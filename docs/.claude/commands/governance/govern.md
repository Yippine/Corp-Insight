# /govern - 智能治理總入口

## 🎯 指令概述
`/govern` 是智能治理體系的總入口，自動分析用戶意圖並建議執行合適的治理指令。整合了專案規範管理、健康檢查、版本控制等核心功能。

## 🧠 智能意圖識別

### 自動分析用戶需求
```typescript
interface IntentAnalysis {
  // 規範建立需求
  specCreation: ["不統一", "應該統一", "需要規範", "標準化", "格式亂"];

  // 健康檢查需求
  projectAudit: ["檢查專案", "有沒有問題", "掃描", "健康", "狀況"];

  // 規範更新需求
  ruleSync: ["規範過時", "需要修改", "規範不對", "更新規範"];

  // 版本管理需求
  versionTag: ["完成了", "做好了", "Epic", "功能", "發版", "可以部署"];
}
```

## ⚡ 使用方式

### 智能對話模式
```bash
# 直接描述問題，AI自動分析並建議
/govern API回應格式每次都不一樣，很亂
→ 分析：格式標準化需求 → 建議執行 /govern-spec

/govern 幫我檢查專案有沒有問題
→ 分析：健康檢查需求 → 執行 /govern-audit

/govern OAuth登入功能做完了
→ 分析：版本管理需求 → 建議執行 /govern-tag v0.2.1
```

### 直接指令模式
```bash
# 熟悉的開發者可以直接使用具體指令
/govern-spec    # 建立規範規格
/govern-audit   # 治理審查
/govern-sync    # 規範同步
/govern-tag     # 版本標記
```

## 🔍 核心分析邏輯

### 步驟 1：語義分析
```typescript
const analyzeUserIntent = (input: string): IntentResult => {
  const keywords = extractKeywords(input);
  const patterns = matchPatterns(input);
  const context = analyzeContext(conversationHistory);

  return {
    primaryIntent: determinePrimaryIntent(keywords, patterns),
    confidence: calculateConfidence(keywords, patterns, context),
    suggestedAction: mapToGovernCommand(primaryIntent),
    parameters: extractParameters(input, primaryIntent)
  };
};
```

### 步驟 2：信心度判斷
```typescript
// 信心度閾值
HIGH_CONFIDENCE = 0.85;    // 直接執行
MEDIUM_CONFIDENCE = 0.6;   // 詢問確認
LOW_CONFIDENCE = 0.4;      // 提供選項

if (confidence >= HIGH_CONFIDENCE) {
  executeCommand(suggestedAction);
} else if (confidence >= MEDIUM_CONFIDENCE) {
  askConfirmation(suggestedAction);
} else {
  provideOptions(allPossibleActions);
}
```

### 步驟 3：智能建議
```typescript
const generateResponse = (analysis: IntentResult): string => {
  const { primaryIntent, confidence, suggestedAction } = analysis;

  switch (primaryIntent) {
    case 'spec_creation':
      return `檢測到${getSubject(input)}標準化需求 (信心度: ${confidence}%)
建議執行 ${suggestedAction} 建立規範？`;

    case 'project_audit':
      return `檢測到專案健康檢查需求 (信心度: ${confidence}%)
執行 ${suggestedAction} 全面掃描...`;

    case 'version_management':
      return `檢測到功能完成，版本管理需求 (信心度: ${confidence}%)
建議版本號 ${suggestVersion()}，執行 ${suggestedAction}？`;
  }
};
```

## 📊 智能學習機制

### 使用模式學習
```typescript
interface UsagePattern {
  userPreferences: {
    preferredCommands: string[];
    commonScenarios: string[];
    responseStyle: 'direct' | 'confirmatory' | 'explanatory';
  };

  contextualMemory: {
    projectPhase: 'planning' | 'development' | 'testing' | 'deployment';
    recentActions: string[];
    frequentTopics: string[];
  };
}
```

### 動態調整策略
- **快節奏開發者** → 提高自動執行閾值
- **謹慎型開發者** → 增加確認步驟
- **新手開發者** → 提供詳細解釋

## 🛡️ 防稀釋機制

### 核心身份保持
```yaml
CORE_IDENTITY: |
  我是智能治理專家，無論對話多長都記住：
  - 分析用戶意圖並建議合適的治理指令
  - 核心指令：/govern-spec, /govern-audit, /govern-sync, /govern-tag
  - 信心度 85%+ 自動執行，否則詢問確認
  - 對話超過 100 輪時建議重啟保持 focus

CONVERSATION_LIMITS:
  warning_threshold: 50    # 50輪對話後提醒
  reset_threshold: 100     # 100輪對話後建議重啟
  sync_trigger: 25         # 25輪對話後建議同步規範
```

### 智能重置提醒
```typescript
if (conversationTurns > WARNING_THRESHOLD) {
  suggest(`對話較長，建議：
1. /govern-sync 同步當前討論到規範中
2. 重啟對話保持 focus
3. 繼續當前討論`);
}
```

## 🔧 錯誤處理與容錯

### 模糊匹配容錯
```typescript
const fuzzyMatch = (input: string): MatchResult => {
  // 拼寫錯誤容錯
  const corrected = spellCheck(input);

  // 同義詞識別
  const synonyms = findSynonyms(corrected);

  // 上下文推理
  const contextual = inferFromContext(synonyms, conversationHistory);

  return bestMatch(contextual);
};
```

### 降級策略
```typescript
// 如果智能分析失敗，提供手動選擇
const fallbackOptions = [
  "1. /govern-spec - 建立新的專案規範",
  "2. /govern-audit - 檢查專案健康狀況",
  "3. /govern-sync - 更新現有規範",
  "4. /govern-tag - 管理版本標記",
  "5. 描述更具體的需求"
];
```

## 📈 成功指標

### 效率提升指標
- **意圖識別準確率** > 90%
- **自動執行成功率** > 85%
- **用戶滿意度** > 95%
- **學習指令時間** < 5分鐘

### 使用體驗指標
- **對話輪數減少** 50%+
- **重複詢問減少** 70%+
- **錯誤執行減少** 80%+

---

## 🚀 快速開始

```bash
# 第一次使用
/govern 我想要規範化專案的 API 設計

# 日常使用
/govern 檢查專案        # 健康檢查
/govern XX 功能完成了     # 版本管理
/govern 規範需要更新     # 同步更新

# 直接指令
/govern-audit          # 跳過分析，直接執行
```

*這個智能入口讓治理工作變得像自然對話一樣簡單*