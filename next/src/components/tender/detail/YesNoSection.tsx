'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Section, FieldValue } from '../../../hooks/useTenderDetail';

interface YesNoSectionProps {
  section: Section;
}

export default function YesNoSection({ section }: YesNoSectionProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // 檢查欄位是否符合「是/否」格式
  const isYesNoField = (field: FieldValue) => {
    if (typeof field.value === 'string') {
      const value = field.value.trim().toLowerCase();
      return value === '是' || value === '否';
    }
    return false;
  };

  // 將欄位分為「是」和「否」兩組
  const categorizeFields = () => {
    const yesFields: FieldValue[] = [];
    const noFields: FieldValue[] = [];
    const otherFields: FieldValue[] = [];

    section.fields.forEach(field => {
      if (isYesNoField(field)) {
        if (field.value === '是') {
          yesFields.push(field);
        } else {
          noFields.push(field);
        }
      } else {
        otherFields.push(field);
      }
    });

    return { yesFields, noFields, otherFields };
  };

  const { yesFields, noFields, otherFields } = categorizeFields();

  // 渲染一般欄位
  const renderRegularField = (field: FieldValue, depth = 0) => {
    // 處理有子欄位的情況
    if (field.children && field.children.length > 0) {
      const groupKey = `${field.label}-${depth}`;
      const isExpanded = expandedGroups[groupKey] || depth === 0;

      return (
        <div key={field.label} className={`my-2 ${depth > 0 ? 'ml-4' : ''}`}>
          {depth > 0 && (
            <button
              onClick={() => toggleGroup(groupKey)}
              className="flex items-center font-medium text-gray-800 hover:text-blue-600"
            >
              {isExpanded ? (
                <ChevronDown className="mr-1 h-4 w-4" />
              ) : (
                <ChevronRight className="mr-1 h-4 w-4" />
              )}
              {field.label}
            </button>
          )}

          {depth === 0 && (
            <div className="mb-2 text-lg font-medium text-gray-800">
              {field.label}
            </div>
          )}

          {(isExpanded || depth === 0) && (
            <div
              className={`${depth > 0 ? 'mt-2 space-y-2 border-l-2 border-gray-200 pl-4' : ''}`}
            >
              {field.children.map(child =>
                renderRegularField(child, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    }

    // 處理葉欄位
    if (!field.value || field.value === '') return null;

    return (
      <div key={field.label} className={`py-2 ${depth > 0 ? 'ml-4' : ''}`}>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-gray-600">{field.label}</div>
          <div className="col-span-2 whitespace-pre-wrap break-words">
            {Array.isArray(field.value) ? field.value.join(', ') : field.value}
          </div>
        </div>
      </div>
    );
  };

  // 渲染是/否欄位
  const renderYesNoField = (field: FieldValue, isYes = true) => {
    return (
      <div key={field.label} className="flex items-start gap-2 py-2">
        {isYes ? (
          <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
        ) : (
          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
        )}
        <span className="text-gray-800">{field.label}</span>
      </div>
    );
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      {/* 「是」欄位 */}
      {yesFields.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-medium text-gray-800">符合條件</h3>
          <div className="space-y-2">
            {yesFields.map(field => renderYesNoField(field, true))}
          </div>
        </div>
      )}

      {/* 「否」欄位 */}
      {noFields.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-4 text-lg font-medium text-gray-800">不符合條件</h3>
          <div className="space-y-2">
            {noFields.map(field => renderYesNoField(field, false))}
          </div>
        </div>
      )}

      {/* 一般欄位 */}
      {otherFields.length > 0 && (
        <div>
          <div className="space-y-4">
            {otherFields.map(field => renderRegularField(field))}
          </div>
        </div>
      )}
    </div>
  );
}
