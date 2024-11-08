import { useState } from 'react';
import Instructions from '../Instructions';

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
    storageMultiplier: 1.5
  },
  {
    id: 'medium',
    name: '中（一般應用、數據處理）',
    cpuMultiplier: 1.5,
    memoryMultiplier: 1.95,
    storageMultiplier: 2.25
  },
  {
    id: 'high',
    name: '高（AI運算、即時處理）',
    cpuMultiplier: 2,
    memoryMultiplier: 2.6,
    storageMultiplier: 3
  }
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

    // CPU: 每50位用戶配置1核心為基準，乘以複雜度係數
    const cpuCores = Math.ceil((concurrentUsers / 50) * selectedComplexity.cpuMultiplier);

    // 內存: 基於用戶數和數據量，乘以複雜度係數
    const memory = Math.ceil((concurrentUsers * 0.3 + data * 1) * selectedComplexity.memoryMultiplier);

    // 存儲空間: 基於數據量，含備份空間，乘以複雜度係數
    const storage = Math.ceil(data * 1.5 * selectedComplexity.storageMultiplier);

    setResult({ cpuCores, memory, storage });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Instructions
        what="伺服器規格計算器幫助您估算應用所需的伺服器資源。"
        why="準確的伺服器規格評估可以確保應用運行順暢，同時避免資源浪費。"
        how="輸入預期的並發用戶數、數據量和應用複雜度，計算器會根據經驗值推薦合適的伺服器配置。"
      />
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            並發用戶數
          </label>
          <input
            type="number"
            value={users}
            onChange={(e) => setUsers(e.target.value)}
            min="1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            數據量 (GB)
          </label>
          <input
            type="number"
            value={dataSize}
            onChange={(e) => setDataSize(e.target.value)}
            min="1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            應用複雜度
          </label>
          <select
            value={complexity}
            onChange={(e) => setComplexity(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {complexityLevels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={calculateSpecs}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          計算規格
        </button>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-medium text-gray-900">建議規格</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm text-gray-500">CPU</p>
                <p className="text-lg font-medium text-gray-900">
                  {result.cpuCores} 核心
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">記憶體</p>
                <p className="text-lg font-medium text-gray-900">
                  {result.memory} GB RAM
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">存儲空間</p>
                <p className="text-lg font-medium text-gray-900">
                  {result.storage} GB
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              注意：這是基本估算，實際需求可能因應用特性而異
            </p>
          </div>
        )}
      </div>
    </div>
  );
}