'use client';

import React from "react";

interface DataSourceProps {
  sources: Array<{
    name: string,
    url: string,
  }>;
}

const DataSource: React.FC<DataSourceProps> = ({ sources }) => {
  return (
    <div className="text-sm text-gray-500 text-center mt-4 space-y-1">
      <div className="flex justify-center">
        <span className="text-gray-500">資料來源：</span>
        {sources.map((source, index) => (
          <React.Fragment key={source.url}>
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">
              {source.name}
            </a>
            {index < sources.length - 1 && <span className="text-gray-300 px-2">|</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default DataSource;