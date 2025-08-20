import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useGoogleAnalytics } from "../../hooks/useGoogleAnalytics";

interface BackButtonProps {
  buttonText?: string;
  sessionKey: string;
  returnPath: string;
}

export default function BackButton({
  returnPath,
  sessionKey,
  buttonText = "返回搜尋結果",
}: BackButtonProps) {
  const navigate = useNavigate();
  const { trackBackButtonClick } = useGoogleAnalytics();

  const handleBack = () => {
    const savedSearch = sessionStorage.getItem(sessionKey);
    trackBackButtonClick(location.pathname);

    navigate(`${returnPath}${savedSearch ? `?${savedSearch}` : ""}`, {
      replace: true,
      state: { fromDetail: true },
    });
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md"
    >
      <X className="w-5 h-5 mr-2" />
      {buttonText}
    </button>
  );
}
