import { Clock, AlertCircle } from 'lucide-react';

interface UnderDevelopmentProps {
  message?: string;
  year?: string;
}

export default function UnderDevelopment({ 
  message = '精彩功能即將推出，我們將為您帶來更豐富的資訊體驗。',
  year = '2025'
}: UnderDevelopmentProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">即將推出</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          {message && (
            <>
              {message}
              <br />
            </>
          )}
          期待與您一同體驗！
        </p>
        <div className="flex justify-center space-x-2 text-sm text-gray-500">
          <AlertCircle className="h-5 w-5" />
          <span>預計上線時間：{year} 年</span>
        </div>
      </div>
    </div>
  );
} 