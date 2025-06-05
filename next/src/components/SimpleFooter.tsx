import React from 'react';

export default function SimpleFooter() {
  return (
    <div className="mt-8 border-t border-gray-200 bg-white py-6 text-center">
      <p className="text-lg text-gray-400">
        © {new Date().getFullYear()} 企業放大鏡™｜資料來源：政府公開資訊平台
        <br />
        <span className="text-sm">
          本平台僅提供資料檢索服務，不保證資訊之即時性及完整性。
        </span>
      </p>
    </div>
  );
}
