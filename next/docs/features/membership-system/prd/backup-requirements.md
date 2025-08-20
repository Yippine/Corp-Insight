# 資料備份需求規格

## 文件資訊
- **適用專案：** 企業洞察平台會員管理系統（Brownfield）
- **文件版本：** v1.0
- **最後更新：** 2025-08-20
- **輸出語言：** 繁體中文（臺灣用語）

---

## 1. 備份需求概述

### 1.1 核心目標
實現企業級 MongoDB 資料備份與還原功能，確保會員資料與系統設定的安全性，支援災難復原與資料遷移需求。

### 1.2 技術架構
- **資料庫：** MongoDB (Docker 單節點 Replica Set)
- **備份工具：** mongodump / mongorestore
- **存儲位置：** `/app/db/backups` (Docker 容器內)
- **管理介面：** 整合到既有 `/admin/database` 頁面

---

## 2. 備份類型與策略

### 2.1 完整備份 (Full Backup)
**執行時機：**
- 手動觸發（Admin 介面）
- 定期排程（每日 2:00 AM）
- 重大更新前

**備份範圍：**
- 所有 Collections（包含索引）
- 系統設定與權限資料
- 排除敏感的臨時資料

### 2.2 增量備份 (Incremental Backup)
**執行策略：**
- 基於 MongoDB Oplog 的變更追蹤
- 每 4 小時執行一次
- 配合完整備份建立還原點

### 2.3 緊急備份 (Emergency Backup)
**觸發條件：**
- 系統異常或資料異常檢測
- 重大操作前（如大量資料變更）
- 手動緊急備份請求

---

## 3. 備份管理介面

### 3.1 管理介面整合
**位置：** 整合到既有 `/admin/database` 頁面
**設計原則：** 比照現有頁面的 UI 與互動邏輯

### 3.2 核心功能

#### 3.2.1 備份建立
```typescript
interface CreateBackupRequest {
  name: string;                    // 備份名稱
  description?: string;            // 備份描述
  collections?: string[];          // 指定 Collections（空=全部）
  include_sensitive?: boolean;     // 是否包含敏感欄位
  backup_type: 'full' | 'partial'; // 備份類型
}
```

**操作流程：**
1. Admin 填寫備份資訊
2. 系統驗證權限與參數
3. 執行 mongodump 指令
4. 記錄備份 metadata 到 `backups` collection
5. 生成 checksum 校驗碼

#### 3.2.2 備份列表管理
**列表欄位：**
- 備份名稱與描述
- 建立時間與大小
- 建立者（Admin 用戶）
- Checksum 校驗碼
- 狀態（進行中/完成/失敗）

**操作按鈕：**
- 下載備份（權限控制）
- 還原備份（危險操作）
- 刪除備份（權限控制）
- 驗證完整性

#### 3.2.3 備份還原
**安全機制：**
- 限制為 Root 或具有 `run_db_restore` 權限的 Admin
- 多重確認機制：
  1. 輸入操作確認字串
  2. 輸入隨機確認碼
  3. 顯示操作影響範圍

**還原選項：**
```typescript
interface RestoreOptions {
  backup_id: string;
  target_collections?: string[];   // 指定還原 Collections
  drop_existing: boolean;          // 是否先刪除現有資料
  create_backup_before: boolean;   // 還原前自動備份
}
```

---

## 4. 備份技術實作

### 4.1 mongodump 指令範例

#### 完整備份
```bash
mongodump \
  --host=mongodb:27017 \
  --db=corp_insight \
  --out=/app/db/backups/backup_$(date +%Y%m%d_%H%M%S) \
  --gzip \
  --oplog
```

#### 部分 Collections 備份
```bash
mongodump \
  --host=mongodb:27017 \
  --db=corp_insight \
  --collection=users \
  --collection=user_auth_providers \
  --out=/app/db/backups/users_backup_$(date +%Y%m%d_%H%M%S) \
  --gzip
```

### 4.2 mongorestore 指令範例

#### 完整還原
```bash
mongorestore \
  --host=mongodb:27017 \
  --db=corp_insight \
  --drop \
  --gzip \
  --oplogReplay \
  /app/db/backups/backup_20250820_020000/corp_insight
```

### 4.3 Docker 整合考量

**Volume 掛載：**
```yaml
# docker-compose.yml
services:
  app:
    volumes:
      - backup_data:/app/db/backups

volumes:
  backup_data:
    driver: local
```

**權限設定：**
- 備份目錄權限：`755` (rwxr-xr-x)
- 備份檔案權限：`644` (rw-r--r--)
- 所有者：容器內 app user

---

## 5. 資料模型

### 5.1 backups Collection

```typescript
interface BackupRecord {
  _id: ObjectId;
  name: string;                    // 備份名稱
  description?: string;            // 備份描述
  created_by: ObjectId;            // 建立者 (Admin user_id)
  backup_type: 'full' | 'partial' | 'emergency';
  
  // 檔案資訊
  path: string;                    // 備份檔案路徑
  size: number;                    // 檔案大小 (bytes)
  checksum: string;                // SHA256 校驗碼
  
  // 備份設定
  collections: string[];           // 包含的 Collections
  include_sensitive: boolean;      // 是否包含敏感資料
  
  // 時間戳記
  created_at: Date;
  completed_at?: Date;
  
  // 狀態追蹤
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message?: string;
  
  // Metadata
  mongodb_version: string;
  backup_tool_version: string;
}
```

### 5.2 backup_operations Collection (操作記錄)

```typescript
interface BackupOperation {
  _id: ObjectId;
  operation_type: 'create' | 'restore' | 'delete' | 'download';
  backup_id: ObjectId;
  operator: ObjectId;              // 操作者 user_id
  
  // 操作詳情
  parameters: object;              // 操作參數
  result: 'success' | 'failure';
  error_details?: string;
  
  // 安全記錄
  ip_address: string;
  user_agent: string;
  confirmation_token?: string;     // 用於危險操作的確認 token
  
  // 時間戳記
  started_at: Date;
  completed_at?: Date;
}
```

---

## 6. API 端點設計

### 6.1 備份管理 API

```typescript
// 建立備份
POST /api/admin/backups
Body: CreateBackupRequest
Response: { backup_id: string, status: 'started' }

// 取得備份列表
GET /api/admin/backups
Query: { page?, limit?, search? }
Response: { backups: BackupRecord[], total: number }

// 取得單一備份詳情
GET /api/admin/backups/:id
Response: BackupRecord

// 下載備份
GET /api/admin/backups/:id/download
Response: File stream (需權限驗證)

// 還原備份
POST /api/admin/backups/:id/restore
Body: RestoreOptions
Response: { operation_id: string, status: 'started' }

// 刪除備份
DELETE /api/admin/backups/:id
Response: { success: boolean }

// 驗證備份完整性
POST /api/admin/backups/:id/verify
Response: { valid: boolean, checksum_match: boolean }
```

---

## 7. 安全與權限控制

### 7.1 權限要求

| 操作 | 必要權限 | 額外要求 |
|------|----------|----------|
| 查看備份列表 | `view_backups` | - |
| 建立備份 | `create_backup` | - |
| 下載備份 | `download_backup` | IP 白名單檢查 |
| 還原備份 | `run_db_restore` | 多重確認 + Audit log |
| 刪除備份 | `manage_backups` | 確認操作 |

### 7.2 安全機制

**檔案加密：**
- 敏感備份檔案採用 AES-256 加密
- 加密金鑰由環境變數提供
- 支援密碼保護的備份下載

**存取控制：**
- 備份檔案不能任意存取
- 限制下載頻率與大小
- 記錄所有存取活動

**審核日誌：**
```json
{
  "event": "backup_restored",
  "backup_id": "backup_123",
  "operator": "admin_456",
  "collections_affected": ["users", "user_auth_providers"],
  "confirmation_codes": ["ABC123", "DEF456"],
  "ip": "192.168.1.100",
  "timestamp": "2025-08-20T10:30:00Z"
}
```

---

## 8. 自動化與排程

### 8.1 定期備份策略

**每日完整備份：**
- 執行時間：每天 02:00 (低峰時段)
- 保留期限：30 天
- 自動清理：超過期限自動刪除

**每週歸檔備份：**
- 執行時間：每週日 01:00
- 保留期限：12 週
- 壓縮處理：額外壓縮以節省空間

### 8.2 監控與告警

**備份狀態監控：**
- 備份成功/失敗率追蹤
- 備份檔案大小趨勢分析
- 儲存空間使用監控

**告警機制：**
- 備份失敗即時通知
- 儲存空間不足預警
- 備份檔案損壞檢測

---

## 9. 災難復原計畫

### 9.1 復原等級定義

**等級 1 - 資料損壞：**
- 復原時間：< 30 分鐘
- 使用最新完整備份還原

**等級 2 - 系統故障：**
- 復原時間：< 2 小時
- 重建容器環境 + 資料還原

**等級 3 - 完全災難：**
- 復原時間：< 24 小時
- 包含硬體重建與完整系統復原

### 9.2 復原測試

**月度測試：**
- 在測試環境執行完整復原流程
- 驗證資料完整性與系統功能
- 記錄復原時間與問題點

---

## 10. 效能與容量規劃

### 10.1 備份效能指標

- **備份速度：** ≥ 50MB/min (完整備份)
- **儲存效率：** 壓縮率 ≥ 60%
- **復原速度：** ≥ 100MB/min
- **同時操作：** 支援 1 個備份 + 1 個還原

### 10.2 容量規劃

**儲存需求估算：**
- 基礎資料量：~500MB (預估)
- 每日增長：~10MB
- 備份保留：30 天完整 + 12 週歸檔
- 總儲存需求：~50GB (含壓縮與冗餘)

---

## 11. 法規遵循

### 11.1 資料保護

**個資處理：**
- 備份檔案包含個人資料，需符合個資法
- 提供個資匿名化備份選項
- 支援特定使用者資料排除

**資料保留政策：**
- 依法規要求設定資料保留期限
- 提供資料銷毀證明機制
- 支援法規要求的資料導出格式

---

**此文件為資料備份功能的完整需求規格，確保系統資料安全與業務連續性。**