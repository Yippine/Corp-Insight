'use client';
import { useState } from 'react';

interface CalculationResult {
  boxesNeeded: number;
  itemsPerBox: number;
  utilization: number;
  layout: string;
}

export default function PackagingCalculator() {
  const [productLength, setProductLength] = useState('100');
  const [productWidth, setProductWidth] = useState('50');
  const [productHeight, setProductHeight] = useState('30');
  const [boxLength, setBoxLength] = useState('600');
  const [boxWidth, setBoxWidth] = useState('400');
  const [boxHeight, setBoxHeight] = useState('300');
  const [quantity, setQuantity] = useState('100');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculatePackaging = () => {
    const pL = parseFloat(productLength);
    const pW = parseFloat(productWidth);
    const pH = parseFloat(productHeight);
    const bL = parseFloat(boxLength);
    const bW = parseFloat(boxWidth);
    const bH = parseFloat(boxHeight);
    const qty = parseInt(quantity);

    // 計算每個方向可以放置的數量
    const lengthCount = Math.floor(bL / pL);
    const widthCount = Math.floor(bW / pW);
    const heightCount = Math.floor(bH / pH);

    // 計算每箱可放置的總數量
    const itemsPerBox = lengthCount * widthCount * heightCount;

    // 計算需要的箱子數量
    const boxesNeeded = Math.ceil(qty / itemsPerBox);

    // 計算空間利用率
    const productVolume = pL * pW * pH;
    const boxVolume = bL * bW * bH;
    const utilization = (itemsPerBox * productVolume * 100) / boxVolume;

    setResult({
      boxesNeeded,
      itemsPerBox,
      utilization,
      layout: `長 ${lengthCount} × 寬 ${widthCount} × 高 ${heightCount}`,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-3 text-xl font-medium text-gray-900">
            產品尺寸 (mm)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                長度
              </label>
              <input
                type="number"
                value={productLength}
                onChange={e => setProductLength(e.target.value)}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                寬度
              </label>
              <input
                type="number"
                value={productWidth}
                onChange={e => setProductWidth(e.target.value)}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                高度
              </label>
              <input
                type="number"
                value={productHeight}
                onChange={e => setProductHeight(e.target.value)}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-xl font-medium text-gray-900">
            箱子尺寸 (mm)
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                長度
              </label>
              <input
                type="number"
                value={boxLength}
                onChange={e => setBoxLength(e.target.value)}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                寬度
              </label>
              <input
                type="number"
                value={boxWidth}
                onChange={e => setBoxWidth(e.target.value)}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-base font-medium text-gray-700">
                高度
              </label>
              <input
                type="number"
                value={boxHeight}
                onChange={e => setBoxHeight(e.target.value)}
                min="1"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          需求數量 (件)
        </label>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={calculatePackaging}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算包裝方式
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <h3 className="text-xl font-medium text-gray-900">計算結果</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base text-gray-500">需要箱數</p>
              <p className="text-xl font-medium text-gray-900">
                {result.boxesNeeded} 箱
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">每箱數量</p>
              <p className="text-xl font-medium text-gray-900">
                {result.itemsPerBox} 件
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">空間利用率</p>
              <p className="text-xl font-medium text-gray-900">
                {result.utilization.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">擺放方式</p>
              <p className="text-xl font-medium text-gray-900">
                {result.layout}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
