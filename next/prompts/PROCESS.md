# AI 工具資料填寫與批次流程（說明）

使用方式（給使用者的指令語句）：

- 「請參照 `/mnt/c/Users/user/Documents/Yippine/Program/Corp-Insight/next/prompts/PROCESS.md`，為我填寫 NNNN（0001–0023）的 AI 工具定義」
  - 其中 NNNN 為 4 位數的批次代碼（前補零）。

## 填寫規則

1. 以 `prompts/template.md` 為規範，填寫欄位：`id`、`name`、`description`、`tags`、`instructions`、`placeholder`。
2. `id`：英文小寫，單字以 `-` 連接；其餘欄位以臺灣繁體中文為主，可穿插必要外語名詞。
3. 中文標點使用全形；全形與半形之間保留空格。
4. 每次填寫前，先查詢目前資料庫 `ai_tools` 的既有標籤，盡量沿用已存在標籤名稱，避免同義重複。
5. `tags` 原則：以使用者檢索會想到的關鍵詞為主，通常 1–3 個；必要時可超過 3 個但應節制。

## 查詢現有標籤

- 指令：`npm run db:ai:tags`（預設僅統計 `isActive=true`）
- 可用參數：`--active=true|false`、`--limit=數量`、`--db=資料庫名稱`
- 輸出：依出現次數排序的標籤列表（JSON）。

## 唯一來源

- 目前以 `prompts/batches` 作為唯一真實來源（Single Source of Truth）。

## 匯入與審核流程

1. 依使用者提供的批次代碼（NNNN）填寫 `prompts/batches/NNNN` 內 10 筆的未填欄位。
2. 使用者審核通過後：
   - 使用 `npm run db:ai:import:batch -- --batch=NNNN` 指定批次（例如 `--batch=2` 代表 0002）；或使用簡寫 `npm run db:ai:import:batch -- --NNNN`。
   - 若要整批全部匯入：`npm run db:ai:import`（會遞迴讀取 `prompts/batches` 全部批次）。
   - 匯入腳本會自動將 `$oid/$date` 轉成 `ObjectId/Date` 並插入；重複 `_id` 會略過。
3. 使用者測試 `/aitool/search` 與相關功能；確認無誤後自行備份資料庫。
4. 進入下一批次（`NNNN+1`，4 位數前補零）重複上述流程。
