'use client';

interface Director {
  title: string;
  name: string;
  representative?: string | [number, string];
  shares: string;
}

interface DirectorsTableProps {
  directors: Director[];
  onViewChange: (view: 'chart' | 'table') => void;
}

export default function DirectorsTable({ directors }: DirectorsTableProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-5">
        <h3 className="flex items-center text-xl font-medium leading-6 text-gray-900">
          <span className="mr-3 inline-block h-6 w-1 rounded-full bg-blue-600"></span>
          董監事名單
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
                  職稱
                </th>
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
                  持有股份
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-base font-medium uppercase tracking-wider text-gray-500"
                >
                  代表法人
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {directors.map((director, index) => (
                <tr
                  key={index}
                  className="transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">
                        {director.title}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-base text-gray-900">
                      {director.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-base text-gray-900">
                      {director.shares || '0'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-base text-gray-900">
                      {Array.isArray(director.representative)
                        ? director.representative[1]
                        : director.representative || '-'}
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
