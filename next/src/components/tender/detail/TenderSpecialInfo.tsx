'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Badge } from '../../common/Badge';
import { Section } from '../../../hooks/useTenderDetail';
import TenderBasicInfo from './TenderBasicInfo';
import { TenderRecord } from '../../../hooks/useTenderDetail';
import CommitteeCard from '../detail-components/CommitteeCard';
import ComplaintUnitCard, {
  parseComplaintUnits,
} from '../detail-components/ComplaintUnitCard';

interface TenderSpecialInfoProps {
  section: Section;
  targetRecord: TenderRecord | null;
}

export default function TenderSpecialInfo({
  section,
  targetRecord,
}: TenderSpecialInfoProps) {
  // 根據部分類型選擇渲染邏輯
  if (section.title === '最有利標') {
    return renderMostAdvantageousSection(section, targetRecord);
  } else if (section.title === '其他') {
    return renderOtherInfoSection(section, targetRecord);
  }

  // 預設情況
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <TenderBasicInfo section={section} />
    </motion.div>
  );
}

// 渲染最有利標部分
function renderMostAdvantageousSection(
  section: Section,
  targetRecord: TenderRecord | null
) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <motion.div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4">
          <h3 className="flex items-center text-xl font-semibold text-gray-800">
            <span className="mr-3 h-6 w-2 rounded-full bg-blue-500"></span>
            評選委員組成
          </h3>
        </div>

        <div className="space-y-6 px-6 py-5">
          {targetRecord?.detail['最有利標:評選委員']?.map(
            (group: any[], index: number) => (
              <motion.div
                key={index}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {group.map(committee => (
                    <CommitteeCard key={committee.姓名} committee={committee} />
                  ))}
                </div>
              </motion.div>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// 渲染其他資訊部分
function renderOtherInfoSection(
  section: Section,
  targetRecord: TenderRecord | null
) {
  const queryUnitData =
    targetRecord?.detail[
      '其他:疑義、異議、申訴及檢舉受理單位:疑義、異議受理單位'
    ];
  const appealData =
    targetRecord?.detail['其他:疑義、異議、申訴及檢舉受理單位:申訴受理單位'];
  const complaintData =
    targetRecord?.detail['其他:疑義、異議、申訴及檢舉受理單位:檢舉受理單位'];
  const filteredFields = section.fields.filter(
    field => !field.label.includes('疑義、異議、申訴及檢舉受理單位')
  );

  // 創建一個臨時的 section 物件僅包含過濾後的欄位
  const otherInfoSection = {
    ...section,
    title: '補充說明資訊',
    fields: filteredFields,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 使用 TenderBasicInfo 來渲染其他區塊 */}
      <TenderBasicInfo section={otherInfoSection} />

      {/* 整合後的受理單位專區 */}
      {(queryUnitData || complaintData || appealData) && (
        <motion.div
          className="overflow-hidden rounded-xl bg-white shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4">
            <h3 className="flex items-center text-xl font-semibold text-gray-800">
              <span className="mr-3 h-6 w-2 rounded-full bg-blue-500"></span>
              採購案件聯絡與申訴管道
            </h3>
          </div>

          <div className="space-y-8 px-6 py-5">
            {/* 疑義/異議受理單位 */}
            {queryUnitData && (
              <motion.div
                className="rounded-2xl border border-gray-200 bg-gray-50 p-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="flex items-center text-lg font-semibold text-gray-900">
                    <span className="mr-3 h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                    採購案件諮詢窗口
                  </h4>
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-600">
                      主辦機關單位
                    </div>
                    <Badge
                      variant="solid"
                      colorScheme="blue"
                      className="text-base font-medium"
                    >
                      {queryUnitData}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 新增申訴受理單位區塊 */}
            {appealData && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h4 className="flex items-center border-b pb-3 text-lg font-semibold text-gray-900">
                  <span className="mr-3 h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  政府採購申訴管道
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {parseComplaintUnits(appealData).map(unit => (
                    <ComplaintUnitCard key={unit.name} unit={unit} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* 檢舉受理單位列表 */}
            {complaintData && (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <h4 className="flex items-center border-b pb-3 text-lg font-semibold text-gray-900">
                  <span className="mr-3 h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  政府採購監督管道
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {parseComplaintUnits(complaintData).map(unit => (
                    <ComplaintUnitCard key={unit.name} unit={unit} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
