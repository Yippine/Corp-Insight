# 系統管理需求規格

## 文件資訊
- **適用專案：** 企業洞察平台會員管理系統（Brownfield）
- **文件版本：** v1.0
- **最後更新：** 2025-08-20
- **輸出語言：** 繁體中文（臺灣用語）

---

## 1. 系統管理概述

### 1.1 核心目標
整合會員管理系統的監控、維護與管理功能，包含 Sitemap 管理、系統監控、日誌管理等，確保系統穩定運行與高效維護。

### 1.2 整合原則
- **最小侵入：** 整合到既有 `/admin/sitemap` 與 `/admin/database` 頁面
- **一致體驗：** 遵循既有 Admin 頁面的 UI 與互動邏輯
- **權限控制：** 基於角色的功能存取控制

---

## 2. Sitemap 管理功能

### 2.1 功能整合需求
**整合位置：** 既有 `/admin/sitemap` 頁面
**設計要求：** 完全參考現有頁面的 UI 與互動細節

### 2.2 核心功能擴展

#### 2.2.1 會員相關 URL 管理
**新增功能：**
- 自動發現會員相關頁面 URL
- 會員登入/註冊頁面 sitemap 條目
- OAuth callback URLs 的 sitemap 管理

**URL 類型：**
```typescript
interface MembershipUrls {
  auth_pages: string[];           // 登入相關頁面
  oauth_callbacks: string[];      // OAuth 回調 URLs  
  user_profiles: string[];        // 用戶個人檔案頁面
  admin_pages: string[];          // 後台管理頁面
}
```

#### 2.2.2 動態 URL 生成
**智能生成邏輯：**
- 基於會員數量動態調整 sitemap 優先級
- 根據頁面存取頻率調整更新頻率
- 支援會員相關頁面的條件式包含/排除

#### 2.2.3 SEO 最佳化整合
**會員系統 SEO 需求：**
- 登入頁面的 canonical URL 管理
- OAuth 相關頁面的 robots.txt 規則
- 會員專區頁面的 sitemap 權重設定

### 2.3 操作介面要求

**與既有功能的整合：**
- 沿用現有 sitemap 檢視介面
- 整合會員相關 URL 到現有分類中
- 保持既有的重新生成、預覽、下載功能

**新增操作按鈕：**
- "重新掃描會員 URLs"
- "驗證 OAuth 端點"
- "匯出會員 sitemap"

---

## 3. 系統監控儀表板

### 3.1 監控範圍

#### 3.1.1 會員系統健康狀態
```typescript
interface MembershipSystemHealth {
  database_status: 'healthy' | 'warning' | 'critical';
  auth_providers: {
    google: 'active' | 'inactive' | 'error';
    facebook: 'active' | 'inactive' | 'error';
    line: 'active' | 'inactive' | 'error';
  };
  session_store: 'healthy' | 'warning' | 'critical';
  backup_status: 'success' | 'pending' | 'failed';
}
```

#### 3.1.2 效能指標監控
**關鍵指標 (KPIs)：**
- 註冊轉換率 (每日新註冊 / 訪問量)
- 登入成功率 (成功登入 / 登入嘗試)
- OAuth 流程完成率
- Session 平均持續時間
- API 回應時間

#### 3.1.3 安全事件監控
**監控事項：**
- 異常登入嘗試 (IP/地理位置)
- OAuth 錯誤頻率
- Token 相關安全事件
- Admin 危險操作記錄

### 3.2 儀表板介面

#### 3.2.1 即時狀態儀表板
```typescript
interface DashboardWidgets {
  system_overview: {
    total_users: number;
    active_sessions: number;
    failed_logins_24h: number;
    backup_last_success: Date;
  };
  
  oauth_status: {
    google_healthy: boolean;
    facebook_healthy: boolean;
    line_healthy: boolean;
    last_check: Date;
  };
  
  recent_activities: ActivityLog[];
  security_alerts: SecurityAlert[];
}
```

#### 3.2.2 圖表與趨勢分析
**視覺化組件：**
- 每日註冊/登入趨勢圖
- OAuth Provider 使用比例圓餅圖
- 錯誤率趨勢折線圖
- 系統效能監控儀表

---

## 4. 日誌管理系統

### 4.1 日誌分類架構

#### 4.1.1 會員活動日誌
```typescript
interface MemberActivityLog {
  event_type: 'registration' | 'login' | 'logout' | 'profile_update';
  user_id: ObjectId;
  auth_method: 'email' | 'google' | 'facebook' | 'line';
  ip_address: string;
  user_agent: string;
  success: boolean;
  error_details?: string;
  timestamp: Date;
}
```

#### 4.1.2 系統操作日誌
```typescript
interface SystemOperationLog {
  operation: 'backup_create' | 'backup_restore' | 'config_change' | 'admin_action';
  operator: ObjectId;
  target: string;
  parameters: object;
  result: 'success' | 'failure';
  execution_time: number;  // milliseconds
  timestamp: Date;
}
```

#### 4.1.3 安全事件日誌
```typescript
interface SecurityEventLog {
  event_type: 'failed_login' | 'suspicious_activity' | 'token_anomaly' | 'admin_breach_attempt';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  user_id?: ObjectId;
  details: object;
  blocked: boolean;
  timestamp: Date;
}
```

### 4.2 日誌查詢與分析

#### 4.2.1 高階查詢介面
**查詢功能：**
- 時間範圍篩選 (最近 1 小時 ~ 90 天)
- 事件類型多選篩選
- 用戶 ID / IP 地址搜尋
- 嚴重程度篩選
- 成功/失敗狀態篩選

#### 4.2.2 日誌匯出功能
**支援格式：**
- JSON Lines (.jsonl)
- CSV 格式
- 結構化日誌 (ELK 相容)
- PDF 報告格式

---

## 5. 系統設定管理

### 5.1 會員系統設定

#### 5.1.1 OAuth Provider 設定
```typescript
interface OAuthProviderConfig {
  google: {
    enabled: boolean;
    client_id: string;
    scopes: string[];
    button_text: string;
    order: number;
  };
  facebook: {
    enabled: boolean;
    app_id: string;
    scopes: string[];
    button_text: string;
    order: number;
  };
  line: {
    enabled: boolean;
    channel_id: string;
    scopes: string[];
    button_text: string;
    order: number;
  };
}
```

#### 5.1.2 安全政策設定
```typescript
interface SecurityPolicyConfig {
  password_policy: {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_symbols: boolean;
  };
  
  session_policy: {
    max_concurrent_sessions: number;
    idle_timeout: number;  // minutes
    absolute_timeout: number;  // hours
  };
  
  rate_limiting: {
    login_attempts_per_minute: number;
    registration_per_hour: number;
    password_reset_per_day: number;
  };
}
```

### 5.2 設定管理介面

#### 5.2.1 設定頁面整合
**位置建議：** `/admin/system-settings` 或整合到既有 admin 頁面
**權限要求：** Root 或具有 `manage_system_config` 權限的 Admin

#### 5.2.2 設定變更追蹤
**變更記錄機制：**
- 所有設定變更都記錄到 audit log
- 支援設定變更的回滾功能
- 設定變更需要二次確認

---

## 6. 效能監控與最佳化

### 6.1 效能指標定義

#### 6.1.1 API 效能監控
```typescript
interface APIPerformanceMetrics {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  average_response_time: number;  // milliseconds
  p95_response_time: number;
  p99_response_time: number;
  error_rate: number;  // percentage
  throughput: number;  // requests per minute
}
```

#### 6.1.2 資料庫效能監控
**監控項目：**
- 查詢執行時間分佈
- 慢查詢識別與分析
- 連線池使用狀況
- 索引使用效率

### 6.2 自動最佳化建議

#### 6.2.1 智能警告系統
**警告觸發條件：**
- API 回應時間超過閾值
- 資料庫連線數接近上限
- 錯誤率異常增加
- 儲存空間不足

#### 6.2.2 最佳化建議引擎
**建議類型：**
- 索引優化建議
- 查詢效能改善
- 快取策略調整
- 硬體資源擴充建議

---

## 7. 災難復原與維護

### 7.1 系統健康檢查

#### 7.1.1 自動健康檢查
```typescript
interface HealthCheckResult {
  overall_status: 'healthy' | 'warning' | 'critical';
  components: {
    database: ComponentHealth;
    auth_providers: ComponentHealth;
    file_system: ComponentHealth;
    memory_usage: ComponentHealth;
    disk_usage: ComponentHealth;
  };
  last_check: Date;
  next_check: Date;
}
```

#### 7.1.2 預防性維護
**維護任務：**
- 定期資料庫索引重建
- 過期 session 清理
- 日誌檔案輪替
- 臨時檔案清理

### 7.2 緊急處理程序

#### 7.2.1 故障快速響應
**自動化響應：**
- 服務異常自動重啟
- 資料庫連線失敗自動重連
- 快取失效自動清理
- 緊急模式切換

#### 7.2.2 手動干預介面
**緊急操作按鈕：**
- 強制清除所有 session
- 禁用特定 OAuth Provider
- 啟用維護模式
- 緊急備份觸發

---

## 8. 報告與分析

### 8.1 定期報告生成

#### 8.1.1 系統運行報告
**報告內容：**
- 系統可用性統計
- 效能指標趨勢
- 安全事件摘要
- 用戶活動分析

#### 8.1.2 業務指標報告
**關鍵指標：**
- 註冊轉換漏斗分析
- OAuth Provider 使用偏好
- 用戶留存率分析
- 系統使用峰值統計

### 8.2 報告自動化

#### 8.2.1 排程報告
**報告頻率：**
- 每日運營報告 (自動)
- 每週系統健康報告
- 每月業務分析報告
- 季度安全稽核報告

#### 8.2.2 報告分發
**分發機制：**
- Email 自動發送
- Dashboard 即時顯示
- PDF 下載功能
- API 介面存取

---

## 9. 整合與相容性

### 9.1 與既有系統整合

#### 9.1.1 現有 Admin 頁面整合
**整合要求：**
- 完全參考 `/admin/sitemap` 的 UI 設計
- 沿用 `/admin/database` 的操作邏輯
- 保持既有的權限驗證機制
- 使用相同的樣式與元件庫

#### 9.1.2 API 整合
**整合原則：**
- 使用既有的 API 路徑慣例
- 沿用現有的錯誤處理格式
- 保持 API 回應結構一致性

### 9.2 擴展性設計

#### 9.2.1 模組化架構
**設計原則：**
- 功能模組可獨立啟用/停用
- 支援第三方監控工具整合
- 預留客製化擴展介面

#### 9.2.2 未來功能準備
**預留空間：**
- A/B 測試功能整合
- 進階分析工具接入
- 多租戶系統支援
- 微服務架構遷移準備

---

## 10. 實作注意事項

### 10.1 開發 Agent 重要提醒
- **絕對不得改用新的 UI 框架或元件**：請直接參考並復用既有 `/admin/sitemap` 與 `/admin/database` 的 UI 設計
- **必須保持既有操作邏輯**：任何 UI 與互動行為的細部更動需與 PM/Owner 討論
- **沿用既有 API 慣例**：使用相同的路徑結構、回應格式與錯誤處理

### 10.2 效能考量
- 大量日誌查詢需要分頁與索引優化
- 即時監控功能避免對主系統造成效能影響
- 報告生成採用背景處理避免阻塞使用者操作

### 10.3 安全考量
- 所有系統管理功能都需要嚴格的權限控制
- 敏感操作必須有 audit trail
- 系統設定變更需要多重確認機制

---

**此文件為系統管理功能的完整需求規格，確保會員管理系統的穩定運行與高效維護。**