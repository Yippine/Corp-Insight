export const DEFAULT_SEARCH_STATE = {
  results: [],
  query: '',
  currentPage: 1,
  totalPages: 1,
  searchType: 'company' as const
};

export const STORAGE_KEYS = {
  TENDER_SEARCH: 'lastTenderSearchState',
  COMPANY_SEARCH: 'lastCompanySearchState'
} as const; 