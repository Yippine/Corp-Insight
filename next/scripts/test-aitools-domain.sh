#!/bin/bash
# AI Tools 域名功能測試腳本

echo "=== AI Tools 域名功能測試 ==="
echo "測試時間: $(date)"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 測試函數 - 檢查 HTTP 狀態碼
test_url() {
    local url=$1
    local description=$2
    local expected_code=$3

    echo -n "測試 $description: "
    response=$(curl -s -o /dev/null -w "%{http_code} -> %{url_effective}" -L "$url")
    actual_code=$(echo $response | cut -d' ' -f1)

    if [ "$actual_code" == "$expected_code" ]; then
        echo -e "${GREEN}✓ 通過${NC} ($response)"
    else
        echo -e "${RED}✗ 失敗${NC} (預期 $expected_code，實際 $response)"
    fi
}

# 測試函數 - 檢查重定向結果 URL
test_redirect() {
    local url=$1
    local description=$2
    local expected_final_url=$3

    echo -n "測試 $description: "
    response=$(curl -s -o /dev/null -w "%{http_code} -> %{url_effective}" -L "$url")
    actual_final_url=$(echo $response | cut -d' ' -f3)

    if [ "$actual_final_url" == "$expected_final_url" ]; then
        echo -e "${GREEN}✓ 通過${NC} (重定向到 $actual_final_url)"
    else
        echo -e "${RED}✗ 失敗${NC} (預期重定向到 $expected_final_url，實際 $response)"
    fi
}

echo "1. 檢查域名解析狀態"
echo "----------------------------------------"
if nslookup aitools.leopilot.com > /dev/null 2>&1; then
    echo -e "${GREEN}✓ aitools.leopilot.com 域名已解析${NC}"
    nslookup aitools.leopilot.com | grep -A1 "Name:"
else
    echo -e "${RED}✗ aitools.leopilot.com 域名尚未解析${NC}"
    echo -e "${YELLOW}請先設定 DNS 記錄指向此伺服器${NC}"
    exit 1
fi

echo ""
echo "2. 測試 Nginx 配置"
echo "----------------------------------------"
if sudo nginx -t 2>&1 | grep -q "test is successful"; then
    echo -e "${GREEN}✓ Nginx 配置語法正確${NC}"
else
    echo -e "${RED}✗ Nginx 配置有錯誤${NC}"
    sudo nginx -t
    exit 1
fi

echo ""
echo "3. 測試 URL 重定向和訪問"
echo "----------------------------------------"

# 測試舊域名重定向 (CloudFlare 處理重定向，檢查最終 URL)
test_redirect "http://corpinsight.leopilot.com/aitool/search" "舊域名 HTTP 重定向" "https://aitools.leopilot.com/search"
test_redirect "https://corpinsight.leopilot.com/aitool/search" "舊域名 HTTPS 重定向" "https://aitools.leopilot.com/search"

# 測試新域名訪問 (CloudFlare 處理 HTTP 到 HTTPS)
test_redirect "http://aitools.leopilot.com/search" "新域名 HTTP 到 HTTPS" "https://aitools.leopilot.com/search"
test_url "https://aitools.leopilot.com/search" "新域名 HTTPS 搜尋頁" "200"
test_url "https://aitools.leopilot.com/search?q=chatgpt" "新域名帶參數搜尋" "200"
test_url "https://aitools.leopilot.com/detail/test-id" "新域名詳情頁" "200"

# 測試通用頁面
test_url "https://aitools.leopilot.com/faq" "新域名 FAQ 頁面" "200"
test_url "https://aitools.leopilot.com/feedback" "新域名回饋頁面" "200"
test_url "https://aitools.leopilot.com/privacy" "新域名隱私頁面" "200"

echo ""
echo "4. 檢查日誌"
echo "----------------------------------------"
echo "最近的 Nginx 錯誤日誌："
sudo tail -n 5 /var/log/nginx/aitools_error.log 2>/dev/null || echo "無錯誤日誌"

echo ""
echo "5. 檢查服務狀態"
echo "----------------------------------------"
echo -n "Docker 容器狀態: "
if docker ps | grep -q "app-prod"; then
    echo -e "${GREEN}✓ 運行中${NC}"
else
    echo -e "${RED}✗ 未運行${NC}"
fi

echo -n "Nginx 服務狀態: "
if sudo systemctl is-active nginx > /dev/null; then
    echo -e "${GREEN}✓ 運行中${NC}"
else
    echo -e "${RED}✗ 未運行${NC}"
fi

echo ""
echo "=== 測試完成 ==="
