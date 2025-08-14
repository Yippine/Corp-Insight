# Submodule Git 工作流程指南

本指南定義 references/ 子模組的標準化 Git 工作流程，確保版本控制的安全性和一致性。

## ⚠️ 重要警告

**絕對禁止推送到 `main` 分支！** 這是原開源專案的主分支，任何推送都可能造成衝突。

## 核心工作流程概覽

1. **WIP 暫存流程**：將開發進度安全地提交到功能分支
2. **正式上版流程**：將功能分支合併到 `dev` 分支（本地）

---

## WIP 暫存流程

### 步驟 1：智慧分支判斷

當接收到暫存指令時：

1. **檢查當前分支**：
   - **若在 `dev` 分支**：分析變更檔案，自動建立功能分支 `feature/xxx`
   - **若在 `feature/xxx` 分支**：
     - **情境符合**：直接在此分支操作
     - **情境不符**：詢問使用者是否建立新分支

### 步驟 2：建立 WIP 提交

1. **加入異動**：將相關檔案變更加入暫存區
2. **建立提交**：建立 WIP 提交
3. **訊息格式**：簡潔的中文描述

範例：
```bash
git commit -m "新增 Docker 配置檔案"
git commit -m "修改管理員登入設定"
```

---

## 正式上版流程

**此流程為全自動，無需手動介入。**

### 步驟 1：切換並更新 dev 分支

```bash
git checkout dev
git pull origin dev  # 如果有遠端 dev 分支的話
```

### 步驟 2：壓平合併 (Squash Merge)

在 `dev` 分支上執行：

```bash
git merge --squash feature/xxx
```

### 步驟 3：正式提交

使用符合規範的訊息提交：

```bash
git commit -m "[type] Subject"
```

### 步驟 4：本地清理

**注意：僅本地操作，不推送到遠端！**

```bash
# 刪除功能分支
git branch -D feature/xxx
```

### 步驟 5：最終驗證

執行以下指令確認狀態：

```bash
git status
git log --oneline -3
```

---

## 正式提交訊息規範

### 格式

`[type] Subject Part 1 | Subject Part 2`

### 範疇 (Type) 定義

| 範疇 | 英文 | 職責 |
| :--- | :--- | :--- |
| 前端 | `front-end` | UI/UX、頁面元件 |
| 後端 | `back-end` | 核心業務邏輯 |
| 整合 | `integration` | 前後端整合 |
| 資料庫 | `database` | 資料庫相關 |
| 部署 | `deploy` | Docker、部署配置 |
| 事務 | `chore` | 工具設定、依賴管理 |
| 文件 | `docs` | 文檔撰寫 |
| 格式 | `style` | 程式碼格式修正 |

### 主題 (Subject) 撰寫規則

- **智慧化提煉**：分析所有 WIP 提交，提煉核心主題
- **主題分隔**：多個主題用 ` | ` 分隔
- **格式選擇**：
  1. **句子式**：句首大寫，句尾加句號
     - 範例：`Update user authentication logic. | Fix database connection issue.`
  2. **標題式**：主要單字首字母大寫，無句號
     - 範例：`Add Docker Configuration for Submodule Project Name`

---

## 分支管理策略

### 分支結構

- `main`：原專案主分支（**禁止修改**）
- `dev`：本地開發主分支（**僅本地，不推送**）
- `feature/xxx`：功能開發分支

### 安全規則

1. **絕不推送 `main`**：避免與原專案衝突
2. **`dev` 不推送**：避免與原作者 dev 分支衝突
3. **功能分支本地化**：所有開發在本地進行

---

## 常用指令參考

### 日誌檢查

```bash
# 圖形化日誌
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

# 簡化日誌
git log --oneline -5
```

### 分支操作

```bash
# 檢查當前分支
git branch --show-current

# 建立功能分支
git checkout -b feature/new-feature

# 切換分支
git checkout dev
```

---

## 注意事項

1. **子模組特性**：本專案為 submodule，有特殊的版本管理需求
2. **本地開發**：所有開發活動限制在本地，避免遠端衝突
3. **定期同步**：可定期從 `main` 更新到 `dev`：
   ```bash
   git checkout dev
   git merge main
   ```

4. **備份重要**：重要變更前建議建立備份分支

## 範例工作流程

```bash
# 1. 從 dev 建立功能分支
git checkout dev
git checkout -b feature/add-docker-support

# 2. 開發並暫存
git add .
git commit -m "新增 Docker 配置"

# 3. 完成開發，準備上版
git checkout dev
git merge --squash feature/add-docker-support
git commit -m "[deploy] Add Docker Configuration for Submodule Project Name"

# 4. 清理
git branch -D feature/add-docker-support
```
