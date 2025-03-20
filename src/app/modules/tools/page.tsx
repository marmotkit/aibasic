'use client';

import { useState, useCallback } from 'react';
import { ArrowUpIcon } from '@heroicons/react/24/solid';
import { useDropzone } from 'react-dropzone';

type Tool = 'schedule' | 'tasks' | 'summary';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  tool: Tool;
};

type MessageHistory = {
  schedule: Message[];
  tasks: Message[];
  summary: Message[];
};

export default function ToolsPage() {
  const [messageHistory, setMessageHistory] = useState<MessageHistory>({
    schedule: [],
    tasks: [],
    summary: []
  });
  const [input, setInput] = useState('');
  const [selectedTool, setSelectedTool] = useState<Tool>('schedule');
  const [loading, setLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const text = await file.text();
      setFileContent(text);
      setMessageHistory(prev => ({
        ...prev,
        summary: [...prev.summary, {
          role: 'user',
          content: `已上傳文件：${file.name}\n\n${text.slice(0, 200)}...`,
          tool: 'summary'
        }]
      }));
      
      // 自動切換到摘要工具
      setSelectedTool('summary');
      
      // 自動開始分析
      handleSummary(text);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'text/html': ['.html'],
    },
    multiple: false
  });

  const handleSummary = async (content: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/agent/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, type: '一般' }),
      });

      const data = await response.json();
      
      setMessageHistory(prev => ({
        ...prev,
        summary: [...prev.summary, {
          role: 'assistant',
          content: data.summary || '無法處理文件內容',
          tool: 'summary'
        }]
      }));
    } catch (error) {
      console.error('Error:', error);
      setMessageHistory(prev => ({
        ...prev,
        summary: [...prev.summary, {
          role: 'assistant',
          content: '抱歉，處理文件時發生錯誤。',
          tool: 'summary'
        }]
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !fileContent || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessageHistory(prev => ({
      ...prev,
      [selectedTool]: [...prev[selectedTool], {
        role: 'user',
        content: userMessage,
        tool: selectedTool
      }]
    }));
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      switch (selectedTool) {
        case 'schedule':
          endpoint = '/api/agent/schedule';
          payload = { task: userMessage, date: new Date().toISOString(), duration: '1小時' };
          break;
        case 'tasks':
          endpoint = '/api/agent/tasks';
          payload = { tasks: [userMessage], action: '分析' };
          break;
        case 'summary':
          endpoint = '/api/agent/summary';
          payload = { content: userMessage || fileContent, type: '一般' };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      setMessageHistory(prev => ({
        ...prev,
        [selectedTool]: [...prev[selectedTool], {
          role: 'assistant',
          content: data.schedule || data.analysis || data.summary || '無法處理請求',
          tool: selectedTool
        }]
      }));
    } catch (error) {
      console.error('Error:', error);
      setMessageHistory(prev => ({
        ...prev,
        [selectedTool]: [...prev[selectedTool], {
          role: 'assistant',
          content: '抱歉，處理請求時發生錯誤。',
          tool: selectedTool
        }]
      }));
    } finally {
      setLoading(false);
    }
  };

  const getToolTitle = (tool: Tool) => {
    switch (tool) {
      case 'schedule':
        return '日程安排';
      case 'tasks':
        return '任務追蹤';
      case 'summary':
        return '文件摘要';
    }
  };

  const getToolDescription = (tool: Tool) => {
    switch (tool) {
      case 'schedule':
        return '安排和管理您的日程，智能分析時間衝突並提供建議。';
      case 'tasks':
        return '追蹤任務進度，分析完成度，並提供優先級建議。';
      case 'summary':
        return '快速分析文件內容，提取關鍵信息，生成摘要報告。';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 min-h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-white">智能工具集</h1>
        <div className="flex space-x-4 mb-4">
          {(['schedule', 'tasks', 'summary'] as Tool[]).map((tool) => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTool === tool
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {getToolTitle(tool)}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            {getToolTitle(selectedTool)}
          </h2>
          <p className="text-gray-300">
            {getToolDescription(selectedTool)}
          </p>
        </div>

        {selectedTool === 'summary' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-50/10' : 'border-gray-600 hover:border-gray-500'}
            `}
          >
            <input {...getInputProps()} />
            <p className="text-gray-300">
              {isDragActive ?
                '放開以上傳文件...' :
                '拖放文件到此處，或點擊選擇文件'
              }
            </p>
            <p className="text-gray-400 text-sm mt-2">
              支援的文件格式：TXT、MD、JSON、HTML
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto mb-4 space-y-4">
        {messageHistory[selectedTool].map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-600 text-white ml-12'
                : 'bg-gray-100 text-gray-900 mr-12'
            }`}
          >
            <p className="text-sm font-semibold mb-1 opacity-90">
              {message.role === 'user' ? '您' : 'AI'}
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

      <form onSubmit={handleSubmit} className="flex space-x-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            selectedTool === 'schedule' ? '請描述需要安排的任務...' :
            selectedTool === 'tasks' ? '請輸入需要追蹤的任務...' :
            '請輸入需要摘要的文件內容，或直接拖放文件...'
          }
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