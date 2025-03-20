'use client';

import { useState } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
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
        <h1 className="text-3xl font-bold mb-4">基礎 ChatGPT 問答</h1>
        <p className="text-gray-600">
          這是最基本的 AI 對話功能，您可以輸入任何問題，AI 將會給出回應。
          這個模組使用 GPT-3.5-turbo 模型，展示了最基礎的文字對話能力。
        </p>
      </div>

      <div className="flex-1 overflow-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white ml-12'
                : 'bg-gray-100 text-gray-800 mr-12'
            }`}
          >
            <p className="text-sm font-semibold mb-1 opacity-90">
              {message.role === 'user' ? '您' : 'AI'}
            </p>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        ))}
        {loading && (
          <div className="bg-gray-100 text-gray-800 mr-12 p-4 rounded-lg">
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
          placeholder="輸入您的問題..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
        >
          <ArrowUpIcon className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
} 