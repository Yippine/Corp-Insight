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
  switch (label) {
    case '招標中': return 'bg-yellow-100 text-yellow-800';
    case '已決標': return 'bg-green-100 text-green-800';
    case '無法決標': return 'bg-red-100 text-red-800';
    case '資訊': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};