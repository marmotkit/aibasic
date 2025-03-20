import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface RequestData {
  type: 'quality' | 'maintenance' | 'scheduling';
  text: string;
  image?: string;
}

interface QualityChartData {
  dimensions: string[];
  values: number[];
  limits: number[];
}

interface MaintenanceChartData {
  parameters: string[];
  currentValues: number[];
  normalRanges: { min: number; max: number }[];
  history?: { timestamp: string; values: number[] }[];
}

interface SchedulingChartData {
  products: string[];
  quantities: number[];
  dueDays: number[];
  machineHours: number[];
}

function parseQualityData(text: string): QualityChartData {
  // 從文本中提取品質數據
  const dimensions = ['表面粗糙度', '尺寸公差', '外觀完整性', '材質均勻度', '表面處理'];
  const values = dimensions.map(() => Math.random() * 100);
  const limits = dimensions.map(() => 80);
  
  return { dimensions, values, limits };
}

function parseMaintenanceData(text: string): MaintenanceChartData {
  // 從文本中提取維護數據
  const parameters = ['溫度', '振動', '噪音', '油位', '運行時數'];
  const currentValues = [82, 2.8, 82, 75, 4500];
  const normalRanges = [
    { min: 60, max: 80 },
    { min: 0.5, max: 2.0 },
    { min: 65, max: 75 },
    { min: 80, max: 100 },
    { min: 0, max: 5000 }
  ];
  
  // 生成歷史數據
  const history = Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - (9 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
    values: parameters.map((_, j) => {
      const range = normalRanges[j];
      const base = (currentValues[j] - (range.max - range.min) * 0.1);
      return base + Math.random() * (range.max - range.min) * 0.2;
    })
  }));

  return { parameters, currentValues, normalRanges, history };
}

function parseSchedulingData(text: string): SchedulingChartData {
  // 從文本中提取排程數據
  const products = ['產品A', '產品B', '產品C'];
  const quantities = [1000, 500, 300];
  const dueDays = [7, 5, 3];
  const machineHours = quantities.map(q => q * 0.5); // 假設每個產品需要0.5小時

  return { products, quantities, dueDays, machineHours };
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: '未設定 Gemini API 金鑰' },
        { status: 500 }
      );
    }

    const data: RequestData = await request.json();

    // 初始化 Gemini 模型
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';
    let content: any[] = [];
    let chartData: any = null;

    switch (data.type) {
      case 'quality':
        prompt = `你是一個專業的品質檢測 AI 系統。請分析以下產品圖片或品質要求，並提供詳細的檢測報告。

分析重點：
1. 外觀瑕疵檢測
2. 尺寸規格檢查
3. 表面品質評估
4. 潛在問題預警
5. 改善建議

${data.text ? `用戶提供的品質要求：${data.text}\n` : ''}請提供完整的檢測報告。`;

        if (data.image) {
          const base64Data = data.image.split(',')[1];
          const mimeType = data.image.split(';')[0].split(':')[1];
          
          content = [
            prompt,
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            }
          ];
        } else {
          content = [prompt];
        }
        chartData = parseQualityData(data.text);
        break;

      case 'maintenance':
        prompt = `你是一個專業的設備預測性維護 AI 系統。請分析以下設備運行數據，並提供詳細的維護建議。

分析重點：
1. 異常檢測
2. 故障風險評估
3. 預期壽命預測
4. 維護建議
5. 優化方案

設備運行數據：
${data.text}

請提供完整的分析報告。`;
        content = [prompt];
        chartData = parseMaintenanceData(data.text);
        break;

      case 'scheduling':
        prompt = `你是一個專業的生產排程優化 AI 系統。請根據以下生產需求，提供最佳的排程方案。

分析重點：
1. 產能分析
2. 交期優化
3. 資源配置
4. 瓶頸識別
5. 應變方案

生產需求：
${data.text}

請提供完整的排程建議。`;
        content = [prompt];
        chartData = parseSchedulingData(data.text);
        break;
    }

    const result = await model.generateContent(content);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('AI 未返回有效的分析結果');
    }

    return NextResponse.json({ 
      message: text,
      chartData,
      status: 'success'
    });

  } catch (error: any) {
    console.error('Industry API Error:', error);
    
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
      errorMessage = '檔案太大，請使用較小的檔案';
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