import Link from 'next/link';

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
];

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white">AI 技術演進學習之旅</h1>
        <p className="text-xl text-center mb-12 text-gray-300">
          透過實際操作體驗 AI 技術的發展歷程，從基礎對話到智能代理
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <Link 
              key={module.href}
              href={module.href}
              className={`${module.color} hover:opacity-90 transition-opacity p-6 rounded-lg shadow-lg`}
            >
              <h2 className="text-2xl font-bold text-white mb-2">{module.title}</h2>
              <p className="text-white/90">{module.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
