'use client';

import { Building2, FileText, Calendar } from "lucide-react";
import type { TenderRecord, TenderDetail } from "../../../hooks/useTenderDetail";
import { formatDate } from '../../../lib/utils/formatters';

interface TenderHeaderProps {
  targetRecord: TenderRecord | null;
  data: TenderDetail | null;
}

export default function TenderHeader({ targetRecord, data }: TenderHeaderProps) {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold text-gray-900">{targetRecord?.brief.title}</h2>
          </div>
          {targetRecord?.date && (
            <p className="flex items-center text-base text-gray-500">
              <Calendar className="h-5 w-5 mr-1" />
              公告日期：{formatDate(targetRecord.date)}
            </p>
          )}
          {targetRecord?.brief?.type && (
            <p className="flex items-center text-base text-gray-500">
              <FileText className="h-5 w-5 mr-1" />
              公告類型：{targetRecord.brief.type}
            </p>
          )}
          {data?.unit_name && (
            <p className="flex items-center text-base text-gray-500">
              <Building2 className="h-5 w-5 mr-1" />
              招標機關：{data.unit_name}
            </p>
          )}
        </div>
        <div className="flex space-x-3">
           <button className="inline-flex items-center px-4 py-2 border 
            border-transparent text-base font-medium rounded-md text-white 
            bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-orange-300 whitespace-nowrap">
            一鍵生成洞察報告
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border 
            border-gray-300 shadow-sm text-base font-medium rounded-md 
            text-gray-700 bg-white hover:bg-gray-50 focus:outline-none 
            focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
            whitespace-nowrap ml-3"
          >
            加入追蹤
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border 
            border-transparent text-base font-medium rounded-md text-white 
            bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
            focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
          >
            下載報表
          </button>
        </div>
      </div>
    </div>
  );
}