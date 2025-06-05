'use client';

import { TenderSearchResult } from '@/lib/tender/types';
import { getLabelStyle } from '@/lib/tender/labels';

interface TenderResultRowProps {
  tender: TenderSearchResult;
  onClick: () => void;
}

export default function TenderResultRow({
  tender,
  onClick,
}: TenderResultRowProps) {
  return (
    <tr onClick={onClick} className="cursor-pointer hover:bg-gray-50">
      <td className="px-6 py-4 text-center">
        <div className="flex w-[3.25rem] flex-wrap justify-center gap-2">
          <span className={getLabelStyle(tender.label.trim())}>
            {tender.label.trim()}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-base text-gray-500">{tender.date}</td>
      <td className="px-6 py-4 text-base text-gray-500">{tender.type}</td>
      <td className="px-6 py-4 text-base text-gray-900">
        <div className="line-clamp-3">{tender.title}</div>
      </td>
      <td className="px-6 py-4 text-base text-gray-900">
        <div className="line-clamp-2">{tender.unitName}</div>
      </td>
      <td className="px-6 py-4 text-base text-gray-500">{tender.amount}</td>
    </tr>
  );
}
