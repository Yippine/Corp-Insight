import type { ColorTheme } from './types';

// 預設顏色配色方案
export const colorPalettes: Omit<ColorTheme, 'name'>[] = [
  {
    primary: 'bg-pink-500 bg-opacity-85',
    secondary: 'bg-pink-50',
    accent: 'bg-rose-100',
    text: 'text-pink-500 bg-opacity-85',
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
    hover: 'hover:bg-purple-50',
    shadow: 'shadow-purple-500/10',
    gradient: {
      from: 'from-purple-500 bg-opacity-90',
      to: 'to-fuchsia-500'
    }
  }
];

const tagColorMap = new Map<string, ColorTheme>();

/**
 * 根據已排序的標籤列表，初始化全域的標籤顏色對應表。
 * 這個函式應該在應用程式的起始點被呼叫一次。
 * @param sortedTags - 一個字串陣列，標籤已經按照期望的順序（例如，按使用頻率）排序。
 */
export function initializeTagColorMap(sortedTags: string[]): void {
  tagColorMap.clear(); // 清除舊的對應，以防萬一

  // 為「全部」標籤設定固定的灰色主題
  tagColorMap.set('全部', getTagColor('全部', true));

  // 為其他標籤按順序分配調色盤中的顏色
  const otherTags = sortedTags.filter(tag => tag !== '全部');
  otherTags.forEach((tag, index) => {
    const palette = colorPalettes[index % colorPalettes.length];
    tagColorMap.set(tag, {
      name: tag,
      ...palette,
    });
  });
}

/**
 * 為給定的標籤生成一個確定性的顏色主題。
 * 此函式會優先從已初始化的全域顏色對應表中查找顏色。
 * 如果找不到，它會退回使用雜湊演算法來生成一個臨時但一致的顏色。
 * @param tag 標籤字串。
 * @param forceHash - (內部使用) 強制使用雜湊演算法，用於初始化「全部」標籤。
 * @returns 一個 ColorTheme 物件。
 */
export function getTagColor(tag: string, forceHash = false): ColorTheme {
  // 優先從全域對應表中查找
  if (!forceHash && tagColorMap.has(tag)) {
    return tagColorMap.get(tag)!;
  }
  
  // 為「全部」標籤提供一個固定的、中性的主題
  if (tag === '全部') {
    const theme: ColorTheme = {
      name: tag,
      primary: 'bg-gray-700',
      secondary: 'bg-gray-100',
      accent: 'bg-gray-200',
      text: 'text-gray-800',
      hover: 'hover:bg-gray-200',
      shadow: 'shadow-gray-500/10',
      gradient: { from: 'from-gray-400', to: 'to-gray-500' },
    };
    // 如果是「全部」標籤的原始查詢，也將其存入快取
    tagColorMap.set(tag, theme);
    return theme;
  }
  
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash << 5) - hash + tag.charCodeAt(i);
    hash |= 0; // 轉換為 32 位元整數
  }

  const index = Math.abs(hash) % colorPalettes.length;
  const palette = colorPalettes[index];
  
  const theme: ColorTheme = {
    name: tag,
    ...palette,
  };

  // 將後備的雜湊結果也存入對應表，以確保後續呼叫的一致性
  tagColorMap.set(tag, theme);
  return theme;
}