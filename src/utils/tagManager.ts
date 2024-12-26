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
    primary: 'bg-blue-500 bg-opacity-85',
    secondary: 'bg-blue-50',
    accent: 'bg-indigo-100',
    text: 'text-blue-500 bg-opacity-85',
    icon: 'text-blue-500 bg-opacity-85',
    hover: 'hover:bg-blue-50',
    shadow: 'shadow-blue-500/10',
    gradient: {
      from: 'from-blue-500 bg-opacity-85',
      to: 'to-indigo-500'
    }
  },
  {
    primary: 'bg-pink-500 bg-opacity-85',
    secondary: 'bg-pink-50',
    accent: 'bg-rose-100',
    text: 'text-pink-500 bg-opacity-85',
    icon: 'text-pink-500 bg-opacity-85',
    hover: 'hover:bg-pink-50',
    shadow: 'shadow-pink-500/10',
    gradient: {
      from: 'from-pink-500 bg-opacity-85',
      to: 'to-rose-500'
    }
  },
  {
    primary: 'bg-amber-500 bg-opacity-85',
    secondary: 'bg-amber-50',
    accent: 'bg-yellow-100',
    text: 'text-amber-500 bg-opacity-85',
    icon: 'text-amber-500 bg-opacity-85',
    hover: 'hover:bg-amber-50',
    shadow: 'shadow-amber-500/10',
    gradient: {
      from: 'from-amber-500 bg-opacity-85',
      to: 'to-yellow-500'
    }
  },
  {
    primary: 'bg-emerald-500 bg-opacity-85',
    secondary: 'bg-emerald-50',
    accent: 'bg-green-100',
    text: 'text-emerald-500 bg-opacity-85',
    icon: 'text-emerald-500 bg-opacity-85',
    hover: 'hover:bg-emerald-50',
    shadow: 'shadow-emerald-500/10',
    gradient: {
      from: 'from-emerald-500 bg-opacity-85',
      to: 'to-green-500'
    }
  },
  {
    primary: 'bg-cyan-500 bg-opacity-85',
    secondary: 'bg-cyan-50',
    accent: 'bg-sky-100',
    text: 'text-cyan-500 bg-opacity-85',
    icon: 'text-cyan-500 bg-opacity-85',
    hover: 'hover:bg-cyan-50',
    shadow: 'shadow-cyan-500/10',
    gradient: {
      from: 'from-cyan-500 bg-opacity-85',
      to: 'to-sky-500'
    }
  },
  {
    primary: 'bg-sky-500 bg-opacity-85',
    secondary: 'bg-sky-50',
    accent: 'bg-blue-100',
    text: 'text-sky-500 bg-opacity-85',
    icon: 'text-sky-500 bg-opacity-85',
    hover: 'hover:bg-sky-50',
    shadow: 'shadow-sky-500/10',
    gradient: {
      from: 'from-sky-500 bg-opacity-85',
      to: 'to-blue-500'
    }
  },
  {
    primary: 'bg-purple-500 bg-opacity-85',
    secondary: 'bg-purple-50',
    accent: 'bg-violet-100',
    text: 'text-purple-500 bg-opacity-85',
    icon: 'text-purple-500 bg-opacity-85',
    hover: 'hover:bg-purple-50',
    shadow: 'shadow-purple-500/10',
    gradient: {
      from: 'from-purple-500 bg-opacity-85',
      to: 'to-violet-500'
    }
  }
];

export function generateTagThemes(tools: Tool[]): Record<string, CategoryTheme> {
  // 1. 收集所有 tags 並計算出現次數
  const tagCounts = new Map<string, number>();
  tools.forEach(tool => {
    tool.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });

  // 2. 將 tags 轉換為數組並排序
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

  // 3. 將單個 tag 的工具歸類到 "other" 分類
  const singleTags = sortedTags.filter(t => t.count === 1);
  const multipleTags = sortedTags.filter(t => t.count > 1);

  if (singleTags.length > 0) {
    multipleTags.push({
      tag: 'other',
      count: singleTags.length
    });
  }

  // 4. 生成主題配置
  const themes: Record<string, CategoryTheme> = {
    all: {
      name: '全部',
      ...colorPalettes[0],
    }
  };

  // 為每個 tag 分配顏色
  multipleTags.forEach((tagCount, index) => {
    const palette = colorPalettes[index % colorPalettes.length];
    themes[tagCount.tag] = {
      name: getTagDisplayName(tagCount.tag),
      ...palette
    };
  });

  return themes;
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
    other: '其他'
  };

  return tagDisplayNames[tag] || tag;
}