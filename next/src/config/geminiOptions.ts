export const targetAudiences = [
  { id: 'website-owner', name: '網站管理員' },
  { id: 'marketer', name: '數位行銷人員' },
  { id: 'business-owner', name: '企業主' },
  { id: 'content-creator', name: '內容創作者' },
  { id: 'ecommerce', name: '電商經營者' },
  { id: 'developer', name: '開發人員' }
] as const;

export const contentTypes = [
  { id: 'guide', name: '教學指南' },
  { id: 'case-study', name: '案例分析' },
  { id: 'comparison', name: '比較評測' },
  { id: 'news', name: '新聞資訊' },
  { id: 'product', name: '產品介紹' },
  { id: 'tutorial', name: '操作教程' }
] as const;

export const valuePropositions = [
  { id: 'problem-solving', name: '解決問題' },
  { id: 'efficiency', name: '提升效率' },
  { id: 'cost-saving', name: '節省成本' },
  { id: 'innovation', name: '創新突破' },
  { id: 'quality', name: '品質保證' },
  { id: 'experience', name: '體驗優化' }
] as const;

export const searchIntents = [
  { id: 'informational', name: '資訊查詢' },
  { id: 'commercial', name: '商業意圖' },
  { id: 'transactional', name: '交易意圖' },
  { id: 'navigational', name: '導航意圖' }
];

export const competitionLevels = [
  { id: 'low', name: '低競爭度' },
  { id: 'medium', name: '中競爭度' },
  { id: 'high', name: '高競爭度' }
];

export const productCategories = [
  { id: 'electronics', name: '電子產品' },
  { id: 'software', name: '軟體服務' },
  { id: 'education', name: '教育培訓' },
  { id: 'healthcare', name: '醫療保健' },
  { id: 'finance', name: '金融理財' }
];

export const reviewTypes = [
  { id: 'positive', name: '正面評價' },
  { id: 'neutral', name: '中立評價' },
  { id: 'mixed', name: '綜合評價' }
];