'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// 修改所有元件的漸層色系為藍色調組合
const colorPalette = {
  primary: 'hsl(210, 60%, 55%)',      // 主藍色
  secondary: 'hsl(240, 50%, 60%)',   // 靛藍色
  accent1: 'hsl(190, 70%, 60%)',     // 青藍色
  accent2: 'hsl(270, 50%, 65%)',     // 淡紫色
  highlight: 'hsl(180, 70%, 65%)'    // 青綠色
};

// 內聯 Loading - 用於內容區塊
export const InlineLoading = () => (
  <div className="flex items-center justify-center p-8 flex-col">
    <div className="relative w-40 h-40">
      {/* 核心光環動畫 - 使用 will-change 優化效能 */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${colorPalette.primary}, ${colorPalette.highlight}, ${colorPalette.secondary})`,
          opacity: 0.5,
          willChange: 'transform'
        }}
        animate={{ 
          rotate: 360,
        }}
        transition={{
          rotate: {
            duration: 4, // 降低動畫頻率以提升效能
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />

      {/* 同步光暈層 - 使用 CSS transform 代替 motion.rotate */}
      <div
        className="absolute -inset-8 opacity-30 animate-spin-slow"
        style={{
          background: `radial-gradient(circle, ${colorPalette.primary}, transparent 70%)`,
          filter: 'blur(20px)',
          willChange: 'transform',
          animation: 'spin 6s linear infinite'
        }}
      />

      {/* 恆定星雲層 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at center, transparent 30%, ${colorPalette.primary}22 40%, ${colorPalette.secondary}33 60%, transparent 70%)`,
          filter: 'blur(8px)',
          transform: 'rotate(0deg) scale(1.5)'
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          rotate: {
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }
        }}
      />

      {/* 主能量環 */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `conic-gradient(from 0deg, 
            ${colorPalette.primary}00, 
            ${colorPalette.primary}ff,
            ${colorPalette.secondary}ff,
            ${colorPalette.primary}ff,
            ${colorPalette.primary}00
          )`,
          borderRadius: '50%',
          filter: 'blur(1px)'
        }}
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* 同步光波層 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{
            border: `2px solid ${colorPalette.primary}`,
            opacity: 0.3
          }}
          animate={{
            rotate: 360,
            opacity: [0.3, 0]
          }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            },
            opacity: {
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeOut"
            }
          }}
        />
      ))}

      {/* 穩定能量核心 */}
      <motion.div
        className="absolute inset-0 m-auto w-16 h-16"
        style={{
          background: `radial-gradient(circle, white, ${colorPalette.primary})`,
          borderRadius: '50%',
          filter: 'blur(2px)',
          boxShadow: `0 0 30px ${colorPalette.primary}`
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* 恆定中心光點 */}
      <div
        className="absolute inset-0 m-auto w-8 h-8 rounded-full"
        style={{
          background: 'radial-gradient(circle, white, rgba(255,255,255,0.8))',
          boxShadow: '0 0 20px rgba(255,255,255,0.8)',
          filter: 'blur(1px)'
        }}
      />
    </div>

    {/* Loading 文字與動態點點 - 優化字體樣式 */}
    <div className="mt-8 flex items-center">
      <motion.span
        className="text-[1.5rem] font-bold tracking-wider"
        style={{
          color: colorPalette.primary,
          textShadow: `
            0 0 15px ${colorPalette.primary}60,
            0 0 30px ${colorPalette.primary}40
          `,
          WebkitTextStroke: `1px ${colorPalette.primary}40`
        }}
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Loading
      </motion.span>
      <div className="flex space-x-2 ml-3">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{
              background: colorPalette.primary,
              boxShadow: `0 0 10px ${colorPalette.primary}`,
              willChange: 'transform, opacity'
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// 按鈕 Loading - 用於表單提交
export const ButtonLoading = ({ text = "處理中..." }: { text?: string }) => (
  <motion.span 
    className="flex items-center justify-center space-x-2 relative"
    initial={{ opacity: 0.8 }}
  >
    {/* 載入圖示 */}
    <motion.div
      className="relative"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Loader2 className="w-5 h-5" />
    </motion.div>

    {/* 文字 */}
    <motion.span
      animate={{
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="relative"
    >
      {text}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent, currentColor, transparent)'
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.span>
  </motion.span>
);

// Block Loading - 用於內容區域載入
export const BlockLoading = ({ overlay = false }: { overlay?: boolean }) => {
  return (
    <div className={`${overlay ? 'absolute inset-0 bg-white/80 backdrop-blur-sm z-10' : ''} flex items-center justify-center p-4`}>
      <div className="relative flex flex-col items-center">
        {/* 旋轉光圈 */}
        <motion.div
          className="w-12 h-12 rounded-full"
          style={{
            border: `3px solid transparent`,
            borderTopColor: colorPalette.primary,
            borderRightColor: colorPalette.secondary,
            willChange: 'transform'
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* 內部脈動 */}
        <motion.div 
          className="absolute inset-0 m-auto w-6 h-6 rounded-full"
          style={{
            background: colorPalette.primary,
            boxShadow: `0 0 15px ${colorPalette.primary}`,
            willChange: 'transform, opacity'
          }}
          animate={{
            scale: [0.8, 1.1, 0.8],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 文字 */}
        <motion.div
          className="mt-3 text-sm font-medium"
          style={{ color: colorPalette.primary }}
          animate={{
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          loading...
        </motion.div>
      </div>
    </div>
  );
};

// 迷你 Loading - 用於小區域空間
export const MiniLoading = () => (
  <div className="inline-flex items-center justify-center">
    <motion.div
      className="w-6 h-6 rounded-full border-2 border-t-blue-500 border-r-blue-400 border-b-transparent border-l-transparent"
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  </div>
);

// 進度 Loading - 帶有進度指示的載入元件
export const ProgressLoading = ({ progress = 0 }: { progress: number }) => (
  <div className="flex flex-col items-center justify-center p-4">
    <div className="w-40 h-3 bg-gray-200 rounded-full overflow-hidden">
      <motion.div 
        className="h-full rounded-full"
        style={{ 
          background: `linear-gradient(90deg, ${colorPalette.primary}, ${colorPalette.secondary})`,
          width: `${progress}%` 
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
    <motion.div
      className="mt-2 text-sm font-medium"
      style={{ color: colorPalette.primary }}
      animate={{
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {progress}% completed
    </motion.div>
  </div>
);