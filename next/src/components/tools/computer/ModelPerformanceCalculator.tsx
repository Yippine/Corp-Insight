'use client';
import { useState } from 'react';

interface ModelArchitecture {
  id: string;
  name: string;
  baseMemory: number;
  computeMultiplier: number;
  latencyBase: number;
}

const architectures: ModelArchitecture[] = [
  {
    id: 'transformer',
    name: 'Transformer',
    baseMemory: 1.2,
    computeMultiplier: 1.5,
    latencyBase: 100,
  },
  {
    id: 'cnn',
    name: 'CNN',
    baseMemory: 1.0,
    computeMultiplier: 1.2,
    latencyBase: 50,
  },
  {
    id: 'rnn',
    name: 'RNN',
    baseMemory: 0.8,
    computeMultiplier: 1.3,
    latencyBase: 75,
  },
];

interface CalculationResult {
  memoryUsage: number;
  computeEfficiency: number;
  powerConsumption: number;
  inferenceLatency: number;
  throughput: number;
}

export default function ModelPerformanceCalculator() {
  const [architecture, setArchitecture] = useState(architectures[0].id);
  const [modelSize, setModelSize] = useState('1');
  const [batchSize, setBatchSize] = useState('32');
  const [quantization, setQuantization] = useState('8');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculatePerformance = () => {
    const selectedArch = architectures.find(a => a.id === architecture)!;
    const size = parseFloat(modelSize);
    const batch = parseInt(batchSize);
    const bits = parseInt(quantization);

    // 記憶體使用計算 (GB)
    const memoryUsage = selectedArch.baseMemory * size * (bits / 32) * batch;

    // 計算效率 (TFLOPS)
    const computeEfficiency =
      size * selectedArch.computeMultiplier * (32 / bits);

    // 功耗估算 (W)
    const powerConsumption = computeEfficiency * 100 + 50;

    // 推理延遲 (ms)
    const inferenceLatency =
      selectedArch.latencyBase * size * (batch / 32) * (bits / 8);

    // 吞吐量 (samples/sec)
    const throughput = (1000 / inferenceLatency) * batch;

    setResult({
      memoryUsage,
      computeEfficiency,
      powerConsumption,
      inferenceLatency,
      throughput,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          模型架構
        </label>
        <select
          value={architecture}
          onChange={e => setArchitecture(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {architectures.map(arch => (
            <option key={arch.id} value={arch.id}>
              {arch.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          模型大小 (GB)
        </label>
        <input
          type="number"
          value={modelSize}
          onChange={e => setModelSize(e.target.value)}
          min="0.1"
          step="0.1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          批次大小
        </label>
        <input
          type="number"
          value={batchSize}
          onChange={e => setBatchSize(e.target.value)}
          min="1"
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
          <option value="32">FP32</option>
          <option value="16">FP16</option>
          <option value="8">INT8</option>
          <option value="4">INT4</option>
        </select>
      </div>

      <button
        onClick={calculatePerformance}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算效能
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h3 className="text-xl font-medium text-gray-900">效能預測結果</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-base text-gray-500">記憶體使用</p>
              <p className="text-xl font-medium text-gray-900">
                {result.memoryUsage.toFixed(2)} GB
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">計算效率</p>
              <p className="text-xl font-medium text-gray-900">
                {result.computeEfficiency.toFixed(2)} TFLOPS
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">估計功耗</p>
              <p className="text-xl font-medium text-gray-900">
                {result.powerConsumption.toFixed(0)} W
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">推理延遲</p>
              <p className="text-xl font-medium text-gray-900">
                {result.inferenceLatency.toFixed(2)} ms
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">吞吐量</p>
              <p className="text-xl font-medium text-gray-900">
                {result.throughput.toFixed(0)} samples/sec
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
