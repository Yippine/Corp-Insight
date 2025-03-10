import { generateTagThemes } from '../utils/tagManager';
import { tools } from './tools';

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

const tagThemes = generateTagThemes(tools);

// 用於標籤分類顯示的主題（合併後的版本）
export const categoryThemes = tagThemes.merged;

// 用於工具卡片標籤顯示的主題（完整版本）
export const fullTagThemes = tagThemes.full;