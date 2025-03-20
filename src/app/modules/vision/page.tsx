'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export default function VisionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setLoading(true);
    setAnalysis('');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/vision', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.message);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || '分析圖片時發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
  });

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-[calc(100vh-64px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">Vision API 圖像識別</h1>
        <p className="text-gray-300">
          上傳一張圖片，AI 將會分析圖片內容並提供詳細描述。
          這個模組使用 Google 的 Vision API，展示了 AI 的視覺理解能力。
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 flex-1">
        <div
          {...getRootProps()}
          className="flex-1 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center relative overflow-hidden hover:border-blue-500 transition-colors cursor-pointer"
        >
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt="上傳的圖片"
              fill
              style={{ objectFit: 'contain' }}
              className="p-2"
            />
          ) : (
            <p className="text-gray-300 p-8">拖放圖片到此處，或點擊選擇圖片</p>
          )}
          <input {...getInputProps()} />
        </div>

        <div className="flex-1 bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white">分析結果：</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-900/50 text-red-200 p-4 rounded-lg">
              {error}
            </div>
          ) : analysis ? (
            <div className="bg-gray-700/50 text-gray-100 p-4 rounded-lg whitespace-pre-wrap">
              {analysis}
            </div>
          ) : (
            <div className="bg-blue-900/50 text-blue-200 p-4 rounded-lg">
              上傳圖片後將在此處顯示分析結果
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 