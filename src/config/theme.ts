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
    name: '人工智慧',
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
  computer: {
    name: '電腦業',
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
  finance: {
    name: '金融業',
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
  manufacturing: {
    name: '製造業',
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
};