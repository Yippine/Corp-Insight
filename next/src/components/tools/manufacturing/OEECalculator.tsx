'use client';
import { useState } from 'react';
import Instructions from '../Instructions';

interface CalculationResult {
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

export default function OEECalculator() {
  const [plannedTime, setPlannedTime] = useState('480'); // 8小時
  const [downtime, setDowntime] = useState('60');
  const [idealCycleTime, setIdealCycleTime] = useState('1');
  const [totalParts, setTotalParts] = useState('400');
  const [defectParts, setDefectParts] = useState('20');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateOEE = () => {
    const planned = parseFloat(plannedTime);
    const down = parseFloat(downtime);
    const cycle = parseFloat(idealCycleTime);
    const total = parseInt(totalParts);
    const defects = parseInt(defectParts);

    // 可用性 = 運行時間 / 計劃時間
    const runningTime = planned - down;
    const availability = (runningTime / planned) * 100;

    // 性能 = (實際產出 × 理想週期時間) / 運行時間
    const performance = ((total * cycle) / runningTime) * 100;

    // 品質 = 良品數 / 總產出
    const quality = ((total - defects) / total) * 100;

    // OEE = 可用性 × 性能 × 品質
    const oee = (availability * performance * quality) / 10000;

    setResult({
      availability,
      performance,
      quality,
      oee
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Instructions
        what="OEE（設備綜合效率）計算器用於評估設備的整體使用效率。"
        why="OEE是衡量生產效率的重要指標，可以幫助識別需要改善的領域。"
        how="輸入計劃生產時間、停機時間、理想週期時間和產出數據，計算器會顯示可用性、性能和品質三個指標。計算公式：OEE = 可用性×性能×品質，其中可用性 = 運行時間/計劃時間，性能 = 實際產出/理想產出，品質 = 良品數/總產出。"
      />
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            計劃生產時間 (分鐘)
          </label>
          <input
            type="number"
            value={plannedTime}
            onChange={(e) => setPlannedTime(e.target.value)}
            min="1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            停機時間 (分鐘)
          </label>
          <input
            type="number"
            value={downtime}
            onChange={(e) => setDowntime(e.target.value)}
            min="0"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            理想週期時間 (分鐘/件)
          </label>
          <input
            type="number"
            value={idealCycleTime}
            onChange={(e) => setIdealCycleTime(e.target.value)}
            min="0.1"
            step="0.1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            總產出數量 (件)
          </label>
          <input
            type="number"
            value={totalParts}
            onChange={(e) => setTotalParts(e.target.value)}
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
            value={defectParts}
            onChange={(e) => setDefectParts(e.target.value)}
            min="0"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculateOEE}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          計算OEE
        </button>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-medium text-gray-900">計算結果</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base text-gray-500">可用性 (A)</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.availability.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">性能 (P)</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.performance.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">品質 (Q)</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.quality.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">OEE</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.oee.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}