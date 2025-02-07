import React, { useState } from 'react';
import { questions, constitutions } from '../data/constitutions';
import { ChevronRight } from 'lucide-react';

const QuestionnaireForm = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const calculateResults = () => {
    const scores: Record<string, number> = {};
    
    // Initialize scores
    constitutions.forEach(constitution => {
      scores[constitution.id] = 0;
    });

    // Calculate scores based on answers
    Object.entries(answers).forEach(([questionId, value]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        Object.entries(question.constitutions).forEach(([constitutionId, weight]) => {
          // 將0-4的評分轉換為百分比分數
          const normalizedValue = (value / 4) * 100;
          scores[constitutionId] += normalizedValue * (weight / 3);
        });
      }
    });

    // 根據分數判定體質
    const matchedConstitutions = [];
    
    // 先檢查是否符合平和質的條件
    if (scores['balanced'] >= constitutions.find(c => c.id === 'balanced')!.threshold * 10) {
      matchedConstitutions.push('balanced');
    } else {
      // 如果不是平和質，檢查其他體質
      for (const constitution of constitutions) {
        if (constitution.id !== 'balanced' && 
            scores[constitution.id] >= constitution.threshold * 10) {
          matchedConstitutions.push(constitution.id);
        }
      }
    }

    // 如果沒有符合任何體質，預設為平和質
    if (matchedConstitutions.length === 0) {
      matchedConstitutions.push('balanced');
    }

    setResults(matchedConstitutions);
    setShowResults(true);
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">您的體質評估結果</h2>
        {results.map(resultId => {
          const constitution = constitutions.find(c => c.id === resultId)!;
          return (
            <div key={resultId} className="mb-8 bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">{constitution.name}</h3>
              <p className="text-gray-600 mb-4">{constitution.description}</p>
              <h4 className="font-semibold mb-2">調理建議：</h4>
              <ul className="list-disc pl-5">
                {constitution.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600 mb-1">{rec}</li>
                ))}
              </ul>
            </div>
          );
        })}
        <button
          onClick={() => setShowResults(false)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          重新測試
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">中醫體質評估問卷</h1>
      <div className="space-y-6">
        {questions.map(question => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg mb-4">{question.text}</p>
            <div className="flex items-center space-x-4">
              {[0, 1, 2, 3, 4].map(value => (
                <label key={value} className="flex flex-col items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={value}
                    checked={answers[question.id] === value}
                    onChange={() => handleAnswerChange(question.id, value)}
                    className="mb-2"
                  />
                  <span className="text-sm">{value}</span>
                </label>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>無</span>
              <span>輕度</span>
              <span>中度</span>
              <span>較重</span>
              <span>嚴重</span>
            </div>
          </div>
        ))}
        <button
          onClick={calculateResults}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          提交評估 <ChevronRight className="ml-2 h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default QuestionnaireForm;