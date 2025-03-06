import { motion } from 'framer-motion';
import { Badge } from '../../../components/common/Badge';

// 解析專業經驗函數
function parseExperience(experienceText: string) {
  if (!experienceText) return [];

  // 拆分多個經歷
  const experiences = experienceText.split(/經歷\d+：/).filter(exp => exp.trim().length > 0);
  
  return experiences.map(exp => {
    const parts: Record<string, string> = {};
    
    // 嘗試提取三個標準字段
    const fields = [
      { key: '服務機關(構)名稱', pattern: /服務機關\(構\)名稱：([^職]+)職稱：/ },
      { key: '職稱', pattern: /職稱：([^所]+)所任工作：/ },
      { key: '所任工作', pattern: /所任工作：(.+)$/ }
    ];
    
    fields.forEach(({ key, pattern }) => {
      const match = exp.match(pattern);
      parts[key] = match ? match[1].trim() : '';
    });
    
    return parts;
  });
}

interface CommitteeCardProps {
  committee: any;
}

export default function CommitteeCard({ committee }: CommitteeCardProps) {
  const isAttended = committee.出席會議 === '是'
  const attendanceLabel = isAttended ? '已出席' : '未出席'
  const experiences = parseExperience(committee.與採購案相關之學經歷);

  return (
    <motion.div 
      key={committee.姓名} 
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <h4 className="text-lg font-semibold flex items-center text-gray-900">
            <span className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-3"></span>
            {committee.姓名 || '評選委員姓名未提供'}
          </h4>
        </div>
        <Badge 
          variant='outline'
          colorScheme={isAttended ? 'green' : 'red'}
          className="text-sm font-medium tracking-wide"
        >
          {attendanceLabel}
        </Badge>
      </div>

      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="col-span-1">
          <dt className="text-sm font-medium text-gray-500 mb-3">現任職務</dt>
          <dd>
            {committee.職業 && (
              <div className="flex flex-wrap gap-2">
                {committee.職業.split('；').map((field: string, idx: number) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    colorScheme="purple"
                    className="text-sm font-medium tracking-wide cursor-pointer transform hover:scale-105 transition-transform duration-200"
                    title="點擊查看相關標案"
                  >
                    {field.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </dd>
        </div>

        <div className="col-span-2">
          <dt className="text-sm font-medium text-gray-500 mb-3">專業領域與相關經歷</dt>
          {experiences.length > 0 ? (
            <div className="space-y-4">
              {experiences.map((exp, expIndex) => (
                <motion.div 
                  key={expIndex} 
                  className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-100 shadow-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: expIndex * 0.1 }}
                >
                  <h5 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-1.5 h-4 bg-blue-500 rounded-full mr-2 opacity-75"></span>
                    專業經歷 {expIndex + 1}
                  </h5>
                  <div className="space-y-4">
                    {Object.entries(exp).map(([key, value], idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="text-sm font-medium text-gray-600 flex items-center">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                          {key === '服務機關(構)名稱' ? '服務單位' : 
                           key === '職稱' ? '擔任職務' : 
                           '專業技能'}
                        </div>
                        <div className="flex flex-wrap gap-2 pl-3">
                          {value.split(/、|，|;|；/).filter(item => item.trim()).map((item, itemIdx) => (
                            <Badge
                              key={itemIdx}
                              variant="solid"
                              colorScheme={
                                key === '服務機關(構)名稱' ? 'blue' : 
                                key === '職稱' ? 'purple' : 'green'
                              }
                              className="text-sm font-medium tracking-wide transform hover:scale-105 transition-transform duration-200"
                            >
                              {item.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic bg-gray-50 rounded-lg p-4 border border-gray-100">
              無相關專業經歷記錄
            </div>
          )}
        </div>

        {committee.備註 && (
          <div className="col-span-2 mt-4">
            <dt className="text-sm font-medium text-gray-500 mb-2">評選備註</dt>
            <dd className="text-base text-gray-700 bg-blue-50 rounded-lg p-4 border border-blue-100">
              {committee.備註}
            </dd>
          </div>
        )}
      </dl>
    </motion.div>
  );
}