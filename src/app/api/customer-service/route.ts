import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface RequestData {
  message: string;
  moduleId: string;
}

interface OrderBase {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

interface ShippedOrder extends OrderBase {
  status: '已出貨';
  trackingNumber: string;
  shippingCompany: string;
  estimatedDeliveryDate: string;
  shippingHistory: Array<{
    time: string;
    location: string;
    status: string;
  }>;
}

interface ProcessingOrder extends OrderBase {
  status: '處理中';
  processingStage: string;
  estimatedShippingDate: string;
}

type Order = ShippedOrder | ProcessingOrder;

// 模擬訂單資料庫
const orderDatabase: Order[] = [
  {
    orderNumber: 'OD2024031001',
    customerName: '王小明',
    orderDate: '2024-03-10',
    status: '已出貨',
    trackingNumber: 'TN2024031001',
    shippingCompany: '黑貓宅急便',
    estimatedDeliveryDate: '2024-03-12',
    items: [
      { name: 'CNC 切削刀具組', quantity: 1, price: 12000 },
      { name: '冷卻液', quantity: 2, price: 1500 }
    ],
    totalAmount: 15000,
    shippingHistory: [
      { time: '2024-03-10 14:30', location: '台北物流中心', status: '已收件' },
      { time: '2024-03-11 09:15', location: '桃園轉運站', status: '配送中' },
      { time: '2024-03-11 15:20', location: '新竹物流中心', status: '已送達' }
    ]
  },
  {
    orderNumber: 'OD2024031002',
    customerName: '李小華',
    orderDate: '2024-03-10',
    status: '處理中',
    processingStage: '備貨中',
    estimatedShippingDate: '2024-03-13',
    items: [
      { name: 'CNC 主軸', quantity: 1, price: 35000 }
    ],
    totalAmount: 35000
  }
];

// 模擬物流資料庫
const trackingDatabase = new Map([
  ['TN2024031001', {
    trackingNumber: 'TN2024031001',
    orderNumber: 'OD2024031001',
    currentLocation: '新竹物流中心',
    status: '已送達',
    history: [
      { time: '2024-03-10 14:30', location: '台北物流中心', status: '已收件' },
      { time: '2024-03-11 09:15', location: '桃園轉運站', status: '配送中' },
      { time: '2024-03-11 15:20', location: '新竹物流中心', status: '已送達' }
    ]
  }]
]);

// 模擬產品資料庫
const productDatabase = {
  'CNC-M101': {
    name: 'CNC 綜合加工機 M101',
    maintenanceGuide: {
      daily: [
        '檢查主軸溫度和振動',
        '清潔工作台面',
        '檢查冷卻液液位',
        '檢查氣壓值'
      ],
      weekly: [
        '更換過濾器',
        '潤滑導軌',
        '檢查皮帶張力',
        '校正原點位置'
      ],
      monthly: [
        '更換冷卻液',
        '檢查主軸軸承',
        '校正精度',
        '更新系統軟體'
      ]
    },
    troubleshooting: {
      'temperature-high': {
        symptom: '主軸溫度過高',
        solutions: [
          '檢查冷卻系統是否正常運作',
          '降低主軸轉速',
          '檢查環境溫度',
          '聯繫維修人員'
        ],
        videoUrl: 'https://example.com/troubleshooting/temperature'
      }
    },
    tutorials: {
      basic: {
        title: '基礎操作教學',
        steps: [
          '開機和安全檢查',
          '程式編輯和模擬',
          '工件裝夾和對正',
          '加工參數設定'
        ],
        videoUrl: 'https://example.com/tutorials/basic'
      }
    }
  }
};

function formatOrderStatus(order: Order | undefined): string {
  if (!order) {
    return '很抱歉，找不到此訂單資訊。請確認訂單編號是否正確，或聯繫客服專線 0800-888-999 尋求協助。';
  }

  if (order.status === '已出貨') {
    return `訂單編號：${order.orderNumber}
狀態：${order.status}
物流編號：${order.trackingNumber}
配送公司：${order.shippingCompany}
預計送達：${order.estimatedDeliveryDate}
訂購項目：
${order.items.map(item => `- ${item.name} x ${item.quantity} ($${item.price})`).join('\n')}
總金額：$${order.totalAmount}

物流追蹤：
${order.shippingHistory.map(h => `${h.time} - ${h.location} - ${h.status}`).join('\n')}`;
  } else {
    return `訂單編號：${order.orderNumber}
狀態：${order.status}
處理階段：${order.processingStage}
預計出貨：${order.estimatedShippingDate}
訂購項目：
${order.items.map(item => `- ${item.name} x ${item.quantity} ($${item.price})`).join('\n')}
總金額：$${order.totalAmount}`;
  }
}

function formatTrackingStatus(tracking: any): string {
  if (!tracking) {
    return '很抱歉，找不到此物流編號的包裹資訊。請確認物流編號是否正確，或聯繫客服專線 0800-888-999 尋求協助。';
  }

  return `物流編號：${tracking.trackingNumber}
目前位置：${tracking.currentLocation}
配送狀態：${tracking.status}

物流追蹤：
${tracking.history.map((h: any) => `${h.time} - ${h.location} - ${h.status}`).join('\n')}`;
}

function getMaintenanceGuide(productId: string): string {
  const product = productDatabase[productId as keyof typeof productDatabase];
  if (!product) return '找不到此產品';

  return `${product.name} 保養指南：

日常保養：
${product.maintenanceGuide.daily.map(step => `• ${step}`).join('\n')}

每週保養：
${product.maintenanceGuide.weekly.map(step => `• ${step}`).join('\n')}

每月保養：
${product.maintenanceGuide.monthly.map(step => `• ${step}`).join('\n')}`;
}

function getTroubleshootingGuide(productId: string, issue: string): any {
  const product = productDatabase[productId as keyof typeof productDatabase];
  if (!product) return { content: '找不到此產品' };

  const troubleshooting = product.troubleshooting[issue as keyof typeof product.troubleshooting];
  if (!troubleshooting) return { content: '找不到相關故障排除指南' };

  return {
    content: `故障排除指南：
問題：${troubleshooting.symptom}

解決方案：
${troubleshooting.solutions.map(solution => `• ${solution}`).join('\n')}`,
    metadata: {
      videoUrl: troubleshooting.videoUrl
    }
  };
}

function getTutorial(productId: string, level: string): any {
  const product = productDatabase[productId as keyof typeof productDatabase];
  if (!product) return { content: '找不到此產品' };

  const tutorial = product.tutorials[level as keyof typeof product.tutorials];
  if (!tutorial) return { content: '找不到相關教學' };

  return {
    content: `${tutorial.title}：

學習步驟：
${tutorial.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}`,
    metadata: {
      videoUrl: tutorial.videoUrl
    }
  };
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // 訂單查詢模式
    if (data.moduleId === 'order') {
      // 提取訂單編號
      const orderMatch = data.message.match(/[訂單號碼：]*(OD\d+)/i);
      if (orderMatch) {
        const orderNumber = orderMatch[1];
        const order = orderDatabase.find(o => o.orderNumber === orderNumber);
        return NextResponse.json({
          message: formatOrderStatus(order),
          moduleId: 'order'
        });
      }

      // 提取物流編號
      const trackingMatch = data.message.match(/[物流編號：]*(TN\d+)/i);
      if (trackingMatch) {
        const trackingNumber = trackingMatch[1];
        const tracking = trackingDatabase.get(trackingNumber);
        return NextResponse.json({
          message: formatTrackingStatus(tracking),
          moduleId: 'order'
        });
      }

      // 處理退貨相關詢問
      if (data.message.includes('退貨')) {
        return NextResponse.json({
          message: `退貨流程說明：
1. 請先確認商品是否符合退貨條件（購買後 7 天內，商品完整未使用）
2. 登入會員中心，在「訂單管理」中選擇要退貨的訂單
3. 點選「申請退貨」，填寫退貨原因
4. 等待客服人員審核，審核通過後會寄送退貨包裹標籤
5. 請將商品完整包裝，貼上退貨標籤後送至指定物流點
6. 商品檢驗無誤後，將於 3-5 個工作天內退款

如需協助，請撥打客服專線：0800-888-999`,
          moduleId: 'order'
        });
      }
    }

    // 檢查是否是產品相關查詢
    const productMatch = data.message.match(/CNC-[A-Z0-9]+/);
    if (productMatch) {
      if (data.message.includes('保養')) {
        const guide = getMaintenanceGuide(productMatch[0]);
        return NextResponse.json({
          message: guide,
          type: 'text',
          moduleId: 'product',
        });
      }
      
      if (data.message.includes('溫度過高')) {
        const guide = getTroubleshootingGuide(productMatch[0], 'temperature-high');
        return NextResponse.json({
          message: guide.content,
          type: 'video',
          metadata: guide.metadata,
          moduleId: 'product',
        });
      }

      if (data.message.includes('教學') || data.message.includes('新手')) {
        const tutorial = getTutorial(productMatch[0], 'basic');
        return NextResponse.json({
          message: tutorial.content,
          type: 'video',
          metadata: tutorial.metadata,
          moduleId: 'learning',
        });
      }
    }

    // 使用 AI 生成回應
    let prompt = '';
    switch (data.moduleId) {
      case 'order':
        prompt = `你是一位專業的客服人員，請針對以下訂單相關問題提供協助。如果客戶想要退換貨，請提供完整的退換貨流程說明。

客戶問題：${data.message}

請提供專業且有禮貌的回應。如果無法解決客戶問題，請提供以下聯絡方式：
- 客服專線：(02) 2345-6789
- 客服信箱：service@example.com
- 線上客服：週一至週五 09:00-18:00
- 企業 Line：@exampleCNC`;
        break;

      case 'product':
        prompt = `你是一位專業的技術支援人員，請針對以下產品使用問題提供協助。回答時要考慮安全性，並提供清楚的步驟說明。

客戶問題：${data.message}

請提供專業且詳細的回應。如果問題較為複雜，建議客戶：
1. 撥打技術支援專線：(02) 2345-6789 #123
2. 預約現場維修服務
3. 參考線上技術文件庫`;
        break;

      case 'learning':
        prompt = `你是一位專業的教育訓練講師，請針對以下學習需求提供建議。說明時要由淺入深，並注重實務操作。

客戶問題：${data.message}

請提供專業且易懂的回應。建議可以：
1. 觀看線上教學影片
2. 參加實體培訓課程
3. 下載完整的學習手冊`;
        break;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      message: text,
      type: 'text',
      moduleId: data.moduleId,
    });

  } catch (error: any) {
    console.error('Customer Service API Error:', error);
    return NextResponse.json(
      { error: error.message || '處理請求時發生錯誤' },
      { status: 500 }
    );
  }
} 