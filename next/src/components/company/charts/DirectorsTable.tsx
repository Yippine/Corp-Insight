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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-5">
        <h3 className="text-xl leading-6 font-medium text-gray-900 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
          董監事名單
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                  職稱
                </th>
                <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                  姓名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                  持有股份
                </th>
                <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                  代表法人
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {directors.map((director, index) => (
                <tr 
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">
                        {director.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900">
                      {director.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900">
                      {director.shares || '0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-base text-gray-900">
                      {Array.isArray(director.representative) ? director.representative[1] : director.representative || '-'}
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