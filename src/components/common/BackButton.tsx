import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  basePath: string;
  stateKey?: string;
}

export default function BackButton({ 
  basePath = '/company/search',
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    const savedState = JSON.parse(sessionStorage.getItem('previousSearchState') || '{}')
    
    navigate(`${basePath}?${savedState.searchParams || ''}`, {
      state: { 
        fromDetail: true,
        scrollPosition: savedState.scrollPosition || 0
      }
    })
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