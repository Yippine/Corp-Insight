'use client';
import { useState } from 'react';

interface Complexity {
  id: string;
  name: string;
  cpuMultiplier: number;
  memoryMultiplier: number;
  storageMultiplier: number;
}

const complexityLevels: Complexity[] = [
  {
    id: 'low',
    name: '低（基本網站、簡單API）',
    cpuMultiplier: 1,
    memoryMultiplier: 1.3,
    storageMultiplier: 1.5,
  },
  {
    id: 'medium',
    name: '中（一般應用、數據處理）',
    cpuMultiplier: 1.5,
    memoryMultiplier: 1.95,
    storageMultiplier: 2.25,
  },
  {
    id: 'high',
    name: '高（AI運算、即時處理）',
    cpuMultiplier: 2,
    memoryMultiplier: 2.6,
    storageMultiplier: 3,
  },
];

interface CalculationResult {
  cpuCores: number;
  memory: number;
  storage: number;
}

export default function ServerSpecCalculator() {
  const [users, setUsers] = useState('100');
  const [dataSize, setDataSize] = useState('50');
  const [complexity, setComplexity] = useState(complexityLevels[0].id);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateSpecs = () => {
    const concurrentUsers = parseInt(users);
    const data = parseInt(dataSize);
    const selectedComplexity = complexityLevels.find(c => c.id === complexity)!;

    // CPU: 每50位使用者配置1核心為基準，乘以複雜度係數
    const cpuCores = Math.ceil(
      (concurrentUsers / 50) * selectedComplexity.cpuMultiplier
    );

    // 內存: 基於使用者數量和數據量，乘以複雜度係數
    const memory = Math.ceil(
      (concurrentUsers * 0.3 + data * 1) * selectedComplexity.memoryMultiplier
    );

    // 存儲空間: 基於數據量，含備份空間，乘以複雜度係數
    const storage = Math.ceil(
      data * 1.5 * selectedComplexity.storageMultiplier
    );

    setResult({ cpuCores, memory, storage });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          並發使用者數量量
        </label>
        <input
          type="number"
          value={users}
          onChange={e => setUsers(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          數據量 (GB)
        </label>
        <input
          type="number"
          value={dataSize}
          onChange={e => setDataSize(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          應用複雜度
        </label>
        <select
          value={complexity}
          onChange={e => setComplexity(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {complexityLevels.map(level => (
            <option key={level.id} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={calculateSpecs}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算規格
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h3 className="text-xl font-medium text-gray-900">建議規格</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-base text-gray-500">CPU</p>
              <p className="text-xl font-medium text-gray-900">
                {result.cpuCores} 核心
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">記憶體</p>
              <p className="text-xl font-medium text-gray-900">
                {result.memory} GB RAM
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">存儲空間</p>
              <p className="text-xl font-medium text-gray-900">
                {result.storage} GB
              </p>
            </div>
          </div>
          <p className="mt-4 text-base text-gray-500">
            注意：這是基本估算，實際需求可能因應用特性而異
          </p>
        </div>
      )}
    </div>
  );
}
