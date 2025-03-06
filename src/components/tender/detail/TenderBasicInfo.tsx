import { motion } from 'framer-motion';
import { Section } from '../../../hooks/useTenderDetail';
import FieldRenderer, { FieldRendererProvider } from '../detail-components/FieldRenderer';

interface TenderBasicInfoProps {
  section: Section;
}

export default function TenderBasicInfo({ section }: TenderBasicInfoProps) {
  // 渲染基本資訊部分
  return (
    <motion.div
      className="bg-white shadow-lg rounded-xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
          {section.title}
        </h3>
      </div>
      
      <div className="px-6 py-5 space-y-6">
        <FieldRendererProvider>
          <dl className={`grid ${['投標廠商', '決標品項'].includes(section.title) ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
            {section.fields.map((field, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <FieldRenderer field={field} depth={0} sectionTitle={section.title} />
              </div>
            ))}
          </dl>
        </FieldRendererProvider>
      </div>
    </motion.div>
  );
}