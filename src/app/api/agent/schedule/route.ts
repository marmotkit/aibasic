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

    const { task, date, duration } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `作為一個日程安排助手，請幫忙安排以下任務：
任務：${task}
日期：${date}
時長：${duration}

請提供：
1. 詳細的時間安排
2. 可能的衝突提醒
3. 優先級建議
4. 相關準備事項

請用繁體中文回答。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const schedule = response.text();

    return NextResponse.json({
      schedule,
      success: true
    });

  } catch (error: any) {
    console.error('Schedule API Error:', error);
    return NextResponse.json(
      { error: error.message || '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
} 