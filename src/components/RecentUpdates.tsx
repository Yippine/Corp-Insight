import { ChevronRight, Award, Users, Building2, LucideIcon } from 'lucide-react';

interface UpdateItem {
  icon: LucideIcon;
  iconColor: string;
  category: string;
  title: string;
  description: string;
}

interface RecentUpdatesProps {
  updates?: UpdateItem[];
}

const defaultUpdates: UpdateItem[] = [
  {
    icon: Award,
    iconColor: 'text-blue-600',
    category: '重大標案',
    title: '台積電獲得新竹科學園區擴建案',
    description: '總金額達 NT$ 1,500,000,000...'
  },
  {
    icon: Users,
    iconColor: 'text-green-600',
    category: '人事異動',
    title: '聯發科技董事會改選',
    description: '新任董事長及總經理名單公布...'
  },
  {
    icon: Building2,
    iconColor: 'text-purple-600',
    category: '新設立公司',
    title: '本週新設立公司統計',
    description: '本週全台新設立公司共計 1,234 家...'
  }
];

export default function RecentUpdates({ updates = defaultUpdates }: RecentUpdatesProps) {
  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">最新動態</h2>
        <button className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium">
          查看更多 <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {updates.map((update, index) => {
          const Icon = update.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Icon className={`h-5 w-5 ${update.iconColor} mr-2`} />
                <span className="text-sm text-gray-500">{update.category}</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {update.title}
              </h3>
              <p className="text-sm text-gray-600">
                {update.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
} 