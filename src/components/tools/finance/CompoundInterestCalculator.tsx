import { useState } from 'react';

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
      const amount = p * Math.pow(1 + r/n, n * year);
      const yearlyInterest = amount - previousAmount;
      
      yearlyBreakdown.push({
        year,
        amount,
        interest: yearlyInterest
      });
      
      previousAmount = amount;
    }

    const finalAmount = yearlyBreakdown[yearlyBreakdown.length - 1].amount;
    const totalInterest = finalAmount - p;

    setResult({
      finalAmount,
      totalInterest,
      yearlyBreakdown
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            本金 (NT$)
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            min="0"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            年利率 (%)
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            min="0"
            step="0.1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            投資期間 (年)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            min="1"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            複利頻率 (次/年)
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          計算複利
        </button>

        {result && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">最終金額</p>
                <p className="text-lg font-medium text-gray-900">
                  NT$ {result.finalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">總利息收入</p>
                <p className="text-lg font-medium text-gray-900">
                  NT$ {result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">年度明細</h4>
              <div className="space-y-2">
                {result.yearlyBreakdown.map((year) => (
                  <div key={year.year} className="grid grid-cols-3 text-sm">
                    <div>第 {year.year} 年</div>
                    <div className="text-right">
                      NT$ {year.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div className="text-right text-green-600">
                      +{year.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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