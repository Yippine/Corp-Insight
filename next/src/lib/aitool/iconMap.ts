// 圖標映射檔案 - 集中管理所有工具使用的圖標
import {
  // 基本圖標
  Zap, Lightbulb, Target, Search, FileText, Edit, PenTool,
  BarChart3, Calculator, TrendingUp, Brain, Sparkles,
  Rocket, Star, Crown, Settings, Users, Calendar,
  MessageSquare, Heart, Shield, Globe, Smartphone,
  Laptop, Database, Server, Code, ChartBar, PieChart,
  Activity, Briefcase, DollarSign, ShoppingCart, Package,
  CreditCard, Percent, TrendingDown, Building, Factory,
  
  // 額外的圖標 (從原始 tools.ts 保留)
  Type, Stethoscope, Cpu, Network, HardDrive, Scale,
  ScanLine, Landmark, PiggyBank, Repeat, CircleDollarSign,
  LucideIcon
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  // 基本圖標
  Zap, Lightbulb, Target, Search, FileText, Edit, PenTool,
  BarChart3, Calculator, TrendingUp, Brain, Sparkles,
  Rocket, Star, Crown, Settings, Users, Calendar,
  MessageSquare, Heart, Shield, Globe, Smartphone,
  Laptop, Database, Server, Code, ChartBar, PieChart,
  Activity, Briefcase, DollarSign, ShoppingCart, Package,
  CreditCard, Percent, TrendingDown, Building, Factory,
  
  // 額外的圖標
  Type, Stethoscope, Cpu, Network, HardDrive, Scale,
  ScanLine, Landmark, PiggyBank, Repeat, CircleDollarSign
};

// 類型定義
export type IconName = keyof typeof iconMap;

// 輔助函數 - 獲取圖標或返回預設值
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || iconMap.Zap;
}