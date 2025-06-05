'use client';

import React from 'react';

interface DataSourceProps {
  sources: Array<{
    name: string;
    url: string;
  }>;
}

const DataSource: React.FC<DataSourceProps> = ({ sources }) => {
  return (
    <div className="mt-4 space-y-1 text-center text-sm text-gray-500">
      <div className="flex justify-center">
        <span className="text-gray-500">資料來源：</span>
        {sources.map((source, index) => (
          <React.Fragment key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 transition-colors hover:text-blue-800"
            >
              {source.name}
            </a>
            {index < sources.length - 1 && (
              <span className="px-2 text-gray-300">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DataSource;
