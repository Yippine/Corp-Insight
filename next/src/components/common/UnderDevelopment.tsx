import { Clock, AlertCircle } from 'lucide-react';

interface UnderDevelopmentProps {
  message?: string;
  year?: string;
}

export default function UnderDevelopment({
  message = '精彩功能即將推出，我們將為您帶來更豐富的資訊體驗。',
  year = '2025',
}: UnderDevelopmentProps) {
  return (
    <div className="overflow-hidden bg-white p-12 shadow sm:rounded-lg">
      <div className="space-y-4 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Clock className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-2xl font-semibold text-gray-900">即將推出</h3>
        <p className="mx-auto max-w-md text-gray-600">
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
