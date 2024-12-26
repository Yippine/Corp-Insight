import { Tool } from '../config/tools';
import { CategoryTheme } from '../config/theme';

interface TagCount {
  tag: string;
  count: number;
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  icon: string;
  hover: string;
  shadow: string;
  gradient: {
    from: string;
    to: string;
  };
}

const colorPalettes: ColorPalette[] = [
  {
    primary: 'bg-pink-300 bg-opacity-85',
    secondary: 'bg-pink-50',
    accent: 'bg-pink-100',
    text: 'text-pink-500 bg-opacity-85',
    icon: 'text-pink-500 bg-opacity-85',
    hover: 'hover:bg-pink-50',
    shadow: 'shadow-pink-300/20',
    gradient: {
      from: 'from-pink-300 bg-opacity-85',
      to: 'to-pink-400'
    }
  },
  {
    primary: 'bg-rose-300 bg-opacity-85',
    secondary: 'bg-rose-50',
    accent: 'bg-rose-100',
    text: 'text-rose-500 bg-opacity-85',
    icon: 'text-rose-500 bg-opacity-85',
    hover: 'hover:bg-rose-50',
    shadow: 'shadow-rose-300/20',
    gradient: {
      from: 'from-rose-300 bg-opacity-85',
      to: 'to-rose-400'
    }
  },
  {
    primary: 'bg-orange-200 bg-opacity-85',
    secondary: 'bg-orange-50',
    accent: 'bg-orange-100',
    text: 'text-orange-500 bg-opacity-85',
    icon: 'text-orange-500 bg-opacity-85',
    hover: 'hover:bg-orange-50',
    shadow: 'shadow-orange-200/20',
    gradient: {
      from: 'from-orange-200 bg-opacity-85',
      to: 'to-orange-300'
    }
  },
  {
    primary: 'bg-lime-300 bg-opacity-85',
    secondary: 'bg-lime-50',
    accent: 'bg-lime-100',
    text: 'text-lime-600 bg-opacity-85',
    icon: 'text-lime-600 bg-opacity-85',
    hover: 'hover:bg-lime-50',
    shadow: 'shadow-lime-300/20',
    gradient: {
      from: 'from-lime-300 bg-opacity-85',
      to: 'to-lime-400'
    }
  },
  {
    primary: 'bg-emerald-300 bg-opacity-85',
    secondary: 'bg-emerald-50',
    accent: 'bg-emerald-100',
    text: 'text-emerald-600 bg-opacity-85',
    icon: 'text-emerald-600 bg-opacity-85',
    hover: 'hover:bg-emerald-50',
    shadow: 'shadow-emerald-300/20',
    gradient: {
      from: 'from-emerald-300 bg-opacity-85',
      to: 'to-emerald-400'
    }
  },
  {
    primary: 'bg-sky-300 bg-opacity-85',
    secondary: 'bg-sky-50',
    accent: 'bg-sky-100',
    text: 'text-sky-600 bg-opacity-85',
    icon: 'text-sky-600 bg-opacity-85',
    hover: 'hover:bg-sky-50',
    shadow: 'shadow-sky-300/20',
    gradient: {
      from: 'from-sky-300 bg-opacity-85',
      to: 'to-sky-400'
    }
  },
  {
    primary: 'bg-indigo-300 bg-opacity-85',
    secondary: 'bg-indigo-50',
    accent: 'bg-indigo-100',
    text: 'text-indigo-600 bg-opacity-85',
    icon: 'text-indigo-600 bg-opacity-85',
    hover: 'hover:bg-indigo-50',
    shadow: 'shadow-indigo-300/20',
    gradient: {
      from: 'from-indigo-300 bg-opacity-85',
      to: 'to-indigo-400'
    }
  },
  {
    primary: 'bg-purple-300 bg-opacity-85',
    secondary: 'bg-purple-50',
    accent: 'bg-purple-100',
    text: 'text-purple-600 bg-opacity-85',
    icon: 'text-purple-600 bg-opacity-85',
    hover: 'hover:bg-purple-50',
    shadow: 'shadow-purple-300/20',
    gradient: {
      from: 'from-purple-300 bg-opacity-85',
      to: 'to-purple-400'
    }
  },
  {
    primary: 'bg-fuchsia-300 bg-opacity-85',
    secondary: 'bg-fuchsia-50',
    accent: 'bg-fuchsia-100',
    text: 'text-fuchsia-600 bg-opacity-85',
    icon: 'text-fuchsia-600 bg-opacity-85',
    hover: 'hover:bg-fuchsia-50',
    shadow: 'shadow-fuchsia-300/20',
    gradient: {
      from: 'from-fuchsia-300 bg-opacity-85',
      to: 'to-fuchsia-400'
    }
  }
];

export interface TagThemes {
  merged: Record<string, CategoryTheme>;
  full: Record<string, CategoryTheme>;
}

export function generateTagThemes(tools: Tool[]): TagThemes {
  // 1. 收集所有 tags 並計算出現次數
  const tagCounts = new Map<string, number>();
  tools.forEach(tool => {
    tool.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // 2. 將 tags 轉換為陣列並排序
  const sortedTags: TagCount[] = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      // 首先按照數量降序排序
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      // 如果數量相同，按照 tag 名稱字母順序排序
      return a.tag.localeCompare(b.tag);
    });

  // 3. 生成完整的主題配置（不合併單個標籤）
  const fullThemes: Record<string, CategoryTheme> = {
    all: {
      name: '全部',
      ...colorPalettes[0],
    }
  };

  // 為每個 tag 分配顏色（完整版）
  sortedTags.forEach((tagCount, index) => {
    const palette = colorPalettes[(index + 1) % colorPalettes.length];
    fullThemes[tagCount.tag] = {
      name: getTagDisplayName(tagCount.tag),
      ...palette
    };
  });

  // 4. 生成合併後的主題配置
  const singleTags = sortedTags.filter(t => t.count === 1);
  const multipleTags = sortedTags.filter(t => t.count > 1);
  
  const mergedThemes: Record<string, CategoryTheme> = {
    all: {
      name: '全部',
      ...colorPalettes[0],
    }
  };

  // 為多個標籤分配顏色
  multipleTags.forEach((tagCount, index) => {
    const palette = colorPalettes[(index + 1) % colorPalettes.length];
    mergedThemes[tagCount.tag] = {
      name: getTagDisplayName(tagCount.tag),
      ...palette
    };
  });

  // 如果有單個標籤，添加 "others" 分類
  if (singleTags.length > 0) {
    mergedThemes.others = {
      name: '其他',
      ...colorPalettes[(multipleTags.length + 1) % colorPalettes.length]
    };
  }

  return {
    merged: mergedThemes,
    full: fullThemes
  };
}

function getTagDisplayName(tag: string): string {
  // 定義 tag 顯示名稱的映射
  const tagDisplayNames: Record<string, string> = {
    all: '全部',
    business: '商業',
    enterprise: '企業',
    market: '市場',
    strategy: '策略',
    customer: '客戶',
    workflow: '工作流',
    investment: '投資',
    data: '數據',
    project: '專案',
    management: '管理',
    humanResource: '人力',
    interview: '面試',
    job: '求職',
    seo: 'SEO',
    ai: 'AI',
    finance: '金融',
    tech: '科技',
    computer: '電腦',
    manufacturing: '製造',
    design: '設計',
    legal: '法律',
    education: '教育',
    writing: '寫作',
    learning: '學習',
    social: '社群',
    psychology: '心理',
    language: '語言',
    startup: '創業',
    promptDesign: '提示詞',
    analysis: '分析',
    medical: '醫療',
    role: '角色',
    music: '音樂',
    philosophy: '哲學',
    movie: '電影',
    review: '評論',
    food: '美食',
    academic: '學術',
    jailbreak: '越獄',
    others: '其他'
  };

  return tagDisplayNames[tag] || tag;
}