# Claude Code 指令系統總覽

企業洞察平台的完整 Claude Code 指令架構，整合智能治理、BMad Method 和版本控制。

## 🏗️ 指令目錄架構

### 📁 指令分類標準
```
.claude/commands/
├── BMad/           # BMad Method Agile 開發流程
├── git/            # 版本控制與發佈管理  
├── governance/     # 智能治理與規範管理
└── README.md       # 本檔案：指令系統總覽
```

**統一規範：**
- 每個子目錄都包含完整的使用指南
- 統一使用 `README.md` 作為目錄說明文件
- 所有指令都有詳細的使用範例和參數說明

## 🧠 智能指令路由系統

### 第一層：智能分析入口
```bash
# 主要智能入口 - 自動分析並路由
/govern              # 智能治理總入口 → governance/
/bmad-orchestrator   # BMad智能協調器 → BMad/

# 使用策略
1. 規範、健康檢查、版本管理 → /govern
2. Agile開發流程、需求分析 → /bmad-orchestrator  
3. 明確知道具體指令 → 直接使用子目錄指令
```

### 第二層：領域專用指令
```bash
# 智能治理領域 (governance/)
/govern-spec         # 規範建立
/govern-audit        # 健康檢查
/govern-sync         # 規範同步
/govern-tag          # 版本管理

# BMad Method 領域 (BMad/)  
/bmad-master         # 任務執行器
/dev, /pm, /qa       # 各角色 Agent
/*task, *create-doc  # 具體任務指令

# 版本控制領域 (git/)
/wip                 # 工作進度暫存
/release             # 正式發佈
```

### 智能路由決策邏輯
```typescript
interface RoutingDecision {
  // 用戶輸入分析
  input_analysis: {
    keywords: string[];
    intent: UserIntent;
    confidence: number;
  };
  
  // 路由策略
  routing_strategy: {
    primary_system: 'governance' | 'bmad' | 'git';
    specific_command: string;
    reasoning: string;
  };
}

// 路由規則範例
const routingRules = {
  // 治理導向
  '規範|標準|檢查|健康|版本|同步': 'governance',
  
  // 開發流程導向  
  'Epic|Story|需求|架構|測試|開發': 'bmad',
  
  // 版本控制導向
  '提交|發佈|合併|分支': 'git'
};
```

## 📊 各子系統能力矩陣

### 🤖 Governance System (智能治理)
| 指令 | 功能 | 自動化程度 | 企業平台特化 |
|------|------|------------|--------------|
| `/govern` | 智能意圖分析 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| `/govern-spec` | 規範建立 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| `/govern-audit` | 健康檢查 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| `/govern-sync` | 規範同步 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| `/govern-tag` | 版本管理 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**核心優勢：**
- 🧠 自然語言理解
- 🎯 企業平台深度整合
- 🔄 智能學習與優化
- 🛡️ 防稀釋記憶機制

### 🔄 BMad Method System (Agile 流程)
| Agent | 角色 | 主要任務 | 協調能力 |
|-------|------|----------|----------|
| `bmad-orchestrator` | 智能協調器 | 流程指導 | ⭐⭐⭐⭐⭐ |
| `bmad-master` | 任務執行器 | 直接執行 | ⭐⭐⭐ |
| `pm/po/dev/qa` | 角色專家 | 專業任務 | ⭐⭐⭐⭐ |

**核心優勢：**
- 📋 完整 Agile 流程覆蓋
- 🎭 多角色協作模式  
- 📚 豐富的任務模板庫
- 🔧 標準化開發工作流

### 🌿 Git Workflow System (版本控制)
| 指令 | 用途 | 整合度 | 自動化 |
|------|------|--------|--------|
| `/wip` | 工作暫存 | ⭐⭐⭐ | ⭐⭐⭐ |
| `/release` | 正式發佈 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**核心優勢：**
- 🔄 簡化的 Git 工作流
- 🚀 自動化發佈流程
- 📝 標準化提交訊息

## 🎯 系統整合與協調

### 智能指令協調機制
```typescript
interface CommandCoordination {
  // 主入口協調
  govern_bmad_coordination: {
    rule: '治理優先，開發支援';
    scenarios: {
      '規範建立': '/govern → 可選 BMad templates';
      '需求分析': '/bmad-orchestrator → 可選 /govern-spec';
      '功能完成': '/govern-tag + BMad story review';
      '專案檢查': '/govern-audit + BMad checklist';
    };
  };
  
  // 版本控制協調
  version_coordination: {
    governance_git: '/govern-tag → /release';
    bmad_git: 'BMad Epic 完成 → /govern-tag → /wip//release';
  };
}
```

### 用戶使用決策樹
```
用戶需求
├── 規範/檢查/版本相關？ → /govern (智能分析路由)
├── 開發流程/需求分析？ → /bmad-orchestrator  
├── 明確知道Git操作？ → /wip 或 /release
└── 不確定？ → /govern (通用智能分析)
```

## 📈 最佳實踐建議

### 新用戶學習路徑
```bash
# 第1週：熟悉智能入口
1. 使用 /govern 了解治理能力
2. 嘗試 /bmad-orchestrator 了解開發流程

# 第2週：掌握核心功能  
3. 定期 /govern-audit 檢查專案健康
4. 功能完成時 /govern-tag 管理版本

# 第3週：進階整合
5. 使用 /govern-sync 同步規範
6. 整合 BMad 開發流程與治理系統
```

### 團隊協作建議
```bash
# 日常開發
開發者: /bmad-orchestrator → 選擇 dev agent → 開發
完成後: /govern-tag → /release

# 專案管理  
PM: /bmad-orchestrator → 選擇 pm agent → 規劃
規範化: /govern-spec → /govern-sync

# 品質保證
QA: /govern-audit → 檢查專案健康
問題修復: /govern-sync → 同步新規範
```

## 🔧 系統維護與升級

### 指令版本管理
- 每個子系統維護自己的版本號
- 統一透過 `/govern-tag` 管理整體版本
- 向後兼容保證

### 效能監控
- 意圖識別準確率 > 90%
- 指令執行成功率 > 95%
- 用戶滿意度 > 95%

---

## 💡 設計原則

**統一性** - 所有指令遵循相同的設計模式  
**智能性** - 優先使用智能入口，減少記憶負擔  
**專業性** - 每個領域都有專業化的深度功能  
**協調性** - 不同系統間無縫整合與協作  

*這是企業洞察平台 Claude Code 指令系統的完整架構*