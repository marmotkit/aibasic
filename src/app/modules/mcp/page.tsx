'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'tool' | 'error';
  content: string;
}

export default function McpPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('message') as HTMLInputElement;
    const message = input.value.trim();

    if (!message) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    input.value = '';

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '處理請求時發生錯誤');
      }

      if (data.toolCalls) {
        setMessages(prev => [
          ...prev,
          { role: 'tool', content: `正在使用工具：${data.toolCalls}` }
        ]);
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message }
      ]);
    } catch (error: any) {
      setMessages(prev => [
        ...prev,
        { role: 'error', content: error.message }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">
        MCP 工具調用
      </h1>
      <p className="mb-4 text-gray-300">
        在這個模組中，AI 可以使用各種外部工具來協助回答問題。例如：搜尋網頁、查詢天氣、計算數學問題等。您可以詢問需要
        使用工具的問題，AI 會自動選擇合適的工具來幫助回答。
      </p>

      <div className="space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white ml-auto'
                    : msg.role === 'tool'
                    ? 'bg-amber-600 text-white'
                    : msg.role === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-700 text-white'
                } ${msg.role === 'user' ? 'max-w-[80%] ml-auto' : 'max-w-[80%]'}`}
              >
                <div className="text-sm opacity-90 mb-1 text-gray-200">
                  {msg.role === 'user' 
                    ? '您'
                    : msg.role === 'tool'
                    ? '工具調用'
                    : msg.role === 'error'
                    ? '錯誤'
                    : 'AI 助手'}
                </div>
                <div>{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="p-4 rounded-lg bg-gray-700 text-white">
                <div className="text-sm opacity-90 mb-1">處理中...</div>
                <div>正在思考並選擇合適的工具...</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              name="message"
              placeholder="輸入您的問題..."
              className="flex-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg ${
                isLoading
                  ? 'bg-gray-600 text-gray-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              送出
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 