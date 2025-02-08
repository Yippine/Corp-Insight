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
  <div className="flex items-center justify-center p-8">
    <div className="relative w-20 h-20">
      {/* 彩虹光環效果 */}
      <motion.div 
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            from 0deg, 
            ${colorPalette.primary},
            ${colorPalette.accent1},
            ${colorPalette.highlight},
            ${colorPalette.accent2},
            ${colorPalette.secondary},
            ${colorPalette.primary}
          )`,
          filter: 'blur(8px)',
          opacity: 0.5
        }}
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      {/* 主要旋轉環 */}
      <motion.div 
        className="absolute inset-0 rounded-full border-[3px]"
        style={{
          borderImage: `linear-gradient(
            45deg,
            ${colorPalette.primary},
            ${colorPalette.accent1} 30%,
            ${colorPalette.highlight} 70%,
            ${colorPalette.accent2}
          ) 1`,
          filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
        }}
        animate={{ 
          rotate: 360,
          scale: [1, 0.95, 1],
        }}
        transition={{
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1]
          },
          scale: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      {/* 中心光點 */}
      <motion.div
        className="absolute inset-0 m-auto w-4 h-4 rounded-full"
        style={{
          background: 'radial-gradient(circle, white, rgba(255,255,255,0.8))',
          boxShadow: '0 0 20px rgba(255,255,255,0.8)',
          filter: 'blur(1px)'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  </div>
);

// 按鈕 Loading - 用於表單提交
export const ButtonLoading = ({ text = "處理中..." }: { text?: string }) => (
  <motion.span 
    className="flex items-center justify-center space-x-2 relative"
    initial={{ opacity: 0.8 }}
    animate={{ 
      opacity: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    {/* 彩虹背景光暈 */}
    <motion.div
      className="absolute inset-0 rounded-lg"
      style={{
        background: `linear-gradient(
          45deg,
          ${colorPalette.primary},
          ${colorPalette.accent1} 30%,
          ${colorPalette.highlight} 70%,
          ${colorPalette.accent2}
        )`,
        filter: 'blur(8px)',
        opacity: 0.2
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.1, 0.3, 0.1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
    
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
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)',
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
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

// 全屏 Loading - 用於頁面級別載入
export const FullscreenLoading = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
    style={{
      background: 'radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
    }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative"
    >
      {/* 外層彩虹光環 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(
            from 0deg, 
            ${colorPalette.primary},
            ${colorPalette.accent1},
            ${colorPalette.highlight},
            ${colorPalette.accent2},
            ${colorPalette.secondary},
            ${colorPalette.primary}
          )`,
          filter: 'blur(15px)',
        }}
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* 中層光環 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(
            45deg,
            ${colorPalette.primary},
            ${colorPalette.accent1} 30%,
            ${colorPalette.highlight} 70%,
            ${colorPalette.accent2}
          )`,
          backdropFilter: 'blur(5px)',
        }}
        animate={{
          rotate: -360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* 主要載入區域 */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '4px solid transparent',
            borderImage: `linear-gradient(
              45deg,
              ${colorPalette.primary},
              ${colorPalette.accent1} 30%,
              ${colorPalette.highlight} 70%,
              ${colorPalette.accent2}
            ) 1`,
            filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
          }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          animate={{
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-white font-medium"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}
        >
          Loading
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

// 區塊 Loading - 用於卡片或面板
export const BlockLoading = ({ overlay = false }: { overlay?: boolean }) => {
  const content = (
    <div className="flex items-center justify-center p-4">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* 彩虹光環 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(
              from 0deg, 
              ${colorPalette.primary},
              ${colorPalette.accent1},
              ${colorPalette.highlight},
              ${colorPalette.accent2},
              ${colorPalette.secondary},
              ${colorPalette.primary}
            )`,
            filter: 'blur(8px)',
          }}
          animate={{ 
            rotate: -360,
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            },
            opacity: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        />
        
        {/* 中心光點 */}
        <motion.div
          className="absolute inset-0 m-auto w-8 h-8 rounded-full"
          style={{
            background: 'radial-gradient(circle, white 30%, rgba(255,255,255,0))',
            boxShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}
          animate={{
            scale: [0.8, 1, 0.8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );

  if (overlay) {
    return (
      <div className="absolute inset-0 backdrop-blur-[2px] flex items-center justify-center z-10"
           style={{
             background: 'radial-gradient(circle at center, rgba(255,255,255,0.1), rgba(255,255,255,0.05))'
           }}>
        {content}
      </div>
    );
  }

  return content;
};

// 微型 Loading - 用於即時搜尋等小型操作
export const MiniLoading = () => (
  <div className="inline-flex items-center space-x-1">
    {[...Array(3)].map((_, i) => (
      <motion.div
        key={i}
        className="w-2 h-2 rounded-full"
        style={{
          background: `hsl(${i * 120}, 100%, 50%)`,
          boxShadow: `0 0 10px hsla(${i * 120}, 100%, 50%, 0.5)`
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.2,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

// 進度 Loading - 用於檔案上傳等需要顯示進度的場景
export const ProgressLoading = ({ progress = 0 }: { progress: number }) => (
  <div className="w-full space-y-2">
    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden relative">
      <div 
        style={{
          background: `linear-gradient(
            90deg,
            ${colorPalette.primary},
            ${colorPalette.accent1},
            ${colorPalette.highlight},
            ${colorPalette.accent2},
            ${colorPalette.secondary}
          )`,
          filter: 'blur(4px)',
          opacity: 0.3
        }}
      />
      <motion.div
        className="h-full rounded-full"
        style={{
          background: `linear-gradient(
            90deg,
            ${colorPalette.primary} 20%,
            ${colorPalette.accent1} 50%,
            ${colorPalette.highlight} 80%
          )`,
          boxShadow: '0 0 10px rgba(255,255,255,0.5)'
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      />
    </div>
    <motion.div
      className="text-sm text-center"
      style={{
        background: `linear-gradient(
          90deg,
          ${colorPalette.primary},
          ${colorPalette.accent1},
          ${colorPalette.highlight},
          ${colorPalette.accent2},
          ${colorPalette.secondary}
        )`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 5px rgba(255,255,255,0.3)'
      }}
      animate={{
        opacity: [0.6, 1, 0.6]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {progress}%
    </motion.div>
  </div>
);