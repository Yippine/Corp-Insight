'use client';

import { FolderOpen } from 'lucide-react';

interface NoDataFoundProps {
  message?: string;
}

export default function NoDataFound({ message = '無相關數據' }: NoDataFoundProps) {
  return (
    <div className="text-center py-10 px-4 bg-gray-50 rounded-lg">
      <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-base font-medium text-gray-900">{message}</h3>
      <p className="mt-1 text-sm text-gray-500">系統中暫無此資料，可能尚未收集或處理</p>
    </div>
  );
}