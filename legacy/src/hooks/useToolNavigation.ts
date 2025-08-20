import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export function useToolNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.fromDetail) {
      const searchParams = sessionStorage.getItem("toolSearchParams");
      const scrollPosition = sessionStorage.getItem("toolSearchScroll");

      if (searchParams) {
        const decodedParams = new URLSearchParams(
          decodeURIComponent(searchParams)
        );
        navigate(`?${decodedParams}`, {
          replace: true,
          state: { shouldRestoreScroll: true },
        });
        sessionStorage.removeItem("toolSearchParams");
      }

      if (scrollPosition) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(scrollPosition));
          sessionStorage.removeItem("toolSearchScroll");
        });
      }
    }
  }, [location.state, navigate]);
}
