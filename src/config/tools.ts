import React from 'react';
// import { Calculator, Package, Activity, BarChart3, Scale, DollarSign, Coins, PieChart, LineChart, Wallet, Monitor, Server, Database, Cpu, Network, Search, FileText, Type, MessageSquare, Star, Zap } from 'lucide-react';
// import ManufacturingCalculator from '../components/tools/manufacturing/ManufacturingCalculator';
// import MetalWeightCalculator from '../components/tools/manufacturing/MetalWeightCalculator';
// import YieldCalculator from '../components/tools/manufacturing/YieldCalculator';
// import PackagingCalculator from '../components/tools/manufacturing/PackagingCalculator';
// import OEECalculator from '../components/tools/manufacturing/OEECalculator';
// import CompoundInterestCalculator from '../components/tools/finance/CompoundInterestCalculator';
// import CurrencyConverter from '../components/tools/finance/CurrencyConverter';
// import LoanCalculator from '../components/tools/finance/LoanCalculator';
// import ROICalculator from '../components/tools/finance/ROICalculator';
// import DepositCalculator from '../components/tools/finance/DepositCalculator';
// import GPUMemoryCalculator from '../components/tools/computer/GPUMemoryCalculator';
// import ServerSpecCalculator from '../components/tools/computer/ServerSpecCalculator';
// import AIInfrastructureCostCalculator from '../components/tools/computer/AIInfrastructureCostCalculator';
// import ModelPerformanceCalculator from '../components/tools/computer/ModelPerformanceCalculator';
// import WorkloadScalabilityCalculator from '../components/tools/computer/WorkloadScalabilityCalculator';
// import TitleGenerator from '../components/tools/seo/TitleGenerator';
// import DescriptionGenerator from '../components/tools/seo/DescriptionGenerator';
// import KeywordGenerator from '../components/tools/seo/KeywordGenerator';
// import FaqGenerator from '../components/tools/seo/FaqGenerator';
// import ReviewGenerator from '../components/tools/seo/ReviewGenerator';
// import FeatureGenerator from '../components/tools/seo/FeatureGenerator';
import { promptTools, PromptToolConfig } from './promptTools';
import PromptToolTemplate from '../components/tools/common/PromptToolTemplate';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  component: React.ComponentType<any>;
  tags: string[];
}

const aiTools = promptTools.map((tool: PromptToolConfig) => ({
  id: tool.id,
  name: tool.name,
  description: tool.description,
  icon: tool.icon,
  component: () => React.createElement(PromptToolTemplate, { config: tool }),
  tags: tool.tags
}));

export const tools: Tool[] = [
  // {
  //   id: 'title-generator',
  //   name: 'SEO 標題策略大師',
  //   description: '智能生成 SEO 友好的標題，提高點擊率和搜尋排名',
  //   icon: Type,
  //   component: TitleGenerator,
  //   tags: ['工具', 'SEO']
  // },
  // {
  //   id: 'description-generator',
  //   name: 'SEO 描述智能專家',
  //   description: '生成優化的 META 描述，提升搜尋結果的點擊率',
  //   icon: FileText,
  //   component: DescriptionGenerator,
  //   tags: ['工具', 'SEO']
  // },
  // {
  //   id: 'keyword-generator',
  //   name: 'SEO 關鍵詞戰略家',
  //   description: '發掘高價值長尾關鍵字，降低競爭難度',
  //   icon: Search,
  //   component: KeywordGenerator,
  //   tags: ['工具', 'SEO']
  // },
  // {
  //   id: 'faq-generator',
  //   name: 'FAQ 智能構建師',
  //   description: '智能生成常見問題，豐富網站內容',
  //   icon: MessageSquare,
  //   component: FaqGenerator,
  //   tags: ['工具', 'SEO']
  // },
  // {
  //   id: 'review-generator',
  //   name: 'SEO 社群評價專家',
  //   description: '生成真實感產品評價，增加社交證明',
  //   icon: Star,
  //   component: ReviewGenerator,
  //   tags: ['工具', 'SEO']
  // },
  // {
  //   id: 'feature-generator',
  //   name: '產品價值放大器',
  //   description: '客製化產品功能描述，提高銷售吸引力',
  //   icon: Zap,
  //   component: FeatureGenerator,
  //   tags: ['工具', 'SEO']
  // },
  // {
  //   id: 'gpu-memory',
  //   name: 'GPU 內存計算器',
  //   description: '計算 AI 模型運行所需的 GPU 內存',
  //   icon: Monitor,
  //   component: GPUMemoryCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'server-spec',
  //   name: '伺服器規格計算器',
  //   description: '評估應用所需的伺服器資源配置',
  //   icon: Server,
  //   component: ServerSpecCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'ai-infrastructure-cost',
  //   name: 'AI 基礎設施成本估算器',
  //   description: '評估 AI 專案的硬體、運營和軟體成本',
  //   icon: Database,
  //   component: AIInfrastructureCostCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'model-performance',
  //   name: '模型效能預測工具',
  //   description: '預測 AI 模型的資源消耗和性能表現',
  //   icon: Cpu,
  //   component: ModelPerformanceCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'workload-scalability',
  //   name: 'AI 工作負載規模化評估',
  //   description: '評估 AI 系統的可擴展性和資源效率',
  //   icon: Network,
  //   component: WorkloadScalabilityCalculator,
  //   tags: ['工具', '電腦']
  // },
  // {
  //   id: 'manufacturing-calculator',
  //   name: '工具機加工參數計算器',
  //   description: '計算銑削/車削速度、進給率，提供最佳加工參數建議',
  //   icon: Calculator,
  //   component: ManufacturingCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'metal-weight',
  //   name: '金屬材料重量計算器',
  //   description: '計算各種金屬材料的重量及預估成本',
  //   icon: Scale,
  //   component: MetalWeightCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'yield-calculator',
  //   name: '簡易良率計算器',
  //   description: '計算生產良率和損失成本分析',
  //   icon: BarChart3,
  //   component: YieldCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'packaging-calculator',
  //   name: '包裝箱最佳化計算器',
  //   description: '計算最佳包裝方式，提升物流效率',
  //   icon: Package,
  //   component: PackagingCalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'oee-calculator',
  //   name: '基礎 OEE 計算器',
  //   description: '計算設備綜合效率指標',
  //   icon: Activity,
  //   component: OEECalculator,
  //   tags: ['工具', '製造']
  // },
  // {
  //   id: 'compound-interest',
  //   name: '複利計算器',
  //   description: '計算投資收益與複利效果',
  //   icon: DollarSign,
  //   component: CompoundInterestCalculator,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'currency-converter',
  //   name: '外幣快速換算器',
  //   description: '主要貨幣即時匯率換算',
  //   icon: Coins,
  //   component: CurrencyConverter,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'loan-calculator',
  //   name: '貸款比較計算器',
  //   description: '比較不同貸款方案的還款計畫',
  //   icon: Wallet,
  //   component: LoanCalculator,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'roi-calculator',
  //   name: '投資報酬率計算器',
  //   description: '計算投資效益與年化報酬率',
  //   icon: LineChart,
  //   component: ROICalculator,
  //   tags: ['工具', '金融']
  // },
  // {
  //   id: 'deposit-calculator',
  //   name: '定存理財試算器',
  //   description: '計算定存收益與到期金額',
  //   icon: PieChart,
  //   component: DepositCalculator,
  //   tags: ['工具', '金融']
  // },
  ...aiTools
];