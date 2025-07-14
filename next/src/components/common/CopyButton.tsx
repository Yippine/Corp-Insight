'use client';

import { useState, type FC } from 'react';
import { Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
}

const CopyButton: FC<CopyButtonProps> = ({ textToCopy, className }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // You could add some user-facing error feedback here if you want
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className={`absolute top-2 right-2 p-1.5 rounded-lg bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 hover:text-gray-700 transition-all duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 ${className || ''}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isCopied ? '已複製' : '複製'}
      title={isCopied ? '已複製!' : '複製'}
    >
      {isCopied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </motion.button>
  );
};

export default CopyButton;