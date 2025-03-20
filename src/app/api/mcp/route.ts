import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// 定義可用的工具
const tools = {
  async searchWeb(query: string) {
    try {
      // 使用 Google Custom Search API
      const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
      const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID;

      if (!GOOGLE_API_KEY || !GOOGLE_CSE_ID) {
        return '搜尋功能未設定完成，請設定 Google API 金鑰';
      }

      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '搜尋請求失敗');
      }

      if (!data.items || data.items.length === 0) {
        return '找不到相關資訊';
      }

      // 整理搜尋結果
      const results = data.items.slice(0, 3).map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link
      }));

      return results.map(item => 
        `標題：${item.title}\n摘要：${item.snippet}\n連結：${item.link}\n`
      ).join('\n');

    } catch (error) {
      console.error('Search Error:', error);
      return '搜尋過程發生錯誤';
    }
  },

  async getWeather(location: string) {
    // 這裡應該實現實際的天氣 API 調用
    return `${location}的天氣資訊（示例）：晴天，溫度25°C`;
  },

  async calculateMath(expression: string) {
    try {
      // 安全的數學運算評估
      const result = eval(expression.replace(/[^0-9+\-*/.()]/g, ''));
      return `計算結果：${result}`;
    } catch (error) {
      return '無法計算該表達式';
    }
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

    try {
      // 生成回答
      const prompt = `你是一個具有工具使用能力的AI助手。你可以使用以下工具：
1. searchWeb: 搜尋網路上的資訊
2. getWeather: 查詢指定地點的天氣
3. calculateMath: 計算數學表達式

請分析用戶的問題，判斷是否需要使用工具。如果需要，請說明你要使用什麼工具和原因。
請用繁體中文回答。

用戶問題：${message}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // 分析是否需要使用工具
      let toolCalls = null;
      let finalResponse = text;

      // 檢測是否提到要使用特定工具
      if (text.toLowerCase().includes('searchweb')) {
        const searchResult = await tools.searchWeb(message);
        toolCalls = 'Web 搜尋';
        finalResponse += `\n\n搜尋結果：${searchResult}`;
      }
      if (text.toLowerCase().includes('getweather') && message.includes('天氣')) {
        const location = message.replace(/天氣/g, '').trim();
        const weatherResult = await tools.getWeather(location);
        toolCalls = '天氣查詢';
        finalResponse += `\n\n${weatherResult}`;
      }
      if (text.toLowerCase().includes('calculatemath')) {
        const mathResult = await tools.calculateMath(message);
        toolCalls = '數學計算';
        finalResponse += `\n\n${mathResult}`;
      }

      return NextResponse.json({
        message: finalResponse,
        toolCalls: toolCalls
      });

    } catch (modelError: any) {
      console.error('Gemini Model Error:', modelError);
      
      // 如果 Gemini 失敗，嘗試直接使用工具
      let toolCalls = null;
      let finalResponse = '';

      if (message.includes('搜尋') || message.includes('查詢')) {
        const searchResult = await tools.searchWeb(message);
        toolCalls = 'Web 搜尋';
        finalResponse = searchResult;
      }
      else if (message.includes('天氣')) {
        const location = message.replace(/天氣/g, '').trim();
        const weatherResult = await tools.getWeather(location);
        toolCalls = '天氣查詢';
        finalResponse = weatherResult;
      }
      else if (message.includes('計算')) {
        const expression = message.replace(/[^0-9+\-*/.()]/g, '');
        if (expression) {
          const mathResult = await tools.calculateMath(expression);
          toolCalls = '數學計算';
          finalResponse = mathResult;
        }
      }

      if (!finalResponse) {
        throw modelError;
      }

      return NextResponse.json({
        message: finalResponse,
        toolCalls: toolCalls
      });
    }

  } catch (error: any) {
    console.error('MCP API Error:', error);
    
    return NextResponse.json(
      { error: error.message || '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
} 