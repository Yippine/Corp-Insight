# /govern-audit - 企業洞察平台健康檢查系統

## 🎯 指令概述
`/govern-audit` 是專為企業洞察平台設計的全方位健康檢查系統，執行智能掃描以確保專案規範、程式碼品質、API 一致性和系統架構的完整性。

## 🔍 企業平台特定檢查層級

### Layer 1: 專案結構合規性檢查
**檢查目標：**
- 驗證 Next.js 14 專案結構標準
- 確保企業平台核心功能目錄完整
- 檢查 BMad Method 兼容性

```typescript
interface EnterpriseStructureAudit {
  nextjsCompliance: NextJSStructureCheck;
  coreFeatures: CoreFeatureCheck[];
  bmadCompatibility: BMadCompatibilityCheck;
  missingDirectories: string[];
  structureScore: number; // 0-100
}

const auditEnterpriseStructure = async (): Promise<EnterpriseStructureAudit> => {
  const expectedStructure = {
    'next/src/app/': ['api/', 'company/', 'aitool/', 'tender/', 'admin/'],
    'next/src/components/': ['aitool/', 'company/', 'tender/', 'admin/', 'common/'],
    'next/src/lib/': ['aitool/', 'company/', 'database/', 'utils.ts'],
    'next/docs/': ['features/', 'guidelines/', 'BROWNFIELD-DEVELOPMENT-CONSTRAINTS.md'],
    '.claude/commands/': ['governance/', 'BMad/'],
    '.bmad-core/': ['agents/', 'tasks/', 'templates/', 'core-config.yaml']
  };

  return validateProjectStructure(expectedStructure);
};
```

### Layer 2: API 一致性檢查
**企業平台核心：檢查三大功能 API**
- 企業資料 API 一致性
- 標案查詢 API 標準化
- AI 工具整合 API 規範

```typescript
interface APIConsistencyAudit {
  companyAPIs: APIStandardCheck[];
  tenderAPIs: APIStandardCheck[];
  aiToolAPIs: APIStandardCheck[];
  responseFormatScore: number;
  errorHandlingScore: number;
  authenticationScore: number;
}

const auditAPIConsistency = async (): Promise<APIConsistencyAudit> => {
  const apiEndpoints = [
    // 企業資料 APIs
    '/api/company/search',
    '/api/company/detail',
    '/api/company/financial',

    // 標案查詢 APIs
    '/api/tender/search',
    '/api/tender/detail',
    '/api/tender/statistics',

    // AI 工具 APIs
    '/api/aitool/list',
    '/api/aitool/chat',
    '/api/aitool/analysis'
  ];

  return checkAPIStandardCompliance(apiEndpoints);
};
```

### Layer 3: 會員系統安全檢查
**檢查目標：**
- OAuth 認證流程安全性
- 權限分級正確性
- 資料存取控制合規性

```typescript
interface SecurityAudit {
  oauthSecurity: OAuthSecurityCheck;
  permissionMatrix: PermissionMatrixCheck;
  dataAccessControl: DataAccessAudit[];
  securityScore: number;
}

const auditMembershipSecurity = async (): Promise<SecurityAudit> => {
  const securityChecks = [
    checkOAuthImplementation(),
    validatePermissionLevels(['guest', 'member', 'premium', 'admin']),
    auditDataAccessRules(),
    checkSessionManagement(),
    validateCSRFProtection()
  ];

  return aggregateSecurityResults(securityChecks);
};
```

### Layer 4: 前端效能與 UX 檢查
**檢查目標：**
- Next.js 效能最佳化
- Tailwind CSS 使用規範性
- 響應式設計完整性

```typescript
interface FrontendAudit {
  performanceScore: PerformanceMetrics;
  tailwindUsage: TailwindAudit;
  responsiveDesign: ResponsiveCheck[];
  accessibilityScore: number;
  seoOptimization: SEOCheck;
}

const auditFrontendQuality = async (): Promise<FrontendAudit> => {
  return {
    performanceScore: await checkLoadingTimes(),
    tailwindUsage: await auditTailwindClasses(),
    responsiveDesign: await checkResponsiveBreakpoints(),
    accessibilityScore: await checkA11yCompliance(),
    seoOptimization: await validateSEOElements()
  };
};
```

### Layer 5: 資料庫與部署檢查
**檢查目標：**
- MongoDB 資料結構一致性
- EC2 + Nginx 部署健康度
- 備份機制完整性

```typescript
interface InfrastructureAudit {
  databaseHealth: DatabaseHealthCheck;
  deploymentStatus: DeploymentCheck;
  backupIntegrity: BackupAuditResult;
  monitoringCoverage: MonitoringCheck;
}

const auditInfrastructure = async (): Promise<InfrastructureAudit> => {
  return {
    databaseHealth: await checkMongoDBHealth(),
    deploymentStatus: await checkEC2NginxStatus(),
    backupIntegrity: await validateBackupSchedule(),
    monitoringCoverage: await checkLoggingAndMonitoring()
  };
};
```

## 🚨 智能問題檢測與修復

### 自動問題分類
```typescript
enum IssueCategory {
  CRITICAL = 'critical',      // 影響核心功能
  HIGH = 'high',             // 影響使用者體驗
  MEDIUM = 'medium',         // 影響開發效率
  LOW = 'low',               // 優化建議
  INFO = 'info'              // 資訊提醒
}

interface DetectedIssue {
  category: IssueCategory;
  component: 'api' | 'frontend' | 'security' | 'infrastructure' | 'governance';
  description: string;
  impact: string;
  autoFixable: boolean;
  suggestedAction: string;
  relatedFiles: string[];
}
```

### 企業平台常見問題檢測
```typescript
const detectCommonIssues = async (): Promise<DetectedIssue[]> => {
  const issues: DetectedIssue[] = [];

  // API 一致性問題
  const apiIssues = await detectAPIInconsistencies([
    {
      pattern: /^(?!.*\/api\/(company|tender|aitool)\/).*/,
      message: 'API 路徑不符合企業平台三大功能分類'
    },
    {
      pattern: /response\.data\.(?!success|data|message|error)/,
      message: 'API 回應格式不符合統一標準'
    }
  ]);

  // 權限控制問題
  const securityIssues = await detectSecurityVulnerabilities([
    'missing_authentication',
    'insufficient_authorization',
    'data_exposure_risk',
    'session_management_flaw'
  ]);

  // 效能問題
  const performanceIssues = await detectPerformanceBottlenecks([
    'large_bundle_size',
    'unoptimized_images',
    'slow_api_responses',
    'memory_leaks'
  ]);

  return [...apiIssues, ...securityIssues, ...performanceIssues];
};
```

## 🔧 自動修復機制

### 可自動修復的問題類型
```typescript
interface AutoFixCapability {
  apiFormatting: 'auto-fix';           // API 格式標準化
  importOptimization: 'auto-fix';      // Import 語句優化
  tailwindClassOrder: 'auto-fix';      // Tailwind 類別排序
  missingIndexFiles: 'auto-fix';       // 缺失的索引檔案
  brokenReferences: 'suggest-fix';     // 損壞的引用連結
  securityVulnerabilities: 'manual-review'; // 安全性問題需人工檢查
}

const autoFix = async (issues: DetectedIssue[]): Promise<AutoFixResults> => {
  const fixes: FixResult[] = [];

  for (const issue of issues.filter(i => i.autoFixable)) {
    try {
      const result = await applyAutoFix(issue);
      fixes.push({
        issue: issue.description,
        status: 'success',
        filesModified: result.modifiedFiles,
        details: result.changes
      });
    } catch (error) {
      fixes.push({
        issue: issue.description,
        status: 'failed',
        error: error.message
      });
    }
  }

  return { fixes, summary: generateFixSummary(fixes) };
};
```

## 📊 企業平台健康度評分

### 綜合評分系統
```typescript
interface HealthScore {
  overall: number;                    // 0-100 總體健康度
  breakdown: {
    structure: number;                // 專案結構 (20%)
    apiConsistency: number;          // API 一致性 (25%)
    security: number;                // 安全性 (20%)
    performance: number;             // 效能 (15%)
    codeQuality: number;            // 程式碼品質 (10%)
    documentation: number;          // 文件完整性 (10%)
  };
  trend: 'improving' | 'stable' | 'declining';
}

const calculateHealthScore = (auditResults: ComprehensiveAudit): HealthScore => {
  const weights = {
    structure: 0.20,
    apiConsistency: 0.25,
    security: 0.20,
    performance: 0.15,
    codeQuality: 0.10,
    documentation: 0.10
  };

  const scores = {
    structure: auditResults.structure.score,
    apiConsistency: auditResults.api.consistencyScore,
    security: auditResults.security.securityScore,
    performance: auditResults.frontend.performanceScore,
    codeQuality: auditResults.codeQuality.overallScore,
    documentation: auditResults.documentation.completenessScore
  };

  const overall = Object.entries(scores).reduce(
    (total, [key, score]) => total + (score * weights[key]),
    0
  );

  return { overall, breakdown: scores, trend: calculateTrend(scores) };
};
```

## 📋 檢查報告格式

### 詳細報告
```bash
🤖 企業洞察平台健康檢查報告
執行時間：{reportTimestamp}
掃描範圍：{filesCount} 個檔案，{apisCount} 個 API，{componentsCount} 個元件

════════════════════════════════════════
📊 整體健康度：{overallScore}/100 ({healthStatus})

🏗️ 專案結構：✅ {structureScore}/100
✅ Next.js 14 結構標準: 符合
✅ 企業平台功能目錄: 完整
⚠️ BMad Method 兼容性: {bmadScore}/100 - 需要調整 {bmadIssuesCount} 項

🔗 API 一致性：⚠️ {apiScore}/100
✅ 企業資料 API: {companyApiScore}/100
⚠️ 標案查詢 API: {tenderApiScore}/100 - {tenderIssuesCount} 個格式不統一
🔴 AI 工具 API: {aiToolApiScore}/100 - 需要重構回應格式

🔒 安全性：✅ {securityScore}/100
✅ OAuth 認證: 安全
✅ 會員權限分級: 正確實作
✅ 資料存取控制: 符合規範
⚠️ CSRF 防護: {csrfScore}/100 - 建議加強

⚡ 前端效能：⚠️ {performanceScore}/100
✅ 載入時間: {loadTimeMs}ms (目標 < 3s)
⚠️ Bundle 大小: {bundleSizeMB}MB (建議 < 1MB)
✅ Tailwind 使用: 規範正確
🔴 圖片優化: {imageOptScore}/100 - 需要 WebP 轉換

🗄️ 基礎設施：✅ {infraScore}/100
✅ MongoDB 健康度: 正常
✅ EC2 + Nginx: 運行穩定
✅ 備份機制: 正常運作
✅ 監控覆蓋率: {monitoringCoverage}%

🔧 自動修復：已執行
✅ 修復 {fixedIssuesCount} 個問題
⚠️ {manualIssuesCount} 個問題需手動處理

🎯 優先行動建議：
1. {priority1Action} (高優先級)
2. {priority2Action} (中優先級)
3. {priority3Action} (低優先級)

📈 改善趨勢：{trendDirection}
上次檢查分數：{previousScore}/100
本次改善：{improvementDelta} 分
```

### 快速報告
```bash
🤖 快速健康檢查：
🏗️ 結構：✅ {structureScore}/100
🔗 API：⚠️ {apiScore}/100 - {apiIssuesCount} 問題
🔒 安全：✅ {securityScore}/100
⚡ 效能：⚠️ {performanceScore}/100 - {perfIssuesCount} 問題
🗄️ 基建：✅ {infraScore}/100

整體評分：{overallScore}/100 ({healthStatus})
需立即處理：{criticalIssuesCount} 個嚴重問題
```

## 📅 定期檢查排程

### 自動化檢查觸發
```typescript
const scheduleAudits = {
  daily: ['security', 'performance'],           // 每日安全與效能檢查
  weekly: ['structure', 'apiConsistency'],      // 週檢查結構與 API
  monthly: ['comprehensive'],                   // 月度全面檢查
  onDeploy: ['security', 'structure'],         // 部署前檢查
  onCommit: ['codeQuality']                     // 提交時程式碼檢查
};
```

---

## 🚀 快速使用

```bash
# 全面健康檢查
/govern-audit

# 特定領域檢查
/govern-audit --focus=api          # 只檢查 API 一致性
/govern-audit --focus=security     # 只檢查安全性
/govern-audit --focus=performance  # 只檢查效能

# 快速檢查模式
/govern-audit --quick             # 5分鐘快速掃描
```

*為企業洞察平台量身打造的智能健康檢查系統*
