# /govern-sync - 智能規範同步系統

## 🎯 指令概述
`/govern-sync` 是企業洞察平台的智能規範同步工具，自動分析對話內容並識別需要更新的規範，實現規範與實際開發需求的雙向同步。

## 🧠 智能同步分析

### 同步需求識別
```typescript
interface SyncAnalysis {
  conversationAnalysis: ConversationInsight;
  outdatedStandards: OutdatedStandard[];
  newRequirements: NewRequirement[];
  conflictResolution: ConflictResolution[];
  syncActions: SyncAction[];
}

enum SyncTrigger {
  CONVERSATION_DRIFT = 'conversation_drift',    // 對話偏離現有規範
  REQUIREMENT_CHANGE = 'requirement_change',    // 需求變更
  IMPLEMENTATION_GAP = 'implementation_gap',    // 實作與規範落差  
  PERIODIC_UPDATE = 'periodic_update',          // 定期更新
  MANUAL_REQUEST = 'manual_request'             // 手動同步請求
}
```

### 對話內容智能解析
```typescript
const analyzeConversationForSync = (messages: Message[]): SyncAnalysis => {
  // 1. 提取規範相關語句
  const ruleStatements = extractRuleStatements(messages);
  
  // 2. 識別與現有規範的差異
  const standardConflicts = findStandardConflicts(ruleStatements);
  
  // 3. 檢測新的規範需求
  const newRequirements = detectNewRequirements(ruleStatements);
  
  // 4. 分析實作與規範的落差
  const implementationGaps = findImplementationGaps(messages);
  
  return {
    conversationAnalysis: analyzeContext(messages),
    outdatedStandards: standardConflicts,
    newRequirements: newRequirements,
    conflictResolution: generateConflictResolutions(standardConflicts),
    syncActions: generateSyncActions(newRequirements, implementationGaps)
  };
};
```

## 🔍 企業平台特定同步場景

### 場景 1: API 規範更新同步
**觸發情況：**
```yaml
api_sync_triggers:
  format_changes: 
    - "API回應格式需要調整"
    - "錯誤處理方式要改變" 
    - "新增欄位到回應中"
  
  security_updates:
    - "權限檢查邏輯修改"
    - "認證流程調整"
    - "資料存取規則變更"
    
  performance_optimizations:
    - "分頁邏輯需要優化"
    - "快取策略調整"
    - "查詢效能改善"
```

**同步流程：**
```typescript
const syncAPIStandards = async (changes: APIChange[]): Promise<SyncResult> => {
  const apiStandardsPath = 'next/docs/guidelines/api-standards.md';
  const currentStandards = await readStandardsFile(apiStandardsPath);
  
  // 智能合併變更
  const updatedStandards = await intelligentMerge(currentStandards, changes, {
    preserveExistingRules: true,
    addNewRequirements: true,
    resolveConflicts: 'prompt_user',
    updateExamples: true
  });
  
  // 更新相關文件
  const relatedFiles = [
    'next/docs/guidelines/security-standards.md',  // 安全規範可能受影響
    'next/docs/guidelines/frontend-standards.md',  // 前端呼叫方式可能需調整
    '.claude/commands/governance/govern-audit.md'  // 審查標準需同步
  ];
  
  return updateRelatedStandards(updatedStandards, relatedFiles);
};
```

### 場景 2: 會員系統規範同步
**觸發情況：**
```yaml
membership_sync_triggers:
  permission_changes:
    - "會員等級權限調整"
    - "新增管理員角色"
    - "資料存取權限細化"
    
  authentication_updates:
    - "OAuth 流程修改"
    - "登入驗證加強"
    - "會話管理改善"
```

### 場景 3: 開發流程規範同步
**觸發情況：**
```yaml
development_sync_triggers:
  workflow_changes:
    - "部署流程調整"
    - "測試策略更新" 
    - "版本管理規則修改"
    
  technology_updates:
    - "技術棧升級"
    - "工具鏈變更"
    - "架構調整"
```

## ⚡ 智能同步算法

### 步驟 1: 規範相關語句識別
```typescript
const extractRuleStatements = (messages: Message[]): RuleStatement[] => {
  const rulePatterns = [
    /應該|必須|需要|要求|規定|標準|規範|約定/g,
    /不能|不可|禁止|避免|限制/g,
    /建議|推薦|最好|優先/g,
    /統一|一致|標準化|規範化/g
  ];
  
  const statements: RuleStatement[] = [];
  
  for (const message of messages) {
    const content = message.content;
    
    // 找出包含規範性語句的段落
    const ruleParagraphs = content.split(/[.!?。！？]/).filter(paragraph => 
      rulePatterns.some(pattern => pattern.test(paragraph))
    );
    
    for (const paragraph of ruleParagraphs) {
      statements.push({
        content: paragraph.trim(),
        type: classifyRuleType(paragraph),
        confidence: calculateRuleConfidence(paragraph),
        relatedDomain: identifyDomain(paragraph),
        timestamp: message.timestamp
      });
    }
  }
  
  return statements.filter(s => s.confidence > 0.7);
};
```

### 步驟 2: 現有規範衝突檢測
```typescript
const findStandardConflicts = async (ruleStatements: RuleStatement[]): Promise<StandardConflict[]> => {
  const conflicts: StandardConflict[] = [];
  const existingStandards = await loadAllStandards();
  
  for (const statement of ruleStatements) {
    for (const standard of existingStandards) {
      const conflictAnalysis = analyzeConflict(statement, standard);
      
      if (conflictAnalysis.hasConflict) {
        conflicts.push({
          statement: statement,
          conflictingStandard: standard,
          conflictType: conflictAnalysis.type,
          severity: conflictAnalysis.severity,
          resolution: suggestResolution(statement, standard)
        });
      }
    }
  }
  
  return conflicts;
};
```

### 步驟 3: 智能合併策略
```typescript
enum MergeStrategy {
  APPEND = 'append',                    // 添加新規則
  REPLACE = 'replace',                  // 替換舊規則
  ENHANCE = 'enhance',                  // 增強現有規則
  SPLIT = 'split',                      // 拆分成多個規則
  CONSOLIDATE = 'consolidate'           // 合併相似規則
}

const intelligentMerge = async (
  currentStandards: StandardDocument,
  changes: Change[],
  options: MergeOptions
): Promise<StandardDocument> => {
  
  const mergeStrategy = determineMergeStrategy(changes, currentStandards);
  
  switch (mergeStrategy) {
    case MergeStrategy.APPEND:
      return appendNewRules(currentStandards, changes);
      
    case MergeStrategy.REPLACE:
      return replaceExistingRules(currentStandards, changes);
      
    case MergeStrategy.ENHANCE:
      return enhanceExistingRules(currentStandards, changes);
      
    case MergeStrategy.CONSOLIDATE:
      return consolidateRules(currentStandards, changes);
  }
};
```

## 🔄 同步執行流程

### 自動同步觸發
```typescript
const executeSync = async (trigger: SyncTrigger, context: SyncContext): Promise<SyncResult> => {
  console.log(`🔄 開始智能規範同步... (觸發: ${trigger})`);
  
  // 1. 分析同步需求
  const analysis = await analyzeConversationForSync(context.messages);
  console.log(`    ├─ 識別 ${analysis.outdatedStandards.length} 個過時規範`);
  console.log(`    ├─ 發現 ${analysis.newRequirements.length} 個新需求`);
  
  // 2. 生成同步計劃
  const syncPlan = await generateSyncPlan(analysis);
  console.log(`    ├─ 生成同步計劃: ${syncPlan.actions.length} 個操作`);
  
  // 3. 執行同步操作
  const results = await executeSyncPlan(syncPlan);
  console.log(`    ├─ 同步完成: ${results.successCount}/${results.totalCount} 成功`);
  
  // 4. 更新索引和引用
  await updateReferencesAndIndexes(results.modifiedFiles);
  console.log(`    ├─ 更新 ${results.modifiedFiles.length} 個文件的引用`);
  
  // 5. 驗證同步結果
  const validation = await validateSyncResults(results);
  console.log(`    └─ 同步驗證: ${validation.isValid ? '通過' : '失敗'}`);
  
  return results;
};
```

### 衝突解決策略
```typescript
interface ConflictResolution {
  conflict: StandardConflict;
  strategy: ResolutionStrategy;
  userPrompt?: string;
  autoResolvable: boolean;
}

enum ResolutionStrategy {
  USER_CHOICE = 'user_choice',          // 讓用戶選擇
  MERGE_BOTH = 'merge_both',            // 合併兩者
  KEEP_EXISTING = 'keep_existing',      // 保留現有
  USE_NEW = 'use_new',                  // 使用新的
  CREATE_VARIANT = 'create_variant'     // 創建變體規範
}

const resolveConflicts = async (conflicts: StandardConflict[]): Promise<ConflictResolution[]> => {
  const resolutions: ConflictResolution[] = [];
  
  for (const conflict of conflicts) {
    if (conflict.severity === 'low' && conflict.type === 'enhancement') {
      // 低嚴重度增強型衝突：自動合併
      resolutions.push({
        conflict,
        strategy: ResolutionStrategy.MERGE_BOTH,
        autoResolvable: true
      });
    } else if (conflict.severity === 'high') {
      // 高嚴重度衝突：需要用戶決定
      resolutions.push({
        conflict,
        strategy: ResolutionStrategy.USER_CHOICE,
        userPrompt: generateConflictPrompt(conflict),
        autoResolvable: false
      });
    }
  }
  
  return resolutions;
};
```

## 📊 同步報告與追蹤

### 同步執行報告
```bash
🔄 智能規範同步報告
執行時間：{syncTimestamp}
觸發原因：{triggerReason}

════════════════════════════════════════

📝 對話分析結果：
   ├─ 處理對話輪數: {conversationTurns}
   ├─ 識別規範語句: {ruleStatementsCount} 個
   ├─ 檢測新需求: {newRequirementsCount} 個
   └─ 發現衝突: {conflictsCount} 個

🔍 規範更新摘要：
   ├─ API 標準: 更新 {apiUpdatesCount} 項
   ├─ 安全規範: 新增 {securityAdditionsCount} 項  
   ├─ 前端規範: 調整 {frontendChangesCount} 項
   └─ 部署流程: 優化 {deploymentOptimizationsCount} 項

📁 影響檔案：
   ├─ next/docs/guidelines/api-standards.md (主要更新)
   ├─ next/docs/guidelines/security-standards.md (權限調整)
   ├─ .claude/commands/governance/govern-audit.md (檢查標準同步)
   └─ CLAUDE.md (記憶更新)

🎯 同步結果：
   ✅ 成功: {successfulSyncs} 個操作
   ⚠️  警告: {warningsCount} 個需注意
   ❌ 失敗: {failedSyncs} 個操作

⚡ 自動處理：
   ✅ 自動解決 {autoResolvedCount} 個低級衝突
   🤝 用戶確認 {userResolvedCount} 個高級衝突
   📝 創建 {newRulesCount} 條新規範

📈 規範健康度提升：
   前: {previousHealthScore}/100
   後: {currentHealthScore}/100
   提升: +{healthScoreImprovement} 分
```

### 同步歷史追蹤
```typescript
interface SyncHistory {
  syncId: string;
  timestamp: Date;
  trigger: SyncTrigger;
  changesCount: number;
  affectedStandards: string[];
  userInteractions: UserInteraction[];
  outcome: 'success' | 'partial' | 'failed';
  healthScoreChange: number;
}

const trackSyncHistory = async (result: SyncResult): Promise<void> => {
  const historyEntry: SyncHistory = {
    syncId: generateSyncId(),
    timestamp: new Date(),
    trigger: result.trigger,
    changesCount: result.changes.length,
    affectedStandards: result.modifiedFiles,
    userInteractions: result.userInteractions,
    outcome: result.success ? 'success' : 'partial',
    healthScoreChange: result.healthScoreChange
  };
  
  await appendSyncHistory(historyEntry);
};
```

## 🛡️ 同步品質保證

### 同步前驗證
```typescript
const validateBeforeSync = async (syncPlan: SyncPlan): Promise<ValidationResult> => {
  const validations = [
    validateSyntaxCorrectness(syncPlan),
    validateSemanticConsistency(syncPlan),
    validateBusinessLogic(syncPlan),
    validateTechnicalFeasibility(syncPlan),
    validateBackwardCompatibility(syncPlan)
  ];
  
  return aggregateValidationResults(validations);
};
```

### 同步後完整性檢查
```typescript
const validateAfterSync = async (syncResults: SyncResult[]): Promise<IntegrityCheck> => {
  return {
    referencesIntegrity: await checkAllReferences(),
    crossStandardConsistency: await checkCrossStandardConsistency(),
    implementationAlignment: await checkImplementationAlignment(),
    documentationCompleteness: await checkDocumentationCompleteness()
  };
};
```

## 📅 定期同步排程

### 自動同步觸發條件
```typescript
const syncSchedule = {
  // 對話觸發同步
  conversationBased: {
    ruleStatementCount: 5,        // 累積5個規範語句時同步
    conflictDetected: true,       // 檢測到衝突時立即同步
    conversationLength: 50        // 對話超過50輪時建議同步
  },
  
  // 時間觸發同步
  timeBased: {
    daily: 'check_for_pending_syncs',
    weekly: 'comprehensive_sync_review', 
    monthly: 'full_standards_audit'
  },
  
  // 事件觸發同步
  eventBased: {
    beforeDeploy: true,           // 部署前同步檢查
    afterMilestone: true,         // 里程碑完成後同步
    onStandardViolation: true     // 違反規範時同步
  }
};
```

---

## 🚀 快速使用

```bash
# 智能分析並同步
/govern-sync

# 特定領域同步
/govern-sync --domain=api           # 只同步 API 相關規範  
/govern-sync --domain=security      # 只同步安全相關規範

# 衝突處理模式
/govern-sync --resolve=auto         # 自動解決低級衝突
/govern-sync --resolve=interactive  # 互動式解決所有衝突

# 同步歷史查看
/govern-sync --history             # 查看同步歷史
/govern-sync --status              # 查看待同步項目
```

*讓規範與實際開發保持完美同步的智能系統*