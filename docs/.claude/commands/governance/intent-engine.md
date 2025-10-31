# Intent Engine - 智能意圖識別引擎

## 🧠 核心識別引擎

### 意圖分類架構
```typescript
enum UserIntent {
  SPEC_CREATION = 'spec_creation',      // 建立規範需求
  PROJECT_AUDIT = 'project_audit',      // 專案健康檢查  
  STANDARD_SYNC = 'standard_sync',      // 規範同步更新
  VERSION_TAG = 'version_tag',          // 版本標記管理
  GENERAL_QUERY = 'general_query',      // 一般查詢
  AMBIGUOUS = 'ambiguous'               // 模糊不清需澄清
}

interface IntentAnalysisResult {
  primaryIntent: UserIntent;
  confidence: number;                    // 0.0 - 1.0
  suggestedCommand: string | null;
  parameters: Record<string, any>;
  reasoning: string;
  alternatives: AlternativeIntent[];
}
```

### 關鍵字權重矩陣
```typescript
const INTENT_KEYWORDS = {
  [UserIntent.SPEC_CREATION]: {
    high_confidence: [
      '不統一', '應該統一', '需要規範', '標準化', '規範化',
      'API設計', '格式標準', '設計原則', '團隊約定',
      '每次都不一樣', '格式亂', '不一致'
    ],
    medium_confidence: [
      '建議', '推薦', '最好', '統一',
      '設計', '格式', '標準', '約定'
    ],
    context_patterns: [
      /(.+)(應該|需要|要)(統一|規範|標準化)/g,
      /(API|格式|設計)(.+)(不統一|不一樣|亂)/g
    ]
  },

  [UserIntent.PROJECT_AUDIT]: {
    high_confidence: [
      '檢查專案', '有沒有問題', '掃描', '健康檢查',
      '專案狀況', '全面檢查', '審查', 'audit'
    ],
    medium_confidence: [
      '檢查', '問題', '狀況', '健康', '審查',
      '掃描', '驗證', '確認'
    ],
    context_patterns: [
      /(檢查|掃描)(.+)(專案|系統|整個)/g,
      /(有沒有|是否有)(.+)問題/g,
      /專案(.+)(狀況|健康|問題)/g
    ]
  },

  [UserIntent.STANDARD_SYNC]: {
    high_confidence: [
      '規範過時', '需要修改', '規範不對', '更新規範',
      '同步', '規範更新', '標準調整'
    ],
    medium_confidence: [
      '更新', '修改', '調整', '同步',
      '規範', '標準', '過時'
    ],
    context_patterns: [
      /規範(.+)(過時|不對|需要更新)/g,
      /(更新|修改|調整)(.+)規範/g,
      /(.+)跟規範不一致/g
    ]
  },

  [UserIntent.VERSION_TAG]: {
    high_confidence: [
      '完成了', '做好了', '搞定了', 'Epic完成',
      '功能完成', '可以發版', '準備上線', '可以部署'
    ],
    medium_confidence: [
      '完成', '做好', '結束', '發版',
      '版本', '上線', '部署'
    ],
    context_patterns: [
      /(.+)(完成了|做好了|搞定了)/g,
      /(功能|模組|Epic)(.+)完成/g,
      /(可以|準備)(.+)(發版|上線|部署)/g
    ]
  }
};
```

## ⚡ 智能分析算法

### 多階段意圖分析
```typescript
const analyzeIntent = async (input: string, conversationContext?: ConversationContext): Promise<IntentAnalysisResult> => {
  // 階段 1: 關鍵字匹配分析
  const keywordScores = calculateKeywordScores(input);
  
  // 階段 2: 語法模式識別  
  const patternMatches = analyzePatterns(input);
  
  // 階段 3: 上下文語義分析
  const contextAnalysis = analyzeContext(input, conversationContext);
  
  // 階段 4: 企業平台特定分析
  const domainAnalysis = analyzePlatformDomain(input);
  
  // 綜合計算最終結果
  return synthesizeAnalysisResults({
    keywordScores,
    patternMatches, 
    contextAnalysis,
    domainAnalysis
  });
};

const calculateKeywordScores = (input: string): KeywordScores => {
  const scores: Record<UserIntent, number> = {} as any;
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    let score = 0;
    
    // 高信心度關鍵字 (權重 1.0)
    keywords.high_confidence.forEach(keyword => {
      if (input.includes(keyword)) {
        score += 1.0;
      }
    });
    
    // 中信心度關鍵字 (權重 0.6)
    keywords.medium_confidence.forEach(keyword => {
      if (input.includes(keyword)) {
        score += 0.6;
      }
    });
    
    // 語法模式匹配 (權重 0.8)
    keywords.context_patterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        score += 0.8 * matches.length;
      }
    });
    
    scores[intent] = Math.min(score, 3.0); // 最高 3 分
  }
  
  return scores;
};
```

### 企業平台特定語義分析
```typescript
const analyzePlatformDomain = (input: string): DomainAnalysis => {
  const platformKeywords = {
    // 企業資料相關
    company_data: ['企業', '公司', '商業資料', '企業查詢', '公司資訊'],
    
    // 標案相關  
    tender_data: ['標案', '招標', '政府標案', '標案查詢', '招標資訊'],
    
    // AI工具相關
    ai_tools: ['AI工具', '人工智慧', '聊天機器人', '智能分析'],
    
    // 會員系統相關
    membership: ['會員', '登入', '註冊', 'OAuth', '權限', '認證'],
    
    // 技術架構相關
    technical: ['Next.js', 'MongoDB', 'API', '前端', '後端', '資料庫']
  };
  
  const domainScores = {};
  for (const [domain, keywords] of Object.entries(platformKeywords)) {
    domainScores[domain] = keywords.reduce((score, keyword) => {
      return score + (input.includes(keyword) ? 1 : 0);
    }, 0);
  }
  
  return {
    primaryDomain: Object.keys(domainScores).reduce((a, b) => 
      domainScores[a] > domainScores[b] ? a : b
    ),
    domainScores,
    domainConfidence: Math.max(...Object.values(domainScores)) / 3
  };
};
```

### 上下文感知分析
```typescript
interface ConversationContext {
  recentMessages: Message[];
  currentTopic: string | null;
  userPatterns: UserPattern;
  sessionLength: number;
}

const analyzeContext = (input: string, context: ConversationContext): ContextAnalysis => {
  if (!context) return { contextBoost: 0, topicContinuation: false };
  
  // 檢查是否延續之前的話題
  const topicContinuation = checkTopicContinuation(input, context.currentTopic);
  
  // 分析用戶習慣模式
  const userPreferenceBoost = analyzeUserPreferences(input, context.userPatterns);
  
  // 考慮對話長度的影響
  const sessionLengthAdjustment = calculateSessionAdjustment(context.sessionLength);
  
  return {
    contextBoost: userPreferenceBoost + sessionLengthAdjustment,
    topicContinuation,
    suggestedFocus: determineFocusFromContext(context)
  };
};
```

## 🎯 智能建議系統

### 信心度閾值決策
```typescript
const CONFIDENCE_THRESHOLDS = {
  AUTO_EXECUTE: 0.85,        // 自動執行
  CONFIRM_EXECUTE: 0.65,     // 確認後執行
  PROVIDE_OPTIONS: 0.45,     // 提供選項
  REQUEST_CLARIFICATION: 0   // 需要澄清
};

const generateResponse = (analysis: IntentAnalysisResult): ResponseStrategy => {
  const { primaryIntent, confidence, suggestedCommand } = analysis;
  
  if (confidence >= CONFIDENCE_THRESHOLDS.AUTO_EXECUTE) {
    return {
      action: 'auto_execute',
      command: suggestedCommand,
      message: `檢測到${getIntentDisplayName(primaryIntent)}需求 (信心度: ${Math.round(confidence * 100)}%)\n正在執行 ${suggestedCommand}...`
    };
  }
  
  if (confidence >= CONFIDENCE_THRESHOLDS.CONFIRM_EXECUTE) {
    return {
      action: 'confirm_execute',
      command: suggestedCommand,
      message: `檢測到${getIntentDisplayName(primaryIntent)}需求 (信心度: ${Math.round(confidence * 100)}%)\n建議執行 ${suggestedCommand}？`
    };
  }
  
  if (confidence >= CONFIDENCE_THRESHOLDS.PROVIDE_OPTIONS) {
    return {
      action: 'provide_options',
      options: generateOptions(analysis),
      message: `我理解您可能需要以下功能之一：\n${formatOptions(analysis.alternatives)}`
    };
  }
  
  return {
    action: 'request_clarification',
    message: `請提供更具體的描述，我可以幫您：\n1. 建立專案規範 (/govern-spec)\n2. 檢查專案健康 (/govern-audit)\n3. 同步規範更新 (/govern-sync)\n4. 管理版本標記 (/govern-tag)`
  };
};
```

### 動態學習機制
```typescript
interface LearningData {
  userCorrections: UserCorrection[];
  successfulPredictions: SuccessfulPrediction[];
  missedIntents: MissedIntent[];
  userFeedback: UserFeedback[];
}

const updateLearningModel = async (
  originalAnalysis: IntentAnalysisResult,
  userAction: UserAction,
  outcome: ActionOutcome
): Promise<void> => {
  // 記錄用戶實際行為與預測的差異
  const learningEntry: LearningData = {
    originalPrediction: originalAnalysis,
    actualAction: userAction,
    outcome: outcome,
    timestamp: new Date(),
    context: getCurrentContext()
  };
  
  // 更新關鍵字權重
  if (outcome.success && originalAnalysis.confidence < 0.8) {
    // 提高成功預測的關鍵字權重
    await increaseKeywordWeights(originalAnalysis.primaryIntent, extractKeywords(userAction.input));
  }
  
  if (!outcome.success && originalAnalysis.confidence > 0.7) {
    // 降低錯誤預測的關鍵字權重
    await decreaseKeywordWeights(originalAnalysis.primaryIntent, extractKeywords(userAction.input));
  }
  
  // 學習新的語法模式
  if (userAction.intent !== originalAnalysis.primaryIntent) {
    await learnNewPatterns(userAction.input, userAction.intent);
  }
};
```

## 📊 企業平台專用情境識別

### 常見對話情境模板
```typescript
const ENTERPRISE_SCENARIOS = {
  // API 標準化情境
  api_standardization: {
    triggers: [
      'API回應格式不統一',
      '每個API格式都不一樣', 
      '前端處理API很困難',
      '需要統一API設計'
    ],
    intent: UserIntent.SPEC_CREATION,
    domain: 'api_design',
    confidence_boost: 0.2
  },
  
  // 會員系統優化情境  
  membership_optimization: {
    triggers: [
      '會員權限管理需要規範',
      'OAuth登入流程要調整',
      '用戶認證有問題',
      '權限分級不清楚'
    ],
    intent: UserIntent.SPEC_CREATION,
    domain: 'membership_security',
    confidence_boost: 0.15
  },
  
  // 功能完成情境
  feature_completion: {
    triggers: [
      'OAuth整合完成了',
      'AI工具功能做好了',
      '會員系統可以上線',
      '前端優化結束了'
    ],
    intent: UserIntent.VERSION_TAG,
    domain: 'version_management', 
    confidence_boost: 0.25
  },
  
  // 專案檢查情境
  project_health_check: {
    triggers: [
      '專案有沒有問題',
      '檢查一下整體狀況', 
      '確認專案健康度',
      '全面掃描專案'
    ],
    intent: UserIntent.PROJECT_AUDIT,
    domain: 'project_health',
    confidence_boost: 0.2
  }
};

const matchEnterpriseScenario = (input: string): ScenarioMatch | null => {
  for (const [scenario, config] of Object.entries(ENTERPRISE_SCENARIOS)) {
    for (const trigger of config.triggers) {
      if (input.includes(trigger) || calculateSimilarity(input, trigger) > 0.8) {
        return {
          scenario,
          intent: config.intent,
          domain: config.domain,
          confidenceBoost: config.confidence_boost,
          matchedTrigger: trigger
        };
      }
    }
  }
  return null;
};
```

### 時序感知分析
```typescript
const analyzeTemporalContext = (input: string, conversationHistory: Message[]): TemporalAnalysis => {
  // 檢查是否在功能開發週期中
  const developmentPhase = detectDevelopmentPhase(conversationHistory);
  
  // 分析是否在特定時間點 (如週會前、部署前)
  const timeContext = detectTimeContext();
  
  // 根據專案階段調整意圖權重
  const phaseAdjustments = {
    'planning': { [UserIntent.SPEC_CREATION]: +0.1 },
    'development': { [UserIntent.STANDARD_SYNC]: +0.1 },
    'testing': { [UserIntent.PROJECT_AUDIT]: +0.15 },
    'deployment': { [UserIntent.VERSION_TAG]: +0.2 }
  };
  
  return {
    developmentPhase,
    timeContext,
    phaseAdjustments: phaseAdjustments[developmentPhase] || {}
  };
};
```

## 🔧 錯誤處理與容錯

### 模糊匹配與拼寫容錯
```typescript
const fuzzyIntentMatching = (input: string): FuzzyMatchResult => {
  const commonTypos = {
    '規範': ['歸範', '規泛', '规范'],
    '檢查': ['简查', '檢茶', '检查'],
    '同步': ['同不', '同歩', '同步'],
    '版本': ['版木', '板本', '版夲']
  };
  
  let correctedInput = input;
  
  // 自動拼寫修正
  for (const [correct, typos] of Object.entries(commonTypos)) {
    typos.forEach(typo => {
      correctedInput = correctedInput.replace(new RegExp(typo, 'g'), correct);
    });
  }
  
  // 語音輸入錯誤修正
  const phoneticCorrections = {
    '歸樣': '規範',
    '檢查': '檢查',
    '同不': '同步'
  };
  
  for (const [incorrect, correct] of Object.entries(phoneticCorrections)) {
    correctedInput = correctedInput.replace(new RegExp(incorrect, 'g'), correct);
  }
  
  return {
    originalInput: input,
    correctedInput: correctedInput,
    hadCorrections: correctedInput !== input,
    corrections: findCorrections(input, correctedInput)
  };
};
```

### 降級處理策略
```typescript
const handleLowConfidenceInput = (input: string, analysis: IntentAnalysisResult): FallbackResponse => {
  // 策略 1: 關鍵字提取建議
  const extractedKeywords = extractMeaningfulKeywords(input);
  if (extractedKeywords.length > 0) {
    const suggestions = mapKeywordsToCommands(extractedKeywords);
    return {
      strategy: 'keyword_suggestions',
      message: `根據關鍵字「${extractedKeywords.join('、')}」，您可能需要：`,
      suggestions: suggestions
    };
  }
  
  // 策略 2: 領域分類引導
  const possibleDomains = identifyPossibleDomains(input);
  if (possibleDomains.length > 0) {
    return {
      strategy: 'domain_guidance',
      message: `我發現您提到了${possibleDomains[0]}相關的內容，相關功能包括：`,
      options: getCommandsForDomain(possibleDomains[0])
    };
  }
  
  // 策略 3: 通用幫助
  return {
    strategy: 'general_help',
    message: `我可以協助您進行以下操作：`,
    options: [
      '/govern-spec - 建立或更新專案規範',
      '/govern-audit - 檢查專案健康狀況',
      '/govern-sync - 同步規範與實際狀況', 
      '/govern-tag - 管理版本標記與發佈'
    ]
  };
};
```

---

## 📈 效能指標與優化

### 識別準確率追蹤
```typescript
interface AccuracyMetrics {
  overallAccuracy: number;           // 總體準確率
  intentAccuracy: Record<UserIntent, number>;  // 各意圖準確率
  confidenceCalibration: number;     // 信心度校準
  userSatisfaction: number;          // 用戶滿意度
  responseTime: number;              // 平均響應時間
}

const trackAccuracyMetrics = async (): Promise<AccuracyMetrics> => {
  const recentPredictions = await getRecentPredictions(1000);
  
  return {
    overallAccuracy: calculateOverallAccuracy(recentPredictions),
    intentAccuracy: calculateIntentAccuracy(recentPredictions),
    confidenceCalibration: calculateCalibration(recentPredictions),
    userSatisfaction: calculateSatisfaction(recentPredictions),
    responseTime: calculateAvgResponseTime(recentPredictions)
  };
};
```

*這個意圖識別引擎讓治理系統能真正「理解」用戶需求，提供智能且精準的回應*