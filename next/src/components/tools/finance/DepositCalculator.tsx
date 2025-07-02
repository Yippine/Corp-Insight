'use client';
import { useState } from 'react';

interface DepositResult {
  finalAmount: number;
  totalInterest: number;
  monthlyInterest: number;
}

export default function DepositCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('1.5');
  const [months, setMonths] = useState('12');
  const [result, setResult] = useState<DepositResult | null>(null);

  const calculateDeposit = () => {
    const initialAmount = parseFloat(principal);
    const annualRate = parseFloat(rate) / 100;
    const period = parseInt(months);

    // 計算最終金額
    const finalAmount = initialAmount * (1 + (annualRate * period) / 12);
    const totalInterest = finalAmount - initialAmount;
    const monthlyInterest = totalInterest / period;

    setResult({
      finalAmount,
      totalInterest,
      monthlyInterest,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          存款金額 (NT$)
        </label>
        <input
          type="number"
          value={principal}
          onChange={e => setPrincipal(e.target.value)}
          min="0"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          年利率 (%)
        </label>
        <input
          type="number"
          value={rate}
          onChange={e => setRate(e.target.value)}
          min="0"
          step="0.1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          存款期間 (月)
        </label>
        <input
          type="number"
          value={months}
          onChange={e => setMonths(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={calculateDeposit}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算定存收益
      </button>

      {result && (
        <div className="space-y-4 rounded-lg bg-gray-50 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base text-gray-500">到期金額</p>
              <p className="text-xl font-medium text-gray-900">
                NT${' '}
                {result.finalAmount.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">總利息收入</p>
              <p className="text-xl font-medium text-gray-900">
                NT${' '}
                {result.totalInterest.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-base text-gray-500">月平均利息</p>
              <p className="text-xl font-medium text-gray-900">
                NT${' '}
                {result.monthlyInterest.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
