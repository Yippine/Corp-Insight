'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Section, FieldValue } from '../../../hooks/useTenderDetail';

interface TenderBasicInfoProps {
  section: Section;
}

export default function TenderBasicInfo({ section }: TenderBasicInfoProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const renderFieldValue = (field: FieldValue, depth = 0) => {
    if (field.children && field.children.length > 0) {
      const groupKey = `${field.label}-${depth}`;
      const isExpanded = expandedGroups[groupKey];

      return (
        <div key={field.label} className={`my-2 ${depth > 0 ? 'ml-4' : ''}`}>
          <button
            onClick={() => toggleGroup(groupKey)}
            className="flex items-center text-gray-800 hover:text-blue-600 font-medium"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 mr-1" />
            ) : (
              <ChevronRight className="h-4 w-4 mr-1" />
            )}
            {field.label}
          </button>
          
          {isExpanded && (
            <div className="mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
              {field.children.map((child) => renderFieldValue(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Handle leaf field
    if (!field.value || field.value === '') return null;

    return (
      <div key={field.label} className={`py-2 ${depth > 0 ? 'ml-4' : ''}`}>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-gray-600">{field.label}</div>
          <div className="col-span-2 break-words whitespace-pre-wrap">
            {Array.isArray(field.value) ? field.value.join(', ') : field.value}
          </div>
        </div>
      </div>
    );
  };

  // Filter out empty fields
  const nonEmptyFields = section.fields.filter(
    f => f.value || (f.children && f.children.length > 0)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-2">
        {nonEmptyFields.map((field) => renderFieldValue(field))}
      </div>
    </div>
  );
}