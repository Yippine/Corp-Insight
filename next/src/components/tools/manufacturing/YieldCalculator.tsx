'use client';
import { useState } from 'react';
import Instructions from '../Instructions';

interface CalculationResult {
  yield: number;
  defectRate: number;
  totalCost: number;
  lossCost: number;
}

export default function YieldCalculator() {
  const [totalQuantity, setTotalQuantity] = useState('1000');
  const [defectQuantity, setDefectQuantity] = useState('50');
  const [unitCost, setUnitCost] = useState('100');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateYield = () => {
    const total = parseInt(totalQuantity);
    const defects = parseInt(defectQuantity);
    const cost = parseFloat(unitCost);

    const yieldRate = ((total - defects) / total) * 100;
    const defectRate = (defects / total) * 100;
    const totalCost = total * cost;
    const lossCost = defects * cost;

    setResult({
      yield: yieldRate,
      defectRate: defectRate,
      totalCost: totalCost,
      lossCost: lossCost
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Instructions
        what="良率計算器用於計算生產過程中的良品率和相關成本。"
        why="良率分析可以幫助識別生產問題，評估品質改善成效，並計算不良品造成的損失。"
        how="輸入總生產量、不良品數量和單件成本，計算器會顯示良率百分比和損失金額。計算公式：良率 = (總數量-不良品數量)/總數量×100%，損失成本 = 不良品數量×單件成本。"
      />
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            總生產量 (件)
          </label>
          <input
            type="number"
            value={totalQuantity}
            onChange={(e) => setTotalQuantity(e.target.value)}
            min="1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            不良品數量 (件)
          </label>
          <input
            type="number"
            value={defectQuantity}
            onChange={(e) => setDefectQuantity(e.target.value)}
            min="0"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            單件成本 (NT$)
          </label>
          <input
            type="number"
            value={unitCost}
            onChange={(e) => setUnitCost(e.target.value)}
            min="0"
            step="0.1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculateYield}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          計算良率與損失
        </button>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-medium text-gray-900">計算結果</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base text-gray-500">良率</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.yield.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">不良率</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.defectRate.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">總成本</p>
                <p className="text-xl font-medium text-gray-900">
                  NT$ {result.totalCost.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">損失成本</p>
                <p className="text-xl font-medium text-gray-900">
                  NT$ {result.lossCost.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}