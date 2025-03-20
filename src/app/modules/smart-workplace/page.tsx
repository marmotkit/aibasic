'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Chart from 'chart.js/auto';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'chart' | 'code' | 'table';
  metadata?: {
    chartData?: any;
    codeSnippet?: string;
    language?: string;
    tableData?: any;
  };
  department: string;
}

interface DepartmentModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  suggestedQuestions: string[];
  features: Array<{
    name: string;
    description: string;
  }>;
}

const departmentModules: DepartmentModule[] = [
  {
    id: 'hr',
    title: '人力資源智能助手',
    description: '人才分析與管理的智能解決方案',
    icon: '👥',
    features: [
      { name: '離職風險分析', description: '預測員工離職風險，提供留任建議' },
      { name: '招募職能配對', description: '智能匹配職位要求與人才技能' },
      { name: '企業知識服務', description: 'GPT 驅動的企業知識庫問答系統' }
    ],
    suggestedQuestions: [
      '請分析近三個月的員工離職風險指標',
      '幫我找出最適合 Senior Frontend 職位的候選人',
      '請說明公司差勤規定的細節',
      '分析各部門的人員流動率趨勢'
    ]
  },
  {
    id: 'it',
    title: 'IT 智能開發助手',
    description: '程式開發與維護的智能輔助工具',
    icon: '💻',
    features: [
      { name: '智能代碼生成', description: '基於需求自動生成程式碼' },
      { name: '代碼優化建議', description: '提供性能與品質改進建議' },
      { name: '程式除錯助手', description: '智能診斷並解決程式問題' }
    ],
    suggestedQuestions: [
      '幫我優化這段 React 組件的性能',
      '生成一個帳號管理的 API 接口',
      '分析目前系統的程式碼質量',
      '檢查並優化資料庫查詢效能'
    ]
  },
  {
    id: 'finance',
    title: '財務智能分析師',
    description: '財務數據分析與風險評估',
    icon: '📊',
    features: [
      { name: '稅務分析', description: '智能稅務規劃與風險評估' },
      { name: '財報分析', description: '自動化財務報表分析與洞察' },
      { name: '應收應付分析', description: '現金流預測與風險預警' }
    ],
    suggestedQuestions: [
      '分析本季度的稅務優化空間',
      '生成本月的財務健康報告',
      '評估主要客戶的應收帳款風險',
      '預測下季度的現金流狀況'
    ]
  },
  {
    id: 'legal',
    title: '法務智能顧問',
    description: '合約審查與法務風險管理',
    icon: '⚖️',
    features: [
      { name: '合約智能審查', description: '自動檢查合約條款與風險' },
      { name: '法規遵循檢查', description: '確保業務符合法規要求' },
      { name: '法務風險預警', description: '識別潛在法務風險' }
    ],
    suggestedQuestions: [
      '審查這份採購合約的風險點',
      '檢查新產品是否符合資安法規',
      '評估與供應商的合約履行狀況',
      '分析智慧財產權相關風險'
    ]
  },
  {
    id: 'executive',
    title: '總經理數據中心',
    description: '企業營運數據即時監控',
    icon: '📈',
    features: [
      { name: '營運數據儀表板', description: '即時監控關鍵營運指標' },
      { name: '決策支援系統', description: 'AI 輔助的決策建議' },
      { name: '風險預警系統', description: '全面性風險監控與預警' }
    ],
    suggestedQuestions: [
      '顯示本週的關鍵營運指標',
      '分析各部門的績效表現',
      '預測下季度的營運趨勢',
      '識別目前的主要營運風險'
    ]
  }
];

// 部門分組配置
const departmentGroups = {
  'hr-it': ['hr', 'it'],
  'finance-legal': ['finance', 'legal'],
  'executive': ['executive']
};

interface ChartData {
  type: 'line' | 'bar' | 'pie';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string;
      fill?: boolean;
    }>;
  };
}

export default function SmartWorkplacePage() {
  const searchParams = useSearchParams();
  const deptGroup = searchParams.get('dept') || 'hr-it';
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // 根據 URL 參數過濾顯示的部門
  const availableDepartments = departmentModules.filter(
    module => departmentGroups[deptGroup as keyof typeof departmentGroups]?.includes(module.id)
  );

  // 初始化選擇第一個可用的部門
  useEffect(() => {
    if (availableDepartments.length > 0 && !selectedDepartment) {
      const firstDept = availableDepartments[0].id;
      setSelectedDepartment(firstDept);
      setMessages([{
        role: 'assistant',
        content: '您好！我是您的智慧場域 AI 助理。請問需要什麼協助？',
        timestamp: new Date().toLocaleTimeString(),
        department: firstDept
      }]);
    }
  }, [deptGroup, availableDepartments]);

  // 清理舊的圖表
  const clearChart = () => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }
  };

  // 創建新的圖表
  const createChart = (chartData: ChartData) => {
    if (!chartRef.current) return;
    
    clearChart();
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstanceRef.current = new Chart(ctx, {
      type: chartData.type,
      data: chartData.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: 'white'
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: 'white'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          x: {
            ticks: {
              color: 'white'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  };

  // 處理圖表數據
  const handleChartData = (metadata: any) => {
    if (!metadata?.chartData) return;
    
    createChart(metadata.chartData);
  };

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim()) return;

    setLoading(true);
    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      department: selectedDepartment
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    try {
      const response = await fetch('/api/smart-workplace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          department: selectedDepartment,
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
        department: selectedDepartment
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // 如果是總經理室的回應且包含圖表數據，則更新圖表
      if (selectedDepartment === 'executive' && data.metadata?.chartData) {
        handleChartData(data.metadata);
      }
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
          className={`max-w-[80%] rounded-lg p-4 ${
            isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
          }`}
        >
          {!isUser && (
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🤖</span>
              <span className="text-sm text-gray-300">AI 助理</span>
            </div>
          )}
          <div className="mb-2 whitespace-pre-wrap">{message.content}</div>
          
          {message.type === 'chart' && message.metadata?.chartData && (
            <div className="mt-4 bg-gray-800 p-4 rounded-lg">
              {/* 這裡可以根據 chartData 渲染對應的圖表 */}
              <div className="text-sm text-gray-400">圖表數據已生成</div>
            </div>
          )}

          {message.type === 'code' && message.metadata?.codeSnippet && (
            <div className="mt-4 bg-gray-800 p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{message.metadata.codeSnippet}</code>
              </pre>
            </div>
          )}

          {message.type === 'table' && message.metadata?.tableData && (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full bg-gray-800 rounded-lg">
                {/* 表格內容渲染 */}
              </table>
            </div>
          )}

          <div className="text-xs text-gray-400 mt-2">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  };

  // 過濾當前部門的訊息
  const currentDepartmentMessages = messages.filter(
    message => message.department === selectedDepartment
  );

  const currentModule = departmentModules.find(
    module => module.id === selectedDepartment
  );

  // 清理圖表
  useEffect(() => {
    return () => {
      clearChart();
    };
  }, []);

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-white">智慧場域 AI 中心</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* 左側部門選擇 */}
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 gap-4">
            {availableDepartments.map(module => {
              const moduleMessages = messages.filter(m => m.department === module.id);
              const messageCount = Math.floor(moduleMessages.length / 2);

              return (
                <Card
                  key={module.id}
                  className={`p-4 cursor-pointer transition-colors ${
                    selectedDepartment === module.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedDepartment(module.id)}
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
                  
                  {selectedDepartment === module.id && (
                    <div className="mt-4 space-y-2">
                      {module.features.map((feature, index) => (
                        <div key={index} className="bg-gray-700 p-2 rounded">
                          <div className="font-medium">{feature.name}</div>
                          <div className="text-sm text-gray-300">{feature.description}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* 圖表區域 - 只在總經理室時顯示 */}
          {selectedDepartment === 'executive' && (
            <div className="mt-6">
              <Card className="bg-gray-800 p-4">
                <canvas 
                  ref={chartRef} 
                  className="w-full"
                  style={{ height: '300px' }}
                ></canvas>
              </Card>
            </div>
          )}
        </div>

        {/* 右側對話區域 */}
        <div className="md:col-span-3">
          <Card className="bg-gray-800 p-4 h-[800px] flex flex-col">
            <div className="flex-1 overflow-y-auto mb-4">
              {currentDepartmentMessages.map((message, index) => (
                <div key={index}>{renderMessage(message)}</div>
              ))}
            </div>

            {/* 快速問題按鈕 */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentModule?.suggestedQuestions.map((question, index) => (
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
      </div>
    </div>
  );
} 