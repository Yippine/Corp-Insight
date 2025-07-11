'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Lightbulb, Wand2, ChevronDown } from 'lucide-react';

interface InstructionsProps {
  what: string;
  why: string;
  how: string;
}

const instructionItems = [
  {
    id: 'what',
    Icon: HelpCircle,
    title: '這是什麼？',
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },
  {
    id: 'why',
    Icon: Lightbulb,
    title: '為什麼需要？',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  {
    id: 'how',
    Icon: Wand2,
    title: '如何使用？',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
];

export default function Instructions({ what, why, how }: InstructionsProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  const contentMap: { [key: string]: string } = { what, why, how };

  return (
    <div className="w-full space-y-2">
      {instructionItems.map(({ id, Icon, title, color, bgColor }) => (
        <div key={id} className={`rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${openId === id ? `shadow-lg ${bgColor}`: 'bg-white'}`}>
          <button
            onClick={() => setOpenId(openId === id ? null : id)}
            className={`flex w-full items-center justify-between p-4 text-left font-medium ${color} transition-colors duration-300 hover:bg-gray-50/50`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`h-6 w-6 ${color}`} />
              <span className='text-lg'>{title}</span>
            </div>
            <motion.div
              animate={{ rotate: openId === id ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className={`h-5 w-5 ${color}`} />
            </motion.div>
          </button>
          <AnimatePresence>
            {openId === id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className={`p-4 pt-0 ${color} text-base`}>
                  <p className='opacity-80'>{contentMap[id]}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
