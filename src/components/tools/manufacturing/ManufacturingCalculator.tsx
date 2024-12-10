import { useState } from 'react';
import Instructions from '../Instructions';

interface CalculationResult {
  spindleSpeed: number;
  feedRate: number;
}

const materials = [
  { id: 'steel', name: '碳鋼', cuttingSpeed: 30 },
  { id: 'stainless', name: '不鏽鋼', cuttingSpeed: 25 },
  { id: 'aluminum', name: '鋁合金', cuttingSpeed: 100 },
  { id: 'brass', name: '黃銅', cuttingSpeed: 90 },
  { id: 'cast-iron', name: '鑄鐵', cuttingSpeed: 40 }
];

export default function ManufacturingCalculator() {
  const [material, setMaterial] = useState(materials[0].id);
  const [toolDiameter, setToolDiameter] = useState('10');
  const [cuttingDepth, setCuttingDepth] = useState('1');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateParameters = () => {
    const selectedMaterial = materials.find(m => m.id === material);
    if (!selectedMaterial) return;

    const diameter = parseFloat(toolDiameter);
    const depth = parseFloat(cuttingDepth);
    
    // 計算主軸轉速 (RPM) = (切削速度 × 1000) / (π × 刀具直徑)
    const spindleSpeed = Math.round((selectedMaterial.cuttingSpeed * 1000) / (Math.PI * diameter));
    
    // 計算進給速度 (mm/min) = 轉速 × 每刃進給 × 刀具刃數
    // 假設每刃進給為0.1mm，4刃刀具
    const feedRate = Math.round(spindleSpeed * 0.1 * 4);

    setResult({ spindleSpeed, feedRate });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Instructions
        what="工具機加工參數計算器是一個幫助您確定最佳切削參數的工具。"
        why="正確的加工參數可以提高加工效率、延長刀具壽命，並確保加工品質。"
        how="輸入材料類型、刀具直徑和切削深度，計算器會根據材料特性和加工經驗值，推薦最適合的主軸轉速和進給速度。計算公式：主軸轉速(RPM) = (切削速度×1000)/(π×刀具直徑)，進給速度 = 轉速×每刃進給×刀具刃數。"
      />
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            材料類型
          </label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            刀具直徑 (mm)
          </label>
          <input
            type="number"
            value={toolDiameter}
            onChange={(e) => setToolDiameter(e.target.value)}
            min="1"
            step="0.1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">
            切削深度 (mm)
          </label>
          <input
            type="number"
            value={cuttingDepth}
            onChange={(e) => setCuttingDepth(e.target.value)}
            min="0.1"
            step="0.1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculateParameters}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          計算參數
        </button>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-xl font-medium text-gray-900">計算結果</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base text-gray-500">建議主軸轉速</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.spindleSpeed.toLocaleString()} RPM
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">建議進給速度</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.feedRate.toLocaleString()} mm/min
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}