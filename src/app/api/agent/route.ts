import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 定義代理可用的工具
const tools = {
  async searchWeb(query: string) {
    return `模擬搜索結果：找到關於 "${query}" 的相關信息...`;
  },

  async analyzeData(data: string, format?: string) {
    return `數據分析報告：
1. 數據概述：${data}
2. 主要發現：...
3. 建議行動：...
${format ? `\n格式：${format}` : ''}`;
  },

  async createPlan(goal: string, steps: number = 3) {
    return `行動計劃 - ${goal}：
${Array.from({ length: steps }, (_, i) => `${i + 1}. 步驟 ${i + 1}...`).join('\n')}`;
  },

  async scheduleTask(task: string, date: string, duration: string) {
    const response = await fetch('/api/agent/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, date, duration })
    });
    const data = await response.json();
    return data.schedule;
  },

  async trackTasks(tasks: any[], action: string) {
    const response = await fetch('/api/agent/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks, action })
    });
    const data = await response.json();
    return data.analysis;
  },

  async summarizeDocument(content: string, type: string) {
    const response = await fetch('/api/agent/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type })
    });
    const data = await response.json();
    return data.summary;
  }
};

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '未設定 Gemini API 金鑰' },
        { status: 500 }
      );
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '請提供問題內容' },
        { status: 400 }
      );
    }

    // 初始化 Gemini 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 系統提示詞
    const prompt = `你是一個智能代理，具有以下能力：
1. 理解用戶需求並分解為可執行的步驟
2. 使用工具收集信息和執行任務
3. 持續跟蹤任務進度並適應變化
4. 提供清晰的行動解釋和最終總結

你可以使用以下工具：
1. searchWeb: 在網絡上搜索信息
2. analyzeData: 分析數據並生成報告
3. createPlan: 創建行動計劃
4. scheduleTask: 安排任務日程
5. trackTasks: 追蹤任務進度
6. summarizeDocument: 生成文件摘要

請分析用戶的問題，判斷是否需要使用工具。如果需要，請說明你要使用什麼工具和原因。
請用繁體中文回答。

用戶問題：${message}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 分析是否需要使用工具
      const actions = [];
      let finalResponse = text;

      // 檢測是否需要使用特定工具
      if (text.toLowerCase().includes('searchweb')) {
        const searchResult = await tools.searchWeb(message);
        actions.push({
          type: 'searchWeb',
          result: searchResult
        });
      }
      if (text.toLowerCase().includes('analyzedata')) {
        const analysisResult = await tools.analyzeData(message);
        actions.push({
          type: 'analyzeData',
          result: analysisResult
        });
      }
      if (text.toLowerCase().includes('createplan')) {
        const planResult = await tools.createPlan(message);
        actions.push({
          type: 'createPlan',
          result: planResult
        });
      }

      return NextResponse.json({
        message: finalResponse,
        actions: actions
      });

    } catch (modelError: any) {
      console.error('Gemini Model Error:', modelError);
      throw modelError;
    }

  } catch (error: any) {
    console.error('Agent API Error:', error);
    return NextResponse.json(
      { error: error.message || '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
} 