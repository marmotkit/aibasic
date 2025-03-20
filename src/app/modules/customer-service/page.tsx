'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'video' | 'link';
  metadata?: {
    orderNumber?: string;
    trackingNumber?: string;
    productId?: string;
    imageUrl?: string;
    videoUrl?: string;
    linkUrl?: string;
  };
  moduleId: string;
}

interface ServiceModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  suggestedQuestions: string[];
}

const serviceModules: ServiceModule[] = [
  {
    id: 'order',
    title: '訂單查詢',
    description: '查詢訂單狀態、出貨進度和物流追蹤',
    icon: '📦',
    suggestedQuestions: [
      '我想查詢訂單 OD2024031001 的出貨狀態',
      '請問訂單 OD2024031001 的物流編號是多少？',
      '請問物流編號 TN2024031001 的包裹到哪裡了？',
      '我想查詢訂單 OD2024031002 的處理進度',
      '我想查詢訂單 OD2024031003 的出貨狀態',
      '請問物流編號 TN2024031003 的包裹到哪裡了？',
      '我要如何申請退貨？'
    ]
  },
  {
    id: 'product',
    title: '產品支援',
    description: '產品使用指南、故障排除和維修服務',
    icon: '🔧',
    suggestedQuestions: [
      'CNC-M101 機台的日常保養步驟',
      '主軸溫度過高該如何處理？',
      '如何更換過濾器？',
      '請問有推薦的切削油嗎？'
    ]
  },
  {
    id: 'learning',
    title: '學習中心',
    description: '互動式教學、操作影片和使用技巧',
    icon: '📚',
    suggestedQuestions: [
      '新手如何開始使用 CNC 機台？',
      '如何提高加工精度？',
      '請問有教學影片嗎？',
      '如何設定最佳切削參數？'
    ]
  }
];

export default function CustomerServicePage() {
  const [selectedModule, setSelectedModule] = useState<string>('order');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '您好！我是您的智能客服助理。請問需要什麼幫助？',
      timestamp: new Date().toLocaleTimeString(),
      moduleId: 'order'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    setLoading(true);
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      moduleId: selectedModule
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await fetch('/api/customer-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          moduleId: selectedModule,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString(),
        type: data.type,
        metadata: data.metadata,
        moduleId: data.moduleId || selectedModule
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      alert(error.message || '發生錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === 'user';

    return (
      <div
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[70%] rounded-lg p-4 ${
            isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
          }`}
        >
          {!isUser && (
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🤖</span>
              <span className="text-sm text-gray-300">智能客服</span>
            </div>
          )}
          <div className="mb-1 whitespace-pre-wrap">{message.content}</div>
          {message.metadata?.imageUrl && (
            <img
              src={message.metadata.imageUrl}
              alt="參考圖片"
              className="mt-2 rounded-lg max-w-full"
            />
          )}
          {message.metadata?.videoUrl && (
            <div className="mt-2">
              <video
                controls
                className="rounded-lg max-w-full"
                src={message.metadata.videoUrl}
              />
            </div>
          )}
          {message.metadata?.linkUrl && (
            <a
              href={message.metadata.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-blue-300 hover:text-blue-200 block"
            >
              📎 查看詳細資訊
            </a>
          )}
          <div className="text-xs text-gray-400 mt-1">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  };

  // 過濾當前模組的訊息
  const currentModuleMessages = messages.filter(
    message => message.moduleId === selectedModule
  );

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-4 text-white">智能客服中心</h1>

      {/* 服務模組選擇 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {serviceModules.map(module => {
          // 計算此模組的訊息數量
          const moduleMessages = messages.filter(m => m.moduleId === module.id);
          const messageCount = Math.floor(moduleMessages.length / 2); // 每次對話包含用戶和助理的訊息

          return (
            <Card
              key={module.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedModule === module.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
              onClick={() => setSelectedModule(module.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="text-3xl">{module.icon}</div>
                {messageCount > 0 && (
                  <span className="px-2 py-1 text-xs bg-blue-500 rounded-full">
                    {messageCount}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold mb-1">{module.title}</h3>
              <p className="text-sm text-gray-300">{module.description}</p>
            </Card>
          );
        })}
      </div>

      {/* 對話區域 */}
      <Card className="bg-gray-800 p-4 mb-4 h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {currentModuleMessages.map((message, index) => (
            <div key={index}>{renderMessage(message)}</div>
          ))}
        </div>

        {/* 快速問題按鈕 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {serviceModules
            .find(m => m.id === selectedModule)
            ?.suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-white border-gray-600 hover:bg-gray-700"
                onClick={() => handleSendMessage(question)}
              >
                {question}
              </Button>
            ))}
        </div>

        {/* 輸入區域 */}
        <div className="flex gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="請輸入您的問題..."
            className="flex-1 bg-gray-700 text-white border-gray-600"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputText.trim()}
            className="px-8"
          >
            {loading ? '發送中...' : '發送'}
          </Button>
        </div>
      </Card>
    </div>
  );
} 