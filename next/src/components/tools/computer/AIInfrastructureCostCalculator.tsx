'use client';
import { useState } from 'react';

interface WorkloadType {
  id: string;
  name: string;
  costMultiplier: number;
  powerMultiplier: number;
}

const workloadTypes: WorkloadType[] = [
  {
    id: 'training',
    name: '模型訓練',
    costMultiplier: 1.5,
    powerMultiplier: 1.8,
  },
  {
    id: 'inference',
    name: '推理服務',
    costMultiplier: 1.2,
    powerMultiplier: 1.3,
  },
  {
    id: 'hybrid',
    name: '混合模式',
    costMultiplier: 1.35,
    powerMultiplier: 1.5,
  },
];

interface CalculationResult {
  hardwareCost: number;
  operationalCost: number;
  softwareCost: number;
  totalCost: number;
  monthlyPowerConsumption: number;
}

export default function AIInfrastructureCostCalculator() {
  const [workloadType, setWorkloadType] = useState(workloadTypes[0].id);
  const [concurrentUsers, setConcurrentUsers] = useState('100');
  const [dailyRequests, setDailyRequests] = useState('10000');
  const [gpuCount, setGpuCount] = useState('4');
  const [duration, setDuration] = useState('12'); // 月份

  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateCosts = () => {
    const selectedWorkload = workloadTypes.find(w => w.id === workloadType)!;
    const users = parseInt(concurrentUsers);
    const requests = parseInt(dailyRequests);
    const gpus = parseInt(gpuCount);
    const months = parseInt(duration);

    // 基礎硬體成本（每GPU每月）
    const gpuMonthlyCost = 30000; // NT$
    const hardwareCost =
      gpus * gpuMonthlyCost * months * selectedWorkload.costMultiplier;

    // 運營成本計算
    const powerConsumption = gpus * 300 * selectedWorkload.powerMultiplier; // 每GPU 300W
    const monthlyPowerCost = (powerConsumption * 24 * 30 * 3) / 1000; // 3元/kWh
    const coolingCost = monthlyPowerCost * 0.4; // 冷卻成本約為電力成本的40%
    const networkCost = requests * 0.1 * 30; // 假設每請求0.1元網絡成本
    const operationalCost =
      (monthlyPowerCost + coolingCost + networkCost) * months;

    // 軟體授權成本（基於使用者數量和使用時間）
    const softwareCost = users * 100 * months; // 假設每使用者每月100元

    const totalCost = hardwareCost + operationalCost + softwareCost;

    setResult({
      hardwareCost,
      operationalCost,
      softwareCost,
      totalCost,
      monthlyPowerConsumption: powerConsumption,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          工作負載類型
        </label>
        <select
          value={workloadType}
          onChange={e => setWorkloadType(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {workloadTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          並發使用者數量量
        </label>
        <input
          type="number"
          value={concurrentUsers}
          onChange={e => setConcurrentUsers(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          每日請求量
        </label>
        <input
          type="number"
          value={dailyRequests}
          onChange={e => setDailyRequests(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          GPU 數量
        </label>
        <input
          type="number"
          value={gpuCount}
          onChange={e => setGpuCount(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          使用期間 (月)
        </label>
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={calculateCosts}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算成本
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h3 className="text-xl font-medium text-gray-900">成本估算結果</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-base text-gray-500">硬體成本</p>
              <p className="text-xl font-medium text-gray-900">
                NT$ {result.hardwareCost.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">運營成本</p>
              <p className="text-xl font-medium text-gray-900">
                NT$ {result.operationalCost.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">軟體授權成本</p>
              <p className="text-xl font-medium text-gray-900">
                NT$ {result.softwareCost.toLocaleString()}
              </p>
            </div>
            <div className="border-t pt-4">
              <p className="text-base text-gray-500">總成本</p>
              <p className="text-2xl font-bold text-gray-900">
                NT$ {result.totalCost.toLocaleString()}
              </p>
            </div>
            <div className="text-base text-gray-500">
              預估每月耗電量：{result.monthlyPowerConsumption.toFixed(1)} kWh
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
