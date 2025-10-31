# /govern-tag - 智能版本標記系統

## 🎯 指令概述
`/govern-tag` 是企業洞察平台的智能版本管理工具，自動檢測功能完成狀態並建議版本號，整合 Git 標籤管理與 GitHub Release 發佈流程。

## 🏗️ 企業平台版本策略

### 版本號映射架構
```typescript
interface VersionMapping {
  // 主版本 (Major): 核心架構變更
  major: {
    v1: '正式版發佈 - 三大功能完整';
    v2: '架構重大升級';
    v3: '商業模式變更';
  };
  
  // 次版本 (Minor): 功能模組完成  
  minor: {
    'v0.1.x': 'AI工具優化與整合';
    'v0.2.x': '會員系統與權限控制';
    'v0.3.x': '前端效能與使用者體驗';
    'v0.4.x': '資料整合與標案功能';
    'v0.5.x': '企業資料查詢優化';
  };
  
  // 修訂版本 (Patch): Epic/Story 完成
  patch: {
    epic_completion: '+1',      // Epic 完成
    hotfix: '+1',              // 緊急修復
    optimization: '+1'         // 效能優化
  };
}
```

### 功能模組對應表
```typescript
const featureModuleMapping = {
  // AI 工具模組 (v0.1.x)
  'ai-tools-enhancement': {
    version: 'v0.1',
    epics: [
      'ai-chatbot-integration',       // v0.1.1
      'tool-search-optimization',     // v0.1.2  
      'ai-analysis-features',         // v0.1.3
      'prompt-management-system'      // v0.1.4
    ]
  },
  
  // 會員系統模組 (v0.2.x)
  'membership-system': {
    version: 'v0.2',
    epics: [
      'google-oauth-integration',     // v0.2.1
      'user-profile-management',      // v0.2.2
      'permission-level-system',      // v0.2.3
      'subscription-management'       // v0.2.4
    ]
  },
  
  // 前端優化模組 (v0.3.x)  
  'frontend-optimization': {
    version: 'v0.3',
    epics: [
      'performance-optimization',     // v0.3.1
      'responsive-design-upgrade',    // v0.3.2
      'ui-component-standardization', // v0.3.3
      'accessibility-improvements'    // v0.3.4
    ]
  }
};
```

## 🧠 智能版本檢測

### Epic 完成狀態識別
```typescript
const detectEpicCompletion = (conversation: Message[]): EpicCompletionAnalysis => {
  const completionPatterns = [
    // 明確完成表述
    /(.+)(完成了|做好了|搞定了|結束了)/g,
    /(.*)(功能|模組|系統)(.*)(完成|實作完|開發完)/g,
    
    // 測試完成表述  
    /(.+)(測試通過|測試完成|QA完成)/g,
    
    // 部署相關表述
    /(.+)(可以部署|準備上線|可以發版)/g,
    
    // Epic 特定表述
    /(Epic|故事|需求)(.+)(完成|達成)/g
  ];
  
  const matches = extractMatches(conversation, completionPatterns);
  
  return {
    completedFeatures: identifyCompletedFeatures(matches),
    confidence: calculateCompletionConfidence(matches),
    suggestedVersion: suggestVersionNumber(matches),
    relatedEpics: findRelatedEpics(matches)
  };
};
```

### 版本號智能推薦
```typescript
const suggestVersionNumber = (analysis: EpicCompletionAnalysis): VersionSuggestion => {
  const currentVersion = getCurrentVersion();
  const completedFeature = analysis.completedFeatures[0];
  
  // 根據完成的功能模組確定版本
  const moduleMapping = featureModuleMapping[completedFeature.module];
  if (moduleMapping) {
    const baseVersion = moduleMapping.version;
    const epicIndex = moduleMapping.epics.indexOf(completedFeature.epic);
    const patchNumber = epicIndex + 1;
    
    return {
      suggested: `${baseVersion}.${patchNumber}`,
      reasoning: `${completedFeature.module} 模組的第 ${patchNumber} 個 Epic 完成`,
      confidence: analysis.confidence,
      alternatives: generateAlternativeVersions(baseVersion, patchNumber)
    };
  }
  
  // 如果沒有明確模組映射，基於當前版本遞增
  return incrementCurrentVersion(currentVersion, analysis);
};
```

### 並行開發版本處理
```typescript
interface ParallelDevelopment {
  activeBranches: ActiveBranch[];
  versionConflicts: VersionConflict[];
  mergeStrategy: MergeStrategy;
}

const handleParallelDevelopment = (analysis: EpicCompletionAnalysis): ParallelVersioning => {
  // 檢測多個功能並行完成
  if (analysis.completedFeatures.length > 1) {
    return {
      strategy: 'sequential_tagging',
      versions: analysis.completedFeatures.map((feature, index) => ({
        feature: feature.name,
        version: calculateSequentialVersion(feature, index),
        order: index + 1
      })),
      mergeOrder: prioritizeByBusinessValue(analysis.completedFeatures)
    };
  }
  
  return standardVersioning(analysis);
};
```

## ⚡ 版本標記執行流程

### 自動標記流程
```typescript
const executeVersionTagging = async (suggestion: VersionSuggestion): Promise<TagResult> => {
  console.log(`🏷️  開始版本標記流程...`);
  
  // 1. 檢查工作區狀態
  const workspaceStatus = await checkWorkspaceStatus();
  if (!workspaceStatus.clean) {
    return { success: false, error: '工作區有未提交變更，請先提交' };
  }
  
  // 2. 確認版本號可用
  const versionAvailable = await checkVersionAvailability(suggestion.suggested);
  if (!versionAvailable) {
    const alternative = await findNextAvailableVersion(suggestion.suggested);
    console.log(`    ├─ 版本 ${suggestion.suggested} 已存在，建議使用 ${alternative}`);
    suggestion.suggested = alternative;
  }
  
  // 3. 創建 Git 標籤
  const tagResult = await createGitTag(suggestion.suggested, {
    message: generateTagMessage(suggestion),
    force: false
  });
  
  if (!tagResult.success) {
    return { success: false, error: `Git 標籤建立失敗: ${tagResult.error}` };
  }
  
  console.log(`    ├─ Git 標籤 ${suggestion.suggested} 建立成功`);
  
  // 4. 推送標籤到遠端
  const pushResult = await pushTagToRemote(suggestion.suggested);
  console.log(`    ├─ 標籤推送到遠端: ${pushResult.success ? '成功' : '失敗'}`);
  
  // 5. 更新專案版本記錄
  await updateVersionHistory(suggestion);
  console.log(`    ├─ 版本歷史記錄已更新`);
  
  // 6. 生成 Release Notes (可選)
  const releaseNotes = await generateReleaseNotes(suggestion);
  console.log(`    └─ Release Notes 已生成`);
  
  return {
    success: true,
    version: suggestion.suggested,
    tagHash: tagResult.hash,
    releaseNotes: releaseNotes
  };
};
```

### Git 標籤訊息自動生成
```typescript
const generateTagMessage = (suggestion: VersionSuggestion): string => {
  const { suggested, reasoning, completedFeatures } = suggestion;
  
  let message = `🚀 ${suggested}\n\n`;
  
  // 主要功能描述
  if (completedFeatures.length === 1) {
    const feature = completedFeatures[0];
    message += `✨ ${feature.displayName}\n\n`;
    message += `完成內容：\n`;
    message += feature.completedTasks.map(task => `• ${task}`).join('\n');
  } else {
    message += `✨ 多項功能完成\n\n`;
    message += completedFeatures.map(f => `• ${f.displayName}`).join('\n');
  }
  
  message += `\n\n📊 改善項目：\n`;
  message += generateImprovementSummary(completedFeatures);
  
  message += `\n\n🤖 Generated with Claude Code`;
  message += `\n\nCo-Authored-By: Claude <noreply@anthropic.com>`;
  
  return message;
};
```

## 📋 Release Notes 自動生成

### 企業平台 Release Notes 模板
```typescript
const generateReleaseNotes = async (suggestion: VersionSuggestion): Promise<ReleaseNotes> => {
  const template = `# Release ${suggestion.suggested}

## 🎉 新功能
${generateNewFeaturesSection(suggestion.completedFeatures)}

## 🚀 功能增強  
${generateEnhancementsSection(suggestion.completedFeatures)}

## 🐛 問題修復
${generateBugFixesSection(suggestion.completedFeatures)}

## ⚡ 效能優化
${generatePerformanceSection(suggestion.completedFeatures)}

## 🔒 安全性更新
${generateSecuritySection(suggestion.completedFeatures)}

## 📈 企業洞察平台更新
${generatePlatformSpecificUpdates(suggestion.completedFeatures)}

## 🔧 技術改進
${generateTechnicalImprovements(suggestion.completedFeatures)}

## 📚 文件更新
${generateDocumentationUpdates(suggestion.completedFeatures)}

## 🙏 致謝
感謝所有參與此版本開發的團隊成員。

---
**發佈時間**: ${new Date().toISOString()}  
**Git 標籤**: ${suggestion.suggested}  
**分支**: main  
**建置狀態**: ✅ 通過

🤖 Generated with [Claude Code](https://claude.ai/code)`;

  return {
    version: suggestion.suggested,
    content: template,
    publishDate: new Date(),
    features: suggestion.completedFeatures
  };
};
```

### 企業平台特定內容生成
```typescript
const generatePlatformSpecificUpdates = (features: CompletedFeature[]): string => {
  const platformUpdates = [];
  
  // AI 工具相關更新
  const aiUpdates = features.filter(f => f.module === 'ai-tools-enhancement');
  if (aiUpdates.length > 0) {
    platformUpdates.push('### 🤖 AI 工具整合');
    aiUpdates.forEach(update => {
      platformUpdates.push(`- ${update.description}`);
    });
  }
  
  // 會員系統相關更新  
  const memberUpdates = features.filter(f => f.module === 'membership-system');
  if (memberUpdates.length > 0) {
    platformUpdates.push('### 👥 會員系統');
    memberUpdates.forEach(update => {
      platformUpdates.push(`- ${update.description}`);
    });
  }
  
  // 企業資料相關更新
  const companyUpdates = features.filter(f => f.category === 'company-data');
  if (companyUpdates.length > 0) {
    platformUpdates.push('### 🏢 企業資料功能');
    companyUpdates.forEach(update => {
      platformUpdates.push(`- ${update.description}`);
    });
  }
  
  // 標案資料相關更新
  const tenderUpdates = features.filter(f => f.category === 'tender-data');
  if (tenderUpdates.length > 0) {
    platformUpdates.push('### 📊 標案查詢功能');
    tenderUpdates.forEach(update => {
      platformUpdates.push(`- ${update.description}`);
    });
  }
  
  return platformUpdates.join('\n');
};
```

## 🔗 GitHub Release 整合

### 自動 GitHub Release 創建
```typescript
const createGitHubRelease = async (tagResult: TagResult): Promise<ReleaseResult> => {
  const releaseData = {
    tag_name: tagResult.version,
    target_commitish: 'main',
    name: `企業洞察平台 ${tagResult.version}`,
    body: tagResult.releaseNotes.content,
    draft: false,
    prerelease: tagResult.version.includes('beta') || tagResult.version.startsWith('v0.')
  };
  
  try {
    // 使用 GitHub CLI 創建 Release
    const createCommand = `gh release create ${tagResult.version} --title "${releaseData.name}" --notes "${releaseData.body}"`;
    
    if (releaseData.prerelease) {
      createCommand += ' --prerelease';
    }
    
    const result = await executeCommand(createCommand);
    
    return {
      success: true,
      releaseUrl: result.releaseUrl,
      version: tagResult.version
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
```

## 📊 版本歷史追蹤

### 版本歷史記錄
```typescript
interface VersionHistory {
  version: string;
  releaseDate: Date;
  features: CompletedFeature[];
  epicCount: number;
  moduleProgress: ModuleProgress;
  deploymentStatus: DeploymentStatus;
  userFeedback?: UserFeedback;
}

const updateVersionHistory = async (suggestion: VersionSuggestion): Promise<void> => {
  const historyEntry: VersionHistory = {
    version: suggestion.suggested,
    releaseDate: new Date(),
    features: suggestion.completedFeatures,
    epicCount: suggestion.completedFeatures.length,
    moduleProgress: calculateModuleProgress(suggestion),
    deploymentStatus: 'pending'
  };
  
  // 更新版本歷史文件
  const historyPath = 'next/docs/VERSION_HISTORY.md';
  await appendVersionHistory(historyPath, historyEntry);
  
  // 更新專案狀態文件
  await updateProjectStatus(suggestion);
};
```

### 模組進度追蹤
```typescript
const calculateModuleProgress = (suggestion: VersionSuggestion): ModuleProgress => {
  const moduleStats = {};
  
  for (const module in featureModuleMapping) {
    const mapping = featureModuleMapping[module];
    const completedEpics = suggestion.completedFeatures
      .filter(f => f.module === module)
      .length;
    
    moduleStats[module] = {
      totalEpics: mapping.epics.length,
      completedEpics: completedEpics,
      progress: (completedEpics / mapping.epics.length) * 100,
      nextEpic: mapping.epics[completedEpics] || null
    };
  }
  
  return moduleStats;
};
```

## 📈 版本發佈報告

### 詳細發佈報告
```bash
🏷️  版本標記執行報告
版本號：{versionNumber}
建立時間：{creationTimestamp}

════════════════════════════════════════

✨ 完成功能摘要：
   ├─ 主要模組: {primaryModule}
   ├─ 完成 Epic: {epicName}
   ├─ 包含任務: {taskCount} 個
   └─ 程式碼變更: {codeChanges} 行

🎯 版本決策依據：
   ├─ 檢測信心度: {confidenceScore}%
   ├─ 功能完成度: {completionRate}%
   ├─ 測試通過率: {testPassRate}%
   └─ 版本策略: {versionStrategy}

📊 模組進度更新：
   ├─ AI 工具模組: {aiModuleProgress}% ({aiEpicsCompleted}/{aiEpicsTotal})
   ├─ 會員系統模組: {memberModuleProgress}% ({memberEpicsCompleted}/{memberEpicsTotal})
   ├─ 前端優化模組: {frontendModuleProgress}% ({frontendEpicsCompleted}/{frontendEpicsTotal})
   └─ 資料整合模組: {dataModuleProgress}% ({dataEpicsCompleted}/{dataEpicsTotal})

🚀 部署狀態：
   ├─ Git 標籤: ✅ 已建立 ({gitTagHash})
   ├─ 遠端推送: ✅ 已完成
   ├─ GitHub Release: ✅ 已發佈 ({releaseUrl})
   └─ 部署觸發: ⏳ 等待部署

📝 Release Notes：
   ├─ 新功能: {newFeaturesCount} 項
   ├─ 功能增強: {enhancementsCount} 項  
   ├─ 問題修復: {bugFixesCount} 項
   └─ 效能優化: {optimizationsCount} 項

🎯 下一步建議：
   ├─ 下個 Epic: {nextEpicName}
   ├─ 預估版本: {nextVersionEstimate}
   └─ 目標發佈: {nextReleaseTarget}

整體進度：朝向 v1.0.0 完成 {overallProgress}%
```

---

## 🚀 快速使用

```bash
# 智能檢測並標記版本
/govern-tag

# 手動指定版本號
/govern-tag v0.2.1

# 特定功能完成標記
/govern-tag --feature="會員系統OAuth整合"

# 檢視版本建議
/govern-tag --suggest-only

# 查看版本歷史
/govern-tag --history

# 檢查模組進度
/govern-tag --progress
```

*讓版本管理變得智能且符合企業開發節奏*