import { motion } from "framer-motion";
import { CheckCircle, XCircle, Check, X, Minus } from "lucide-react";
import { Section } from "../../../hooks/useTenderDetail";

interface YesNoSectionProps {
  section: Section;
}

export default function YesNoSection({ section }: YesNoSectionProps) {
  const yesNoFields = extractYesNoFields(section);

  if (!yesNoFields) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white shadow-xl rounded-xl overflow-hidden mt-6 border border-gray-100"
    >
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <span className="w-1.5 h-6 bg-white rounded-full mr-3 opacity-80"></span>
          採購資格與條件摘要
        </h3>
      </div>

      <div className="px-6 py-5">
        {/* 處理投標廠商和決標品項頁籤的分組顯示 */}
        {["投標廠商", "決標品項"].includes(section.title) &&
        (yesNoFields.positiveFields.some((f) => f.group) ||
          yesNoFields.negativeFields.some((f) => f.group)) ? (
          <div className="space-y-6">
            {/* 按組分類渲染欄位 */}
            {Array.from(
              new Set([
                ...yesNoFields.positiveFields
                  .filter((f) => f.group)
                  .map((f) => f.group),
                ...yesNoFields.negativeFields
                  .filter((f) => f.group)
                  .map((f) => f.group),
              ])
            ).map((group, groupIndex) => {
              const groupPositiveFields = yesNoFields.positiveFields.filter(
                (f) => f.group === group
              );
              const groupNegativeFields = yesNoFields.negativeFields.filter(
                (f) => f.group === group
              );

              if (
                groupPositiveFields.length === 0 &&
                groupNegativeFields.length === 0
              ) {
                return null;
              }

              return (
                <motion.div
                  key={`group-${groupIndex}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: groupIndex * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="border border-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {group}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                    {/* 符合條件卡片 */}
                    <motion.div
                      className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 shadow-sm ${groupPositiveFields.length === 0 ? "opacity-50" : ""}`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-base font-semibold text-green-700 mb-3 flex items-center">
                        <div className="p-1 bg-white rounded-full shadow-sm mr-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        符合條件
                      </div>
                      {groupPositiveFields.length > 0 ? (
                        <ul className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                          {renderGroupedFields(groupPositiveFields)}
                        </ul>
                      ) : (
                        <div className="flex items-center justify-center h-6 text-gray-500 italic text-sm">
                          無符合條件
                        </div>
                      )}
                    </motion.div>

                    {/* 不符合條件卡片 */}
                    <motion.div
                      className={`bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200 shadow-sm ${groupNegativeFields.length === 0 ? "opacity-50" : ""}`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="text-base font-semibold text-red-700 mb-3 flex items-center">
                        <div className="p-1 bg-white rounded-full shadow-sm mr-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                        </div>
                        不符合條件
                      </div>
                      {groupNegativeFields.length > 0 ? (
                        <ul className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                          {renderGroupedFields(groupNegativeFields)}
                        </ul>
                      ) : (
                        <div className="flex items-center justify-center h-6 text-gray-500 italic text-sm">
                          無不符合條件
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}

            {/* 顯示未分組的欄位 */}
            {(yesNoFields.positiveFields.some((f) => !f.group) ||
              yesNoFields.negativeFields.some((f) => !f.group)) && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -2 }}
                className="border border-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3">
                  <h4 className="text-lg font-semibold text-gray-800">
                    一般條件
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                  {/* 符合條件 */}
                  <motion.div
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 shadow-sm"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-base font-semibold text-green-700 mb-3 flex items-center">
                      <div className="p-1 bg-white rounded-full shadow-sm mr-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      符合條件
                    </div>
                    {yesNoFields.positiveFields.filter((f) => !f.group).length >
                    0 ? (
                      <ul className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {renderGroupedFields(
                          yesNoFields.positiveFields.filter((f) => !f.group)
                        )}
                      </ul>
                    ) : (
                      <div className="flex items-center justify-center h-6 text-gray-500 italic text-sm">
                        無符合條件
                      </div>
                    )}
                  </motion.div>

                  {/* 不符合條件 */}
                  <motion.div
                    className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg p-4 border border-red-200 shadow-sm"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-base font-semibold text-red-700 mb-3 flex items-center">
                      <div className="p-1 bg-white rounded-full shadow-sm mr-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                      </div>
                      不符合條件
                    </div>
                    {yesNoFields.negativeFields.filter((f) => !f.group).length >
                    0 ? (
                      <ul className="space-y-3 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                        {renderGroupedFields(
                          yesNoFields.negativeFields.filter((f) => !f.group)
                        )}
                      </ul>
                    ) : (
                      <div className="flex items-center justify-center h-6 text-gray-500 italic text-sm">
                        無不符合條件
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          // 一般頁籤的顯示方式（符合/不符合兩欄）
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 符合條件卡片 */}
            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm"
              whileHover={{
                scale: 1.01,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                <div className="p-1.5 bg-white rounded-full shadow-sm mr-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                符合條件
              </div>
              {yesNoFields.positiveFields.length > 0 ? (
                <ul className="space-y-3.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {renderGroupedFields(yesNoFields.positiveFields)}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-8 text-gray-500 italic">
                  無符合條件
                </div>
              )}
            </motion.div>

            {/* 不符合條件卡片 */}
            <motion.div
              className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border border-red-200 shadow-sm"
              whileHover={{
                scale: 1.01,
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
              }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                <div className="p-1.5 bg-white rounded-full shadow-sm mr-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                不符合條件
              </div>
              {yesNoFields.negativeFields.length > 0 ? (
                <ul className="space-y-3.5 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {renderGroupedFields(yesNoFields.negativeFields)}
                </ul>
              ) : (
                <div className="flex items-center justify-center h-8 text-gray-500 italic">
                  無不符合條件
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// 在 renderYesNoSection 函數中添加渲染嵌套"是否"欄位的邏輯
const renderNestedYesNoFields = (field: any) => {
  if (
    !field.children ||
    (!field.children.positiveFields && !field.children.negativeFields)
  ) {
    return null;
  }

  return (
    <div className="ml-6 mt-3 border-l-2 border-gray-200 pl-4">
      <div className="space-y-2">
        {field.children.positiveFields &&
          field.children.positiveFields.length > 0 && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="text-sm font-medium text-green-700 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                相關符合條件
              </div>
              <ul className="space-y-2">
                {field.children.positiveFields.map(
                  (childField: any, index: number) => (
                    <li key={index} className="text-gray-800 text-sm">
                      <div className="flex items-start">
                        <Check className="h-3.5 w-3.5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-medium">
                            {childField.label}
                          </span>
                          {childField.children &&
                            typeof childField.children === "string" && (
                              <div className="ml-5 mt-1 text-xs text-gray-600">
                                {childField.children}
                              </div>
                            )}
                          {renderNestedYesNoFields(childField)}
                        </div>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

        {field.children.negativeFields &&
          field.children.negativeFields.length > 0 && (
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="text-sm font-medium text-red-700 mb-2 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                相關不符合條件
              </div>
              <ul className="space-y-2">
                {field.children.negativeFields.map(
                  (childField: any, index: number) => (
                    <li key={index} className="text-gray-800 text-sm">
                      <div className="flex items-start">
                        <X className="h-3.5 w-3.5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-medium">
                            {childField.label}
                          </span>
                          {childField.children &&
                            typeof childField.children === "string" && (
                              <div className="ml-5 mt-1 text-xs text-gray-600">
                                {childField.children}
                              </div>
                            )}
                          {renderNestedYesNoFields(childField)}
                        </div>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
      </div>
    </div>
  );
};

// 按 group 屬性對欄位進行分組處理
const groupPositiveFields = (fields: any[]) => {
  const groupedFields: Record<string, any[]> = {};
  const ungroupedFields: any[] = [];

  fields.forEach((field) => {
    if (field.group) {
      if (!groupedFields[field.group]) {
        groupedFields[field.group] = [];
      }
      groupedFields[field.group].push(field);
    } else {
      ungroupedFields.push(field);
    }
  });

  return { groupedFields, ungroupedFields };
};

// 渲染單個欄位（包含可能的備註）
const renderField = (field: any, index: number) => (
  <motion.li
    key={index}
    className="text-gray-800 text-base"
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05, duration: 0.2 }}
  >
    <div className="flex items-start group">
      <div className="flex-shrink-0 mt-0.5">
        {field.value === "是" ? (
          <div className="p-0.5 bg-green-100 rounded-full">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        ) : (
          <div className="p-0.5 bg-red-100 rounded-full">
            <X className="h-4 w-4 text-red-600" />
          </div>
        )}
      </div>
      <div className="ml-3 flex-1">
        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {field.label}
        </span>
        {field.children && typeof field.children === "string" && (
          <motion.div
            className="mt-2 text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border-l-3 border-gray-200 shadow-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="prose prose-sm max-w-none">{field.children}</div>
          </motion.div>
        )}
        {field.children &&
          typeof field.children !== "string" &&
          renderNestedYesNoFields(field)}
      </div>
    </div>
  </motion.li>
);

// 渲染分組欄位
const renderGroupedFields = (fields: any[]) => {
  const { groupedFields, ungroupedFields } = groupPositiveFields(fields);

  return (
    <>
      {ungroupedFields.map((field, index) => renderField(field, index))}

      {Object.entries(groupedFields).map(
        ([groupName, groupFields], groupIndex) => (
          <motion.li
            key={`group-${groupIndex}`}
            className="text-gray-800 text-base mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                {groupFields.some((field) => field.value === "是") ? (
                  <div className="p-0.5 bg-green-100 rounded-full">
                    <Minus className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="p-0.5 bg-red-100 rounded-full">
                    <Minus className="h-4 w-4 text-red-600" />
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <span className="font-medium text-gray-700 transition-colors duration-200">
                  {groupName}
                </span>
                <ul className="ml-0 space-y-2.5 mt-2">
                  {groupFields.map((field, index) => renderField(field, index))}
                </ul>
              </div>
            </div>
          </motion.li>
        )
      )}
    </>
  );
};

const extractYesNoFields = (section: Section) => {
  const allYesNoFields: {
    positiveFields: {
      label: string;
      value: string;
      children?: any;
      group?: string;
      path?: string[];
    }[];
    negativeFields: {
      label: string;
      value: string;
      children?: any;
      group?: string;
      path?: string[];
    }[];
  } = {
    positiveFields: [],
    negativeFields: [],
  };

  // 深度優先搜尋所有欄位
  const searchYesNoFields = (field: any, path: string[] = []) => {
    const currentPath = [...path, field.label];

    // 檢查當前欄位是否為"是否"欄位
    if (typeof field.label === "string" && field.label.includes("是否")) {
      const cleanedLabel = field.label.replace(/是否/g, "");
      let mainValue = field.value;
      let childrenText = undefined;

      // 處理文字型態
      if (typeof field.value === "string") {
        if (field.value.includes("\n")) {
          const [yesNoValue, ...restValues] = field.value.split("\n");
          mainValue = yesNoValue.trim().replace(/，.*$/, "");
          childrenText = restValues.join("\n");
        } else if (field.value.includes("，")) {
          const [yesNoValue, ...restValues] = field.value.split("，");
          mainValue = yesNoValue.trim();
          childrenText = restValues.join("，");
        }
      }

      // 分類並存儲
      const groupName = path.length > 0 ? path[path.length - 1] : undefined;

      if (mainValue === "是") {
        allYesNoFields.positiveFields.push({
          label: cleanedLabel,
          value: mainValue,
          ...(childrenText ? { children: childrenText } : {}),
          ...(groupName ? { group: groupName } : {}),
          path: currentPath,
        });
      } else if (mainValue === "否" || String(mainValue).startsWith("否")) {
        allYesNoFields.negativeFields.push({
          label: cleanedLabel,
          value: "否",
          ...(childrenText ? { children: childrenText } : {}),
          ...(groupName ? { group: groupName } : {}),
          path: currentPath,
        });
      }
    }

    // 遞迴處理子欄位
    if (field.children && field.children.length > 0) {
      // 檢查是否為父"是否"欄位
      const isParentYesNoField =
        typeof field.label === "string" && field.label.includes("是否");

      // 收集子"是否"欄位
      if (isParentYesNoField) {
        const childYesNoFields = {
          positiveFields: [] as any[],
          negativeFields: [] as any[],
        };

        field.children.forEach((child: any) => {
          // 臨時收集子欄位的"是否"結果
          const tempAllYesNoFields = { ...allYesNoFields };
          searchYesNoFields(child, currentPath);

          // 找出新增的欄位
          const newPositiveFields = allYesNoFields.positiveFields.filter(
            (f) =>
              !tempAllYesNoFields.positiveFields.some(
                (tf) => tf.label === f.label
              )
          );
          const newNegativeFields = allYesNoFields.negativeFields.filter(
            (f) =>
              !tempAllYesNoFields.negativeFields.some(
                (tf) => tf.label === f.label
              )
          );

          childYesNoFields.positiveFields.push(...newPositiveFields);
          childYesNoFields.negativeFields.push(...newNegativeFields);
        });

        // 如果父欄位已經被處理為"是否"欄位，則添加子欄位作為其 children
        const parentField =
          allYesNoFields.positiveFields.find(
            (f) => f.path && f.path.join() === currentPath.join()
          ) ||
          allYesNoFields.negativeFields.find(
            (f) => f.path && f.path.join() === currentPath.join()
          );

        if (parentField) {
          parentField.children = {
            positiveFields: childYesNoFields.positiveFields,
            negativeFields: childYesNoFields.negativeFields,
          };
        }
      } else {
        // 正常處理子欄位
        field.children.forEach((child: any) =>
          searchYesNoFields(child, currentPath)
        );
      }
    }
  };

  // 處理所有頂層欄位
  section.fields.forEach((field) => searchYesNoFields(field, []));

  // 如果沒有是否欄位，返回 null
  if (
    allYesNoFields.positiveFields.length === 0 &&
    allYesNoFields.negativeFields.length === 0
  ) {
    return null;
  }

  return allYesNoFields;
};
