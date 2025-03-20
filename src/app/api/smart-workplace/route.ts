import { NextResponse } from 'next/server';

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  fill?: boolean;
  pointBackgroundColor?: string;
  pointBorderColor?: string;
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'radar';
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
}

interface Candidate {
  id: string;
  match: number;
  skills: string[];
  experience: number;
}

interface DepartmentData {
  turnoverRisk: Record<string, {
    risk: string;
    percentage: number;
    factors: string[];
  }>;
  recruitmentMatch: Record<string, Candidate[]>;
  companyPolicies: {
    attendance: {
      workHours: string;
      flexibleHours: boolean;
      remoteWork: string;
      overtime: string;
    };
  };
}

// 模擬 HR 數據
const hrData: DepartmentData = {
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

// 生成營收趨勢圖表數據
function generateRevenueChart(): ChartData {
  return {
    type: 'line',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{
        label: '營收（百萬）',
        data: [125000000, 130000000, 142000000, 150000000].map(v => v / 1000000),
        borderColor: '#4CAF50',
        fill: false
      }]
    }
  };
}

// 生成部門績效圖表數據
function generateDepartmentChart(): ChartData {
  const departments = Object.keys(executiveData.departmentPerformance);
  const scores = departments.map(dept => executiveData.departmentPerformance[dept as keyof typeof executiveData.departmentPerformance].achievement);
  
  return {
    type: 'bar',
    data: {
      labels: departments,
      datasets: [{
        label: '部門績效',
        data: scores,
        backgroundColor: ['#2196F3', '#4CAF50', '#FFC107', '#F44336']
      }]
    }
  };
}

// 生成滿意度比較圖表數據
function generateSatisfactionChart(): ChartData {
  return {
    type: 'line',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [
        {
          label: '客戶滿意度',
          data: [4.0, 4.2, 4.3, 4.5],
          borderColor: '#2196F3',
          fill: false
        },
        {
          label: '員工滿意度',
          data: [4.0, 4.1, 4.1, 4.2],
          borderColor: '#4CAF50',
          fill: false
        }
      ]
    }
  };
}

// 生成營運趨勢預測圖表
function generateTrendForecastChart(): ChartData {
  return {
    type: 'line',
    data: {
      labels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q1預測', 'Q2預測'],
      datasets: [
        {
          label: '營收趨勢（百萬）',
          data: [125, 130, 142, 150, 158, 165],
          borderColor: '#4CAF50',
          fill: false
        },
        {
          label: '利潤趨勢（百萬）',
          data: [25, 27, 28, 30, 32, 34],
          borderColor: '#2196F3',
          fill: false
        }
      ]
    }
  };
}

// 生成風險評估圖表
function generateRiskAssessmentChart(): ChartData {
  return {
    type: 'bar',
    data: {
      labels: ['市場風險', '營運風險', '財務風險', '法規風險', '技術風險'],
      datasets: [{
        label: '風險指數',
        data: [75, 45, 30, 55, 60],
        backgroundColor: [
          '#FF5252', // 高風險 - 紅色
          '#FFC107', // 中風險 - 黃色
          '#4CAF50', // 低風險 - 綠色
          '#FF9800', // 中高風險 - 橙色
          '#FF7043'  // 中高風險 - 橙紅色
        ]
      }]
    }
  };
}

// 生成稅務優化圖表
function generateTaxOptimizationChart(): ChartData {
  return {
    type: 'bar',
    data: {
      labels: ['研發投資', '設備折舊', '人才培訓', '綠能投資', '國際營運'],
      datasets: [{
        label: '預估節稅效益（萬元）',
        data: [150, 80, 60, 100, 120],
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FFC107',
          '#9C27B0',
          '#FF5722'
        ]
      }]
    }
  };
}

// 生成財務健康度圖表
function generateFinanceHealthChart(): ChartData {
  return {
    type: 'line',
    data: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
      datasets: [
        {
          label: '營收成長率',
          data: [8, 10, 12, 11, 13, 12],
          borderColor: '#4CAF50',
          fill: false
        },
        {
          label: '利潤率',
          data: [6, 7, 8, 7.5, 8.5, 8],
          borderColor: '#2196F3',
          fill: false
        }
      ]
    }
  };
}

// 生成應收帳款圖表
function generateReceivablesChart(): ChartData {
  return {
    type: 'pie',
    data: {
      labels: ['30天內', '31-60天', '61-90天', '90天以上'],
      datasets: [{
        label: '應收帳款帳齡分布',
        data: [65, 20, 10, 5],
        backgroundColor: [
          '#4CAF50',  // 綠色 - 健康
          '#FFC107',  // 黃色 - 注意
          '#FF9800',  // 橙色 - 警告
          '#F44336'   // 紅色 - 危險
        ]
      }]
    }
  };
}

// 生成合約風險圖表
function generateContractRiskChart(): ChartData {
  return {
    type: 'radar',
    data: {
      labels: ['付款條件', '責任歸屬', '保密條款', '智財權條款', '違約處理', '爭議解決'],
      datasets: [{
        label: '風險評估分數',
        data: [85, 70, 60, 75, 80, 65],
        backgroundColor: 'rgba(33, 150, 243, 0.2)',
        borderColor: '#2196F3',
        pointBackgroundColor: '#2196F3'
      }]
    }
  };
}

// 生成法規遵循圖表
function generateComplianceChart(): ChartData {
  return {
    type: 'bar',
    data: {
      labels: ['個資保護', '資訊安全', '勞動法規', '環保法規', '公司治理'],
      datasets: [{
        label: '法規遵循程度',
        data: [85, 75, 90, 95, 88],
        backgroundColor: [
          '#4CAF50',
          '#FFC107',
          '#4CAF50',
          '#4CAF50',
          '#2196F3'
        ]
      }]
    }
  };
}

// 生成離職風險圖表
function generateTurnoverRiskChart(): ChartData {
  return {
    type: 'bar',
    data: {
      labels: ['工程部', '行銷部', '業務部'],
      datasets: [{
        label: '離職風險指數 (%)',
        data: [15, 5, 8],
        backgroundColor: [
          '#FF5252',  // 高風險 - 紅色
          '#4CAF50',  // 低風險 - 綠色
          '#FFC107'   // 中風險 - 黃色
        ]
      }]
    }
  };
}

// 生成人才匹配度圖表
function generateRecruitmentMatchChart(): ChartData {
  return {
    type: 'radar',
    data: {
      labels: ['技術能力', '工作經驗', '團隊協作', '溝通能力', '學習意願'],
      datasets: [
        {
          label: '候選人 C001',
          data: [95, 90, 85, 88, 92],
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196F3'
        },
        {
          label: '候選人 C002',
          data: [88, 85, 90, 92, 86],
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: '#4CAF50'
        }
      ]
    }
  };
}

// 生成程式碼質量圖表
function generateCodeQualityChart(): ChartData {
  return {
    type: 'bar',
    data: {
      labels: ['測試覆蓋率', '程式碼重複率', '維護性指標', '安全性指標', '效能指標'],
      datasets: [{
        label: '程式碼品質評分',
        data: [85, 92, 78, 88, 85],
        backgroundColor: [
          '#4CAF50',  // 綠色
          '#2196F3',  // 藍色
          '#FFC107',  // 黃色
          '#9C27B0',  // 紫色
          '#FF5722'   // 橙色
        ]
      }]
    }
  };
}

// 生成資料庫效能圖表
function generateDatabasePerformanceChart(): ChartData {
  return {
    type: 'line',
    data: {
      labels: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
      datasets: [
        {
          label: '響應時間 (ms)',
          data: [250, 280, 310, 290, 260, 240],
          borderColor: '#2196F3',
          fill: false
        },
        {
          label: '查詢數量',
          data: [1000, 1200, 1500, 1300, 1100, 1000],
          borderColor: '#4CAF50',
          fill: false
        }
      ]
    }
  };
}

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

function formatHRResponse(message: string, data: DepartmentData) {
  if (message.includes('離職風險')) {
    const riskData = data.turnoverRisk;
    return {
      message: `近三個月員工離職風險分析：\n\n${
        Object.entries(riskData)
          .map(([dept, info]) => 
            `${dept}部門：\n風險等級：${info.risk}\n離職風險指數：${info.percentage}%\n主要因素：${info.factors.join('、')}`
          )
          .join('\n\n')
      }

風險因應對策：
1. 工程部：
   - 檢討加班制度
   - 調整薪資結構
   - 優化工作環境

2. 業務部：
   - 改善績效制度
   - 提供銷售支援
   - 強化團隊激勵

3. 行銷部：
   - 維持良好氛圍
   - 提供成長機會
   - 定期團隊活動`,
      type: 'chart',
      metadata: {
        chartData: generateTurnoverRiskChart()
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
      }

人才評估維度：
1. 技術能力：前端框架熟練度、TypeScript 掌握程度
2. 工作經驗：專案經驗、團隊合作經歷
3. 團隊協作：溝通能力、團隊精神
4. 學習意願：持續學習、技術探索

建議行動：
• 安排技術主管面試
• 進行實作測試
• 評估團隊契合度`,
      type: 'chart',
      metadata: {
        chartData: generateRecruitmentMatchChart()
      }
    };
  }

  if (message.includes('差勤') || message.includes('規定')) {
    const policy = data.companyPolicies.attendance;
    return {
      message: `公司差勤規定：\n
工作時間：${policy.workHours}
彈性工時：${policy.flexibleHours ? '允許' : '不允許'}
遠端工作：${policy.remoteWork}
加班規定：${policy.overtime}

其他重要規定：
1. 彈性上下班：
   - 核心工作時間：10:00-16:00
   - 彈性時段：08:00-10:00 / 16:00-19:00

2. 遠端工作政策：
   - 每週可遠端工作 2 天
   - 需提前一週申請
   - 主管可視專案需求調整

3. 加班規定：
   - 需事先申請並核准
   - 可選擇補休或加班費
   - 30 天內必須完成補休

4. 特殊假別：
   - 生日假 1 天
   - 志工假 2 天
   - 進修假依需求申請`,
      type: 'text'
    };
  }

  return {
    message: `人力資源智能助手已啟動，您可以查詢：
1. 員工離職風險分析
2. 人才招募配對
3. 公司差勤規定

請選擇您想了解的內容。`,
    type: 'text'
  };
}

function formatITResponse(message: string, data: any) {
  if (message.includes('程式碼') || message.includes('代碼')) {
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
${quality.recommendations.map((r: string) => `• ${r}`).join('\n')}

質量指標評分：
• 測試覆蓋率：85分 - 良好
• 程式碼重複率：92分 - 優秀
• 維護性指標：78分 - 待改進
• 安全性指標：88分 - 良好
• 效能指標：85分 - 良好

優先改進項目：
1. 提高單元測試覆蓋率
2. 重構複雜度過高的模組
3. 更新過時的依賴套件`,
      type: 'chart',
      metadata: {
        chartData: generateCodeQualityChart()
      }
    };
  }

  if (message.includes('資料庫') || message.includes('查詢')) {
    const perf = data.performance;
    return {
      message: `資料庫查詢效能分析：\n
平均 API 響應時間：${perf.apiResponseTime}
查詢統計：
- 需優化查詢：${perf.databaseQueries.slow}
- 已優化查詢：${perf.databaseQueries.optimized}
- 總查詢數：${perf.databaseQueries.total}

效能監控：
• 響應時間趨勢：穩定，平均 250ms
• 查詢量變化：正常波動範圍內
• 系統負載：低於 50%

優化建議：
1. 優化慢查詢：
   - 新增適當索引
   - 重寫複雜查詢
   - 實施查詢快取

2. 資料庫維護：
   - 定期更新統計資訊
   - 最佳化資料表
   - 清理過期資料

3. 監控強化：
   - 設置效能警報
   - 自動化效能報告
   - 建立效能基準`,
      type: 'chart',
      metadata: {
        chartData: generateDatabasePerformanceChart()
      }
    };
  }

  return {
    message: `IT 智能開發助手已啟動，您可以查詢：
1. 程式碼質量分析
2. 資料庫查詢效能

請選擇您想了解的內容。`,
    type: 'text'
  };
}

function formatFinanceResponse(message: string, data: any) {
  if (message.includes('財務健康')) {
    return {
      message: `財務健康報告：

營收狀況：15,000,000 (成長 12%)
利潤表現：3,000,000 (成長 8%)
現金流狀況：良好
未來展望：穩定成長

關鍵指標分析：
• 營收持續穩定成長
• 利潤率維持在健康水準
• 現金流充裕，可支持營運擴展
• 財務結構穩健，負債比率適中

詳細分析：
1. 營收成長動能：
   - 主要產品線銷售增長
   - 新市場開拓成效顯著
   - 客戶群持續擴大

2. 成本控制：
   - 營運效率提升
   - 供應鏈優化
   - 自動化投資回報良好

3. 投資報酬：
   - 研發投資效益顯現
   - 設備更新提升產能
   - 人才投資促進創新`,
      type: 'chart',
      metadata: {
        chartData: generateFinanceHealthChart()
      }
    };
  }

  if (message.includes('稅務優化')) {
    return {
      message: `稅務優化分析：

可行的節稅方案：

1. 研發投資抵減：
   • 預估效益：150萬
   • 適用項目：新產品研發
   • 申請條件：已具備

2. 設備折舊：
   • 預估效益：80萬
   • 加速折舊方案
   • 符合綠能規範

3. 人才培訓投資：
   • 預估效益：60萬
   • 產業人才投資方案
   • 政府補助計畫

4. 綠能投資抵減：
   • 預估效益：100萬
   • 太陽能設備
   • 節能改善方案

5. 國際營運規劃：
   • 預估效益：120萬
   • 跨國稅務最適化
   • 移轉訂價策略

總體效益評估：
• 年度預估節稅：510萬
• 投資報酬率：25%
• 實施難度：中等
• 法規符合度：100%`,
      type: 'chart',
      metadata: {
        chartData: generateTaxOptimizationChart()
      }
    };
  }

  if (message.includes('應收帳款')) {
    return {
      message: `應收帳款風險分析：

帳齡分布：
• 30天內：65%
• 31-60天：20%
• 61-90天：10%
• 90天以上：5%

風險評估：
1. 低風險 (30天內)：
   - 金額：9,750,000
   - 客戶數：42
   - 收回機率：99%

2. 中低風險 (31-60天)：
   - 金額：3,000,000
   - 客戶數：15
   - 收回機率：95%

3. 中風險 (61-90天)：
   - 金額：1,500,000
   - 客戶數：8
   - 收回機率：85%

4. 高風險 (90天以上)：
   - 金額：750,000
   - 客戶數：5
   - 收回機率：60%

建議行動方案：
• 加強催收90天以上帳款
• 檢討信用條件政策
• 建立預警機制
• 考慮保險或保理方案`,
      type: 'chart',
      metadata: {
        chartData: generateReceivablesChart()
      }
    };
  }

  return {
    message: `財務智能助手已啟動，您可以查詢：
1. 分析本季度的稅務優化空間
2. 生成本月的財務健康報告
3. 評估主要客戶的應收帳款風險
4. 預測下季度的現金流狀況

請選擇您想了解的內容。`,
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
${review.suggestions.map((s: string) => `• ${s}`).join('\n')}

風險評分：
• 付款條件：85分 - 需要明確時程
• 責任歸屬：70分 - 需要釐清範圍
• 保密條款：60分 - 建議強化
• 智財權條款：75分 - 可再完善
• 違約處理：80分 - 基本完整
• 爭議解決：65分 - 需要補充`,
      type: 'chart',
      metadata: {
        chartData: generateContractRiskChart()
      }
    };
  }

  if (message.includes('法規')) {
    const compliance = data.compliance;
    return {
      message: `法規遵循檢查結果：\n
整體狀態：${compliance.status}

各項法規遵循評分：
• 個資保護：85分 - 待優化項目：資料存取控制
• 資訊安全：75分 - 待優化項目：ISO 27001認證更新
• 勞動法規：90分 - 符合法規要求
• 環保法規：95分 - 超越法規標準
• 公司治理：88分 - 持續優化中

待改善項目：
${compliance.gaps.map((g: string) => `• ${g}`).join('\n')}

改善時程：
1. 短期（1個月內）：更新資料存取權限
2. 中期（3個月內）：完成 ISO 27001 認證
3. 長期（6個月內）：建立自動化法遵系統`,
      type: 'chart',
      metadata: {
        chartData: generateComplianceChart()
      }
    };
  }

  return {
    message: `法務諮詢助手已啟動，您可以查詢：
1. 合約風險評估
2. 法規遵循檢查

請選擇您想了解的內容。`,
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
        chartData: generateRevenueChart()
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
      type: 'chart',
      metadata: {
        chartData: generateDepartmentChart()
      }
    };
  }

  if (message.includes('滿意度')) {
    return {
      message: `滿意度分析報告：\n客戶滿意度：${data.kpi.customerSatisfaction.value}，較上季提升 ${data.kpi.customerSatisfaction.trend}\n員工滿意度：${data.kpi.employeeSatisfaction.value}，較上季提升 ${data.kpi.employeeSatisfaction.trend}\n\n建議行動方案：\n1. 持續優化客戶服務流程\n2. 加強內部溝通和員工關懷`,
      type: 'chart',
      metadata: {
        chartData: generateSatisfactionChart()
      }
    };
  }

  if (message.includes('趨勢')) {
    return {
      message: `下季度營運趨勢預測：\n
1. 營收預測：
   - Q1：預計達到 1.58 億（+5.3%）
   - Q2：預計達到 1.65 億（+4.4%）

2. 利潤預測：
   - Q1：預計達到 3,200 萬（+6.7%）
   - Q2：預計達到 3,400 萬（+6.3%）

3. 增長動力：
   - 新產品線預計貢獻 15% 營收
   - 海外市場擴展計畫進展順利
   - 數位轉型專案效益開始顯現

4. 潛在挑戰：
   - 原物料成本可能上漲
   - 新競爭者進入市場
   - 匯率波動風險增加`,
      type: 'chart',
      metadata: {
        chartData: generateTrendForecastChart()
      }
    };
  }

  if (message.includes('風險')) {
    return {
      message: `目前主要營運風險評估：\n
1. 市場風險 (75分)：
   - 新競爭者進入市場
   - 產品價格競爭加劇
   - 市場需求變動

2. 技術風險 (60分)：
   - 技術更新速度加快
   - 資安威脅增加
   - 人才競爭激烈

3. 法規風險 (55分)：
   - 新法規實施
   - 合規成本增加
   - 跨國法規差異

4. 營運風險 (45分)：
   - 供應鏈穩定性
   - 品質管控
   - 庫存管理

5. 財務風險 (30分)：
   - 應收帳款管理
   - 現金流狀況
   - 匯率波動

風險應對策略：
1. 加強市場情報收集與分析
2. 提升技術研發投資
3. 優化供應鏈管理
4. 強化內部控制機制`,
      type: 'chart',
      metadata: {
        chartData: generateRiskAssessmentChart()
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

    if (department === 'executive') {
      if (message.includes('營收') || message.includes('銷售')) {
        return NextResponse.json({
          message: `本週關鍵營運指標：\n營收：150,000,000 (+12%)\n利潤：30,000,000 (+8%)\n客戶滿意度：4.5 (+0.3)\n員工滿意度：4.2 (+0.1)`,
          type: 'chart',
          metadata: {
            chartData: generateRevenueChart()
          }
        });
      } else if (message.includes('部門') || message.includes('績效')) {
        return NextResponse.json({
          message: `部門績效分析：\nsales部門：達成率 95%，狀態：達標\nengineering部門：達成率 88%，狀態：良好\nmarketing部門：達成率 92%，狀態：優秀\nservice部門：達成率 85%，狀態：待改進`,
          type: 'chart',
          metadata: {
            chartData: generateDepartmentChart()
          }
        });
      } else if (message.includes('滿意度')) {
        return NextResponse.json({
          message: `滿意度分析報告：\n客戶滿意度：4.5，較上季提升 0.3\n員工滿意度：4.2，較上季提升 0.1\n\n建議行動方案：\n1. 持續優化客戶服務流程\n2. 加強內部溝通和員工關懷`,
          type: 'chart',
          metadata: {
            chartData: generateSatisfactionChart()
          }
        });
      } else if (message.includes('趨勢')) {
        return NextResponse.json({
          message: `下季度營運趨勢預測：\n
1. 營收預測：
   - Q1：預計達到 1.58 億（+5.3%）
   - Q2：預計達到 1.65 億（+4.4%）

2. 利潤預測：
   - Q1：預計達到 3,200 萬（+6.7%）
   - Q2：預計達到 3,400 萬（+6.3%）

3. 增長動力：
   - 新產品線預計貢獻 15% 營收
   - 海外市場擴展計畫進展順利
   - 數位轉型專案效益開始顯現

4. 潛在挑戰：
   - 原物料成本可能上漲
   - 新競爭者進入市場
   - 匯率波動風險增加`,
          type: 'chart',
          metadata: {
            chartData: generateTrendForecastChart()
          }
        });
      } else if (message.includes('風險')) {
        return NextResponse.json({
          message: `目前主要營運風險評估：\n
1. 市場風險 (75分)：
   - 新競爭者進入市場
   - 產品價格競爭加劇
   - 市場需求變動

2. 技術風險 (60分)：
   - 技術更新速度加快
   - 資安威脅增加
   - 人才競爭激烈

3. 法規風險 (55分)：
   - 新法規實施
   - 合規成本增加
   - 跨國法規差異

4. 營運風險 (45分)：
   - 供應鏈穩定性
   - 品質管控
   - 庫存管理

5. 財務風險 (30分)：
   - 應收帳款管理
   - 現金流狀況
   - 匯率波動

風險應對策略：
1. 加強市場情報收集與分析
2. 提升技術研發投資
3. 優化供應鏈管理
4. 強化內部控制機制`,
          type: 'chart',
          metadata: {
            chartData: generateRiskAssessmentChart()
          }
        });
      }
    }

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