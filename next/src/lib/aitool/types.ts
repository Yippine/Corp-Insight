// AI 工具類型定義檔案
// For SearchAnalysis component in development
export interface MatchDetail {
  field: string;
  keyword: string;
  content: string;
  score: number;
}

// 工具介面定義
export interface Tools {
  id: string;
  name: string;
  description: string;
  componentId?: string;
  tags: string[];
  category?: string;
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
  score?: number;
  matchDetails?: MatchDetail[];
  systemPromptTemplate?: string;
}

// 顏色主題介面
export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
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
  isActive: boolean;
  componentId?: string;
  renderType?: 'prompt' | 'component';
  createdAt: Date;
  updatedAt: Date;
}
