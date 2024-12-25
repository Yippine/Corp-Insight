import { useState } from 'react';
import { Calculator, Package, Activity, BarChart3, Scale, DollarSign, Coins, PieChart, LineChart, Wallet, Monitor, Server, Database, Cpu, Network, Search, FileText, Type, MessageSquare, Star, Zap } from 'lucide-react';
import ManufacturingCalculator from './manufacturing/ManufacturingCalculator';
import MetalWeightCalculator from './manufacturing/MetalWeightCalculator';
import YieldCalculator from './manufacturing/YieldCalculator';
import PackagingCalculator from './manufacturing/PackagingCalculator';
import OEECalculator from './manufacturing/OEECalculator';
import CompoundInterestCalculator from './finance/CompoundInterestCalculator';
import CurrencyConverter from './finance/CurrencyConverter';
import LoanCalculator from './finance/LoanCalculator';
import ROICalculator from './finance/ROICalculator';
import DepositCalculator from './finance/DepositCalculator';
import GPUMemoryCalculator from './computer/GPUMemoryCalculator';
import ServerSpecCalculator from './computer/ServerSpecCalculator';
import AIInfrastructureCostCalculator from './computer/AIInfrastructureCostCalculator';
import ModelPerformanceCalculator from './computer/ModelPerformanceCalculator';
import WorkloadScalabilityCalculator from './computer/WorkloadScalabilityCalculator';
import TitleGenerator from './seo/TitleGenerator';
import DescriptionGenerator from './seo/DescriptionGenerator';
import KeywordGenerator from './seo/KeywordGenerator';
import FaqGenerator from './seo/FaqGenerator';
import ReviewGenerator from './seo/ReviewGenerator';
import FeatureGenerator from './seo/FeatureGenerator';
import { promptTools, PromptToolConfig } from '../../config/promptTools';
import PromptToolTemplate from './common/PromptToolTemplate';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType;
}

const seoTools: Tool[] = [
  {
    id: 'title-generator',
    name: 'SEO 標題策略大師',
    description: '智能生成 SEO 友好的標題，提高點擊率和搜尋排名',
    icon: Type,
    component: TitleGenerator
  },
  {
    id: 'description-generator',
    name: 'SEO 描述智能專家',
    description: '生成優化的 META 描述，提升搜尋結果的點擊率',
    icon: FileText,
    component: DescriptionGenerator
  },
  {
    id: 'keyword-generator',
    name: 'SEO 關鍵詞戰略家',
    description: '發掘高價值長尾關鍵字，降低競爭難度',
    icon: Search,
    component: KeywordGenerator
  },
  {
    id: 'faq-generator',
    name: 'FAQ 智能構建師',
    description: '智能生成常見問題，豐富網站內容',
    icon: MessageSquare,
    component: FaqGenerator
  },
  {
    id: 'review-generator',
    name: 'SEO 社群評價專家',
    description: '生成真實感產品評價，增加社交證明',
    icon: Star,
    component: ReviewGenerator
  },
  {
    id: 'feature-generator',
    name: '產品價值放大器',
    description: '客製化產品功能描述，提高銷售吸引力',
    icon: Zap,
    component: FeatureGenerator
  },
  ...promptTools.map((tool: PromptToolConfig) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    icon: tool.icon,
    component: () => <PromptToolTemplate config={tool} />
  }))
];

const computerTools: Tool[] = [
  {
    id: 'gpu-memory',
    name: 'GPU 內存計算器',
    description: '計算 AI 模型運行所需的 GPU 內存',
    icon: Monitor,
    component: GPUMemoryCalculator
  },
  {
    id: 'server-spec',
    name: '伺服器規格計算器',
    description: '評估應用所需的伺服器資源配置',
    icon: Server,
    component: ServerSpecCalculator
  },
  {
    id: 'ai-infrastructure-cost',
    name: 'AI 基礎設施成本估算器',
    description: '評估 AI 專案的硬體、運營和軟體成本',
    icon: Database,
    component: AIInfrastructureCostCalculator
  },
  {
    id: 'model-performance',
    name: '模型效能預測工具',
    description: '預測 AI 模型的資源消耗和性能表現',
    icon: Cpu,
    component: ModelPerformanceCalculator
  },
  {
    id: 'workload-scalability',
    name: 'AI 工作負載規模化評估',
    description: '評估 AI 系統的可擴展性和資源效率',
    icon: Network,
    component: WorkloadScalabilityCalculator
  }
];

const manufacturingTools: Tool[] = [
  {
    id: 'manufacturing-calculator',
    name: '工具機加工參數計算器',
    description: '計算銑削/車削速度、進給率，提供最佳加工參數建議',
    icon: Calculator,
    component: ManufacturingCalculator
  },
  {
    id: 'metal-weight',
    name: '金屬材料重量計算器',
    description: '計算各種金屬材料的重量及預估成本',
    icon: Scale,
    component: MetalWeightCalculator
  },
  {
    id: 'yield-calculator',
    name: '簡易良率計算器',
    description: '計算生產良率和損失成本分析',
    icon: BarChart3,
    component: YieldCalculator
  },
  {
    id: 'packaging-calculator',
    name: '包裝箱最佳化計算器',
    description: '計算最佳包裝方式，提升物流效率',
    icon: Package,
    component: PackagingCalculator
  },
  {
    id: 'oee-calculator',
    name: '基礎OEE計算器',
    description: '計算設備綜合效率指標',
    icon: Activity,
    component: OEECalculator
  }
];

const financeTools: Tool[] = [
  {
    id: 'compound-interest',
    name: '複利計算器',
    description: '計算投資收益與複利效果',
    icon: DollarSign,
    component: CompoundInterestCalculator
  },
  {
    id: 'currency-converter',
    name: '外幣快速換算器',
    description: '主要貨幣即時匯率換算',
    icon: Coins,
    component: CurrencyConverter
  },
  {
    id: 'loan-calculator',
    name: '貸款比較計算器',
    description: '比較不同貸款方案的還款��畫',
    icon: Wallet,
    component: LoanCalculator
  },
  {
    id: 'roi-calculator',
    name: '投資報酬率計算器',
    description: '計算投資效益與年化報酬率',
    icon: LineChart,
    component: ROICalculator
  },
  {
    id: 'deposit-calculator',
    name: '定存理財試算器',
    description: '計算定存收益與到期金額',
    icon: PieChart,
    component: DepositCalculator
  }
];

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  if (selectedTool) {
    const ToolComponent = selectedTool.component;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedTool(null)}
          className="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300"
        >
          ← 返回工具列表
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{selectedTool.name}</h2>
          <ToolComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">免費 AI、SEO 工具</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seoTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 hover:border-amber-500"
            >
              <div className="flex items-center mb-4">
                <tool.icon className="h-7 w-7 text-amber-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
              </div>
              <p className="text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">免費金融業工具</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financeTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 hover:border-green-600"
            >
              <div className="flex items-center mb-4">
                <tool.icon className="h-7 w-7 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
              </div>
              <p className="text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">免費電腦業工具</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {computerTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 hover:border-blue-600"
            >
              <div className="flex items-center mb-4">
                <tool.icon className="h-7 w-7 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
              </div>
              <p className="text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">免費製造業工具</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manufacturingTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 hover:border-purple-600"
            >
              <div className="flex items-center mb-4">
                <tool.icon className="h-7 w-7 text-purple-600 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
              </div>
              <p className="text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}