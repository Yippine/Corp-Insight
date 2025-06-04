// AI 工具類型定義檔案
import { IconName } from './iconMap';

// 工具介面定義
export interface Tools {
  id: string;
  name: string;
  description: string;
  iconName: IconName;
  componentId?: string;
  tags: string[];
  category?: string;
  subCategory?: string;
  instructions?: {
    what: string;
    why: string;
    how: string;
  };
  placeholder?: string;
  promptTemplate?: {
    prefix: string;
    suffix: string;
  };
}

// 顏色主題介面
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  icon: string;
  hover: string;
  shadow: string;
  name: string;
  gradient: {
    from: string;
    to: string;
  };
}

// 標籤統計介面
export interface TagStatistics {
  tag: string;
  count: number;
}

export interface TagStats {
  allTags: TagStatistics[];
  mergedTags: TagStatistics[];
}

// MongoDB 工具文檔介面（與資料庫模型同步）
export interface AIToolDocument {
  _id?: any;
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  instructions?: {
    what: string;
    why: string;
    how: string;
  };
  placeholder?: string;
  promptTemplate?: {
    prefix: string;
    suffix: string;
  };
  category?: string;
  subCategory?: string;
  isActive: boolean;
  isAITool?: boolean;
  componentId?: string;
  renderType?: 'prompt' | 'component';
  createdAt: Date;
  updatedAt: Date;
}