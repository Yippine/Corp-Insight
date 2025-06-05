'use client';
import { useState } from 'react';
import Instructions from '../Instructions';

interface CalculationResult {
  finalAmount: number;
  totalInterest: number;
  yearlyBreakdown: Array<{
    year: number;
    amount: number;
    interest: number;
  }>;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState('100000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('5');
  const [frequency, setFrequency] = useState('12');
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateCompoundInterest = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const t = parseInt(years);
    const n = parseInt(frequency);

    const yearlyBreakdown = [];
    let previousAmount = p;

    for (let year = 1; year <= t; year++) {
      const amount = p * Math.pow(1 + r / n, n * year);
      const yearlyInterest = amount - previousAmount;

      yearlyBreakdown.push({
        year,
        amount,
        interest: yearlyInterest,
      });

      previousAmount = amount;
    }

    const finalAmount = yearlyBreakdown[yearlyBreakdown.length - 1].amount;
    const totalInterest = finalAmount - p;

    setResult({
      finalAmount,
      totalInterest,
      yearlyBreakdown,
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Instructions
        what="複利計算器可以幫助您計算投資隨時間增長的價值。"
        why="了解複利效應對於長期投資規劃和財務目標設定非常重要。"
        how="輸入本金、年利率、投資期間和複利頻率，計算器會顯示最終金額和收益明細。計算公式：最終金額 = 本金×(1 + 利率/複利頻率)^(期間×複利頻率)。"
      />
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            本金 (NT$)
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
            投資期間 (年)
          </label>
          <input
            type="number"
            value={years}
            onChange={e => setYears(e.target.value)}
            min="1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            複利頻率 (次/年)
          </label>
          <select
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="1">年複利</option>
            <option value="2">半年複利</option>
            <option value="4">季複利</option>
            <option value="12">月複利</option>
            <option value="365">日複利</option>
          </select>
        </div>

        <button
          onClick={calculateCompoundInterest}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          計算複利
        </button>

        {result && (
          <div className="space-y-6 rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base text-gray-500">最終金額</p>
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
            </div>

            <div>
              <h4 className="mb-3 text-base font-medium text-gray-700">
                年度明細
              </h4>
              <div className="space-y-2">
                {result.yearlyBreakdown.map(year => (
                  <div key={year.year} className="grid grid-cols-3 text-base">
                    <div>第 {year.year} 年</div>
                    <div className="text-right">
                      NT${' '}
                      {year.amount.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-right text-green-600">
                      +
                      {year.interest.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
