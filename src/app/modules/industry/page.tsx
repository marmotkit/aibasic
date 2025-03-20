'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { QualityChart, MaintenanceChart, SchedulingChart } from '@/components/charts/IndustryCharts';

const demoTypes = {
  quality: {
    title: '品質檢測 AI',
    description: '上傳產品圖片或輸入品質要求，AI 將提供詳細的檢測報告',
    placeholder: `請輸入品質要求，例如：
產品：鋁製外殼
規格要求：
1. 表面粗糙度 Ra ≤ 0.8μm
2. 尺寸公差 ±0.05mm
3. 無可見刮痕或凹痕
4. 陽極處理均勻度 ≥ 95%`,
    acceptFiles: 'image/*',
  },
  maintenance: {
    title: '預測性維護 AI',
    description: '輸入設備運行數據，AI 將分析潛在問題並提供維護建議',
    placeholder: `請輸入設備運行數據，例如：
設備編號：CNC-M101
運行參數：
1. 主軸溫度：82°C（正常範圍：60-80°C）
2. 振動值：2.8mm/s（正常範圍：0.5-2.0mm/s）
3. 軸承噪音：82dB（正常範圍：65-75dB）
4. 油位：75%（正常範圍：80-100%）
5. 累計運行時數：4500小時`,
  },
  scheduling: {
    title: '生產排程優化 AI',
    description: '輸入生產需求和資源限制，AI 將提供最佳排程方案',
    placeholder: `請輸入生產需求和資源限制，例如：
本週生產需求：
1. 產品A：1000件，交期7天
2. 產品B：500件，交期5天
3. 產品C：300件，交期3天

可用資源：
- 設備：2台CNC機台
- 工作時間：8小時/班，2班/天
- 產能：
  * 產品A：20件/小時/台
  * 產品B：15件/小時/台
  * 產品C：10件/小時/台`,
  },
};

type DemoType = keyof typeof demoTypes;
type Message = { role: string; content: string; chartData?: any };
type MessagesState = Record<DemoType, Message[]>;

export default function IndustryPage() {
  const [selectedDemo, setSelectedDemo] = useState<DemoType>('quality');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [messagesHistory, setMessagesHistory] = useState<MessagesState>({
    quality: [],
    maintenance: [],
    scheduling: [],
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('type', selectedDemo);
      formData.append('text', text);

      if (file && selectedDemo === 'quality') {
        const reader = new FileReader();
        const imageData = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        formData.append('image', imageData);
      }

      const response = await fetch('/api/industry', {
        method: 'POST',
        body: JSON.stringify({
          type: selectedDemo,
          text: text,
          image: file ? await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
          }) : undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessagesHistory(prev => ({
        ...prev,
        [selectedDemo]: [
          ...prev[selectedDemo],
          { 
            role: 'user', 
            content: text 
          },
          { 
            role: 'assistant', 
            content: data.message,
            chartData: data.chartData
          }
        ]
      }));
      setText('');
      setFile(null);
    } catch (error: any) {
      alert(error.message || '發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (message: Message) => {
    if (!message.chartData) return null;

    switch (selectedDemo) {
      case 'quality':
        return <QualityChart data={message.chartData} />;
      case 'maintenance':
        return <MaintenanceChart data={message.chartData} />;
      case 'scheduling':
        return <SchedulingChart data={message.chartData} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-white">工業 AI 應用示範</h1>
      
      {/* 示範類型選擇 */}
      <div className="flex gap-2 mb-4">
        {Object.entries(demoTypes).map(([key, demo]) => (
          <Button
            key={key}
            onClick={() => {
              setSelectedDemo(key as DemoType);
              setText('');
              setFile(null);
            }}
            variant={selectedDemo === key ? 'default' : 'outline'}
            className={selectedDemo === key ? '' : 'text-white border-white hover:bg-gray-800'}
          >
            {demo.title}
            {messagesHistory[key as DemoType].length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 rounded-full">
                {Math.floor(messagesHistory[key as DemoType].length / 2)}
              </span>
            )}
          </Button>
        ))}
      </div>

      <Card className="p-6 mb-6 bg-gray-800">
        <h2 className="text-2xl font-semibold mb-3 text-white">{demoTypes[selectedDemo].title}</h2>
        <p className="text-gray-300 mb-4">{demoTypes[selectedDemo].description}</p>

        {/* 檔案上傳（僅品質檢測） */}
        {selectedDemo === 'quality' && (
          <div className="mb-4">
            <input
              type="file"
              accept={demoTypes.quality.acceptFiles}
              onChange={handleFileChange}
              className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                       file:rounded-lg file:border-0 file:text-white 
                       file:bg-blue-600 hover:file:bg-blue-700 mb-2"
            />
            {file && <p className="text-sm text-gray-300">已選擇檔案：{file.name}</p>}
          </div>
        )}

        {/* 文字輸入 */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={demoTypes[selectedDemo].placeholder}
          rows={8}
          className="mb-4 bg-gray-700 text-white placeholder-gray-400 border-gray-600"
        />

        <Button 
          onClick={handleSubmit}
          disabled={loading || (!text && !file)}
          className="w-full"
        >
          {loading ? '處理中...' : '開始分析'}
        </Button>
      </Card>

      {/* 當前類型的對話記錄 */}
      <div className="space-y-4">
        {messagesHistory[selectedDemo].map((message, index) => (
          <div key={index}>
            <div className={`p-4 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-900 text-white ml-auto max-w-[80%]' 
                : 'bg-gray-800 text-white max-w-[80%]'
            }`}>
              <p className="text-sm font-semibold mb-1 text-gray-300">
                {message.role === 'user' ? '您的輸入' : 'AI 分析結果'}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === 'assistant' && message.chartData && (
              <div className="mt-4">
                {renderChart(message)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 