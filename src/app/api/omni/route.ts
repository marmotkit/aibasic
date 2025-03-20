import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface MediaInput {
  type: 'image' | 'audio' | 'video' | null;
  data: string | null;
}

async function processAudio(base64Data: string): Promise<string> {
  try {
    // 將 base64 轉換為 Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // 使用 Whisper API 進行語音轉文字
    const response = await openai.audio.transcriptions.create({
      file: new File([buffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1'
    });

    return response.text;
  } catch (error) {
    console.error('Audio processing error:', error);
    throw new Error('音訊處理失敗');
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '未設定 Gemini API 金鑰' },
        { status: 500 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: '未設定 OpenAI API 金鑰' },
        { status: 500 }
      );
    }

    const { media, question } = await request.json();

    if (!media?.data || !question) {
      return NextResponse.json(
        { error: '請提供媒體檔案和問題' },
        { status: 400 }
      );
    }

    // 從 data URL 中提取 base64 數據
    const base64Data = media.data.split(',')[1];
    const mimeType = media.data.split(';')[0].split(':')[1];

    // 初始化 Gemini Pro Vision 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = question;
    let transcription = '';

    // 處理不同類型的媒體
    if (media.type === 'audio') {
      try {
        transcription = await processAudio(base64Data);
        prompt = `這是一段音訊的轉錄文字：\n${transcription}\n\n${question}\n請根據音訊內容回答問題。`;
        
        // 對於音訊，我們直接使用文字生成回答
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
          throw new Error('Gemini API 未返回有效的回答');
        }

        return NextResponse.json({ 
          message: `音訊轉錄：\n${transcription}\n\n分析結果：\n${text}`,
          status: 'success'
        });
      } catch (error) {
        throw new Error('音訊處理失敗：' + (error as Error).message);
      }
    } else if (media.type === 'video') {
      prompt = `這是一段影片。${question}\n請分析影片內容並回答問題。`;
    }

    // 處理圖片和影片（目前影片僅支援靜態幀分析）
    const result = await model.generateContent([
      prompt,
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
      errorMessage = '媒體檔案太大，請使用較小的檔案';
      statusCode = 413;
    } else if (error.message?.includes('format') || error.message?.includes('mime')) {
      errorMessage = '不支援的媒體格式';
      statusCode = 415;
    } else if (error.message?.includes('音訊處理失敗')) {
      errorMessage = error.message;
      statusCode = 400;
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