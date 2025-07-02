'use client';
import { useState } from 'react';

interface ScalabilityResult {
  computeScore: number;
  resourceScore: number;
  costScore: number;
  totalScore: number;
  recommendations: string[];
}

interface ScalabilityFactor {
  id: string;
  name: string;
  weight: number;
}

const computeFactors: ScalabilityFactor[] = [
  { id: 'peak-performance', name: '峰值算力', weight: 0.4 },
  { id: 'scalability', name: '可擴展性', weight: 0.3 },
  { id: 'load-balancing', name: '負載均衡', weight: 0.3 },
];

const resourceFactors: ScalabilityFactor[] = [
  { id: 'resource-allocation', name: '資源分配', weight: 0.4 },
  { id: 'multi-cluster', name: '多集群支持', weight: 0.3 },
  { id: 'edge-computing', name: '邊緣計算', weight: 0.3 },
];

const costFactors: ScalabilityFactor[] = [
  { id: 'resource-utilization', name: '資源利用率', weight: 0.4 },
  { id: 'auto-scaling', name: '自動擴縮容', weight: 0.3 },
  { id: 'cost-control', name: '成本控制', weight: 0.3 },
];

export default function WorkloadScalabilityCalculator() {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScalabilityResult | null>(null);

  const handleScoreChange = (factorId: string, value: string) => {
    setScores(prev => ({
      ...prev,
      [factorId]: parseInt(value),
    }));
  };

  const calculateScalability = () => {
    // 計算各維度分數
    const calculateDimensionScore = (factors: ScalabilityFactor[]) => {
      return factors.reduce((acc, factor) => {
        return acc + (scores[factor.id] || 0) * factor.weight;
      }, 0);
    };

    const computeScore = calculateDimensionScore(computeFactors);
    const resourceScore = calculateDimensionScore(resourceFactors);
    const costScore = calculateDimensionScore(costFactors);

    // 計算總分
    const totalScore = (computeScore + resourceScore + costScore) / 3;

    // 生成建議
    const recommendations: string[] = [];
    if (computeScore < 7) {
      recommendations.push('建議提升計算基礎設施的性能和彈性');
    }
    if (resourceScore < 7) {
      recommendations.push('建議優化資源管理策略，提高資源利用效率');
    }
    if (costScore < 7) {
      recommendations.push('建議實施更嚴格的成本控制措施');
    }

    setResult({
      computeScore,
      resourceScore,
      costScore,
      totalScore,
      recommendations,
    });
  };

  const renderScoreInputs = (factors: ScalabilityFactor[], title: string) => (
    <div className="space-y-4">
      <h3 className="text-xl font-medium text-gray-900">{title}</h3>
      {factors.map(factor => (
        <div key={factor.id}>
          <label className="mb-1 block text-base font-medium text-gray-700">
            {factor.name} (1-10)
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={scores[factor.id] || ''}
            onChange={e => handleScoreChange(factor.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-8">
      {renderScoreInputs(computeFactors, '計算能力評估')}
      {renderScoreInputs(resourceFactors, '資源彈性評估')}
      {renderScoreInputs(costFactors, '成本效率評估')}

      <button
        onClick={calculateScalability}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算評估結果
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h3 className="text-xl font-medium text-gray-900">評估結果</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base text-gray-500">計算能力得分</p>
              <p className="text-xl font-medium text-gray-900">
                {result.computeScore.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">資源彈性得分</p>
              <p className="text-xl font-medium text-gray-900">
                {result.resourceScore.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">成本效率得分</p>
              <p className="text-xl font-medium text-gray-900">
                {result.costScore.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">總體評分</p>
              <p className="text-xl font-medium text-gray-900">
                {result.totalScore.toFixed(1)}
              </p>
            </div>
          </div>
          {result.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="mb-2 text-base font-medium text-gray-900">
                改進建議
              </h4>
              <ul className="list-disc space-y-1 pl-5">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-base text-gray-600">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
