export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  icon: string;
  hover: string;
  shadow: string;
}

export interface CategoryTheme extends ColorTheme {
  name: string;
  gradient: {
    from: string;
    to: string;
  };
}

export const categoryThemes: Record<string, CategoryTheme> = {
  all: {
    name: '全部',
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
  business: {
    name: '商業',
    primary: 'bg-yellow-500 bg-opacity-85',
    secondary: 'bg-yellow-50',
    accent: 'bg-amber-100',
    text: 'text-yellow-500 bg-opacity-85',
    icon: 'text-yellow-500 bg-opacity-85',
    hover: 'hover:bg-yellow-50',
    shadow: 'shadow-yellow-500/10',
    gradient: {
      from: 'from-yellow-500 bg-opacity-85',
      to: 'to-amber-500'
    }
  },
  enterprise: {
    name: '企業',
    primary: 'bg-purple-500 bg-opacity-85',
    secondary: 'bg-purple-50',
    accent: 'bg-indigo-100',
    text: 'text-purple-500 bg-opacity-85',
    icon: 'text-purple-500 bg-opacity-85',
    hover: 'hover:bg-purple-50',
    shadow: 'shadow-purple-500/10',
    gradient: {
      from: 'from-purple-500 bg-opacity-85',
      to: 'to-indigo-500'
    }
  },
  market: {
    name: '市場',
    primary: 'bg-orange-500 bg-opacity-85',
    secondary: 'bg-orange-50',
    accent: 'bg-amber-100',
    text: 'text-orange-500 bg-opacity-85',
    icon: 'text-orange-500 bg-opacity-85',
    hover: 'hover:bg-orange-50',
    shadow: 'shadow-orange-500/10',
    gradient: {
      from: 'from-orange-500 bg-opacity-85',
      to: 'to-amber-500'
    }
  },
  strategy: {
    name: '策略',
    primary: 'bg-blue-500 bg-opacity-85',
    secondary: 'bg-blue-50',
    accent: 'bg-sky-100',
    text: 'text-blue-500 bg-opacity-85',
    icon: 'text-blue-500 bg-opacity-85',
    hover: 'hover:bg-blue-50',
    shadow: 'shadow-blue-500/10',
    gradient: {
      from: 'from-blue-500 bg-opacity-85',
      to: 'to-sky-500'
    }
  },
  customer: {
    name: '客戶',
    primary: 'bg-red-500 bg-opacity-85',
    secondary: 'bg-red-50',
    accent: 'bg-rose-100',
    text: 'text-red-500 bg-opacity-85',
    icon: 'text-red-500 bg-opacity-85',
    hover: 'hover:bg-red-50',
    shadow: 'shadow-red-500/10',
    gradient: {
      from: 'from-red-500 bg-opacity-85',
      to: 'to-rose-500'
    }
  },
  workflow: {
    name: '工作流',
    primary: 'bg-green-500 bg-opacity-85',
    secondary: 'bg-green-50',
    accent: 'bg-emerald-100',
    text: 'text-green-500 bg-opacity-85',
    icon: 'text-green-500 bg-opacity-85',
    hover: 'hover:bg-green-50',
    shadow: 'shadow-green-500/10',
    gradient: {
      from: 'from-green-500 bg-opacity-85',
      to: 'to-emerald-500'
    }
  },
  investment: {
    name: '投資',
    primary: 'bg-teal-600 bg-opacity-85',
    secondary: 'bg-teal-50',
    accent: 'bg-green-100',
    text: 'text-teal-600 bg-opacity-85',
    icon: 'text-teal-600 bg-opacity-85',
    hover: 'hover:bg-teal-50',
    shadow: 'shadow-teal-600/10',
    gradient: {
      from: 'from-teal-600 bg-opacity-85',
      to: 'to-green-600'
    }
  },
  data: {
    name: '數據',
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
  project: {
    name: '專案',
    primary: 'bg-lime-500 bg-opacity-85',
    secondary: 'bg-lime-50',
    accent: 'bg-green-100',
    text: 'text-lime-500 bg-opacity-85',
    icon: 'text-lime-500 bg-opacity-85',
    hover: 'hover:bg-lime-50',
    shadow: 'shadow-lime-500/10',
    gradient: {
      from: 'from-lime-500 bg-opacity-85',
      to: 'to-green-500'
    }
  },
  management: {
    name: '管理',
    primary: 'bg-red-500 bg-opacity-85',
    secondary: 'bg-red-50',
    accent: 'bg-rose-100',
    text: 'text-red-500 bg-opacity-85',
    icon: 'text-red-500 bg-opacity-85',
    hover: 'hover:bg-red-50',
    shadow: 'shadow-red-500/10',
    gradient: {
      from: 'from-red-500 bg-opacity-85',
      to: 'to-rose-500'
    }
  },
  humanResource: {
    name: '人力',
    primary: 'bg-blue-600 bg-opacity-85',
    secondary: 'bg-blue-50',
    accent: 'bg-sky-100',
    text: 'text-blue-600 bg-opacity-85',
    icon: 'text-blue-600 bg-opacity-85',
    hover: 'hover:bg-blue-50',
    shadow: 'shadow-blue-600/10',
    gradient: {
      from: 'from-blue-600 bg-opacity-85',
      to: 'to-sky-600'
    }
  },
  interview: {
    name: '面試',
    primary: 'bg-indigo-600 bg-opacity-85',
    secondary: 'bg-indigo-50',
    accent: 'bg-purple-100',
    text: 'text-indigo-600 bg-opacity-85',
    icon: 'text-indigo-600 bg-opacity-85',
    hover: 'hover:bg-indigo-50',
    shadow: 'shadow-indigo-600/10',
    gradient: {
      from: 'from-indigo-600 bg-opacity-85',
      to: 'to-purple-600'
    }
  },
  job: {
    name: '求職',
    primary: 'bg-fuchsia-500 bg-opacity-85',
    secondary: 'bg-fuchsia-50',
    accent: 'bg-pink-100',
    text: 'text-fuchsia-500 bg-opacity-85',
    icon: 'text-fuchsia-500 bg-opacity-85',
    hover: 'hover:bg-fuchsia-50',
    shadow: 'shadow-fuchsia-500/10',
    gradient: {
      from: 'from-fuchsia-500 bg-opacity-85',
      to: 'to-pink-500'
    }
  },
  seo: {
    name: 'SEO',
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
  ai: {
    name: 'AI',
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
  finance: {
    name: '金融',
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
  tech: {
    name: '科技',
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
    },
  },
  computer: {
    name: '電腦',
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
  manufacturing: {
    name: '製造',
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
  },
  design: {
    name: '設計',
    primary: 'bg-indigo-500 bg-opacity-85',
    secondary: 'bg-indigo-50',
    accent: 'bg-blue-100',
    text: 'text-indigo-500 bg-opacity-85',
    icon: 'text-indigo-500 bg-opacity-85',
    hover: 'hover:bg-indigo-50',
    shadow: 'shadow-indigo-500/10',
    gradient: {
      from: 'from-indigo-500 bg-opacity-85',
      to: 'to-blue-500'
    }
  },
  legal: {
    name: '法律',
    primary: 'bg-gray-500 bg-opacity-85',
    secondary: 'bg-gray-50',
    accent: 'bg-slate-100',
    text: 'text-gray-500 bg-opacity-85',
    icon: 'text-gray-500 bg-opacity-85',
    hover: 'hover:bg-gray-50',
    shadow: 'shadow-gray-500/10',
    gradient: {
      from: 'from-gray-500 bg-opacity-85',
      to: 'to-slate-500'
    }
  },
  education: {
    name: '教育',
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
  writing: {
    name: '寫作',
    primary: 'bg-teal-500 bg-opacity-85',
    secondary: 'bg-teal-50',
    accent: 'bg-emerald-100',
    text: 'text-teal-500 bg-opacity-85',
    icon: 'text-teal-500 bg-opacity-85',
    hover: 'hover:bg-teal-50',
    shadow: 'shadow-teal-500/10',
    gradient: {
      from: 'from-teal-500 bg-opacity-85',
      to: 'to-emerald-500'
    }
  },
  learning: {
    name: '學習',
    primary: 'bg-orange-500 bg-opacity-85',
    secondary: 'bg-orange-50',
    accent: 'bg-amber-100',
    text: 'text-orange-500 bg-opacity-85',
    icon: 'text-orange-500 bg-opacity-85',
    hover: 'hover:bg-orange-50',
    shadow: 'shadow-orange-500/10',
    gradient: {
      from: 'from-orange-500 bg-opacity-85',
      to: 'to-amber-500'
    }
  },
  social: {
    name: '社群',
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
  psychology: {
    name: '心理',
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
  language: {
    name: '語言',
    primary: 'bg-violet-500 bg-opacity-85',
    secondary: 'bg-violet-50',
    accent: 'bg-purple-100',
    text: 'text-violet-500 bg-opacity-85',
    icon: 'text-violet-500 bg-opacity-85',
    hover: 'hover:bg-violet-50',
    shadow: 'shadow-violet-500/10',
    gradient: {
      from: 'from-violet-500 bg-opacity-85',
      to: 'to-purple-500'
    }
  },
  startup: {
    name: '創業',
    primary: 'bg-orange-500 bg-opacity-85',
    secondary: 'bg-orange-50',
    accent: 'bg-amber-100', 
    text: 'text-orange-500 bg-opacity-85',
    icon: 'text-orange-500 bg-opacity-85',
    hover: 'hover:bg-orange-50',
    shadow: 'shadow-orange-500/10',
    gradient: {
      from: 'from-orange-500 bg-opacity-85',
      to: 'to-amber-500'
    }
  },
  promptDesign: {
    name: '提示詞',
    primary: 'bg-teal-500 bg-opacity-85',
    secondary: 'bg-teal-50',
    accent: 'bg-green-100',
    text: 'text-teal-500 bg-opacity-85',
    icon: 'text-teal-500 bg-opacity-85',
    hover: 'hover:bg-teal-50',
    shadow: 'shadow-teal-500/10',
    gradient: {
      from: 'from-teal-500 bg-opacity-85',
      to: 'to-green-500'
    }
  },
  analysis: {
    name: '分析',
    primary: 'bg-fuchsia-500 bg-opacity-85',
    secondary: 'bg-fuchsia-50',
    accent: 'bg-purple-100',
    text: 'text-fuchsia-500 bg-opacity-85',
    icon: 'text-fuchsia-500 bg-opacity-85',
    hover: 'hover:bg-fuchsia-50',
    shadow: 'shadow-fuchsia-500/10',
    gradient: {
      from: 'from-fuchsia-500 bg-opacity-85',
      to: 'to-purple-500'
    }
  },
  medical: {
    name: '醫療',
    primary: 'bg-red-600 bg-opacity-85',
    secondary: 'bg-red-50',
    accent: 'bg-rose-100',
    text: 'text-red-600 bg-opacity-85',
    icon: 'text-red-600 bg-opacity-85',
    hover: 'hover:bg-red-50',
    shadow: 'shadow-red-600/10',
    gradient: {
      from: 'from-red-600 bg-opacity-85',
      to: 'to-rose-600'
    }
  },
  role: {
    name: '角色',
    primary: 'bg-purple-600 bg-opacity-85',
    secondary: 'bg-purple-50',
    accent: 'bg-indigo-100',
    text: 'text-purple-600 bg-opacity-85',
    icon: 'text-purple-600 bg-opacity-85',
    hover: 'hover:bg-purple-50',
    shadow: 'shadow-purple-600/10',
    gradient: {
      from: 'from-purple-600 bg-opacity-85',
      to: 'to-indigo-600'
    }
  },
  music: {
    name: '音樂',
    primary: 'bg-rose-500 bg-opacity-85',
    secondary: 'bg-rose-50', 
    accent: 'bg-pink-100',
    text: 'text-rose-500 bg-opacity-85',
    icon: 'text-rose-500 bg-opacity-85',
    hover: 'hover:bg-rose-50',
    shadow: 'shadow-rose-500/10',
    gradient: {
      from: 'from-rose-500 bg-opacity-85',
      to: 'to-pink-500'
    }
  },
  philosophy: {
    name: '哲學',
    primary: 'bg-indigo-500 bg-opacity-85',
    secondary: 'bg-indigo-50',
    accent: 'bg-purple-100',
    text: 'text-indigo-500 bg-opacity-85',
    icon: 'text-indigo-500 bg-opacity-85',
    hover: 'hover:bg-indigo-50',
    shadow: 'shadow-indigo-500/10',
    gradient: {
      from: 'from-indigo-500 bg-opacity-85',
      to: 'to-purple-500'
    }
  },
  movie: {
    name: '電影',
    primary: 'bg-pink-600 bg-opacity-85',
    secondary: 'bg-pink-50',
    accent: 'bg-rose-100',
    text: 'text-pink-600 bg-opacity-85',
    icon: 'text-pink-600 bg-opacity-85',
    hover: 'hover:bg-pink-50',
    shadow: 'shadow-pink-600/10',
    gradient: {
      from: 'from-pink-600 bg-opacity-85',
      to: 'to-rose-600'
    }
  },
  review: {
    name: '評論',
    primary: 'bg-yellow-600 bg-opacity-85',
    secondary: 'bg-yellow-50',
    accent: 'bg-amber-100',
    text: 'text-yellow-600 bg-opacity-85',
    icon: 'text-yellow-600 bg-opacity-85',
    hover: 'hover:bg-yellow-50',
    shadow: 'shadow-yellow-600/10',
    gradient: {
      from: 'from-yellow-600 bg-opacity-85',
      to: 'to-amber-600'
    }
  },
  food: {
    name: '美食',
    primary: 'bg-orange-600 bg-opacity-85',
    secondary: 'bg-orange-50',
    accent: 'bg-amber-100',
    text: 'text-orange-600 bg-opacity-85',
    icon: 'text-orange-600 bg-opacity-85',
    hover: 'hover:bg-orange-50',
    shadow: 'shadow-orange-600/10',
    gradient: {
      from: 'from-orange-600 bg-opacity-85',
      to: 'to-amber-600'
    }
  },
  academic: {
    name: '學術',
    primary: 'bg-green-600 bg-opacity-85',
    secondary: 'bg-green-50',
    accent: 'bg-emerald-100',
    text: 'text-green-600 bg-opacity-85',
    icon: 'text-green-600 bg-opacity-85',
    hover: 'hover:bg-green-50',
    shadow: 'shadow-green-600/10',
    gradient: {
      from: 'from-green-600 bg-opacity-85',
      to: 'to-emerald-600'
    }
  },
  jailbreak: {
    name: '越獄',
    primary: 'bg-rose-500 bg-opacity-85',
    secondary: 'bg-rose-50',
    accent: 'bg-pink-100',
    text: 'text-rose-500 bg-opacity-85',
    icon: 'text-rose-500 bg-opacity-85',
    hover: 'hover:bg-rose-50',
    shadow: 'shadow-rose-500/10',
    gradient: {
      from: 'from-rose-500 bg-opacity-85',
      to: 'to-pink-500'
    }
  },
};