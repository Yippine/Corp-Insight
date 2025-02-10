import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    const previousSearch = location.state?.previousSearch || ''
    navigate(`/company/search${previousSearch}`)
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