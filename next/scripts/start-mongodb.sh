#!/bin/bash

# Business Magnifier MongoDB 啟動與初始化腳本
# 用途: 啟動 MongoDB Docker 服務並初始化所有 Collections
# 目標: 建立 9 個完整的 MongoDB Collections

set -e  # 遇到錯誤即退出

echo "🚀 Business Magnifier MongoDB 啟動與初始化腳本"
echo "🎯 目標：建立 9 個完整的 MongoDB Collections"
echo "=============================================="

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 檢查 Docker 是否可用
check_docker() {
    echo -e "\n${BLUE}🐳 檢查 Docker 狀態...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker 未安裝或不在 PATH 中${NC}"
        echo -e "${YELLOW}💡 請先安裝 Docker Desktop 並確保其正在運行${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker 服務未運行${NC}"
        echo -e "${YELLOW}💡 請啟動 Docker Desktop${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker 服務正常運行${NC}"
}

# 啟動 MongoDB 容器
start_mongodb() {
    echo -e "\n${BLUE}🔌 啟動 MongoDB 容器...${NC}"
    
    # 停止並移除現有容器 (如果存在)
    if docker ps -a | grep -q "mongo"; then
        echo -e "${YELLOW}⚠️  發現現有 MongoDB 容器，正在停止...${NC}"
        docker stop mongo || true
        docker rm mongo || true
    fi
    
    # 使用 docker-compose 啟動 MongoDB
    if [ -f "docker-compose.yml" ]; then
        echo -e "${BLUE}📋 使用 docker-compose 啟動 MongoDB...${NC}"
        docker-compose up mongodb -d
    else
        echo -e "${YELLOW}⚠️  未找到 docker-compose.yml，使用直接 docker 命令啟動...${NC}"
        docker run -d \
            --name mongo \
            -p 27017:27017 \
            -e MONGO_INITDB_ROOT_USERNAME=admin \
            -e MONGO_INITDB_ROOT_PASSWORD=password \
            -e MONGO_INITDB_DATABASE=business-magnifier \
            -v mongodb_data:/data/db \
            mongo:7.0
    fi
    
    echo -e "${GREEN}✅ MongoDB 容器啟動完成${NC}"
}

# 等待 MongoDB 就緒
wait_for_mongodb() {
    echo -e "\n${BLUE}⏳ 等待 MongoDB 就緒...${NC}"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if docker exec mongo mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
            echo -e "${GREEN}✅ MongoDB 已就緒 (嘗試 $attempt/$max_attempts)${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}⏳ MongoDB 尚未就緒，等待中... ($attempt/$max_attempts)${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ MongoDB 啟動超時${NC}"
    docker logs mongo
    exit 1
}

# 檢查 Node.js 是否可用
check_nodejs() {
    echo -e "\n${BLUE}📦 檢查 Node.js 環境...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安裝${NC}"
        echo -e "${YELLOW}💡 請先安裝 Node.js (建議版本 18+)${NC}"
        exit 1
    fi
    
    local node_version=$(node --version)
    echo -e "${GREEN}✅ Node.js 版本: $node_version${NC}"
    
    # 檢查 MongoDB 驅動是否已安裝
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  node_modules 不存在，正在安裝依賴...${NC}"
        npm install
    fi
    
    if ! node -e "require('mongodb')" &> /dev/null; then
        echo -e "${YELLOW}⚠️  MongoDB 驅動未安裝，正在安裝...${NC}"
        npm install mongodb
    fi
}

# 初始化 MongoDB Collections
init_collections() {
    echo -e "\n${BLUE}🛠️  初始化 MongoDB Collections...${NC}"
    echo -e "${BLUE}🎯 目標：建立 9 個完整的 Collections${NC}"
    
    if [ ! -f "scripts/init-mongodb-collections.js" ]; then
        echo -e "${RED}❌ 初始化腳本不存在: scripts/init-mongodb-collections.js${NC}"
        exit 1
    fi
    
    # 設定環境變數
    export MONGODB_URI="mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin"
    
    # 執行初始化腳本
    echo -e "${BLUE}🔄 執行 Collections 初始化...${NC}"
    if node scripts/init-mongodb-collections.js; then
        echo -e "${GREEN}✅ Collections 初始化完成${NC}"
    else
        echo -e "${RED}❌ Collections 初始化失敗${NC}"
        exit 1
    fi
}

# 顯示連線資訊和建立的 Collections
show_connection_info() {
    echo -e "\n${GREEN}🎉 MongoDB 啟動與初始化完成！${NC}"
    
    echo -e "\n${BLUE}📋 連線資訊:${NC}"
    echo -e "   🔗 連線字串: mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin"
    echo -e "   🏠 資料庫名稱: business-magnifier"
    echo -e "   👤 使用者名稱: admin"
    echo -e "   🔐 密碼: password"
    echo -e "   🌐 管理介面: http://localhost:8081 (需要啟動 mongo-express)"
    
    echo -e "\n${BLUE}📊 建立的 9 個 Collections:${NC}"
    echo -e "   🏢 核心業務資料:"
    echo -e "      📁 companies - 企業資料集合"
    echo -e "      📁 tenders - 政府標案資料集合"
    echo -e "      📁 ai_tools - AI 工具資料集合"
    echo -e "   🗂️  API 快取:"
    echo -e "      📁 pcc_api_cache - 政府採購網 API 快取"
    echo -e "      📁 g0v_company_api_cache - G0V 企業資料 API 快取"
    echo -e "      📁 twincn_api_cache - 台灣企業網 API 快取"
    echo -e "   📝 系統日誌:"
    echo -e "      📁 email_verification_log - Email 驗證日誌"
    echo -e "      📁 feedback_submissions_log - 意見回饋提交日誌"
    
    echo -e "\n${BLUE}🛠️  管理命令:${NC}"
    echo -e "   停止 MongoDB: docker stop mongo"
    echo -e "   重啟 MongoDB: docker restart mongo"
    echo -e "   查看日誌: docker logs mongo"
    echo -e "   進入 MongoDB Shell: docker exec -it mongo mongosh"
    echo -e "   連接資料庫: npm run db:connect-docker"
    
    echo -e "\n${BLUE}🔍 驗證指令:${NC}"
    echo -e "   啟動管理介面: npm run docker:tools"
    echo -e "   檢查 Collections: mongosh \"mongodb://admin:password@localhost:27017/business-magnifier?authSource=admin\" --eval \"show collections\""
    
    echo -e "\n${BLUE}🚀 下一步:${NC}"
    echo -e "   1. 啟動應用程式: npm run dev"
    echo -e "   2. 檢查管理介面: http://localhost:8081"
    echo -e "   3. 匯入測試資料 (如需要)"
    echo -e "   4. 開始開發！"
}

# 主要執行流程
main() {
    # 切換到正確的目錄
    if [ -f "../docker-compose.yml" ]; then
        cd ..
        echo -e "${BLUE}📁 切換到專案根目錄${NC}"
    fi
    
    # 執行各個步驟
    check_docker
    start_mongodb
    wait_for_mongodb
    check_nodejs
    init_collections
    show_connection_info
    
    echo -e "\n${GREEN}✨ 所有步驟完成！${NC}"
    echo -e "\n${YELLOW}💡 提示: 使用 'npm run docker:tools' 啟動 MongoDB Express 管理介面${NC}"
}

# 錯誤處理
trap 'echo -e "\n${RED}💥 腳本執行被中斷${NC}"; exit 1' INT TERM

# 執行主函式
main "$@"