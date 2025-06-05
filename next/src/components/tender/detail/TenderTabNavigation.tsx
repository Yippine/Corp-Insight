'use client';

import { useState, useEffect } from 'react';
import { Section } from '../../../hooks/useTenderDetail';

interface TenderTabNavigationProps {
  sections: Section[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TenderTabNavigation({
  sections,
  activeTab,
  onTabChange,
}: TenderTabNavigationProps) {
  // 在客戶端時獲取路由寬度
  const [availableWidth, setAvailableWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setAvailableWidth(window.innerWidth);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // 計算每個標籤佔用的平均寬度（粗略估算）
  const avgTabWidth = 120; // 平均每個標籤寬度（像素）
  const maxTabs = Math.floor((availableWidth * 0.9) / avgTabWidth);

  // 若標籤數量超過可見區域，則顯示下拉選單
  const shouldUseDropdown = sections.length > maxTabs;

  // 下拉選單模式
  if (shouldUseDropdown) {
    return (
      <div className="relative z-10 rounded-lg bg-white p-3 shadow">
        <select
          value={activeTab}
          onChange={e => onTabChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
        >
          {sections.map(section => (
            <option key={section.title} value={section.title}>
              {section.title}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 標籤模式
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="scrollbar-hide overflow-x-auto">
        <nav className="border-b border-gray-200">
          <div className="flex">
            {sections.map(section => {
              const isActive = activeTab === section.title;
              return (
                <button
                  key={section.title}
                  onClick={() => onTabChange(section.title)}
                  className={`
                    whitespace-nowrap border-b-2 px-6 py-4 text-sm font-medium
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }
                  `}
                >
                  {section.title}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
