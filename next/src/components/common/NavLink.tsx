'use client';

import {
  forwardRef,
  PropsWithChildren,
  useRef,
  useEffect,
  useState,
} from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from './loading/LoadingProvider';

type NavLinkProps = PropsWithChildren<{
  href: string;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  // 新增: 智能加載模式，自動判斷是否需要顯示 Loading
  smartLoading?: boolean;
}>;

/**
 * 增強型導航連結組件
 * 在點擊時立即顯示加載狀態，提升用戶體驗
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      href,
      children,
      className = '',
      activeClassName: _activeClassName = '',
      onClick,
      prefetch = true,
      replace = false,
      scroll: _scroll = true,
      // 默認啟用智能加載
      smartLoading = true,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    const currentPathname = usePathname();
    const currentSearchParams = useSearchParams();
    const { startLoading, checkAndStopLoading } = useLoading();

    // 快取防抖，避免重複導航
    const navigationInProgress = useRef(false);

    // 記錄上次導航到此頁面的時間
    const [lastNavigationTime] = useState<Record<string, number>>(() => {
      // 嘗試從 sessionStorage 恢復導航記錄
      if (typeof window !== 'undefined') {
        try {
          const storedTimes = sessionStorage.getItem('navLinkNavigationTimes');
          return storedTimes ? JSON.parse(storedTimes) : {};
        } catch {
          return {};
        }
      }
      return {};
    });

    // 解析href獲取路徑和查詢參數
    const getPathAndParams = (url: string) => {
      try {
        // 處理相對路徑
        if (url.startsWith('/')) {
          const [path, query] = url.split('?');
          return { path, query: query || '' };
        }
        // 處理絕對URL
        const urlObj = new URL(url, window.location.origin);
        return {
          path: urlObj.pathname,
          query: urlObj.search.replace('?', ''),
        };
      } catch {
        // 如果解析失敗，簡單分割
        const [path, query] = url.split('?');
        return { path, query: query || '' };
      }
    };

    // 是否是 /aitool/search, /company/search, /tender/search 這三個主要搜尋頁面
    const isMainSearchPage = (path: string) => {
      return ['/aitool/search', '/company/search', '/tender/search'].includes(
        path
      );
    };

    // 檢查是否需要顯示 Loading
    const shouldShowLoading = (targetPath: string) => {
      if (!smartLoading) return true; // 如果不使用智能加載，總是顯示

      // 檢查是否最近導航過 (5 分鐘內)
      const now = Date.now();
      const lastNavigated = lastNavigationTime[targetPath] || 0;
      const recentlyNavigated = now - lastNavigated < 300000; // 5 分鐘 = 300000ms

      // 1. 如果是主要搜尋頁面之間的導航 - 智能判斷
      if (
        isMainSearchPage(currentPathname || '') &&
        isMainSearchPage(targetPath)
      ) {
        return !recentlyNavigated; // 如果最近導航過，不顯示 Loading
      }

      // 2. 導航到相同頁面 - 只有參數變化，使用更短的 Loading
      if (targetPath === (currentPathname || '')) {
        return false; // 只有參數變化，不顯示 Loading
      }

      // 3. 其他情況顯示 Loading
      return true;
    };

    // 更新導航時間記錄
    const updateNavigationTime = (path: string) => {
      const now = Date.now();
      lastNavigationTime[path] = now;

      // 保存到 sessionStorage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            'navLinkNavigationTimes',
            JSON.stringify(lastNavigationTime)
          );
        } catch {
          // 忽略儲存錯誤
        }
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // 只處理同源導航
      if (href.startsWith('/') || href.startsWith('#')) {
        e.preventDefault();

        // 解析目標和當前路徑
        const { path: targetPath, query: targetQuery } = getPathAndParams(href);
        const { path: currentPath, query: currentQuery } = {
          path: currentPathname || '/',
          query: currentSearchParams?.toString() || '',
        };

        // 如果目標路徑與當前路徑及參數完全相同，直接跳過導航與 Loading
        if (targetPath === currentPath && targetQuery === currentQuery) {
          return;
        }

        // 避免重複點擊和導航
        if (navigationInProgress.current) {
          return;
        }

        // 標記導航進行中
        navigationInProgress.current = true;

        // 檢查是否為同頁參數變化導航
        const isOnlyParamsChanged =
          targetPath === currentPath && targetQuery !== currentQuery;

        // 決定是否顯示載入狀態
        if (shouldShowLoading(targetPath)) {
          startLoading();
        }

        // 觸發自定義onClick事件
        if (onClick) {
          onClick();
        }

        // 執行導航
        if (replace) {
          router.replace(href);
        } else {
          router.push(href);
        }

        // 更新導航時間記錄
        updateNavigationTime(targetPath);

        // 對於同頁參數變化，我們使用特殊處理
        if (isOnlyParamsChanged) {
          // 稍微延遲一下調用checkAndStopLoading，確保路由變化已經開始
          setTimeout(() => {
            checkAndStopLoading();
          }, 100);
        }

        // 300ms後重置狀態，防止重複點擊
        setTimeout(() => {
          navigationInProgress.current = false;
        }, 300);
      } else if (onClick) {
        // 對於外部連結，只調用onClick
        onClick();
      }
    };

    // 預取頁面內容
    useEffect(() => {
      if (prefetch && href.startsWith('/')) {
        router.prefetch(href);
      }
    }, [href, prefetch, router]);

    return (
      <Link
        ref={ref}
        href={href}
        className={className}
        onClick={handleClick}
        prefetch={prefetch}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = 'NavLink';

export default NavLink;
