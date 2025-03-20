import { NextResponse } from 'next/server';

// 模擬 HR 數據
const hrData = {
  turnoverRisk: {
    engineering: { risk: 'high', percentage: 15, factors: ['加班時數過高', '薪資競爭力不足'] },
    marketing: { risk: 'low', percentage: 5, factors: ['團隊氛圍佳', '工作滿意度高'] },
    sales: { risk: 'medium', percentage: 8, factors: ['業績壓力大', '市場競爭激烈'] }
  },
  recruitmentMatch: {
    'Senior Frontend': [
      { id: 'C001', match: 95, skills: ['React', 'TypeScript', 'Next.js'], experience: 5 },
      { id: 'C002', match: 88, skills: ['Vue', 'JavaScript', 'Node.js'], experience: 4 },
      { id: 'C003', match: 82, skills: ['Angular', 'TypeScript', 'RxJS'], experience: 3 }
    ]
  },
  companyPolicies: {
    attendance: {
      workHours: '09:00-18:00',
      flexibleHours: true,
      remoteWork: '每週可遠端工作2天',
      overtime: '加班需事先申請，並於30天內補休'
    }
  }
};

// 模擬 IT 數據
const itData = {
  codeQuality: {
    coverage: 85,
    bugs: { critical: 2, major: 5, minor: 12 },
    techDebt: '中等',
    recommendations: [
      '增加單元測試覆蓋率',
      '重構遺留代碼',
      '更新過時依賴'
    ]
  },
  performance: {
    apiResponseTime: '250ms',
    databaseQueries: {
      slow: 3,
      optimized: 28,
      total: 31
    }
  }
};

// 模擬財務數據
const financeData = {
  taxAnalysis: {
    currentRate: '20%',
    optimization: {
      potential: '約300萬',
      suggestions: [
        '研發支出加計抵減',
        '綠能投資租稅優惠',
        '境外所得最適化'
      ]
    }
  },
  financialHealth: {
    revenue: { current: 15000000, growth: 12 },
    profit: { current: 3000000, growth: 8 },
    cashFlow: { status: '良好', forecast: '穩定成長' }
  },
  accountsReceivable: {
    total: 5000000,
    aging: {
      '30天內': 3000000,
      '30-60天': 1500000,
      '60-90天': 400000,
      '90天以上': 100000
    }
  }
};

// 模擬法務數據
const legalData = {
  contracts: {
    review: {
      riskLevel: '中等',
      keyIssues: [
        '付款條件不明確',
        '責任歸屬需釐清',
        '保密條款待強化'
      ],
      suggestions: [
        '修改第三條付款時程',
        '增加違約處理機制',
        '補充智財權條款'
      ]
    }
  },
  compliance: {
    status: '大致符合',
    gaps: [
      '個資保護機制待優化',
      'ISO 27001認證待更新'
    ]
  }
};

// 模擬總經理儀表板數據
const executiveData = {
  kpi: {
    revenue: { value: 150000000, trend: '+12%' },
    profit: { value: 30000000, trend: '+8%' },
    customerSatisfaction: { value: 4.5, trend: '+0.3' },
    employeeSatisfaction: { value: 4.2, trend: '+0.1' }
  },
  departmentPerformance: {
    sales: { achievement: 95, status: '達標' },
    engineering: { achievement: 88, status: '良好' },
    marketing: { achievement: 92, status: '優秀' },
    service: { achievement: 85, status: '待改進' }
  },
  risks: [
    { type: '市場風險', level: '中', description: '競爭對手新產品上市' },
    { type: '營運風險', level: '低', description: '供應鏈穩定' },
    { type: '財務風險', level: '低', description: '現金流充足' }
  ]
};

function generateChartData(data: any, type: string) {
  // 根據不同類型生成對應的圖表數據
  switch (type) {
    case 'turnover':
      return {
        labels: Object.keys(data.turnoverRisk),
        datasets: [{
          label: '離職風險指數',
          data: Object.values(data.turnoverRisk).map((d: any) => d.percentage)
        }]
      };
    case 'finance':
      return {
        labels: Object.keys(data.accountsReceivable.aging),
        datasets: [{
          label: '應收帳款帳齡分析',
          data: Object.values(data.accountsReceivable.aging)
        }]
      };
    // 可以根據需求添加更多圖表類型
    default:
      return null;
  }
}

function formatHRResponse(message: string, data: any) {
  if (message.includes('離職風險')) {
    const riskData = data.turnoverRisk;
    return {
      message: `近三個月員工離職風險分析：\n\n${
        Object.entries(riskData)
          .map(([dept, info]: [string, any]) => 
            `${dept}部門：\n風險等級：${info.risk}\n離職風險指數：${info.percentage}%\n主要因素：${info.factors.join('、')}`
          )
          .join('\n\n')
      }`,
      type: 'chart',
      metadata: {
        chartData: generateChartData(data, 'turnover')
      }
    };
  }
  
  if (message.includes('Senior Frontend')) {
    const candidates = data.recruitmentMatch['Senior Frontend'];
    return {
      message: `找到 ${candidates.length} 位適合的候選人：\n\n${
        candidates
          .map(c => `候選人 ${c.id}\n匹配度：${c.match}%\n技能：${c.skills.join(', ')}\n相關經驗：${c.experience} 年`)
          .join('\n\n')
      }`,
      type: 'table',
      metadata: {
        tableData: candidates
      }
    };
  }

  if (message.includes('差勤規定')) {
    const policy = data.companyPolicies.attendance;
    return {
      message: `公司差勤規定：\n
工作時間：${policy.workHours}
彈性工時：${policy.flexibleHours ? '允許' : '不允許'}
遠端工作：${policy.remoteWork}
加班規定：${policy.overtime}`,
      type: 'text'
    };
  }

  return {
    message: '抱歉，我無法理解您的問題。請您重新描述，或選擇其他問題。',
    type: 'text'
  };
}

function formatITResponse(message: string, data: any) {
  if (message.includes('程式碼質量')) {
    const quality = data.codeQuality;
    return {
      message: `系統程式碼質量分析：\n
測試覆蓋率：${quality.coverage}%
Bug 分布：
- 嚴重：${quality.bugs.critical}
- 重要：${quality.bugs.major}
- 次要：${quality.bugs.minor}
技術債：${quality.techDebt}

改進建議：
${quality.recommendations.map((r: string) => `• ${r}`).join('\n')}`,
      type: 'chart',
      metadata: {
        chartData: {
          bugs: quality.bugs,
          coverage: quality.coverage
        }
      }
    };
  }

  if (message.includes('資料庫查詢')) {
    const perf = data.performance;
    return {
      message: `資料庫查詢效能分析：\n
平均 API 響應時間：${perf.apiResponseTime}
查詢統計：
- 需優化查詢：${perf.databaseQueries.slow}
- 已優化查詢：${perf.databaseQueries.optimized}
- 總查詢數：${perf.databaseQueries.total}

建議：優先優化 ${perf.databaseQueries.slow} 個慢查詢`,
      type: 'table',
      metadata: {
        tableData: perf.databaseQueries
      }
    };
  }

  return {
    message: '抱歉，我無法理解您的問題。請您重新描述，或選擇其他問題。',
    type: 'text'
  };
}

function formatFinanceResponse(message: string, data: any) {
  if (message.includes('稅務')) {
    const tax = data.taxAnalysis;
    return {
      message: `稅務優化分析：\n
當前稅率：${tax.currentRate}
優化空間：${tax.optimization.potential}

優化建議：
${tax.optimization.suggestions.map((s: string) => `• ${s}`).join('\n')}`,
      type: 'text'
    };
  }

  if (message.includes('應收帳款')) {
    const ar = data.accountsReceivable;
    return {
      message: `應收帳款風險分析：\n
總額：${ar.total.toLocaleString()} 元

帳齡分析：
${Object.entries(ar.aging)
  .map(([age, amount]) => `${age}：${(amount as number).toLocaleString()} 元`)
  .join('\n')}`,
      type: 'chart',
      metadata: {
        chartData: generateChartData(data, 'finance')
      }
    };
  }

  return {
    message: '抱歉，我無法理解您的問題。請您重新描述，或選擇其他問題。',
    type: 'text'
  };
}

function formatLegalResponse(message: string, data: any) {
  if (message.includes('合約')) {
    const review = data.contracts.review;
    return {
      message: `合約風險評估：\n
風險等級：${review.riskLevel}

主要問題：
${review.keyIssues.map((i: string) => `• ${i}`).join('\n')}

改善建議：
${review.suggestions.map((s: string) => `• ${s}`).join('\n')}`,
      type: 'text'
    };
  }

  if (message.includes('法規')) {
    const compliance = data.compliance;
    return {
      message: `法規遵循檢查結果：\n
整體狀態：${compliance.status}

待改善項目：
${compliance.gaps.map((g: string) => `• ${g}`).join('\n')}`,
      type: 'text'
    };
  }

  return {
    message: '抱歉，我無法理解您的問題。請您重新描述，或選擇其他問題。',
    type: 'text'
  };
}

function formatExecutiveResponse(message: string, data: any) {
  if (message.includes('營運指標')) {
    const kpi = data.kpi;
    return {
      message: `本週關鍵營運指標：\n
營收：${kpi.revenue.value.toLocaleString()} (${kpi.revenue.trend})
利潤：${kpi.profit.value.toLocaleString()} (${kpi.profit.trend})
客戶滿意度：${kpi.customerSatisfaction.value} (${kpi.customerSatisfaction.trend})
員工滿意度：${kpi.employeeSatisfaction.value} (${kpi.employeeSatisfaction.trend})`,
      type: 'chart',
      metadata: {
        chartData: {
          labels: ['營收', '利潤', '客戶滿意度', '員工滿意度'],
          datasets: [{
            label: '關鍵指標',
            data: [
              kpi.revenue.value,
              kpi.profit.value,
              kpi.customerSatisfaction.value,
              kpi.employeeSatisfaction.value
            ]
          }]
        }
      }
    };
  }

  if (message.includes('績效')) {
    const performance = data.departmentPerformance;
    return {
      message: `部門績效分析：\n
${Object.entries(performance)
  .map(([dept, data]) => `${dept}部門：達成率 ${(data as any).achievement}%，狀態：${(data as any).status}`)
  .join('\n')}`,
      type: 'table',
      metadata: {
        tableData: performance
      }
    };
  }

  return {
    message: '抱歉，我無法理解您的問題。請您重新描述，或選擇其他問題。',
    type: 'text'
  };
}

export async function POST(request: Request) {
  try {
    const { message, department } = await request.json();

    switch (department) {
      case 'hr':
        return NextResponse.json(formatHRResponse(message, hrData));
      case 'it':
        return NextResponse.json(formatITResponse(message, itData));
      case 'finance':
        return NextResponse.json(formatFinanceResponse(message, financeData));
      case 'legal':
        return NextResponse.json(formatLegalResponse(message, legalData));
      case 'executive':
        return NextResponse.json(formatExecutiveResponse(message, executiveData));
      default:
        return NextResponse.json({
          message: '無效的部門選擇',
          type: 'text'
        });
    }
  } catch (error) {
    return NextResponse.json(
      { error: '系統發生錯誤，請稍後再試' },
      { status: 500 }
    );
  }
} 