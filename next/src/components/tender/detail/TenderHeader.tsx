'use client';

import { Building2, FileText, Calendar } from 'lucide-react';
import type {
  TenderRecord,
  TenderDetail,
} from '../../../hooks/useTenderDetail';
import { formatDate } from '../../../lib/utils/formatters';

interface TenderHeaderProps {
  targetRecord: TenderRecord | null;
  data: TenderDetail | null;
}

export default function TenderHeader({
  targetRecord,
  data,
}: TenderHeaderProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">
              {targetRecord?.brief.title}
            </h2>
          </div>
          {targetRecord?.date && (
            <p className="flex items-center text-base text-gray-500">
              <Calendar className="mr-1 h-5 w-5" />
              公告日期：{formatDate(targetRecord.date)}
            </p>
          )}
          {targetRecord?.brief?.type && (
            <p className="flex items-center text-base text-gray-500">
              <FileText className="mr-1 h-5 w-5" />
              公告類型：{targetRecord.brief.type}
            </p>
          )}
          {data?.unit_name && (
            <p className="flex items-center text-base text-gray-500">
              <Building2 className="mr-1 h-5 w-5" />
              招標機關：{data.unit_name}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            className="inline-flex items-center whitespace-nowrap rounded-md border 
            border-transparent bg-orange-400 px-4 py-2 text-base 
            font-medium text-white hover:bg-orange-500 focus:outline-none 
            focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
          >
            一鍵生成洞察報告
          </button>
          <button
            className="ml-3 inline-flex items-center whitespace-nowrap rounded-md 
            border border-gray-300 bg-white px-4 py-2 
            text-base font-medium text-gray-700 shadow-sm 
            hover:bg-gray-50 focus:outline-none focus:ring-2 
            focus:ring-blue-500 focus:ring-offset-2"
          >
            加入追蹤
          </button>
          <button
            className="inline-flex items-center whitespace-nowrap rounded-md border 
            border-transparent bg-blue-600 px-4 py-2 text-base 
            font-medium text-white hover:bg-blue-700 focus:outline-none 
            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            下載報表
          </button>
        </div>
      </div>
    </div>
  );
}
