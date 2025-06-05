'use client';

interface Manager {
  序號: string;
  姓名: string;
  到職日期: {
    year: number;
    month: number;
    day: number;
  };
}

interface ManagersTableProps {
  managers: Manager[];
  onViewChange: (view: 'chart' | 'table') => void;
}

export default function ManagersTable({ managers }: ManagersTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-5">
        <h3 className="flex items-center text-xl font-medium leading-6 text-gray-900">
          <span className="mr-3 inline-block h-6 w-1 rounded-full bg-blue-600"></span>
          經理人名單
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-base font-medium uppercase tracking-wider text-gray-500"
                >
                  姓名
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-base font-medium uppercase tracking-wider text-gray-500"
                >
                  到職日期
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {managers.map(manager => (
                <tr
                  key={manager.序號}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">
                        {manager.姓名}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-base text-gray-900">
                      {`${manager.到職日期.year}/${String(manager.到職日期.month).padStart(2, '0')}/${String(manager.到職日期.day).padStart(2, '0')}`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
