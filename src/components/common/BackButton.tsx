import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  basePath: string;
  stateKey?: string;
}

export default function BackButton({ 
  basePath = '/company/search',
  stateKey = 'previousSearch'
}: BackButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    const searchParams = (location.state?.[stateKey] as string) || '';
    navigate(`${basePath}${searchParams}`, {
      state: { fromDetail: true }
    });
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-md"
    >
      <ArrowLeft className="h-6 w-6 mr-2" />
      返回搜尋結果
    </button>
  )
}