import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export function useToolNavigation() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.fromDetail) {
      const searchParams = sessionStorage.getItem('toolListSearch')
      const scrollPosition = sessionStorage.getItem('toolListScroll')
      
      if (searchParams) {
        const decodedParams = new URLSearchParams(decodeURIComponent(searchParams))
        navigate(`?${decodedParams}`, { 
          replace: true,
          state: { shouldRestoreScroll: true }
        })
        sessionStorage.removeItem('toolListSearch')
      }
      
      if (scrollPosition) {
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(scrollPosition))
          sessionStorage.removeItem('toolListScroll')
        })
      }
    }
  }, [location.state, navigate])
}