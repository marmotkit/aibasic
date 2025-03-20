import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '未設定 Gemini API 金鑰' },
        { status: 500 }
      );
    }

    const { content, type } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `作為一個文件摘要助手，請幫忙分析以下${type}文件：

${content}

請提供：
1. 主要內容摘要（不超過 300 字）
2. 關鍵重點（3-5 點）
3. 建議行動項目
4. 相關參考資料或建議

請用繁體中文回答。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({
      summary,
      success: true
    });

  } catch (error: any) {
    console.error('Summary API Error:', error);
    return NextResponse.json(
      { error: error.message || '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
} 