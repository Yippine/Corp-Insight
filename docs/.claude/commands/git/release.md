# Release 正式上版指令

執行 Git Release 正式上版流程，將功能分支的 WIP 提交壓平合併到 main 分支。

## 功能說明

當接收到「上版」、「正式提交」等指令時觸發。此流程為**全自動執行**，無需使用者手動介入。

## 執行流程

### 1. 切換並更新主幹
```bash
git checkout main
git pull origin main
```

### 2. 壓平合併 (Squash Merge)
```bash
git merge --squash feature/xxx
```

### 3. 正式提交
```bash
git commit -m "[type] Subject"
```

### 4. 推送與清理
```bash
# 推送主幹
git push origin main

# 強制刪除功能分支
git branch -D feature/xxx
```

### 5. 最終驗證
```bash
git status
git lg -3
```

## 提交訊息規範

**格式**：`[type] Subject Part 1 | Subject Part 2`

### Type 範疇定義
| 範疇 | 英文 | 用途 |
|------|------|------|
| 前端 | `front-end` | UI/UX、頁面元件、前端互動 |
| 後端 | `back-end` | 核心業務 API、後端服務 |
| 整合 | `integration` | 同時涉及前後端 |
| 資料庫 | `database` | Schema、遷移、索引優化 |
| 部署 | `deploy` | 雲端部署、容器化、CI/CD |
| 事務 | `chore` | 套件管理、框架設定 |
| 文件 | `docs` | 文件更新 |
| 格式 | `style` | 純格式化變更 |

### Subject 格式規則（二選一）

**句子式 (Sentence Case)**：
- 句首大寫，其餘小寫
- 每個主題句尾加句點 `.`
- 範例：`Update user profile validation logic. | Fix image upload error.`

**標題式 (Title Case)**：
- 主要單字首字母大寫
- 句尾不加句點
- 範例：`Refactor User Authentication Module`

## 使用方式

```
使用者指令範例：
- "請正式上版"
- "上版這個功能"
- "合併到 main"

參數：$ARGUMENTS（可選，用於特殊情況說明）
```

## 注意事項

- 此流程為全自動執行
- 執行前確保所有 WIP 提交都有意義
- AI 會自動分析所有 WIP 提交內容來草擬正式提交訊息
- 使用 `-D` 強制刪除分支避免 Git 狀態問題