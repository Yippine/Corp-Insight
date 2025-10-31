# Git 版本控制指令系統

企業洞察平台的 Git 工作流程管理，簡化版本控制操作並與智能治理系統整合。

## 🌿 核心指令

### `/wip` - 工作進度暫存
快速暫存當前工作進度，適用於功能開發中的階段性提交。

```bash
# 使用方式
/wip

# 執行流程：
1. git add . (暫存所有變更)
2. 生成中文 WIP 提交訊息
3. git commit -m "WIP: [功能描述]"
```

**使用時機：**
- 功能開發進行中，需要暫存進度
- 準備切換分支前的工作保存  
- 每日工作結束前的進度備份
- 實驗性變更的階段性記錄

**提交訊息格式：**
```
WIP: 新增使用者登入頁面
WIP: 完成 OAuth 驗證邏輯
WIP: 修復 API 回應格式問題
```

### `/release` - 正式發佈管理
完整的發佈流程，包含最終提交、分支合併和推送。

```bash
# 使用方式
/release

# 執行流程：
1. 確認工作區狀態清潔
2. 生成英文正式提交訊息  
3. 推送到 main 分支
4. 清理功能分支 (可選)
```

**使用時機：**
- 功能完全開發完成
- Epic 或 Story 完成交付
- 準備正式部署上線
- 需要觸發 CI/CD 流程

**提交訊息格式：**
```
[front-end] Implement user authentication system.
[api] Add enterprise data query endpoints.
[ai-tools] Integrate chatbot functionality.
[member] Complete OAuth login process.
```

## 🔄 與智能治理整合

### 版本控制 + 智能標記
```bash
# 完整工作流程
1. 開發功能 → /wip (階段性暫存)
2. 功能完成 → /release (正式提交)  
3. Epic 完成 → /govern-tag (智能版本標記)
4. 健康檢查 → /govern-audit (確保品質)
```

### 智能提交訊息生成
```typescript  
// AI 自動分析變更內容並生成合適的提交訊息
interface CommitMessageGeneration {
  wip_analysis: {
    changed_files: string[];
    feature_context: string;
    progress_description: string;
  };
  
  release_analysis: {
    feature_scope: 'front-end' | 'api' | 'ai-tools' | 'member';
    change_summary: string;
    impact_assessment: string;
  };
}
```

## 📋 分支策略與工作流

### Git Flow 架構
```
main (主分支 - 生產環境)
├── develop (開發分支)  
├── feature/ai-tools-enhancement (功能分支)
│   ├── WIP: AI 聊天機器人整合
│   ├── WIP: 工具搜尋最佳化
│   └── [squash merge] → [ai-tools] Complete AI tools integration.
└── feature/membership-system (功能分支)
    ├── WIP: Google OAuth 整合
    ├── WIP: 用戶權限分級
    └── [squash merge] → [member] Implement membership system.
```

### 企業平台分支命名規範  
```yaml
branch_naming:
  feature_branches:
    - "feature/ai-tools-enhancement"     # AI 工具模組
    - "feature/membership-system"        # 會員系統模組  
    - "feature/frontend-optimization"    # 前端優化模組
    - "feature/data-integration"         # 資料整合模組
    
  hotfix_branches:
    - "hotfix/security-patch"           # 安全性修復
    - "hotfix/api-performance"          # API 效能修復
    
  release_branches:  
    - "release/v0.1.0"                  # 版本發佈分支
    - "release/v0.2.0"                  # 會員系統版本
```

## 🎯 提交訊息標準化

### WIP 提交 (中文)
```bash
# 格式：WIP: [功能模組] 具體進度描述
WIP: 會員系統 Google OAuth 登入整合
WIP: AI 工具 聊天機器人回應最佳化  
WIP: 企業資料 查詢 API 效能改善
WIP: 前端介面 響應式設計調整
```

### Release 提交 (英文) 
```bash  
# 格式：[scope] Verb object in present tense.
[member] Implement Google OAuth authentication
[ai-tools] Optimize chatbot response generation
[api] Improve enterprise data query performance  
[front-end] Enhance responsive design components
[deploy] Update CI/CD pipeline configuration
```

### 提交類型分類
```yaml
commit_scopes:
  feature_scopes:
    - "[ai-tools]"     # AI 工具相關
    - "[member]"       # 會員系統相關
    - "[api]"          # API 開發相關
    - "[front-end]"    # 前端開發相關
    
  technical_scopes:
    - "[deploy]"       # 部署相關
    - "[test]"         # 測試相關  
    - "[docs]"         # 文檔相關
    - "[chore]"        # 維護相關
```

## 🛠️ 進階 Git 操作

### 常用 Git 指令
```bash
# 狀態檢查
git status                    # 檢查工作區狀態
git branch --show-current     # 顯示當前分支
git lg                        # 美化的 log 顯示

# 分支管理
git checkout -b feature/new-feature  # 建立並切換新分支
git branch -D feature/old-feature    # 強制刪除分支
git checkout main && git pull        # 回到主分支並更新

# 合併與重置
git merge --squash feature-branch    # 壓縮合併
git reset --hard HEAD~1              # 重置到上一個提交  
git reflog                           # 查看操作歷史
```

### Git Alias 設定
```bash
# 已配置的別名
git lg = git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

# 建議新增的別名  
git st = git status
git br = git branch  
git co = git checkout
git cm = git commit -m
```

## 🔧 部署整合

### 自動化部署觸發
```yaml
deployment_triggers:
  # 生產環境部署
  production_deploy:
    branch: "main"
    trigger: "/release"
    process: "EC2 + Nginx + PM2"
    
  # 測試環境部署  
  staging_deploy:
    branch: "develop"
    trigger: "push to develop"
    process: "Docker container"
```

### 與 CI/CD 整合
```bash
# Release 後自動觸發
1. /release → 推送到 main
2. GitHub Actions 檢測到推送  
3. 執行測試套件
4. 自動部署到生產環境
5. /govern-audit 檢查部署健康度
```

## 📊 版本歷史追蹤

### 提交歷史分析
```typescript
interface CommitAnalysis {
  feature_progress: {
    ai_tools: { commits: 25, last_commit: '2024-01-15' };
    membership: { commits: 18, last_commit: '2024-01-14' };
    frontend: { commits: 12, last_commit: '2024-01-13' };
  };
  
  commit_patterns: {
    wip_ratio: 0.75;        // 75% WIP commits  
    release_ratio: 0.25;    // 25% Release commits
    avg_commits_per_day: 8;
  };
}
```

### Release Notes 自動生成
```bash
# 基於提交訊息自動生成
git log --oneline main --since="2024-01-01" --grep="\[ai-tools\]"

# 輸出範例：
# a1b2c3d [ai-tools] Implement chatbot integration
# d4e5f6g [ai-tools] Optimize response generation  
# g7h8i9j [ai-tools] Add tool search functionality
```

## 🚨 故障排除與最佳實踐

### 常見問題解決
```bash
# 工作區不乾淨
問題：Cannot switch branch due to uncommitted changes
解決：/wip → 暫存當前進度

# 分支衝突
問題：Merge conflict in branch  
解決：git pull origin main → 手動解決衝突 → /release

# 提交訊息錯誤
問題：Wrong commit message format
解決：git commit --amend -m "正確訊息"
```

### 開發最佳實踐
```yaml
best_practices:
  wip_commits:
    - "每完成小功能就 /wip"
    - "描述要具體且有意義"
    - "每日至少一次 WIP 提交"
    
  release_commits:  
    - "確保功能完整測試"
    - "遵循英文提交訊息格式"
    - "Release 前先 /govern-audit"
    
  branch_management:
    - "功能分支從 main 分出"
    - "完成後及時刪除分支"
    - "定期同步 main 分支更新"
```

## 📈 Git 工作流程效益

### 開發效率提升
- **簡化操作** - 兩個指令涵蓋 90% 使用場景
- **自動化處理** - AI 生成合適的提交訊息
- **錯誤預防** - 內建檢查機制避免常見錯誤
- **流程標準化** - 團隊協作更加順暢

### 與治理系統協同
```bash
# 完整開發生命週期
開發階段: /wip (階段性記錄)
完成階段: /release (正式提交)  
版本管理: /govern-tag (智能標記)
品質保證: /govern-audit (健康檢查)
規範同步: /govern-sync (持續改進)
```

---

## 💡 Git 工作流程哲學

**「讓版本控制變得簡單而強大」**

- 🎯 **簡化操作** - 複雜的 Git 操作封裝成簡單指令
- 🤖 **智能化** - AI 自動生成合適的提交訊息  
- 🔄 **標準化** - 統一的工作流程確保程式碼品質
- 🚀 **整合化** - 與智能治理系統無縫配合

*為企業洞察平台提供專業級的版本控制支援*