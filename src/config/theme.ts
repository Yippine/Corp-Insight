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

export const categoryThemes = generateTagThemes(tools);