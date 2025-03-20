'use client';

import { useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';

type Message = {
  role: 'user' | 'assistant' | 'agent';
  content: string;
  action?: string;
};

export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      
      // 添加代理行為記錄
      if (data.actions) {
        data.actions.forEach((action: { type: string; result: string }) => {
          setMessages(prev => [...prev, {
            role: 'agent',
            content: action.result,
            action: action.type
          }]);
        });
      }

      // 添加 AI 最終回應
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，發生錯誤。請稍後再試。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Agent SDK 智能體</h1>
        <p className="text-gray-300">
          在這個模組中，AI 代理具有自主決策能力，可以根據您的需求執行多個步驟的任務。
          代理可以規劃任務步驟、使用工具、記憶上下文，並持續與您互動直到完成任務。
          您可以要求代理執行複雜的任務，例如：研究主題、分析數據、制定計劃等。
        </p>
      </div>

      <div className="flex-1 overflow-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white ml-12'
                : message.role === 'agent'
                ? 'bg-amber-100 text-amber-900 mr-12'
                : 'bg-gray-100 text-gray-900 mr-12'
            }`}
          >
            <p className="text-sm font-semibold mb-1 opacity-90">
              {message.role === 'user' 
                ? '您' 
                : message.role === 'agent'
                ? `🤖 代理行為：${message.action}`
                : 'AI'}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 text-gray-900 mr-12 p-4 rounded-lg">
            <p className="text-sm font-semibold mb-1">AI</p>
            <p>思考中...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="描述您想要完成的任務..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
} 