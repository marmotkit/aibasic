import Link from 'next/link';
import { Card } from '@/components/ui/card';

const modules = [
  {
    title: '基礎 ChatGPT 問答',
    description: '體驗最基本的 AI 文字對話功能',
    href: '/modules/chat',
    color: 'bg-blue-500',
  },
  {
    title: 'Vision API 圖像識別',
    description: '探索 AI 的圖像理解能力',
    href: '/modules/vision',
    color: 'bg-green-500',
  },
  {
    title: 'Omni 多模態互動',
    description: '體驗多模態 AI 的強大功能',
    href: '/modules/omni',
    color: 'bg-purple-500',
  },
  {
    title: '4O 即時影像互動',
    description: '實時影像分析與互動',
    href: '/modules/4o',
    color: 'bg-red-500',
  },
  {
    title: 'MCP 工具調用',
    description: '了解 AI 如何使用外部工具',
    href: '/modules/mcp',
    color: 'bg-yellow-500',
  },
  {
    title: 'Agent SDK 智能體',
    description: '探索 AI 代理的自主能力',
    href: '/modules/agent',
    color: 'bg-indigo-500',
  },
  {
    title: '智能工具集',
    description: '提供日程安排、任務追蹤和文件摘要等實用工具',
    href: '/modules/tools',
    color: 'bg-pink-500',
  },
  {
    title: '工業 AI 應用',
    description: '智能品質檢測、預測性維護、生產排程優化',
    href: '/modules/industry',
    color: 'bg-orange-500',
  },
  {
    title: '智能客服中心',
    description: '訂單查詢、產品支援、學習資源',
    href: '/modules/customer-service',
    color: 'bg-teal-500',
  },
  {
    title: '智慧場域 AI (人資/IT)',
    description: '人力資源分析、人才招募配對、IT 智能開發',
    href: '/modules/smart-workplace?dept=hr-it',
    color: 'bg-cyan-500',
  },
  {
    title: '智慧場域 AI (財務/法務)',
    description: '財務分析、稅務規劃、合約審查、法規遵循',
    href: '/modules/smart-workplace?dept=finance-legal',
    color: 'bg-emerald-500',
  },
  {
    title: '智慧場域 AI (總經理室)',
    description: '營運數據儀表板、績效分析、風險監控',
    href: '/modules/smart-workplace?dept=executive',
    color: 'bg-violet-500',
  }
];

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-white mb-4">
          AI 人工智慧發展與產業應用
        </h1>
        <p className="text-xl text-center text-gray-300 mb-12">
          透過實際操作體驗 AI 技術的發展歷程，從基礎對話到智能代理到產業實務運用
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link 
              key={module.href}
              href={module.href}
              className="block no-underline"
            >
              <div className={`${module.color} hover:opacity-90 transition-all transform hover:scale-105 p-6 rounded-lg shadow-lg h-full`}>
                <h2 className="text-2xl font-bold text-white mb-2">{module.title}</h2>
                <p className="text-white/90">{module.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
