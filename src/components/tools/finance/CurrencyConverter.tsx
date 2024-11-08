import { useState, useEffect } from 'react';

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
  { code: 'SGD', name: '新加坡幣' }
];

// 模擬匯率資料（實際應用中應該從API獲取）
const mockRates: ExchangeRates = {
  TWD: 1,
  USD: 0.033,
  EUR: 0.030,
  JPY: 3.7,
  CNY: 0.23,
  HKD: 0.26,
  GBP: 0.026,
  AUD: 0.048,
  CAD: 0.044,
  SGD: 0.044
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            金額
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              從
            </label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              轉換成
            </label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name} ({currency.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={convertCurrency}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          換算
        </button>

        {result !== null && (
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  {amount} {fromCurrency}
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {parseFloat(amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} {fromCurrency}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  轉換結果
                </p>
                <p className="text-lg font-medium text-gray-900">
                  {result.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} {toCurrency}
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              匯率：1 {fromCurrency} = {(rates[toCurrency] / rates[fromCurrency]).toFixed(4)} {toCurrency}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}