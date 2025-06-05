'use client';
import { useState, useEffect } from 'react';
import Instructions from '../Instructions';

interface ExchangeRates {
  [key: string]: number;
}

const currencies = [
  { code: 'TWD', name: '新台幣' },
  { code: 'USD', name: '美元' },
  { code: 'EUR', name: '歐元' },
  { code: 'JPY', name: '日圓' },
  { code: 'CNY', name: '人民幣' },
  { code: 'HKD', name: '港幣' },
  { code: 'GBP', name: '英鎊' },
  { code: 'AUD', name: '澳幣' },
  { code: 'CAD', name: '加幣' },
  { code: 'SGD', name: '新加坡幣' },
];

// 模擬匯率資料（實際應用中應該從API獲取）
const mockRates: ExchangeRates = {
  TWD: 1,
  USD: 0.033,
  EUR: 0.03,
  JPY: 3.7,
  CNY: 0.23,
  HKD: 0.26,
  GBP: 0.026,
  AUD: 0.048,
  CAD: 0.044,
  SGD: 0.044,
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('1000');
  const [fromCurrency, setFromCurrency] = useState('TWD');
  const [toCurrency, setToCurrency] = useState('USD');
  const [rates, setRates] = useState<ExchangeRates>(mockRates);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    // 在實際應用中，這裡應該從API獲取即時匯率
    setRates(mockRates);
  }, []);

  const convertCurrency = () => {
    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount)) return;

    // 先轉換成TWD，再轉換成目標貨幣
    const inTWD = inputAmount / rates[fromCurrency];
    const converted = inTWD * rates[toCurrency];

    setResult(converted);
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Instructions
        what="外幣快速換算器可以幫助您進行不同貨幣之間的換算。"
        why="在國際貿易、旅遊或投資時，快速了解不同貨幣的等值金額非常重要。"
        how="選擇原始貨幣和目標貨幣，輸入金額後即可看到換算結果。換算使用即時匯率（目前為模擬數據），計算方式：目標金額 = 原始金額 × 匯率。"
      />
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="mb-1 block text-base font-medium text-gray-700">
            金額
          </label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-4">
          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              從
            </label>
            <select
              value={fromCurrency}
              onChange={e => setFromCurrency(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwapCurrencies}
            className="mb-1 p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            ⇄
          </button>

          <div>
            <label className="mb-1 block text-base font-medium text-gray-700">
              轉換成
            </label>
            <select
              value={toCurrency}
              onChange={e => setToCurrency(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {currencies.map(currency => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={convertCurrency}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          換算
        </button>

        {result !== null && (
          <div className="space-y-4 rounded-lg bg-gray-50 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base text-gray-500">
                  {amount} {fromCurrency}
                </p>
                <p className="text-xl font-medium text-gray-900">
                  {parseFloat(amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {fromCurrency}
                </p>
              </div>
              <div>
                <p className="text-base text-gray-500">轉換結果</p>
                <p className="text-xl font-medium text-gray-900">
                  {result.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  {toCurrency}
                </p>
              </div>
            </div>
            <div className="text-base text-gray-500">
              匯率：1 {fromCurrency} ={' '}
              {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)}{' '}
              {toCurrency}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
