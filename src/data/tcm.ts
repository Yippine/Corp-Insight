export interface Question {
    id: string;
    text: string;
    constitutions: Record<string, number>;
  }
  
  export interface Constitution {
    id: string;
    name: string;
    description: string;
    threshold: number;
    recommendations: string[];
  }
  
  export const constitutions: Constitution[] = [
    {
      id: 'balanced',
      name: '平和',
      description: '平和體質是最理想的體質類型，具有陰陽氣血調和的特點。',
      threshold: 48,
      recommendations: [
        '保持規律的作息時間',
        '均衡飲食，注意營養',
        '適度運動，保持活力',
        '保持良好的心情'
      ]
    },
    {
      id: 'qi-deficiency',
      name: '氣虛',
      description: '氣虛體質表現為容易疲勞，氣短乏力等特徵。',
      threshold: 20,
      recommendations: [
        '注意休息，避免過度勞累',
        '飲食宜溫熱，多食補氣食物',
        '適合緩和運動，如太極拳',
        '保持心情舒暢，避免憂慮'
      ]
    },
    {
      id: 'yang-deficiency',
      name: '陽虛',
      description: '陽虛體質表現為怕冷，手腳發涼等特徵。',
      threshold: 18,
      recommendations: [
        '注意保暖，特別是腹部和四肢',
        '飲食宜溫熱，避免生冷',
        '適合溫和運動，增加陽氣',
        '保持樂觀心態'
      ]
    },
    {
      id: 'yin-deficiency',
      name: '陰虛',
      description: '陰虛體質表現為口乾、手腳心熱等特徵。',
      threshold: 18,
      recommendations: [
        '保持充足睡眠',
        '飲食宜清淡，多食滋陰食物',
        '避免劇烈運動',
        '保持心平氣和'
      ]
    },
    {
      id: 'phlegm-dampness',
      name: '痰濕',
      description: '痰濕體質表現為容易疲勞，體型偏胖等特徵。',
      threshold: 16,
      recommendations: [
        '保持規律作息，早睡早起',
        '飲食清淡，少食多餐',
        '適合有氧運動',
        '保持心情愉快'
      ]
    },
    {
      id: 'damp-heat',
      name: '濕熱',
      description: '濕熱體質表現為容易口渴，大便乾結等特徵。',
      threshold: 16,
      recommendations: [
        '保持作息規律',
        '飲食宜清淡，避免辛辣',
        '適量運動，促進代謝',
        '保持心情平和'
      ]
    },
    {
      id: 'blood-stasis',
      name: '血瘀',
      description: '血瘀體質表現為面色晦暗，容易瘀斑等特徵。',
      threshold: 15,
      recommendations: [
        '保持良好作息',
        '飲食宜溫和，避免過冷過熱',
        '適量運動，促進血液循環',
        '保持心情舒暢'
      ]
    },
    {
      id: 'qi-stagnation',
      name: '氣鬱',
      description: '氣鬱體質表現為容易情緒波動，胸悶等特徵。',
      threshold: 15,
      recommendations: [
        '保持規律作息',
        '飲食有節制，不暴飲暴食',
        '適量運動，舒展身心',
        '學會調節情緒'
      ]
    },
    {
      id: 'special',
      name: '特稟',
      description: '特稟體質表現為容易過敏，免疫力較弱等特徵。',
      threshold: 12,
      recommendations: [
        '注意起居有常',
        '飲食要特別注意',
        '根據體質選擇運動',
        '保持心情愉快'
      ]
    }
  ] as const;
  
  export const questions: Question[] = [
    // 平和質相關問題
    {
      id: 'q1',
      text: '您的精力是否充沛，很少感到疲勞？（0 分代表總是疲勞，4 分代表精力充沛）',
      constitutions: {
        'balanced': 3,
        'qi-deficiency': -1
      }
    },
    {
      id: 'q2',
      text: '您的食慾和消化功能是否正常？（0 分代表消化很差，4 分代表消化良好）',
      constitutions: {
        'balanced': 3,
        'qi-deficiency': -1,
        'phlegm-dampness': -1
      }
    },
    // 氣虛質相關問題
    {
      id: 'q3',
      text: '您是否容易疲勞，即使不劇烈運動也會感到體力不支？（0 分代表從不疲勞，4 分代表經常疲勞）',
      constitutions: {
        'qi-deficiency': 3,
        'balanced': -1
      }
    },
    {
      id: 'q4',
      text: '您是否容易氣喘，說話聲音低弱無力？（0 分代表聲音洪亮，4 分代表經常氣喘無力）',
      constitutions: {
        'qi-deficiency': 3
      }
    },
    // 陽虛質相關問題
    {
      id: 'q5',
      text: '您是否特別怕冷，手腳經常發涼？（0 分代表從不怕冷，4 分代表經常怕冷）',
      constitutions: {
        'yang-deficiency': 3,
        'balanced': -1
      }
    },
    {
      id: 'q6',
      text: '您是否經常腹瀉，特別是在天冷或吃涼的食物後？（0 分代表從不腹瀉，4 分代表經常腹瀉）',
      constitutions: {
        'yang-deficiency': 3
      }
    },
    // 陰虛質相關問題
    {
      id: 'q7',
      text: '您是否經常感到口乾，特別是在晚上？（0 分代表從不口乾，4 分代表經常口乾）',
      constitutions: {
        'yin-deficiency': 3
      }
    },
    {
      id: 'q8',
      text: '您是否容易失眠，睡眠質量差？（0 分代表睡眠良好，4 分代表經常失眠）',
      constitutions: {
        'yin-deficiency': 3,
        'balanced': -1
      }
    },
    // 痰濕質相關問題
    {
      id: 'q9',
      text: '您的體型是否偏胖，特別是腹部容易積累脂肪？（0 分代表體型正常，4 分代表明顯肥胖）',
      constitutions: {
        'phlegm-dampness': 3,
        'balanced': -1
      }
    },
    {
      id: 'q10',
      text: '您是否經常感覺口粘膩，痰多？（0 分代表從不口粘，4 分代表經常口粘痰多）',
      constitutions: {
        'phlegm-dampness': 3
      }
    },
    // 濕熱質相關問題
    {
      id: 'q11',
      text: '您是否容易口苦、口臭，或經常覺得口中有異味？（0 分代表從不口苦，4 分代表經常口苦）',
      constitutions: {
        'damp-heat': 3
      }
    },
    {
      id: 'q12',
      text: '您是否容易長痘痘，皮膚容易發炎？（0 分代表皮膚良好，4 分代表經常長痘）',
      constitutions: {
        'damp-heat': 3,
        'balanced': -1
      }
    },
    // 血瘀質相關問題
    {
      id: 'q13',
      text: '您的面色是否晦暗，或容易有瘀斑？（0 分代表面色紅潤，4 分代表面色晦暗）',
      constitutions: {
        'blood-stasis': 3,
        'balanced': -1
      }
    },
    {
      id: 'q14',
      text: '您是否經常感覺身體某處刺痛或固定部位疼痛？（0 分代表從不疼痛，4 分代表經常疼痛）',
      constitutions: {
        'blood-stasis': 3
      }
    },
    // 氣鬱質相關問題
    {
      id: 'q15',
      text: '您是否容易感到胸悶、嘆氣，或情緒低落？（0 分代表從不胸悶，4 分代表經常胸悶）',
      constitutions: {
        'qi-stagnation': 3,
        'balanced': -1
      }
    },
    {
      id: 'q16',
      text: '您是否容易焦慮、憂慮，或對事物過度擔心？（0 分代表從不焦慮，4 分代表經常焦慮）',
      constitutions: {
        'qi-stagnation': 3
      }
    },
    // 特稟質相關問題
    {
      id: 'q17',
      text: '您是否容易過敏（如花粉、食物、藥物等）？（0 分代表從不過敏，4 分代表經常過敏）',
      constitutions: {
        'special': 3,
        'balanced': -1
      }
    },
    {
      id: 'q18',
      text: '您是否特別容易感冒，或免疫力較弱？（0 分代表很少感冒，4 分代表經常感冒）',
      constitutions: {
        'special': 3,
        'balanced': -1
      }
    },
    // 綜合性問題
    {
      id: 'q19',
      text: '您的大便是否正常，不會太乾也不會太稀？（0 分代表大便異常，4 分代表大便正常）',
      constitutions: {
        'balanced': 3,
        'yin-deficiency': -1,
        'yang-deficiency': -1
      }
    },
    {
      id: 'q20',
      text: '您的情緒是否穩定，很少有劇烈波動？（0 分代表情緒不穩，4 分代表情緒穩定）',
      constitutions: {
        'balanced': 3,
        'qi-stagnation': -1,
        'yin-deficiency': -1
      }
    }
  ];