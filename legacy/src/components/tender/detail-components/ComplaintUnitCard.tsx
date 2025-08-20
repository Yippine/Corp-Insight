import { motion } from "framer-motion";
import { Badge } from "../../../components/common/Badge";

// 解析檢舉受理單位函數
export function parseComplaintUnits(complaintText: string) {
  if (!complaintText) return [];

  // 使用正則表達式拆分各單位，支援全形和半形括號
  const unitRegex = /([^（）()]+)(?:[(（]([^）)]*)[）)])?/g;
  const units: Array<{ name: string; details: Record<string, string[]> }> = [];

  let match;
  while ((match = unitRegex.exec(complaintText)) !== null) {
    const [_, unitName, detailsStr] = match;
    const details: Record<string, string[]> = {};

    // 拆分詳細資料並處理特殊分隔符號
    detailsStr.split("、").forEach((detail) => {
      const [key, ...values] = detail.split(/：|:/);
      if (key && values.length > 0) {
        const processedValues = values
          .join(":")
          .split(/;|；/)
          .map((v) => v.trim());
        details[key.trim()] = processedValues;
      }
    });

    units.push({
      name: unitName.trim(),
      details,
    });
  }

  return units;
}

interface ComplaintUnitCardProps {
  unit: {
    name: string;
    details: Record<string, string[]>;
  };
}

export default function ComplaintUnitCard({ unit }: ComplaintUnitCardProps) {
  return (
    <motion.div
      key={unit.name}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="mb-4">
        <h4 className="text-lg font-semibold flex items-center text-gray-900">
          <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3"></span>
          {unit.name}
        </h4>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(unit.details).map(([key, values]) => (
          <div key={key} className="space-y-2">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
              {key}
            </dt>
            <dd className="flex flex-wrap gap-2">
              {values.map((value, idx) => (
                <Badge
                  key={idx}
                  variant="solid"
                  colorScheme={
                    key.includes("地址")
                      ? "blue"
                      : key.includes("電話")
                        ? "green"
                        : key.includes("傳真")
                          ? "purple"
                          : "gray"
                  }
                  className="text-sm font-medium tracking-wide"
                >
                  {value}
                </Badge>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}
