import { useSearchParams } from "react-router-dom";

export const useSearchParamsHandler = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams();

    // 固定參數順序邏輯
    const orderedKeys = ["q", "type", "page"] as const;
    orderedKeys.forEach((key) => {
      if (params[key]) newParams.set(key, encodeURIComponent(params[key]));
    });
    setSearchParams(newParams);
  };

  const getDecodedQuery = () => {
    const q = searchParams.get("q");
    return q ? decodeURIComponent(q) : "";
  };

  return { updateParams, getDecodedQuery };
};
