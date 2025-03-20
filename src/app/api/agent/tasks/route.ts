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

    const { tasks, action } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `作為一個任務追蹤助手，請幫忙處理以下任務：
任務列表：${JSON.stringify(tasks, null, 2)}
操作：${action}

請提供：
1. 任務優先級排序
2. 完成度評估
3. 下一步建議
4. 可能的風險提醒

請用繁體中文回答。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();

    return NextResponse.json({
      analysis,
      success: true
    });

  } catch (error: any) {
    console.error('Tasks API Error:', error);
    return NextResponse.json(
      { error: error.message || '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
} 