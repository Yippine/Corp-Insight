'use client';
import { useState } from 'react';

interface CalculationResult {
  requiredMemory: number;
}

export default function GPUMemoryCalculator() {
  const [parameters, setParameters] = useState('7');
  const [quantization, setQuantization] = useState('4');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateMemory = () => {
    const P = parseFloat(parameters); // 模型參數數量（以十億為單位）
    const Q = parseFloat(quantization); // 量化位數
    const B = 4; // 每個參數使用4字節
    const extraFactor = 1.2; // 內存加載過程額外消耗係數

    // 計算公式：M = (P * 4B) / (32/Q) * 1.2
    const requiredMemory = ((P * B) / (32 / Q)) * extraFactor;

    setResult({ requiredMemory });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          模型參數數量 (以十億為單位)
        </label>
        <input
          type="number"
          value={parameters}
          onChange={e => setParameters(e.target.value)}
          min="0"
          step="0.1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          量化位數
        </label>
        <select
          value={quantization}
          onChange={e => setQuantization(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="4">4 位</option>
          <option value="8">8 位</option>
          <option value="16">16 位</option>
        </select>
      </div>

      <button
        onClick={calculateMemory}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算 GPU 內存
      </button>

      {result && (
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 text-xl font-medium text-gray-900">計算結果</h3>
          <div>
            <p className="text-base text-gray-500">需要的 GPU 內存</p>
            <p className="text-xl font-medium text-gray-900">
              {result.requiredMemory.toFixed(2)} GB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
