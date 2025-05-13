'use client';

export default function Loading() {
  return (
    <div className="w-full h-full min-h-[50vh] flex justify-center items-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <div className="mt-4 text-gray-500 font-medium">載入中...</div>
      </div>
    </div>
  );
}