'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

export default function OmniPage() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!textareaRef.current?.value && !selectedImage) return;

    const question = textareaRef.current?.value || '請分析這張圖片';
    setIsLoading(true);

    try {
      const response = await fetch('/api/omni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          image: selectedImage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '請求失敗');
      }

      setMessages(prev => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: data.message }
      ]);

      if (textareaRef.current) {
        textareaRef.current.value = '';
      }
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'error', content: error.message || '發生錯誤，請稍後再試' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">
        Omni 多模態對話模組
      </h1>
      <p className="mb-4 text-gray-300">
        這個模組可以同時處理文字和圖片輸入，讓您能夠上傳圖片並詢問相關問題。
      </p>

      <div className="mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white ml-auto'
                : msg.role === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-gray-700 text-white'
            } ${msg.role === 'user' ? 'max-w-[80%] ml-auto' : 'max-w-[80%]'}`}
          >
            <div className="text-sm opacity-90 mb-1 text-gray-200">
              {msg.role === 'user' ? '您' : msg.role === 'error' ? '錯誤' : 'AI 助手'}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            ref={fileInputRef}
            className="block w-full text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-2 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-700"
          />
        </div>

        {selectedImage && (
          <div className="relative w-64 h-64">
            <Image
              src={selectedImage}
              alt="Selected"
              fill
              className="object-contain"
            />
          </div>
        )}

        <div className="flex gap-4">
          <textarea
            ref={textareaRef}
            placeholder="輸入您的問題..."
            className="flex-1 p-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400"
            rows={3}
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
            {isLoading ? '處理中...' : '送出'}
          </button>
        </div>
      </form>
    </div>
  );
} 