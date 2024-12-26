import { Tool } from '../config/tools';
import { CategoryTheme } from '../config/theme';

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
    primary: 'bg-rose-400 bg-opacity-85',
    secondary: 'bg-rose-50',
    accent: 'bg-rose-50',
    text: 'text-rose-400 bg-opacity-85',
    icon: 'text-rose-400 bg-opacity-85',
    hover: 'hover:bg-rose-50',
    shadow: 'shadow-rose-400/20',
    gradient: {
      from: 'from-rose-400 bg-opacity-85',
      to: 'to-rose-300'
    }
  },
  {
    primary: 'bg-amber-500 bg-opacity-75',
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
    primary: 'bg-sky-400 bg-opacity-85',
    secondary: 'bg-sky-50',
    accent: 'bg-sky-100',
    text: 'text-sky-600 bg-opacity-85',
    icon: 'text-sky-600 bg-opacity-85',
    hover: 'hover:bg-sky-50',
    shadow: 'shadow-sky-400/20',
    gradient: {
      from: 'from-sky-400 bg-opacity-85',
      to: 'to-sky-500'
    }
  },
  {
    primary: 'bg-indigo-500 bg-opacity-85',
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
    primary: 'bg-purple-500 bg-opacity-90',
    secondary: 'bg-purple-50',
    accent: 'bg-fuchsia-100',
    text: 'text-purple-500 bg-opacity-90',
    icon: 'text-purple-500 bg-opacity-90',
    hover: 'hover:bg-purple-50',
    shadow: 'shadow-purple-500/10',
    gradient: {
      from: 'from-purple-500 bg-opacity-90',
      to: 'to-fuchsia-500'
    }
  }
];

export interface TagThemes {
  merged: Record<string, CategoryTheme>;
  full: Record<string, CategoryTheme>;
}

export function generateTagThemes(tools: Tool[]): TagThemes {
  // 1. 計算標籤出現次數並分類
  const getTagStatistics = (tools: Tool[]) => {
    const tagCounts = tools.reduce((counts, tool) => {
      tool.tags.forEach(tag => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
      return counts;
    }, new Map<string, number>());

    const tagStats = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

    return {
      allTags: tagStats,
      singleTags: tagStats.filter(t => t.count === 1),
      multipleTags: tagStats.filter(t => t.count > 1)
    };
  };

  // 2. 建立主題配置
  const createTheme = (tag: string, paletteIndex: number): CategoryTheme => ({
    name: getTagDisplayName(tag),
    ...colorPalettes[paletteIndex % colorPalettes.length]
  });

  // 3. 生成主題配置
  const generateThemes = (tagStats: ReturnType<typeof getTagStatistics>) => {
    const { allTags, singleTags, multipleTags } = tagStats;
    
    // 生成完整主題配置(包含所有標籤)
    const fullThemes: Record<string, CategoryTheme> = {
      all: createTheme('all', 0)
    };
    allTags.forEach((tag, index) => {
      fullThemes[tag.tag] = createTheme(tag.tag, index + 1);
    });

    // 生成合併主題配置(僅包含多次出現的標籤)
    const mergedThemes: Record<string, CategoryTheme> = {
      all: createTheme('all', 0)
    };

    // 特殊處理 AI 標籤: 合併單次出現的標籤到 AI 分類中
    const existingAiTag = multipleTags.find(tag => tag.tag === 'ai');
    const aiTagCount = (existingAiTag?.count || 0) + singleTags.length;
    const sortedTags = multipleTags.filter(tag => tag.tag !== 'ai');
    const aiTagIndex = sortedTags.findIndex(tag => tag.count <= aiTagCount);
    const aiTag = { tag: 'ai', count: aiTagCount };
    
    if (aiTagCount > 0) {
      if (aiTagIndex === -1) {
        sortedTags.push(aiTag);
      } else {
        sortedTags.splice(aiTagIndex, 0, aiTag);
      }
    }

    sortedTags.forEach((tagCount, index) => {
      mergedThemes[tagCount.tag] = createTheme(tagCount.tag, index + 1);
    });

    return { merged: mergedThemes, full: fullThemes };
  };

  return generateThemes(getTagStatistics(tools));
}

function getTagDisplayName(tag: string): string {
  const tagDisplayNames: Record<string, string> = {
    all: '全部',
    ai: 'AI',
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
    jailbreak: '越獄'
  };

  return tagDisplayNames[tag] || tag;
}