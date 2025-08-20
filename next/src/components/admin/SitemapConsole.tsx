'use client';

import React, { useState, useCallback } from 'react';
import { useSitemapStatus, SitemapStatusItem } from '@/hooks/useSitemapStatus';
import SitemapStatsDashboard from '@/components/sitemap/SitemapStatsDashboard';
import SitemapStatusCard from '@/components/sitemap/SitemapStatusCard';
import SitemapContentViewer from './SitemapContentViewer';
import TerminalViewer from './TerminalViewer';
import { PlayCircle, Loader2 } from 'lucide-react';

const SCRIPT_COMMANDS = [
  {
    name: 'sitemap:test',
    title: '測試所有 Sitemap',
    description: '對所有 Sitemap 執行健康檢查並更新狀態。',
  },
  {
    name: 'sitemap:monitor',
    title: '啟動自動監控',
    description: '啟動 PM2 程序，定期檢查 Sitemap 狀態。',
  },
  {
    name: 'sitemap:stop',
    title: '停止自動監控',
    description: '停止 PM2 程序，關閉自動監控。',
  },
  {
    name: 'sitemap:status',
    title: '查看監控狀態',
    description: '顯示 PM2 監控程序的當前運行狀態。',
  },
  {
    name: 'sitemap:clear',
    title: '清除所有緩存',
    description: '刪除 sitemap 相關的本地和服務器端緩存。',
  },
];

export default function SitemapConsole() {
  const {
    statusList,
    stats,
    isLoading,
    isInitialized,
    testSingleSitemap,
    testAllSitemaps,
    resetStatus,
  } = useSitemapStatus();

  const [selectedSitemapUrl, setSelectedSitemapUrl] = useState<string>('');
  const [sitemapContent, setSitemapContent] = useState<string>('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalTitle, setTerminalTitle] = useState('');
  const [isTerminalRunning, setIsTerminalRunning] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);

  const handleExecuteScript = useCallback(
    async (scriptName: string, title: string) => {
      setTerminalTitle(title);
      setTerminalOutput('');
      setIsTerminalRunning(true);
      setIsTerminalVisible(true);

      const response = await fetch('/api/admin/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN}`,
        },
        body: JSON.stringify({ scriptName }),
      });

      if (!response.body) return;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setTerminalOutput(prev => prev + chunk);
      }

      setIsTerminalRunning(false);
    },
    []
  );

  const handleViewDetails = useCallback(
    async (url: string) => {
      if (selectedSitemapUrl === url) {
        document
          .getElementById('sitemap-content')
          ?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      setIsLoadingContent(true);
      setSitemapContent('');
      setSelectedSitemapUrl(url);

      try {
        const fetchUrl = new URL(url, window.location.origin).href;
        const response = await fetch(fetchUrl);
        const data = await response.text();
        setSitemapContent(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : '未知錯誤';
        setSitemapContent('載入失敗：' + message);
      } finally {
        setIsLoadingContent(false);
        setTimeout(() => {
          document
            .getElementById('sitemap-content')
            ?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    [selectedSitemapUrl]
  );

  const handleCloseViewer = useCallback(() => {
    setSelectedSitemapUrl('');
    setSitemapContent('');
  }, []);

  const handleValidateContent = useCallback(() => {
    if (!sitemapContent) return;

    if (selectedSitemapUrl.includes('robots.txt')) {
      alert('Robots.txt 驗證邏輯待實現。');
    } else {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sitemapContent, 'text/xml');
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
          alert('❌ XML 格式錯誤\n\n' + parseError[0].textContent);
        } else {
          const urls = xmlDoc.getElementsByTagName('url');
          const sitemaps = xmlDoc.getElementsByTagName('sitemap');
          const totalItems = urls.length + sitemaps.length;
          alert(
            `✅ XML 格式正確！\n\n包含 ${totalItems} 個項目\n- URL: ${urls.length}\n- Sitemap: ${sitemaps.length}`
          );
        }
      } catch (error) {
        alert(
          '❌ 驗證失敗\n\n' +
            (error instanceof Error ? error.message : '未知錯誤')
        );
      }
    }
  }, [sitemapContent, selectedSitemapUrl]);

  const handleOpenNewWindow = useCallback(() => {
    if (selectedSitemapUrl) {
      window.open(selectedSitemapUrl, '_blank', 'noopener,noreferrer');
    }
  }, [selectedSitemapUrl]);

  return (
    <div className="space-y-8">
      <SitemapStatsDashboard
        stats={stats}
        isLoading={isLoading}
        isInitialized={isInitialized}
        onTestAll={testAllSitemaps}
        onReset={resetStatus}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          📋 詳細狀態監控
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statusList.map((item: SitemapStatusItem) => (
            <SitemapStatusCard
              key={item.id}
              item={item}
              onTest={() => testSingleSitemap(item.id)}
              onViewDetails={() => handleViewDetails(item.url)}
            />
          ))}
        </div>
      </div>

      <SitemapContentViewer
        url={selectedSitemapUrl}
        content={sitemapContent}
        isLoading={isLoadingContent}
        onClose={handleCloseViewer}
        onValidate={handleValidateContent}
        onOpenNewWindow={handleOpenNewWindow}
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-2xl font-bold text-gray-900">
          🤖 自動化管理與命令列工具
        </h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            {SCRIPT_COMMANDS.map(cmd => (
              <div
                key={cmd.name}
                className="rounded-lg border bg-gray-50 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between space-x-4">
                  <div className="flex-grow">
                    <h3 className="break-words font-semibold text-gray-800">
                      {cmd.title}
                    </h3>
                    <p className="mt-1 break-words text-sm text-gray-600">
                      {cmd.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecuteScript(cmd.name, cmd.title)}
                    disabled={isTerminalRunning || !isInitialized}
                    className={`
                      flex flex-shrink-0 items-center justify-center space-x-2 rounded-lg px-4 py-2 transition-colors
                      ${
                        isTerminalRunning || !isInitialized
                          ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    <span className="flex items-center whitespace-nowrap">
                      {!isInitialized ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          <span>初始化中</span>
                        </>
                      ) : isTerminalRunning ? (
                        <span>執行中...</span>
                      ) : (
                        <>
                          <PlayCircle size={18} />
                          <span className="ml-2">執行</span>
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div>
            {isTerminalVisible && (
              <TerminalViewer
                title={terminalTitle}
                output={terminalOutput}
                isRunning={isTerminalRunning}
                onClose={() => setIsTerminalVisible(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
