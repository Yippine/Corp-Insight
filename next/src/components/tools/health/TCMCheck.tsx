'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ChevronRight, ChevronDown, Filter, Stethoscope } from 'lucide-react';

// 體質類型定義
const constitutionTypes = [
  {
    id: 'balanced',
    name: '平和體質',
    description: '平和體質是人體最理想的狀態，屬於陰陽氣血平衡的體質。',
    characteristics: [
      '面色紅潤有光澤',
      '精力充沛',
      '睡眠良好',
      '體形勻稱',
      '性格開朗',
      '對外界環境適應能力強'
    ],
    advice: [
      '保持良好的生活習慣',
      '均衡飲食',
      '適當運動',
      '保持愉快心情',
      '避免過度勞累'
    ]
  },
  {
    id: 'qi-deficiency',
    name: '氣虛體質',
    description: '氣虛體質的人主要表現為體內元氣不足，容易疲勞，抵抗力較弱。',
    characteristics: [
      '容易疲乏',
      '說話聲音低弱',
      '容易出汗',
      '活動後氣短',
      '舌淡苔薄',
      '脈弱'
    ],
    advice: [
      '飲食宜溫熱易消化',
      '適合溫補性食物如紅棗、黃耆、山藥等',
      '適當鍛煉如太極拳、散步',
      '避免過度勞累',
      '保持充足睡眠'
    ]
  },
  {
    id: 'yang-deficiency',
    name: '陽虛體質',
    description: '陽虛體質的人主要表現為體內陽氣不足，畏寒怕冷，四肢發涼。',
    characteristics: [
      '怕冷，手腳發涼',
      '面色蒼白或晦暗',
      '喜歡熱飲',
      '大便稀溏',
      '精神不振',
      '舌淡胖，苔白'
    ],
    advice: [
      '飲食宜溫熱，避免生冷食物',
      '適合溫陽食物如羊肉、韭菜、桂圓等',
      '保暖防寒',
      '適當進行陽光浴',
      '避免長時間處於寒冷環境'
    ]
  },
  {
    id: 'yin-deficiency',
    name: '陰虛體質',
    description: '陰虛體質的人主要表現為體內陰液不足，容易上火，手腳心熱。',
    characteristics: [
      '手腳心熱',
      '口乾舌燥',
      '面部潮紅',
      '容易煩躁',
      '眼睛乾澀',
      '舌紅苔少'
    ],
    advice: [
      '飲食宜清淡滋潤，避免辛辣刺激食物',
      '適合滋陰食物如百合、銀耳、梨等',
      '保持充足休息',
      '避免熬夜',
      '保持心情平靜'
    ]
  },
  {
    id: 'phlegm-dampness',
    name: '痰濕體質',
    description: '痰濕體質的人主要表現為體內水液代謝不暢，容易肥胖，痰多。',
    characteristics: [
      '體形肥胖',
      '腹部鬆軟',
      '容易疲乏',
      '痰多',
      '口黏膩',
      '舌苔厚膩'
    ],
    advice: [
      '飲食宜清淡，避免油膩、甜膩食物',
      '適合化濕食物如薏仁、冬瓜、赤小豆等',
      '規律作息，避免久坐',
      '適當進行有氧運動',
      '保持環境乾燥通風'
    ]
  }
];

// 問題列表
const questions = [
  {
    id: 'q1',
    text: '您是否容易感到疲勞？',
    options: [
      { value: 1, text: '從不或很少' },
      { value: 2, text: '有時' },
      { value: 3, text: '經常' },
      { value: 4, text: '總是' }
    ],
    types: { 'qi-deficiency': 3, 'yang-deficiency': 2, 'balanced': -2 }
  },
  {
    id: 'q2',
    text: '您是否怕冷，手腳容易發涼？',
    options: [
      { value: 1, text: '從不或很少' },
      { value: 2, text: '有時' },
      { value: 3, text: '經常' },
      { value: 4, text: '總是' }
    ],
    types: { 'yang-deficiency': 3, 'yin-deficiency': -2, 'balanced': -1 }
  },
  {
    id: 'q3',
    text: '您是否容易口乾舌燥，手腳心發熱？',
    options: [
      { value: 1, text: '從不或很少' },
      { value: 2, text: '有時' },
      { value: 3, text: '經常' },
      { value: 4, text: '總是' }
    ],
    types: { 'yin-deficiency': 3, 'yang-deficiency': -2, 'balanced': -1 }
  },
  {
    id: 'q4',
    text: '您的體型是否偏胖，腹部鬆軟？',
    options: [
      { value: 1, text: '完全不是' },
      { value: 2, text: '有一點' },
      { value: 3, text: '比較明顯' },
      { value: 4, text: '非常明顯' }
    ],
    types: { 'phlegm-dampness': 3, 'qi-deficiency': 1, 'balanced': -2 }
  },
  {
    id: 'q5',
    text: '您精力如何，是否充沛？',
    options: [
      { value: 4, text: '非常充沛' },
      { value: 3, text: '比較充沛' },
      { value: 2, text: '一般' },
      { value: 1, text: '不太充沛' }
    ],
    types: { 'balanced': 3, 'qi-deficiency': -2, 'yang-deficiency': -1 }
  }
];

export default function TCMCheck() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    mainType: string;
    secondaryType: string | null;
    scores: Record<string, number>;
  } | null>(null);
  const [showDetail, setShowDetail] = useState<string | null>(null);

  // 處理選項變更
  const handleOptionChange = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  // 分析結果
  const analyzeResult = () => {
    // 初始化得分
    const scores: Record<string, number> = {
      'balanced': 0,
      'qi-deficiency': 0,
      'yang-deficiency': 0,
      'yin-deficiency': 0,
      'phlegm-dampness': 0
    };

    // 計算每個體質的得分
    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        Object.entries(question.types).forEach(([type, weight]) => {
          scores[type] += answer * weight;
        });
      }
    });

    // 找出得分最高的兩種體質
    const sortedTypes = Object.entries(scores)
      .sort((a, b) => b[1] - a[1]);
    
    const mainType = sortedTypes[0][0];
    const secondaryType = sortedTypes[1][1] > 0 ? sortedTypes[1][0] : null;

    setResult({
      mainType,
      secondaryType,
      scores
    });
  };

  // 重置
  const resetForm = () => {
    setAnswers({});
    setResult(null);
    setShowDetail(null);
  };

  // 渲染問卷
  const renderQuestions = () => (
    <div className="space-y-6">
      {questions.map(question => (
        <div key={question.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <h4 className="font-medium text-gray-800 mb-3">{question.text}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.options.map(option => (
              <button
                key={option.value}
                className={`px-4 py-2 rounded-md text-left transition-all ${
                  answers[question.id] === option.value
                    ? 'bg-blue-100 border-blue-300 text-blue-800 border'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => handleOptionChange(question.id, option.value)}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-6 py-2.5 rounded-lg text-white font-medium transition-all ${
            Object.keys(answers).length < questions.length
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg'
          }`}
          onClick={analyzeResult}
          disabled={Object.keys(answers).length < questions.length}
        >
          <span>分析我的體質</span>
        </motion.button>
      </div>
    </div>
  );

  // 渲染結果
  const renderResult = () => {
    if (!result) return null;

    const mainTypeData = constitutionTypes.find(type => type.id === result.mainType);
    const secondaryTypeData = result.secondaryType 
      ? constitutionTypes.find(type => type.id === result.secondaryType) 
      : null;

    if (!mainTypeData) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6"
      >
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-xl border border-teal-100 mb-8">
          <div className="flex items-center mb-4">
            <Stethoscope className="h-6 w-6 text-teal-600 mr-2" />
            <h3 className="text-xl font-semibold text-teal-800">
              您的主要體質是：{mainTypeData.name}
            </h3>
          </div>
          
          <p className="text-teal-700 mb-4">{mainTypeData.description}</p>
          
          {secondaryTypeData && (
            <div className="mb-4">
              <p className="text-teal-600 font-medium">
                您還具有 {secondaryTypeData.name} 的特點
              </p>
            </div>
          )}

          {/* 主要體質詳情 */}
          <div className="mt-6">
            <button
              className="flex items-center justify-between w-full text-left p-4 bg-white rounded-lg shadow-sm border border-teal-200"
              onClick={() => setShowDetail(showDetail === 'main' ? null : 'main')}
            >
              <span className="font-medium text-teal-800">{mainTypeData.name} 詳細信息</span>
              {showDetail === 'main' ? <ChevronDown size={20} className="text-teal-600" /> : <ChevronRight size={20} className="text-teal-600" />}
            </button>
            
            {showDetail === 'main' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-2 p-4 bg-white rounded-lg border border-teal-100"
              >
                <div className="mb-4">
                  <h4 className="font-medium text-teal-700 mb-2">體質特徵：</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {mainTypeData.characteristics.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-teal-700 mb-2">養生建議：</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700">
                    {mainTypeData.advice.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

          {/* 次要體質詳情 */}
          {secondaryTypeData && (
            <div className="mt-4">
              <button
                className="flex items-center justify-between w-full text-left p-4 bg-white rounded-lg shadow-sm border border-teal-200"
                onClick={() => setShowDetail(showDetail === 'secondary' ? null : 'secondary')}
              >
                <span className="font-medium text-teal-800">{secondaryTypeData.name} 詳細信息</span>
                {showDetail === 'secondary' ? <ChevronDown size={20} className="text-teal-600" /> : <ChevronRight size={20} className="text-teal-600" />}
              </button>
              
              {showDetail === 'secondary' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-2 p-4 bg-white rounded-lg border border-teal-100"
                >
                  <div className="mb-4">
                    <h4 className="font-medium text-teal-700 mb-2">體質特徵：</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {secondaryTypeData.characteristics.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-teal-700 mb-2">養生建議：</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      {secondaryTypeData.advice.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 rounded-md text-teal-700 font-medium border border-teal-300 bg-white hover:bg-teal-50 transition-all"
              onClick={resetForm}
            >
              重新測試
            </motion.button>
          </div>
        </div>

        <div className="text-sm text-gray-500 italic text-center">
          注意：本測試僅供參考，如有健康問題請諮詢專業中醫師。
        </div>
      </motion.div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          瞭解您的中醫體質傾向
        </h3>
        <p className="text-gray-600">
          通過回答以下簡單問題，瞭解您的中醫體質類型，獲取個人化的養生建議。
          請選擇最符合您日常情況的選項。
        </p>
      </div>

      {!result ? renderQuestions() : renderResult()}
    </div>
  );
}