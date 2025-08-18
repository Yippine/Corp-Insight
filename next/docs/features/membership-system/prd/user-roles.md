# 使用者角色定義

## 核心使用者與角色

### Root (後台)
- **定義：** 唯一使用者，初始化存在
- **權限：** 能 CRUD Admin 帳號並分派權限（最高權限）
- **初始設定：** 預設 leosys / 01517124（建議環境變數化）
- **安全要求：** 首次登入強制變更密碼

### Admin (後台)
- **主要功能：**
  - 檢視後台儀表板、會員管理
  - Sitemap 與 Database 操作介面
  - 危險操作需二次確認與審核

- **具體權限：**
  - 查看 /admin/users 列表（搜尋、過濾、分頁）
  - 單一 user detail（含 auth provider 綁定、登入記錄、consents）
  - Member usage 儀表板（DAU、註冊數、登入失敗率）
  - /admin/sitemap（比照現有頁面）
  - /admin/database（比照現有頁面）包含備份/還原

- **危險操作規範：**
  - DB restore 或永久刪除需：
    - 顯示多重確認（type 操作字串、輸入確認碼）
    - 寫入 audit_log，並可由 Root 追蹤與回溯

### User (前台)
- **等級分類：** Free / Pro（先分級不實作付費機制）
- **登入方式：**
  - Email/密碼
  - 第三方（Google 先行）
- **驗證要求：** 必須完成 email 驗證才能啟用會員功能

### System / Auditor
- **用途：** 用於記錄 audit logs、備份活動記錄
- **特性：** 系統級角色，非人類使用者

## 角色設計原則

### 帳號體系分離
- **建議：** 前/後台帳號體系分離（不同 collections 或 role flag）
- **彈性：** 仍可讓 Admin 以 members 管理前台使用者

### 權限管理系統
- **核心機制：** Role-based access control (RBAC) 最小實作
- **角色定義：** roles（root/admin/user）
- **細部權限：** Admin 的 permission flags（view_users, edit_users, run_db_restore 等）

## 角色權限矩陣

| 功能区域 | Root | Admin | User | System |
|------------|------|-------|------|--------|
| 建立 Admin | ✓ | ✗ | ✗ | ✗ |
| 管理會員 | ✓ | ✓ | ✗ | ✗ |
| 備份操作 | ✓ | ✓* | ✗ | ✗ |
| 系統設定 | ✓ | 限制 | ✗ | ✗ |
| Audit 查看 | ✓ | 限制 | ✗ | ✓ |

*需特別權限與二次確認

## 角色實作詳細

### 權限檢查機制
```javascript
// 範例權限結構
user: {
  role: 'admin',
  permissions: {
    view_users: true,
    edit_users: true,
    run_db_restore: false,  // 需特別授權
    manage_sitemap: true
  }
}
```

### Session 管理
- **Access Token：** 15 分鐘 TTL，包含角色資訊
- **Refresh Token：** 14 天 TTL，儲存在 DB，採 rotate 機制
- **Session 驗證：** 每個 API 呼叫都需驗證角色權限

---

**相關文件：**
- [後台管理需求](./admin-requirements.md)
- [安全合規規格](./security-compliance.md)
- [資料模型規格](./data-models.md)