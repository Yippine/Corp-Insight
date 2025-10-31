# /govern-spec - 智能規範建立系統

## 🎯 指令概述
`/govern-spec` 是企業洞察平台的智能規範建立工具，自動分析對話內容並智能決定建立規範、指令或兩者。針對快節奏開發環境優化，支援直接對話式規範建立。

## 🧠 智能判斷邏輯

### 決策優先級架構
```typescript
enum ContentType {
  STANDARD_ONLY = 'standard-only',     // 僅建立規範 (85%)
  COMMAND_ONLY = 'command-only',       // 僅建立指令 (10%)
  BOTH = 'both',                       // 同時建立規範與指令 (5%)
  CLARIFY = 'clarify'                  // 需要使用者澄清
}

const analyzeContent = (conversation: Message[]): ContentDecision => {
  const score = calculateTypeScore(conversation);
  const context = analyzeProjectContext();
  return determineContentType(score, context);
};
```

## 📋 企業平台特定規範類型

### 📊 API 與資料規範 (40% 使用率)
**觸發關鍵字：**
```yaml
api_standards:
  response_format: ["API回應", "資料格式", "JSON格式", "回應結構"]
  error_handling: ["錯誤處理", "例外狀況", "失敗回應", "錯誤碼"]
  authentication: ["登入驗證", "權限控制", "Token", "會員認證"]
  rate_limiting: ["API限制", "請求頻率", "流量控制"]

data_management:
  company_data: ["企業資料", "公司資訊", "商業資料", "企業查詢"]
  tender_data: ["標案資料", "政府標案", "招標資訊", "標案查詢"] 
  ai_tools: ["AI工具", "人工智慧", "工具整合", "AI功能"]
```

**建立位置：**`next/docs/guidelines/api-standards.md`

### 🎨 前端開發規範 (30% 使用率)  
**觸發關鍵字：**
```yaml
ui_standards:
  component_design: ["元件設計", "UI元件", "介面元件", "React元件"]
  styling: ["樣式規範", "CSS標準", "Tailwind", "設計系統"]
  responsive: ["響應式", "手機版", "RWD", "多裝置"]
  accessibility: ["無障礙", "A11Y", "輔助功能", "可及性"]

user_experience:
  navigation: ["導覽設計", "選單設計", "路由", "頁面結構"]
  performance: ["效能優化", "載入速度", "使用者體驗", "UX"]
  feedback: ["使用者回饋", "互動設計", "載入狀態", "錯誤提示"]
```

**建立位置：**`next/docs/guidelines/frontend-standards.md`

### 🔒 安全與權限規範 (20% 使用率)
**觸發關鍵字：**
```yaml
security_standards:
  authentication: ["身份認證", "登入安全", "密碼", "OAuth", "Google登入"]
  authorization: ["權限管理", "角色控制", "存取控制", "會員等級"]
  data_protection: ["資料保護", "隱私", "GDPR", "個資法", "資料安全"]
  api_security: ["API安全", "請求驗證", "CORS", "CSRF", "XSS"]
```

**建立位置：**`next/docs/guidelines/security-standards.md`

### ⚙️ DevOps 與部署規範 (10% 使用率)
**觸發關鍵字：**
```yaml  
deployment_standards:
  environment: ["環境配置", "生產環境", "測試環境", "環境變數"]
  deployment: ["部署流程", "CI/CD", "自動部署", "發佈流程"]
  monitoring: ["監控", "日誌", "錯誤追蹤", "效能監控"]
  backup: ["備份", "資料備份", "災難復原", "資料庫備份"]
```

**建立位置：**`next/docs/guidelines/devops-standards.md`

## 🔍 企業平台智能分析

### 步驟 1：專案環境識別
```typescript
interface ProjectContext {
  platform_type: 'enterprise_insight_platform';
  tech_stack: {
    frontend: 'Next.js 14 + TypeScript + Tailwind';
    backend: 'Node.js + MongoDB';
    deployment: 'EC2 + Nginx + Cloudflare';
  };
  core_features: ['企業資料', '標案查詢', 'AI工具', '會員系統'];
  development_phase: 'brownfield_enhancement';
}
```

### 步驟 2：關鍵字權重計算
```typescript
interface KeywordScore {
  standard: number;    // 規範傾向分數
  command: number;     // 指令傾向分數
  both: number;        // 同時建立分數
}

const calculateScore = (messages: Message[]): KeywordScore => {
  const content = extractContent(messages);
  const projectContext = getProjectContext();
  
  return {
    standard: matchStandardPatterns(content) * projectContext.weight,
    command: matchCommandPatterns(content) * projectContext.weight,
    both: matchInfrastructurePatterns(content) * projectContext.weight
  };
};
```

### 步驟 3：企業平台特定決策
```typescript
const makeDecision = (score: KeywordScore, context: ProjectContext): ContentType => {
  // 企業平台優先建立規範
  if (context.platform_type === 'enterprise_insight_platform') {
    if (score.standard > 0.6 || isDataManagementTopic(context)) {
      return ContentType.STANDARD_ONLY;
    }
  }
  
  // 基礎設施場景優先檢查
  if (score.both > 0.7) {
    return ContentType.BOTH;
  }
  
  // 部署相關指令導向
  if (score.command > 0.8 && isDeploymentRelated(context)) {
    return ContentType.COMMAND_ONLY;
  }
  
  // 預設建立規範（企業平台特性）
  return ContentType.STANDARD_ONLY;
};
```

## 📊 實際場景範例

### 場景 A：API 資料格式討論 → 建立規範
```
使用者：我覺得我們的企業查詢API回應格式應該統一，現在企業基本資料、財務資料、專利資料的格式都不一樣，前端很難處理

🤖 智能分析結果 (信心度: 94%)
類型：API規範 (STANDARD_ONLY)
原因：檢測到企業平台核心功能的格式標準化需求
位置：next/docs/guidelines/api-standards.md
內容：企業資料API統一回應格式規範
```

### 場景 B：會員系統權限討論 → 建立規範
```
使用者：會員系統的權限管理需要更清楚的規範，什麼等級的會員可以看到什麼資料，尤其是標案資料的權限控制

🤖 智能分析結果 (信心度: 91%)
類型：安全規範 (STANDARD_ONLY)  
原因：檢測到會員權限管理標準化需求
位置：next/docs/guidelines/security-standards.md
內容：會員權限分級與資料存取控制規範
```

### 場景 C：部署自動化討論 → 同時建立
```
使用者：我們需要標準化部署流程，同時提供快速部署指令。目前每次都要手動git pull、npm run reset:prod，很容易出錯

🤖 智能分析結果 (信心度: 87%)
類型：規範與指令 (BOTH)
原因：檢測到部署流程標準化 + 自動化需求  
將建立：
- next/docs/guidelines/deployment-standards.md (部署流程規範)
- .claude/commands/deployment/quick-deploy.md (快速部署指令)
```

## ⚙️ 建立流程

### 自動執行序列
```typescript
const executeSpec = async (decision: ContentDecision) => {
  // 分析對話內容
  const content = analyzeConversationContent(messages);
  const category = categorizeByTopic(content);
  const scope = defineSpecificationScope(content, category);
  
  switch (decision.type) {
    case ContentType.STANDARD_ONLY:
      return await createStandardDocument(category, scope, content);
      
    case ContentType.COMMAND_ONLY:
      return await createCommandDocument(category, scope, content);
      
    case ContentType.BOTH:
      return await createBothDocuments(category, scope, content);
  }
};
```

### 規範文件自動生成
```typescript
const createStandardDocument = async (category: string, scope: SpecScope, content: AnalyzedContent) => {
  const template = selectTemplate(category);
  const filePath = generateFilePath(category, scope);
  
  const document = await generateSpecification({
    template,
    content: content.keyPoints,
    examples: content.examples,
    requirements: content.requirements,
    constraints: extractConstraints(content),
    references: findRelatedStandards(category)
  });
  
  // 寫入文件
  await writeFile(filePath, document);
  
  // 更新索引
  await updateStandardsIndex(filePath, category, scope);
  
  // 更新 CLAUDE.md
  await updateProjectMemory(filePath, category);
  
  return { filePath, category, scope, summary: document.summary };
};
```

## 🔧 企業平台特定模板

### API 規範模板
```markdown
# {API_NAME} 統一規範

## 概述
{API_DESCRIPTION}

## 統一回應格式
```typescript
interface StandardAPIResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  error?: {
    code: string;
    detail: string;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}
```

## 企業資料特定欄位
- 統一企業編號 (UBN)
- 公司名稱標準化
- 地址格式標準化
- 聯絡資訊格式

## 錯誤處理標準
- 4XX: 客戶端錯誤
- 5XX: 伺服器錯誤
- 特定錯誤碼定義

## 範例與測試案例
{EXAMPLES_AND_TESTS}
```

### 安全規範模板
```markdown
# {FEATURE_NAME} 安全規範

## 權限分級
- Guest: 基本資料查看
- Member: 進階查詢功能  
- Premium: 完整資料存取
- Admin: 系統管理功能

## 資料存取控制
{ACCESS_CONTROL_RULES}

## 安全檢查清單
- [ ] 輸入驗證
- [ ] 權限檢查
- [ ] 資料脫敏
- [ ] 操作日誌

## 合規要求
{COMPLIANCE_REQUIREMENTS}
```

## 🛡️ 品質保證

### 自動驗證機制
```typescript
const validateSpecification = async (spec: GeneratedSpec): Promise<ValidationResult> => {
  const checks = [
    validateCompleteness(spec),
    validateConsistency(spec), 
    validateProjectAlignment(spec),
    validateBusinessRequirements(spec),
    validateTechnicalFeasibility(spec)
  ];
  
  return await Promise.all(checks);
};
```

### 持續改進機制
```typescript
interface SpecificationMetrics {
  usageFrequency: number;
  violationCount: number;
  feedbackScore: number;
  updateFrequency: number;
  complianceRate: number;
}

const trackSpecificationHealth = (specPath: string): SpecificationMetrics => {
  // 追蹤規範使用情況和健康度
};
```

## 📈 成功指標

### 企業平台特定指標
- **API 一致性提升** > 90%
- **前端開發效率** +40%  
- **安全漏洞減少** -60%
- **部署錯誤減少** -80%
- **新功能開發速度** +50%

---

## 🚀 快速使用

```bash
# 自動分析並建立規範
/govern-spec API回應格式需要統一

# 特定領域規範  
/govern-spec 會員權限管理需要規範化

# 部署相關（可能建立規範+指令）
/govern-spec 部署流程需要自動化
```

*為企業洞察平台量身打造的智能規範建立工具*