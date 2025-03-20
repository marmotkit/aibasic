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

    const { image, question } = await request.json();

    if (!image || !question) {
      return NextResponse.json(
        { error: '請提供圖片和問題' },
        { status: 400 }
      );
    }

    // 從 data URL 中提取 base64 數據
    const base64Data = image.split(',')[1];
    const mimeType = image.split(';')[0].split(':')[1];

    // 初始化 Gemini Pro Vision 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 生成回答
    const result = await model.generateContent([
      question,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('Gemini API 未返回有效的回答');
    }

    return NextResponse.json({ 
      message: text,
      status: 'success'
    });

  } catch (error: any) {
    console.error('Omni API Error:', error);
    
    let errorMessage = '處理請求時發生錯誤';
    let statusCode = 500;
    
    if (error.message?.includes('Not Found') || error.message?.includes('deprecated')) {
      errorMessage = 'AI 模型暫時無法使用，請稍後再試';
      statusCode = 503;
    } else if (error.status === 401 || error.message?.includes('invalid')) {
      errorMessage = 'API 驗證失敗，請聯繫系統管理員';
      statusCode = 401;
    } else if (error.status === 429 || error.message?.includes('quota')) {
      errorMessage = 'API 使用額度已達上限，請稍後再試';
      statusCode = 429;
    } else if (error.message?.includes('size')) {
      errorMessage = '圖片檔案太大，請使用較小的圖片';
      statusCode = 413;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        status: 'error'
      },
      { status: statusCode }
    );
  }
} 