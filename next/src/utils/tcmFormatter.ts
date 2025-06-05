import { constitutions } from '../data/tcm';

export function formatConstitutionTitle(ids: string[]): string {
  const MAX_MAIN = 2;
  const SPECIAL_CASES: Record<string, string> = {
    'blood-stasis+qi-stagnation': '氣滯血瘀型',
    'damp-heat+phlegm-dampness': '痰濕化熱型',
    'yang-deficiency+yin-deficiency': '陰陽兩虛型',
  };

  const specialKey = ids.sort().join('+');
  if (SPECIAL_CASES[specialKey]) {
    return `${SPECIAL_CASES[specialKey]}複合體質養生指南`;
  }

  const main = ids.slice(0, MAX_MAIN);
  const overflow = ids.length - MAX_MAIN;

  const names = main.map(id => {
    const constitution = constitutions.find(c => c.id === id)!;
    return constitution.name;
  });

  let title = names.join('、');
  if (overflow > 0) {
    title += `等 ${ids.length} 型複合`;
  } else if (ids.length > 1) {
    title += '複合';
  }

  return `${title}體質養生指南`;
}
