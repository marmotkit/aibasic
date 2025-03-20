'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface Message {
  type: 'analysis' | 'error';
  content: string;
}

export default function FourOPage() {
  const webcamRef = useRef<Webcam>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isContinuous, setIsContinuous] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const analyzeIntervalRef = useRef<NodeJS.Timeout>();

  const toggleCamera = useCallback(() => {
    setIsStreaming(!isStreaming);
    if (isContinuous) {
      toggleContinuousAnalysis();
    }
  }, [isStreaming, isContinuous]);

  const captureImage = useCallback(() => {
    if (!webcamRef.current) return null;
    return webcamRef.current.getScreenshot();
  }, []);

  const analyzeImage = async () => {
    const imageData = captureImage();
    if (!imageData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/4o', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '分析失敗');
      }

      setMessages(prev => [...prev, {
        type: 'analysis',
        content: data.message
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: error.message || '分析過程發生錯誤'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const captureAndAnalyze = useCallback(() => {
    if (!isStreaming || isLoading) return;
    analyzeImage();
  }, [isStreaming, isLoading]);

  const toggleContinuousAnalysis = useCallback(() => {
    if (isContinuous) {
      if (analyzeIntervalRef.current) {
        clearInterval(analyzeIntervalRef.current);
      }
      setIsContinuous(false);
    } else {
      analyzeIntervalRef.current = setInterval(analyzeImage, 3000);
      setIsContinuous(true);
    }
  }, [isContinuous]);

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">
        4O 即時影像互動
      </h1>
      <p className="mb-4 text-gray-300">
        開啟攝像頭，AI 將實時分析影像內容。您可以選擇單次分析或開啟連續分析模式。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className={`w-full h-full object-cover ${!isStreaming ? 'hidden' : ''}`}
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                請開啟攝像頭
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleCamera}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isStreaming ? '關閉攝像頭' : '開啟攝像頭'}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={captureAndAnalyze}
              disabled={!isStreaming || isLoading}
              className={`flex-1 px-4 py-2 rounded-lg ${
                !isStreaming || isLoading
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              單次分析
            </button>
            <button
              onClick={toggleContinuousAnalysis}
              disabled={!isStreaming || isLoading}
              className={`flex-1 px-4 py-2 rounded-lg ${
                isContinuous
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : !isStreaming || isLoading
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isContinuous ? '停止連續分析' : '開始連續分析'}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4 text-white">分析結果</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  msg.type === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <div className="text-sm opacity-90 mb-1 text-gray-200">
                  {msg.type === 'error' ? '錯誤' : 'AI 分析'}
                </div>
                <div>{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-lg bg-gray-700 text-white">
                <div className="text-sm opacity-90 mb-1">處理中...</div>
                <div>正在分析影像，請稍候...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 