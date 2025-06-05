import { NextRequest, NextResponse } from 'next/server';

// 基礎工具資料（非 AI 工具）
const baseTools = [
  // SEO 工具
  {
    id: 'title-generator',
    name: 'SEO 標題生成器',
    description: '智能生成吸引人且 SEO 友善的網頁標題',
    iconName: 'Type',
    componentId: 'TitleGenerator',
    tags: ['工具', 'SEO'],
    category: 'SEO',
    isAITool: false,
  },
  {
    id: 'description-generator',
    name: 'SEO 描述生成器',
    description: '創建引人入勝的 meta 描述，提升點擊率',
    iconName: 'FileText',
    componentId: 'DescriptionGenerator',
    tags: ['工具', 'SEO'],
    category: 'SEO',
    isAITool: false,
  },
  {
    id: 'keyword-generator',
    name: 'SEO 關鍵字生成器',
    description: '挖掘高價值關鍵字，提升搜尋排名',
    iconName: 'Search',
    componentId: 'KeywordGenerator',
    tags: ['工具', 'SEO'],
    category: 'SEO',
    isAITool: false,
  },
  {
    id: 'faq-generator',
    name: 'SEO 常見問題生成器',
    description: '生成結構化 FAQ，增強 SEO 效果',
    iconName: 'MessageSquare',
    componentId: 'FaqGenerator',
    tags: ['工具', 'SEO'],
    category: 'SEO',
    isAITool: false,
  },
  {
    id: 'review-generator',
    name: 'SEO 評論生成器',
    description: '創建真實可信的產品或服務評論',
    iconName: 'Star',
    componentId: 'ReviewGenerator',
    tags: ['工具', 'SEO'],
    category: 'SEO',
    isAITool: false,
  },
  {
    id: 'feature-generator',
    name: 'SEO 功能描述生成器',
    description: '突出產品功能特色，吸引目標客群',
    iconName: 'Zap',
    componentId: 'FeatureGenerator',
    tags: ['工具', 'SEO'],
    category: 'SEO',
    isAITool: false,
  },

  // 健康工具
  {
    id: 'tcm-check',
    name: '中醫體質檢測',
    description: '基於中醫理論的個人體質分析工具',
    iconName: 'Stethoscope',
    componentId: 'TCMCheck',
    tags: ['工具', '健康'],
    category: '健康',
    isAITool: false,
  },

  // 電腦工具
  {
    id: 'server-spec-calculator',
    name: '伺服器規格計算器',
    description: '根據需求計算最適合的伺服器配置',
    iconName: 'Server',
    componentId: 'ServerSpecCalculator',
    tags: ['工具', '電腦'],
    category: '電腦',
    isAITool: false,
  },
  {
    id: 'workload-scalability-calculator',
    name: '工作負載擴展性計算器',
    description: '評估系統在不同負載下的擴展需求',
    iconName: 'Cpu',
    componentId: 'WorkloadScalabilityCalculator',
    tags: ['工具', '電腦'],
    category: '電腦',
    isAITool: false,
  },
  {
    id: 'model-performance-calculator',
    name: 'AI 模型效能計算器',
    description: '預測 AI 模型的運算效能和資源需求',
    iconName: 'Network',
    componentId: 'ModelPerformanceCalculator',
    tags: ['工具', '電腦'],
    category: '電腦',
    isAITool: false,
  },
  {
    id: 'ai-infrastructure-cost-calculator',
    name: 'AI 基礎建設成本計算器',
    description: '評估 AI 專案的硬體、運營和軟體成本',
    iconName: 'HardDrive',
    componentId: 'AIInfrastructureCostCalculator',
    tags: ['工具', '電腦'],
    category: '電腦',
    isAITool: false,
  },
  {
    id: 'gpu-memory-calculator',
    name: 'GPU 內存計算器',
    description: '計算 AI 模型運行所需的 GPU 內存',
    iconName: 'Zap',
    componentId: 'GPUMemoryCalculator',
    tags: ['工具', '電腦'],
    category: '電腦',
    isAITool: false,
  },

  // 金融工具
  {
    id: 'roi-calculator',
    name: 'ROI 投資報酬率計算器',
    description: '計算投資的預期回報率和風險評估',
    iconName: 'TrendingUp',
    componentId: 'ROICalculator',
    tags: ['工具', '金融'],
    category: '金融',
    isAITool: false,
  },
  {
    id: 'deposit-calculator',
    name: '定期存款計算器',
    description: '計算定期存款的利息收益',
    iconName: 'PiggyBank',
    componentId: 'DepositCalculator',
    tags: ['工具', '金融'],
    category: '金融',
    isAITool: false,
  },
  {
    id: 'loan-calculator',
    name: '貸款計算器',
    description: '計算貸款的月付金額和總利息',
    iconName: 'Landmark',
    componentId: 'LoanCalculator',
    tags: ['工具', '金融'],
    category: '金融',
    isAITool: false,
  },
  {
    id: 'currency-converter',
    name: '匯率轉換器',
    description: '即時匯率查詢和貨幣轉換',
    iconName: 'CircleDollarSign',
    componentId: 'CurrencyConverter',
    tags: ['工具', '金融'],
    category: '金融',
    isAITool: false,
  },
  {
    id: 'compound-interest-calculator',
    name: '複利計算器',
    description: '計算複利投資的長期增長潛力',
    iconName: 'Repeat',
    componentId: 'CompoundInterestCalculator',
    tags: ['工具', '金融'],
    category: '金融',
    isAITool: false,
  },

  // 製造業工具
  {
    id: 'packaging-calculator',
    name: '包裝計算器',
    description: '計算產品包裝的最佳尺寸和材料用量',
    iconName: 'Package',
    componentId: 'PackagingCalculator',
    tags: ['工具', '製造'],
    category: '製造',
    isAITool: false,
  },
  {
    id: 'yield-calculator',
    name: '產量計算器',
    description: '計算生產線的產量和效率指標',
    iconName: 'BarChart3',
    componentId: 'YieldCalculator',
    tags: ['工具', '製造'],
    category: '製造',
    isAITool: false,
  },
  {
    id: 'oee-calculator',
    name: 'OEE 設備效率計算器',
    description: '計算設備的整體效率（OEE）指標',
    iconName: 'Factory',
    componentId: 'OEECalculator',
    tags: ['工具', '製造'],
    category: '製造',
    isAITool: false,
  },
  {
    id: 'metal-weight-calculator',
    name: '金屬重量計算器',
    description: '計算各種金屬材料的重量和體積',
    iconName: 'Scale',
    componentId: 'MetalWeightCalculator',
    tags: ['工具', '製造'],
    category: '製造',
    isAITool: false,
  },
  {
    id: 'manufacturing-calculator',
    name: '製造成本計算器',
    description: '計算產品的製造成本和利潤分析',
    iconName: 'Calculator',
    componentId: 'ManufacturingCalculator',
    tags: ['工具', '製造'],
    category: '製造',
    isAITool: false,
  },
];

// GET - 獲取所有基礎工具
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');

    let filteredTools = [...baseTools];

    // 如果有分類參數，篩選特定分類的工具
    if (category) {
      filteredTools = filteredTools.filter(
        tool => tool.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // 如果有標籤參數，篩選包含該標籤的工具
    if (tag) {
      filteredTools = filteredTools.filter(tool => tool.tags.includes(tag));
    }

    return NextResponse.json({
      success: true,
      data: filteredTools,
      count: filteredTools.length,
      categories: ['SEO', '健康', '電腦', '金融', '製造'],
    });
  } catch (error) {
    console.error('Error in GET /api/aitool/base-tools:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch base tools',
      },
      { status: 500 }
    );
  }
}
