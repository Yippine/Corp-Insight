import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  onCustomClick?: () => void;
}

export default function BackButton({ onCustomClick }: BackButtonProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onCustomClick) {
      onCustomClick();
    } else {
      navigate(-1)
    }
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