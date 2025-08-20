import { motion } from "framer-motion";
import { Phone, Mail, Globe, MapPin, ChevronDown } from "lucide-react";
import { useState, createContext, useContext } from "react";
import { FieldValue } from "../../../hooks/useTenderDetail";

// 創建一個上下文用於跨組件管理展開狀態
const ExpandContext = createContext<{
  expandedFields: Record<string, boolean>;
  toggleFieldExpansion: (fieldKey: string) => void;
}>({
  expandedFields: {},
  toggleFieldExpansion: () => {},
});

// 創建提供者組件
export function FieldRendererProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expandedFields, setExpandedFields] = useState<Record<string, boolean>>(
    {}
  );

  const toggleFieldExpansion = (fieldKey: string) => {
    setExpandedFields((prev) => ({
      ...prev,
      [fieldKey]: !prev[fieldKey],
    }));
  };

  return (
    <ExpandContext.Provider value={{ expandedFields, toggleFieldExpansion }}>
      {children}
    </ExpandContext.Provider>
  );
}

interface FieldRendererProps {
  field: FieldValue;
  depth?: number;
  sectionTitle: string;
  parentKey?: string;
}

export default function FieldRenderer({
  field,
  depth = 0,
  sectionTitle,
  parentKey = "",
}: FieldRendererProps) {
  const { expandedFields, toggleFieldExpansion } = useContext(ExpandContext);

  // 渲染欄位值的通用函數
  const renderFieldValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      return value.map((item, index) => (
        <p key={index} className="text-base text-gray-900">
          {item}
        </p>
      ));
    }

    // 處理特殊格式
    if (value.includes("\n")) {
      return value.split("\n").map((line, index) => (
        <p key={index} className="text-base text-gray-900">
          {line}
        </p>
      ));
    }

    // 處理電話號碼
    if (value.match(/^\(\d{2,4}\)[0-9\-#]+$/)) {
      return (
        <div className="flex items-center">
          <Phone className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    // 處理電子郵件
    if (value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return (
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    // 處理網址
    if (value.startsWith("http")) {
      return (
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-gray-400 mr-2" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base text-blue-600 hover:text-blue-800"
          >
            {value}
          </a>
        </div>
      );
    }

    // 處理地址
    if (value.match(/[縣市區鄉鎮路街]/)) {
      return (
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-base text-gray-900">{value}</span>
        </div>
      );
    }

    return <span className="text-base text-gray-900">{value}</span>;
  };

  const hasChildren = field.children && field.children.length > 0;
  const paddingClass = depth > 0 ? "pl-4" : "";
  const borderClass = depth > 0 ? "border-l-2 border-gray-200" : "";
  // 生成唯一識別鍵
  const fieldKey = `${parentKey}-${field.label}`;
  const isExpanded = expandedFields[fieldKey] ?? true; // 預設展開

  // 修改後的特定區塊佈局判斷條件
  const gridClass =
    (sectionTitle === "投標廠商" && depth === 0) ||
    (sectionTitle === "決標品項" && depth === 1)
      ? "grid grid-cols-2 gap-4"
      : "";

  // 處理陣列型態的複雜資料結構
  const isArrayOfObjects =
    Array.isArray(field.value) &&
    field.value.some((item: any) => typeof item === "object");

  return (
    <div key={field.label} className={`${paddingClass} ${borderClass} mb-4`}>
      <div
        className="flex justify-between items-start group cursor-pointer"
        onClick={() => hasChildren && toggleFieldExpansion(fieldKey)}
        role="button"
        aria-expanded={isExpanded}
      >
        <dt
          className={`text-base ${
            depth === 0
              ? "font-medium text-gray-700"
              : depth === 1
                ? "font-normal text-gray-600"
                : "font-light text-gray-500"
          }`}
        >
          <span className="inline-block w-3 h-3 bg-blue-100 rounded-full mr-2"></span>
          {field.label}
        </dt>
        {(hasChildren || isArrayOfObjects) && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-gray-400" />
          </motion.div>
        )}
      </div>

      {/* 只在展開時顯示內容 */}
      {isExpanded && (
        <>
          {/* 統一值顯示區域 */}
          {field.value && !isArrayOfObjects && (
            <dd className="mt-1 ml-5">{renderFieldValue(field.value)}</dd>
          )}

          {isArrayOfObjects ? (
            <div className={`mt-2 ${gridClass}`}>
              {(field.value as any[]).map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  {Object.entries(item).map(([key, value]) => (
                    <div key={key} className="mb-3 last:mb-0">
                      <div className="text-sm font-medium text-gray-600">
                        {key}
                      </div>
                      <div className="text-base text-gray-900">
                        {Array.isArray(value)
                          ? value.join(", ")
                          : typeof value === "object"
                            ? JSON.stringify(value, null, 2)
                            : String(value || "")}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            hasChildren && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`space-y-3 mt-2 ${gridClass}`}
              >
                {field.children?.map((child, childIndex) => (
                  <FieldRenderer
                    key={childIndex}
                    field={child}
                    depth={depth + 1}
                    sectionTitle={sectionTitle}
                    parentKey={fieldKey}
                  />
                ))}
              </motion.div>
            )
          )}
        </>
      )}
    </div>
  );
}
