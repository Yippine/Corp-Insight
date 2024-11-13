import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface TenderDetailProps {
  tenderId: string;
  onBack: () => void;
}

export default function TenderDetail({ tenderId, onBack }: TenderDetailProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [unitId, jobNumber] = tenderId.split('-');
        const response = await fetch(
          `https://pcc.g0v.ronny.tw/api/tender?unit_id=${unitId}&job_number=${jobNumber}`
        );
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('資料載入失敗，請稍後再試');
      }
      setLoading(false);
    };

    fetchData();
  }, [tenderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          返回列表
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {data?.unit_name}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            標案編號：{tenderId.split('-')[1]}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            {Object.entries(data?.records?.[0]?.detail || {}).map(([key, value]: [string, any], index: number) => (
              <div key={key} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                <dt className="text-sm font-medium text-gray-500">{key}</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center mt-4">
        資料來源：{`https://pcc.g0v.ronny.tw/api`}
      </div>
    </div>
  );
}