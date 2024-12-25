import { useState, useMemo } from 'react';
import { Tool, tools, toolTags } from '../../config/tools';

const getTagColor = (tag: string) => (toolTags as Record<string, { color: string }>)[tag]?.color || 'gray';

const isValidTag = (tag: string): tag is keyof typeof toolTags => tag in toolTags;

export default function Tools() {
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    if (!selectedTag) return tools;
    return tools.filter(tool => tool.tags.includes(selectedTag));
  }, [selectedTag]);

  if (selectedTool) {
    const ToolComponent = selectedTool.component;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedTool(null)}
          className="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md border border-gray-300"
        >
          ← 返回工具列表
        </button>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{selectedTool.name}</h2>
          <ToolComponent />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {Object.entries(toolTags).map(([tag, { name, color }]) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${selectedTag === tag 
                ? `bg-${color}-500 text-white` 
                : `bg-${color}-100 text-${color}-700 hover:bg-${color}-200`
              }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool)}
            className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 hover:border-${isValidTag(tool.tags[0]) ? toolTags[tool.tags[0]].color : 'gray'}-500`}
          >
            <div className="flex items-center mb-4">
              <tool.icon className={`h-7 w-7 text-${isValidTag(tool.tags[0]) ? toolTags[tool.tags[0]].color : 'gray'}-500 mr-3`} />
              <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
            </div>
            <p className="text-gray-600">{tool.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {tool.tags.map(tag => (
                <span
                  key={tag}
                  className={`px-2 py-1 text-xs font-medium rounded-full bg-${getTagColor(tag)}-100 text-${getTagColor(tag)}-700`}
                >
                  {isValidTag(tag) ? toolTags[tag].name : tag}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}