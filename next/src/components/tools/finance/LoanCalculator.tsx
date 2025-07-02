'use client';
import { useState } from 'react';

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remainingBalance: number;
  }>;
}

export default function LoanCalculator() {
  const [amount, setAmount] = useState('1000000');
  const [rate, setRate] = useState('3');
  const [years, setYears] = useState('20');
  const [result, setResult] = useState<LoanResult | null>(null);

  const calculateLoan = () => {
    const principal = parseFloat(amount);
    const annualRate = parseFloat(rate) / 100;
    const monthlyRate = annualRate / 12;
    const totalMonths = parseInt(years) * 12;

    // 計算每月還款金額
    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    // 計算還款明細
    let remainingBalance = principal;
    const schedule = [];

    for (let month = 1; month <= totalMonths; month++) {
      const interest = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      remainingBalance -= principalPayment;

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    const totalPayment = monthlyPayment * totalMonths;
    const totalInterest = totalPayment - principal;

    setResult({
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="mb-1 block text-base font-medium text-gray-700">
          貸款金額 (NT$)
        </label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
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
          貸款期間 (年)
        </label>
        <input
          type="number"
          value={years}
          onChange={e => setYears(e.target.value)}
          min="1"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={calculateLoan}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        計算貸款
      </button>

      {result && (
        <div className="space-y-6 rounded-lg bg-gray-50 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-base text-gray-500">每月還款</p>
              <p className="text-xl font-medium text-gray-900">
                NT${' '}
                {result.monthlyPayment.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div>
              <p className="text-base text-gray-500">總還款金額</p>
              <p className="text-xl font-medium text-gray-900">
                NT${' '}
                {result.totalPayment.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-base text-gray-500">總利息支出</p>
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
              還款明細
            </h4>
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {result.schedule.map(
                (month, index) =>
                  index % 12 === 0 && (
                    <div
                      key={month.month}
                      className="grid grid-cols-4 text-base"
                    >
                      <div>第 {month.month / 12} 年</div>
                      <div className="text-right">
                        NT${' '}
                        {month.payment.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-right text-green-600">
                        本金:{' '}
                        {month.principal.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="text-right text-blue-600">
                        利息:{' '}
                        {month.interest.toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
