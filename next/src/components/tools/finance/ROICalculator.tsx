'use client';
import { useState } from 'react';
import Instructions from '../Instructions';

interface ROIResult {
  roi: number;
  annualizedRoi: number;
  netReturn: number;
}

export default function ROICalculator() {
  const [investment, setInvestment] = useState('100000');
  const [returns, setReturns] = useState('120000');
  const [years, setYears] = useState('1');
  const [result, setResult] = useState<ROIResult | null>(null);

  const calculateROI = () => {
    const initialInvestment = parseFloat(investment);
    const finalValue = parseFloat(returns);
    const period = parseFloat(years);

    const netReturn = finalValue - initialInvestment;
    const roi = (netReturn / initialInvestment) * 100;
    const annualizedRoi =
      (Math.pow(finalValue / initialInvestment, 1 / period) - 1) * 100;

    setResult({
      roi,
      annualizedRoi,
      netReturn,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Instructions
        what="投資報酬率(ROI)計算器用於評估投資的效益。"
        why="ROI可以幫助比較不同投資選項的獲利能力，是投資決策的重要參考指標。"
        how="輸入投資金額、最終價值和投資期間，計算器會顯示總報酬率和年化報酬率。計算公式：ROI = (淨收益/投資金額)×100%，年化ROI = ((最終價值/投資金額)^(1/年數) - 1)×100%。"
      />
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            投資金額 (NT$)
          </label>
          <input
            type="number"
            value={investment}
            onChange={e => setInvestment(e.target.value)}
            min="0"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            最終價值 (NT$)
          </label>
          <input
            type="number"
            value={returns}
            onChange={e => setReturns(e.target.value)}
            min="0"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            投資期間 (年)
          </label>
          <input
            type="number"
            value={years}
            onChange={e => setYears(e.target.value)}
            min="0.1"
            step="0.1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={calculateROI}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          計算ROI
        </button>

        {result && (
          <div className="space-y-4 rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base text-gray-500">總報酬率</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.roi.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">年化報酬率</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.annualizedRoi.toFixed(2)}%
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-base text-gray-500">淨收益</p>
                <p className="text-xl font-medium text-gray-900">
                  NT${' '}
                  {result.netReturn.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
