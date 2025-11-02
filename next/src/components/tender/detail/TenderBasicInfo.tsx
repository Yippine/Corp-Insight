'use client';

import { motion } from 'framer-motion';
import { Section } from '@/hooks/useTenderDetail';
import FieldRenderer, {
  FieldRendererProvider,
} from '../detail-components/FieldRenderer';

interface TenderBasicInfoProps {
  section: Section;
}

export default function TenderBasicInfo({ section }: TenderBasicInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-lg bg-white shadow-lg"
    >
      <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4">
        <h3 className="flex items-center text-xl font-semibold text-gray-800">
          <span className="mr-3 h-6 w-2 rounded-full bg-blue-500"></span>
          {section.title}
        </h3>
      </div>

      <div className="space-y-6 px-6 py-5">
        <FieldRendererProvider>
          <dl
            className={`grid ${['投標廠商', '決標品項'].includes(section.title) ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}
          >
            {section.fields.map((field, index) => (
              <div
                key={index}
                className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <FieldRenderer
                  field={field}
                  depth={0}
                  sectionTitle={section.title}
                />
              </div>
            ))}
          </dl>
        </FieldRendererProvider>
      </div>
    </motion.div>
  );
}
