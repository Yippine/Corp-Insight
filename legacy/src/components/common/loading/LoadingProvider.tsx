import { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
  defaultState?: boolean;
}

export function LoadingProvider({ children, defaultState = false }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(defaultState);

  const setLoading = useCallback((state: boolean) => {
    setIsLoading(state);
  }, []);

  const showLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setLoading,
      showLoading,
      hideLoading
    }}>
      {children}
    </LoadingContext.Provider>
  );
}