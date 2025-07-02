'use client';
import { useState } from 'react';

interface Material {
  id: string;
  name: string;
  density: number; // g/cm³
  priceRange: { min: number; max: number }; // NT$/kg
}

const materials: Material[] = [
  {
    id: 'steel',
    name: '碳鋼',
    density: 7.85,
    priceRange: { min: 30, max: 50 },
  },
  {
    id: 'stainless',
    name: '不鏽鋼',
    density: 8.0,
    priceRange: { min: 80, max: 150 },
  },
  {
    id: 'aluminum',
    name: '鋁合金',
    density: 2.7,
    priceRange: { min: 60, max: 120 },
  },
  {
    id: 'copper',
    name: '銅',
    density: 8.96,
    priceRange: { min: 200, max: 300 },
  },
  {
    id: 'brass',
    name: '黃銅',
    density: 8.5,
    priceRange: { min: 150, max: 250 },
  },
];

export default function MetalWeightCalculator() {
  const [material, setMaterial] = useState(materials[0].id);
  const [shape, setShape] = useState<'rectangular' | 'cylindrical'>(
    'rectangular'
  );
  const [length, setLength] = useState('100');
  const [width, setWidth] = useState('100');
  const [height, setHeight] = useState('10');
  const [diameter, setDiameter] = useState('50');
  const [result, setResult] = useState<{
    volume: number;
    weight: number;
    minCost: number;
    maxCost: number;
  } | null>(null);

  const calculateWeight = () => {
    const selectedMaterial = materials.find(m => m.id === material);
    if (!selectedMaterial) return;

    let volume: number;
    if (shape === 'rectangular') {
      volume =
        (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 1000; // cm³
    } else {
      volume =
        (Math.PI * Math.pow(parseFloat(diameter) / 2, 2) * parseFloat(length)) /
        1000; // cm³
    }

    const weight = volume * selectedMaterial.density; // kg
    const minCost = weight * selectedMaterial.priceRange.min;
    const maxCost = weight * selectedMaterial.priceRange.max;

    setResult({ volume, weight, minCost, maxCost });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          材料類型
        </label>
        <select
          value={material}
          onChange={e => setMaterial(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {materials.map(m => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          形狀
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setShape('rectangular')}
            className={`${
              shape === 'rectangular'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700'
            } flex items-center justify-center rounded-md border px-4 py-2`}
          >
            長方體
          </button>
          <button
            type="button"
            onClick={() => setShape('cylindrical')}
            className={`${
              shape === 'cylindrical'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-300 bg-white text-gray-700'
            } flex items-center justify-center rounded-md border px-4 py-2`}
          >
            圓柱體
          </button>
        </div>
      </div>

      {shape === 'rectangular' ? (
        <>
          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              長度 (mm)
            </label>
            <input
              type="number"
              value={length}
              onChange={e => setLength(e.target.value)}
              min="0"
              step="0.1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              寬度 (mm)
            </label>
            <input
              type="number"
              value={width}
              onChange={e => setWidth(e.target.value)}
              min="0"
              step="0.1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              高度 (mm)
            </label>
            <input
              type="number"
              value={height}
              onChange={e => setHeight(e.target.value)}
              min="0"
              step="0.1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </>
      ) : (
        <>
          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              直徑 (mm)
            </label>
            <input
              type="number"
              value={diameter}
              onChange={e => setDiameter(e.target.value)}
              min="0"
              step="0.1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              長度 (mm)
            </label>
            <input
              type="number"
              value={length}
              onChange={e => setLength(e.target.value)}
              min="0"
              step="0.1"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      <button
        onClick={calculateWeight}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算重量與成本
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h3 className="text-xl font-medium text-gray-900">計算結果</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base text-gray-500">體積</p>
              <p className="text-xl font-medium text-gray-900">
                {result.volume.toFixed(2)} cm³
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">重量</p>
              <p className="text-xl font-medium text-gray-900">
                {result.weight.toFixed(2)} kg
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-base text-gray-500">預估成本範圍</p>
              <p className="text-xl font-medium text-gray-900">
                NT$ {result.minCost.toFixed(0)} ~ {result.maxCost.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
