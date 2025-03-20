import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 確保 API 金鑰存在且有效
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('警告：未設定 GEMINI_API_KEY 環境變數');
}

// 初始化 Google AI 客戶端
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    // 驗證 API 金鑰
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: '系統配置錯誤：未設定 API 金鑰',
          status: 'error' 
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get('image') as File;

    // 驗證圖片
    if (!image) {
      return NextResponse.json(
        { 
          error: '未提供圖片',
          status: 'error'
        },
        { status: 400 }
      );
    }

    // 驗證圖片類型
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { 
          error: '無效的檔案類型，請上傳圖片檔案',
          status: 'error'
        },
        { status: 400 }
      );
    }

    // 將 File 轉換為 Uint8Array
    const bytes = await image.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    // 初始化 Gemini 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 生成圖片內容分析
    const result = await model.generateContent([
      '請詳細描述這張圖片的內容，包括主要物體、場景、顏色、動作等細節。請用繁體中文回答。',
      {
        inlineData: {
          mimeType: image.type,
          data: Buffer.from(uint8Array).toString('base64')
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('AI 未能生成有效的分析結果');
    }

    return NextResponse.json({ 
      message: text,
      status: 'success'
    });

  } catch (error: any) {
    console.error('Vision API Error:', error);
    
    let errorMessage = '處理圖片時發生錯誤';
    let statusCode = 500;
    
    // 處理常見的 API 錯誤
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

    // 移除錯誤訊息中可能包含的敏感資訊
    const safeErrorMessage = errorMessage.replace(/key[-_]?[0-9A-Za-z]{10,}/g, '[REMOVED]');

    return NextResponse.json(
      { 
        error: safeErrorMessage,
        status: 'error'
      },
      { status: statusCode }
    );
  }
} 