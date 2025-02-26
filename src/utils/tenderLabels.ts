export const getCompanyLabel = (record: any): string => {
  const nameKey = record.brief.companies?.name_key?.[Object.keys(record.brief.companies?.name_key || {})[0]];
  const isLoser = nameKey?.some((key: string) => key.includes('未得標廠商'));
  return isLoser ? '未得標' : '得標';
};

export const getTenderLabel = (type: string) => {
  const labelPatterns = [
    {
      label: '已決標',
      patterns: [
        /^決標公告/,
        /^更正決標公告/,
        /^定期彙送/,
        /^更正定期彙送/
      ]
    },
    {
      label: '無法決標',
      patterns: [
        /^無法決標公告/,
        /^更正無法決標公告/
      ]
    },
    {
      label: '資訊',
      patterns: [
        /公開徵求廠商提供參考資料/,
        /財物變賣/,
        /拒絕往來廠商/,
        /招標文件公開閱覽/,
        /財物出租/,
        /懲戒公告/
      ]
    }
  ];

  const matchedLabel = labelPatterns.find(({ patterns }) => 
    patterns.some(pattern => pattern.test(type))
  );

  return matchedLabel ? matchedLabel.label : '招標中';
};

export const getLabelStyle = (label: string) => {
  const baseStyle = 'inline-flex items-center py-[0.4rem] px-3 rounded-full text-sm font-medium whitespace-nowrap';

  const colorStyles = {
    '得標': 'bg-emerald-100 text-emerald-800',
    '未得標': 'bg-rose-100 text-rose-800', 
    '招標中': 'bg-yellow-100 text-yellow-800',
    '已決標': 'bg-green-100 text-green-800',
    '無法決標': 'bg-red-100 text-red-800',
    '資訊': 'bg-blue-100 text-blue-800'
  };

  return `${baseStyle} ${colorStyles[label as keyof typeof colorStyles] || 'bg-gray-100 text-gray-800'}`;
};