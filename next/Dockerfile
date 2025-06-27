# Business Magnifier Next.js Dockerfile
# 多階段建置，優化映像大小和安全性

FROM node:21-bullseye-slim AS base

# 安裝必要的系統依賴
# 更新 apt-get 並安裝 git 和 docker-cli。bullseye 已包含 curl。
RUN apt-get update && apt-get install -y git docker.io gosu && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# 安裝依賴階段
FROM base AS deps
WORKDIR /app
# 複製 package 檔案
COPY package.json package-lock.json* ./
# 安裝依賴 (使用 npm ci 確保一致性)
# 只有當 package.json 或 package-lock.json 變更時，Docker 才會重新執行此步驟
RUN npm ci

# 建置階段
FROM base AS builder
WORKDIR /app
# 從依賴階段複製 node_modules
COPY --from=deps /app/node_modules ./node_modules
# 複製原始碼
COPY . .

# 複製生產環境設定檔 (確保應用能在建置時存取)
COPY .env.production ./

# 設定建置環境變數
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 建置應用程式
RUN npm run build

# 生產環境執行階段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 建立非 root 使用者
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製公共資源
COPY --from=builder /app/public ./public

# 設定正確的權限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 複製建置輸出 (使用 standalone 模式)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 複製生產環境設定檔 (確保應用能在運行時存取)
COPY --from=builder --chown=nextjs:nodejs /app/.env.production ./

# 複製 sitemap 管理所需的檔案
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# 建立並授權 db 目錄，用於備份和還原操作，同時確保 scripts 目錄下的所有檔案都可執行
RUN mkdir -p /app/db/backups && \
    chown -R nextjs:nodejs /app/db && \
    chmod +x /app/scripts/*

# 確保有基本的 Node.js 內建模組可用（http, fs 等已內建於 Node.js）
RUN mkdir -p node_modules

# 暴露埠號
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node scripts/healthcheck.js

# 設定容器進入點
ENTRYPOINT ["/app/scripts/entrypoint.sh"]

# 啟動應用程式 (此指令會傳遞給 ENTRYPOINT)
CMD ["node", "server.js"]