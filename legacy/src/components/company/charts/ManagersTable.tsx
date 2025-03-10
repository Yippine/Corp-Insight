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
    <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-5">
        <h3 className="text-xl leading-6 font-medium text-gray-900 flex items-center">
          <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
          經理人名單
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                  姓名
                </th>
                <th scope="col" className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase tracking-wider">
                  到職日期
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {managers.map((manager) => (
                <tr 
                  key={manager.序號} 
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-base font-medium text-gray-900">
                        {manager.姓名}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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