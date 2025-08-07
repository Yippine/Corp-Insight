import { useState, useEffect } from "react";
import {
  Building2,
  FileText,
  Users,
  MapPin,
  Phone,
  Globe,
  Table,
  BarChart3,
  AlertTriangle,
  Filter,
  Download,
  Clock,
} from "lucide-react";
import { formatDetailData } from "../../utils/companyUtils";
import UnderDevelopment from "../common/UnderDevelopment";
import CompanyMap from "../maps/CompanyMap";
import DirectorsChart from "./charts/DirectorsChart";
import DirectorsTable from "./charts/DirectorsTable";
import ManagersTimeline from "./charts/ManagersTimeline";
import ManagersTable from "./charts/ManagersTable";
import TenderStatsChart from "./charts/TenderStatsChart";
import NoDataFound from "../common/NoDataFound";
import { usePaginatedTenders } from "../../hooks/usePaginatedTenders";
import { fetchListedCompany } from "../../api/routes";
import { useParams, useSearchParams } from "react-router-dom";
import { InlineLoading } from "../common/loading";
import { useGoogleAnalytics } from "../../hooks/useGoogleAnalytics";
import BackButton from "../common/BackButton";
import SEOHead from "../SEOHead";
import { SitemapCollector } from "../../services/SitemapCollector";
import DataSource from "../common/DataSource";
import Pagination from "../Pagination";

interface CompanyDetailProps {
  onBack?: () => void;
  onTenderSelect?: (tenderId: string) => void;
}

const tabs = [
  { id: "basic", name: "基本資料", icon: Building2 },
  { id: "financial", name: "財務概況", icon: BarChart3 },
  { id: "directors", name: "核心成員", icon: Users },
  // { id: 'tenders', name: '標案資料', icon: FileText },
  // { id: 'risk', name: '風險評估', icon: AlertTriangle },
  // { id: 'industry', name: '產業分析', icon: TrendingUp },
  // { id: 'awards', name: '獎項認證', icon: Award }
];

const fetchDetailData = async (taxId: string) => {
  const baseUrl = "https://company.g0v.ronny.tw/api";

  try {
    const [basicRes, listedRes] = await Promise.allSettled([
      fetch(`${baseUrl}/show/${taxId}`),
      fetchListedCompany(taxId),
    ]);

    const basicData =
      basicRes.status === "fulfilled"
        ? await basicRes.value.json()
        : { data: {} };

    const listedData =
      listedRes.status === "fulfilled" ? listedRes.value : { data: {} };

    const company = {
      ...basicData.data,
      ...listedData,
    };

    const SearchData = formatDetailData(taxId, company);
    return { ...SearchData, businessScope: company.所營事業資料 || [] };
  } catch (error) {
    console.error("API request failed:", error);
    throw new Error("無法連接到搜尋服務，請稍後再試");
  }
};

export default function CompanyDetail({ onTenderSelect }: CompanyDetailProps) {
  const { taxId } = useParams<{ taxId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "basic"
  );
  const [SearchData, setSearchData] = useState<any>(null);
  const [view, setView] = useState<"chart" | "table">("chart");
  const [tenderView, setTenderView] = useState<"chart" | "list">("chart");
  const { trackEvent } = useGoogleAnalytics();

  const {
    tenders,
    isLoadingMore,
    error: tenderError,
    progress,
    totalPages,
    currentPage,
    fetchTenders,
  } = usePaginatedTenders(taxId || "");

  const [riskCurrentPage, setRiskCurrentPage] = useState(1);
  const riskTotalPages = 8;

  const handleTabChange = (tab: string) => {
    // 驗證有效 tab 值
    const validTabs = tabs.map((t) => t.id);
    const decodedTab = decodeURIComponent(tab);
    const isValidTab = validTabs.includes(decodedTab);
    const finalTab = isValidTab ? decodedTab : "basic";

    // 處理 URL 編碼與參數設定
    const encodedTab = encodeURIComponent(finalTab);
    setSearchParams({ tab: encodedTab }, { replace: true });

    // 更新狀態與追蹤事件
    setActiveTab(finalTab);
    trackEvent("company_detail_tab_change", { tab: finalTab });
  };

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "basic";
    handleTabChange(currentTab);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const data = await fetchDetailData(taxId || "");
        setSearchData(data);
      } catch (error) {
        console.error("載入公司資料時發生錯誤：", error);
        alert("無法載入公司資料，請稍後再試。");
      }
    };

    loadSearchData();
  }, [taxId]);

  useEffect(() => {
    if (SearchData?.taxId) fetchTenders();
  }, [SearchData?.taxId, SearchData?.name]);

  useEffect(() => {
    if (taxId) {
      SitemapCollector.recordCompanyVisit(taxId);
    }
  }, [taxId]);

  // 添加CSS動畫到style標籤
  useEffect(() => {
    // 添加動畫CSS
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      @keyframes pulse-slow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }
      .animate-pulse-slow {
        animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      .animate-float {
        animation: float 5s ease-in-out infinite;
      }

      .trend-line {
        stroke-dasharray: 1000;
        stroke-dashoffset: 1000;
        animation: dash 2s ease-in-out forwards;
      }

      @keyframes dash {
        from {
          stroke-dashoffset: 1000;
        }
        to {
          stroke-dashoffset: 0;
        }
      }

      .scale-in-center {
        animation: scale-in-center 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
      }

      @keyframes scale-in-center {
        0% {
          transform: scale(0);
          opacity: 0;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .risk-item-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1);
      }
    `;
    document.head.appendChild(styleElement);

    // 清理函數
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const seoTitle = SearchData
    ? `${SearchData.name} - 企業資訊 | 企業放大鏡™`
    : "企業資訊 | 企業放大鏡™";
  const seoDescription = SearchData
    ? `查看 ${SearchData.name} 的詳細企業資訊，包含基本資料、財務概況、核心成員和相關標案等完整資訊。統一編號：${SearchData.taxId}。`
    : "查看完整的企業資訊，包含基本資料、財務概況、核心成員和相關標案等詳細內容。";

  if (!SearchData)
    return (
      <div className="pt-36 pb-8">
        <InlineLoading />
      </div>
    );

  const renderBusinessScope = () => {
    if (!SearchData.businessScope || SearchData.businessScope.length === 0) {
      return <p className="text-gray-500">無營業項目資料</p>;
    }

    // 分離代碼和詳細說明
    const codes = SearchData.businessScope.filter((item: string[]) => item[0]);
    const details = SearchData.businessScope.filter(
      (item: string[]) => !item[0]
    );

    return (
      <div className="space-y-8 bg-white rounded-lg">
        {codes.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 flex items-center space-x-2">
              <span className="inline-block w-1 h-4 bg-blue-600 rounded-full"></span>
              <span>營業項目代碼</span>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {codes.map((item: string[], index: number) => (
                <div
                  key={index}
                  className="group flex items-start space-x-3 bg-gradient-to-r from-blue-50 to-white p-3 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium group-hover:bg-blue-700 transition-colors">
                    {item[0]}
                  </div>
                  <span className="text-base text-gray-700 group-hover:text-gray-900 transition-colors">
                    {item[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {details.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-900 flex items-center space-x-2">
              <span className="inline-block w-1 h-4 bg-blue-600 rounded-full"></span>
              <span>營業項目說明</span>
            </h4>
            <div className="space-y-4 text-base text-gray-700 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4">
              {details.map((item: string[], index: number) => {
                const content = item[1].replace(/^[•·]/, "").trim();
                const isNewSection = /^[１２３４５６７８９０\d]．/.test(
                  content
                );

                return (
                  <div
                    key={index}
                    className={`${isNewSection ? "mt-6 first:mt-0" : "ml-8"} leading-relaxed hover:bg-white rounded-lg p-2 transition-colors duration-200`}
                  >
                    <p
                      className={`${
                        isNewSection
                          ? "text-blue-800 font-medium"
                          : "text-gray-600"
                      }`}
                    >
                      {content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <div className="space-y-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  基本資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      公司狀態
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${SearchData.status === "營業中" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {SearchData.status}
                      </span>
                    </dd>
                  </div>

                  {SearchData.chairman !== "無" && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        負責人
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {SearchData.chairman}
                      </dd>
                    </div>
                  )}

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      統一編號
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.taxId}
                    </dd>
                  </div>

                  {SearchData.financialReportInfo.website &&
                    SearchData.financialReportInfo.website !== "未提供" && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          網址
                        </dt>
                        <dd className="mt-1 text-base text-blue-600 flex items-center">
                          <Globe className="h-5 w-5 text-gray-400 mr-1" />
                          <a
                            href={SearchData.financialReportInfo.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {SearchData.financialReportInfo.website}
                          </a>
                        </dd>
                      </div>
                    )}

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      中文名稱
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.name}
                      {SearchData.financialReportInfo.abbreviation &&
                        `（${SearchData.financialReportInfo.abbreviation}）`}
                    </dd>
                  </div>

                  {SearchData.englishName !== "未提供" && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        英文名稱
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {SearchData.englishName}
                        {SearchData.financialReportInfo.englishAbbreviation &&
                          ` (${SearchData.financialReportInfo.englishAbbreviation})`}
                      </dd>
                    </div>
                  )}

                  {SearchData.phone !== "未提供" && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        聯絡電話
                      </dt>
                      <dd className="mt-1 text-base text-gray-900 flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-1" />
                        {SearchData.phone}
                      </dd>
                    </div>
                  )}

                  {SearchData.website !== "未提供" && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        公司網站
                      </dt>
                      <dd className="mt-1 text-base text-blue-600 flex items-center">
                        <Globe className="h-5 w-5 text-gray-400 mr-1" />
                        <a
                          href={`https://${SearchData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {SearchData.website}
                        </a>
                      </dd>
                    </div>
                  )}

                  {SearchData.employees !== "未提供" && (
                    <div className="sm:col-span-1">
                      <dt className="text-base font-medium text-gray-500">
                        員工人數
                      </dt>
                      <dd className="mt-1 text-base text-gray-900">
                        {SearchData.employees}
                      </dd>
                    </div>
                  )}

                  {SearchData.financialReportInfo.phone &&
                    SearchData.financialReportInfo.phone !== "未提供" && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          電話
                        </dt>
                        <dd className="mt-1 text-base text-gray-900 flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-1" />
                          {SearchData.financialReportInfo.phone}
                        </dd>
                      </div>
                    )}

                  {SearchData.financialReportInfo.fax &&
                    SearchData.financialReportInfo.fax !== "未提供" &&
                    SearchData.financialReportInfo.fax !== "無" && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          傳真
                        </dt>
                        <dd className="mt-1 text-base text-gray-900 flex items-center">
                          <Phone className="h-5 w-5 text-gray-400 mr-1" />
                          {SearchData.financialReportInfo.fax}
                        </dd>
                      </div>
                    )}

                  {SearchData.companyType &&
                    SearchData.companyType !== "未提供" && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          組織型態
                        </dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {SearchData.companyType}
                        </dd>
                      </div>
                    )}
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  資本規模
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      核准資本額
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0">
                      {SearchData.totalCapital}
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-2 sm:gap-4 sm:px-6">
                    <dt className="text-base font-medium text-gray-500">
                      實際資本額
                    </dt>
                    <dd className="mt-1 text-base text-gray-900 sm:mt-0">
                      {SearchData.paidInCapital}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  登記資料
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      公司成立日期
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.established}
                    </dd>
                  </div>

                  <div className="sm:col-span-1">
                    <dt className="text-base font-medium text-gray-500">
                      最近變更日期
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {SearchData.lastChanged}
                    </dd>
                  </div>

                  {SearchData.registrationAuthority &&
                    SearchData.registrationAuthority !== "未提供" && (
                      <div className="sm:col-span-1">
                        <dt className="text-base font-medium text-gray-500">
                          登記機關
                        </dt>
                        <dd className="mt-1 text-base text-gray-900">
                          {SearchData.registrationAuthority}
                        </dd>
                      </div>
                    )}
                </dl>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  營業項目
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {renderBusinessScope()}
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-xl leading-6 font-medium text-gray-900">
                  公司地址
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center text-base text-gray-900 mb-4">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                    <span>{SearchData.address}</span>
                  </div>
                  {SearchData.financialReportInfo.englishAddress !==
                    "未提供" && (
                    <div className="flex items-center text-base text-gray-900 mb-4">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                      <span>
                        {SearchData.financialReportInfo.englishAddress}
                      </span>
                    </div>
                  )}

                  <CompanyMap address={SearchData.address} />
                </div>
              </div>
            </div>

            <DataSource
              sources={[
                {
                  name: "台灣公司資料",
                  url: "https://company.g0v.ronny.tw/",
                },
              ]}
            />
          </div>
        );
      case "financial":
        return (
          <>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl">
              <div className="px-8 py-8 border-b border-gray-100">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  企業財務與資本資訊
                </h3>
                <p className="text-gray-600">深入解析公司財務結構與資本運作</p>
              </div>

              <div className="p-8">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-blue-600 rounded-full mr-3"></span>
                      基本資訊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {SearchData.financialReportInfo.marketType !==
                        "未提供" && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm font-medium text-gray-500">
                            市場類別
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.marketType}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.code !== "未提供" && (
                        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-lg p-4 border border-blue-100">
                          <p className="text-sm font-medium text-gray-500">
                            股票代號
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.code}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-green-600 rounded-full mr-3"></span>
                      領導團隊
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {SearchData.financialReportInfo.chairman !== "未提供" && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm font-medium text-gray-500">
                            董事長
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.chairman}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.generalManager !==
                        "未提供" && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm font-medium text-gray-500">
                            總經理
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.generalManager}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.spokesperson !==
                        "未提供" && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                          <p className="text-sm font-medium text-gray-500">
                            發言人
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.spokesperson}
                            <span className="text-sm text-gray-500 ml-1">
                              (
                              {SearchData.financialReportInfo.spokespersonTitle}
                              )
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-amber-500 rounded-full mr-3"></span>
                      里程碑
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {SearchData.financialReportInfo.establishmentDate !==
                        "未提供" && (
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                          <p className="text-sm font-medium text-gray-500">
                            公司創立日期
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.establishmentDate}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.listingDate !==
                        "未提供" && (
                        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                          <p className="text-sm font-medium text-gray-500">
                            股票上市日期
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.listingDate}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-purple-600 rounded-full mr-3"></span>
                      股權結構
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {SearchData.shareholding !== "未提供" && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">
                            主要股東
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.shareholding}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.parValuePerShare !==
                        "未提供" && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">
                            普通股面額
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {SearchData.financialReportInfo.parValuePerShare}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.paidInCapital !== "0" && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">
                            實收資本總額
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            NT${" "}
                            {parseInt(
                              SearchData.financialReportInfo.paidInCapital
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.privatePlacementShares !==
                        "0" && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">
                            私募股份總數
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {parseInt(
                              SearchData.financialReportInfo
                                .privatePlacementShares
                            ).toLocaleString()}{" "}
                            股
                          </p>
                        </div>
                      )}
                      {SearchData.financialReportInfo.preferredShares !==
                        "0" && (
                        <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-lg p-4 border border-purple-100">
                          <p className="text-sm font-medium text-gray-500">
                            特別股總數
                          </p>
                          <p className="mt-1 text-base font-medium text-gray-900">
                            {parseInt(
                              SearchData.financialReportInfo.preferredShares
                            ).toLocaleString()}{" "}
                            股
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xl leading-6 font-medium text-gray-900 mb-6 flex items-center">
                      <span className="inline-block w-1 h-6 bg-rose-600 rounded-full mr-3"></span>
                      投資人服務
                    </h4>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {SearchData.financialReportInfo
                            .stockTransferAgency !== "未提供" && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                股務代理機構
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {
                                  SearchData.financialReportInfo
                                    .stockTransferAgency
                                }
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo.transferPhone !==
                            "未提供" && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                股務聯絡電話
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {SearchData.financialReportInfo.transferPhone}
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo.transferAddress !==
                            "未提供" && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-gray-500">
                                股務聯絡地址
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {SearchData.financialReportInfo.transferAddress}
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo
                            .certifiedPublicAccountantFirm !== "未提供" && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                財務簽證會計師事務所
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {
                                  SearchData.financialReportInfo
                                    .certifiedPublicAccountantFirm
                                }
                              </p>
                            </div>
                          )}
                          {SearchData.financialReportInfo
                            .certifiedPublicAccountant1 !== "未提供" && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                簽證會計師
                              </p>
                              <p className="mt-1 text-base text-gray-900">
                                {
                                  SearchData.financialReportInfo
                                    .certifiedPublicAccountant1
                                }
                                {SearchData.financialReportInfo
                                  .certifiedPublicAccountant2 !== "未提供" &&
                                  `、${SearchData.financialReportInfo.certifiedPublicAccountant2}`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DataSource
              sources={[
                {
                  name: "台灣上市上櫃公司",
                  url: "https://p.twincn.com/item.aspx",
                },
              ]}
            />
          </>
        );
      case "directors":
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    董監事與經理人資訊
                  </h3>
                  <p className="text-gray-600">
                    深入探索公司治理結構，掌握關鍵決策者動態
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setView("chart")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      view === "chart"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-medium">視覺圖表</span>
                  </button>
                  <button
                    onClick={() => setView("table")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      view === "table"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Table className="h-5 w-5" />
                    <span className="font-medium">詳細資訊</span>
                  </button>
                </div>
              </div>

              {(!SearchData.directors || SearchData.directors.length === 0) &&
              (!SearchData.managers || SearchData.managers.length === 0) ? (
                <NoDataFound message="查無董事會、經理人資料" />
              ) : view === "chart" ? (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  {SearchData.directors && SearchData.directors.length > 0 ? (
                    <DirectorsChart directors={SearchData.directors} />
                  ) : (
                    <NoDataFound message="查無董事會資料" />
                  )}
                  {SearchData.managers && SearchData.managers.length > 0 ? (
                    <ManagersTimeline
                      managers={SearchData.managers}
                      established={SearchData.established}
                    />
                  ) : (
                    <NoDataFound message="查無經理人資料" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                  {SearchData.directors && SearchData.directors.length > 0 ? (
                    <DirectorsTable
                      directors={SearchData.directors}
                      onViewChange={setView}
                    />
                  ) : (
                    <NoDataFound message="查無董事會資料" />
                  )}
                  {SearchData.managers && SearchData.managers.length > 0 ? (
                    <ManagersTable
                      managers={SearchData.managers}
                      onViewChange={setView}
                    />
                  ) : (
                    <NoDataFound message="查無經理人資料" />
                  )}
                </div>
              )}
            </div>

            <DataSource
              sources={[
                {
                  name: "台灣公司資料",
                  url: "https://company.g0v.ronny.tw/",
                },
              ]}
            />
          </div>
        );
      // case "tenders":
      //   return (
      //     <div className="space-y-6">
      //       <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
      //         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      //           <div>
      //             <h3 className="text-3xl font-bold text-gray-900 mb-2">
      //               標案全景
      //             </h3>
      //             <p className="text-gray-600">
      //               深入解析企業的採購生態圖，追蹤每一筆關鍵商機
      //             </p>
      //           </div>
      //           <div className="flex flex-col sm:flex-row gap-3">
      //             <button
      //               onClick={() => setTenderView("chart")}
      //               className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
      //                 tenderView === "chart"
      //                   ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
      //                   : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      //               }`}
      //             >
      //               <BarChart3 className="h-5 w-5" />
      //               <span className="font-medium">視覺圖表</span>
      //             </button>
      //             <button
      //               onClick={() => setTenderView("list")}
      //               className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
      //                 tenderView === "list"
      //                   ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
      //                   : "bg-gray-50 text-gray-700 hover:bg-gray-100"
      //               }`}
      //             >
      //               <Table className="h-5 w-5" />
      //               <span className="font-medium">詳細資訊</span>
      //             </button>
      //           </div>
      //         </div>

      //         {isLoadingMore ? (
      //           <div className="pt-36 pb-8">
      //             <InlineLoading />
      //           </div>
      //         ) : tenderError ? (
      //           <div className="text-center py-12">
      //             <p className="text-gray-500">{tenderError}</p>
      //           </div>
      //         ) : tenders.length > 0 ? (
      //           tenderView === "list" ? (
      //             <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      //               <table className="min-w-full divide-y divide-gray-200">
      //                 <thead className="bg-gray-50">
      //                   <tr>
      //                     <th
      //                       scope="col"
      //                       className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]"
      //                     >
      //                       得標日期
      //                     </th>
      //                     <th
      //                       scope="col"
      //                       className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[35%]"
      //                     >
      //                       採購專案名稱
      //                     </th>
      //                     <th
      //                       scope="col"
      //                       className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[20%]"
      //                     >
      //                       招標機關
      //                     </th>
      //                     <th
      //                       scope="col"
      //                       className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[10%]"
      //                     >
      //                       得標狀態
      //                     </th>
      //                   </tr>
      //                 </thead>
      //                 <tbody className="bg-white divide-y divide-gray-200">
      //                   {tenders.map((tender, index) => (
      //                     <tr
      //                       key={`${tender.tenderId}-${index}`}
      //                       className="hover:bg-gray-50 cursor-pointer"
      //                       onClick={() => onTenderSelect?.(tender.tenderId)}
      //                     >
      //                       <td className="px-6 py-4 text-base text-gray-500">
      //                         {tender.date}
      //                       </td>
      //                       <td className="px-6 py-4 text-base text-gray-900">
      //                         <div className="line-clamp-2">{tender.title}</div>
      //                       </td>
      //                       <td className="px-6 py-4 text-base text-gray-900">
      //                         <div className="line-clamp-2">
      //                           {tender.unitName}
      //                         </div>
      //                       </td>
      //                       <td className="px-6 py-4">
      //                         <span
      //                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
      //                             tender.status === "得標"
      //                               ? "bg-green-100 text-green-800"
      //                               : "bg-yellow-100 text-yellow-800"
      //                           }`}
      //                         >
      //                           {tender.status}
      //                         </span>
      //                       </td>
      //                     </tr>
      //                   ))}
      //                 </tbody>
      //               </table>
      //             </div>
      //           ) : (
      //             <TenderStatsChart
      //               tenders={tenders}
      //               isLoadingMore={isLoadingMore}
      //               progress={progress}
      //               totalPages={totalPages}
      //               currentPage={currentPage}
      //               isFullyLoaded={!isLoadingMore && currentPage === totalPages}
      //             />
      //           )
      //         ) : (
      //           <NoDataFound message="查無標案資料" />
      //         )}
      //       </div>
      //       <DataSource
      //         sources={[
      //           {
      //             name: "標案瀏覽",
      //             url: "https://pcc-api.openfun.app/",
      //           },
      //         ]}
      //       />
      //     </div>
      //   );
      // case 'risk':
      //   return (
      //     <div className="space-y-6">
      //       <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
      //         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      //           <div>
      //             <h3 className="text-3xl font-bold text-gray-900 mb-2">風險評估</h3>
      //             <div className="flex items-center">
      //               <p className="text-gray-600 mr-2">企業法律風險全景分析與深度洞察</p>
      //               <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
      //                 機密情報
      //               </div>
      //             </div>
      //           </div>
      //           <div className="flex flex-col sm:flex-row gap-3">
      //             <button
      //               onClick={() => {
      //                 setView('chart');
      //                 trackEvent('risk_assessment_view_change', { view: 'chart' });
      //               }}
      //               className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
      //                 view === 'chart'
      //                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      //                   : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      //               }`}
      //             >
      //               <BarChart3 className="h-5 w-5" />
      //               <span className="font-medium">視覺圖表</span>
      //             </button>
      //             <button
      //               onClick={() => {
      //                 setView('table');
      //                 trackEvent('risk_assessment_view_change', { view: 'table' });
      //               }}
      //               className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
      //                 view === 'table'
      //                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
      //                   : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
      //               }`}
      //             >
      //               <Table className="h-5 w-5" />
      //               <span className="font-medium">詳細資訊</span>
      //             </button>
      //           </div>
      //         </div>

      //         {view === 'chart' ? (
      //           <div className="space-y-6">
      //             <div className="p-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl">
      //               <div className="bg-white p-6 rounded-xl">
      //                 <div className="flex justify-between items-center mb-6">
      //                   <h4 className="text-xl font-semibold text-gray-800">法律風險概覽</h4>
      //                   <div className="bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
      //                     更新於 2024/11/10
      //                   </div>
      //                 </div>

      //                 <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-6 mb-6">
      //                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-40"></div>
      //                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-100 rounded-full -ml-12 -mb-12 opacity-40"></div>

      //                   <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
      //                     <div className="text-center md:text-left mb-4 md:mb-0">
      //                       <h5 className="text-lg font-medium text-gray-800 mb-1">整體風險評分</h5>
      //                       <div className="text-5xl font-bold text-blue-600">36</div>
      //                       <p className="text-sm text-gray-600 mt-1">低等風險水平</p>
      //                     </div>

      //                     <div className="h-52 w-52 relative">
      //                       <svg className="w-full h-full" viewBox="0 0 100 100">
      //                         <circle
      //                           cx="50" cy="50" r="45"
      //                           fill="none"
      //                           stroke="#e5e7eb"
      //                           strokeWidth="10"
      //                         />
      //                         <circle
      //                           cx="50" cy="50" r="45"
      //                           fill="none"
      //                           stroke="#3b82f6"
      //                           strokeWidth="10"
      //                           strokeDasharray="100 200"
      //                           strokeDashoffset="0"
      //                           strokeLinecap="round"
      //                           className="transition-all duration-100 ease-out"
      //                           transform="rotate(-90 50 50)"
      //                         >
      //                           <animate
      //                             attributeName="stroke-dasharray"
      //                             values="0 283;102 283"
      //                             dur="1.5s"
      //                             fill="freeze"
      //                           />
      //                         </circle>
      //                         <text x="50" y="55" textAnchor="middle" className="text-2xl font-bold" fill="#1e40af">36%</text>
      //                       </svg>
      //                     </div>

      //                     <div className="text-center md:text-right">
      //                       <h5 className="text-lg font-medium text-gray-800 mb-1">同行業平均</h5>
      //                       <div className="text-5xl font-bold text-gray-400">42</div>
      //                       <p className="text-sm text-gray-600 mt-1">低風險水平</p>
      //                     </div>
      //                   </div>

      //                   <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4">
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">合約糾紛</div>
      //                       <div className="text-xl font-bold text-blue-600">45</div>
      //                     </div>
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">財務爭議</div>
      //                       <div className="text-xl font-bold text-purple-600">38</div>
      //                     </div>
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">智財風險</div>
      //                       <div className="text-xl font-bold text-pink-600">22</div>
      //                     </div>
      //                     <div className="text-center">
      //                       <div className="text-sm font-medium text-gray-500">合規指數</div>
      //                       <div className="text-xl font-bold text-green-600">60</div>
      //                     </div>
      //                   </div>
      //                 </div>

      //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      //                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 flex flex-col">
      //                     <div className="text-xl font-medium text-gray-900 mb-2">案件類型佔比</div>
      //                     <div className="flex-1 flex items-center justify-center">
      //                       <div className="relative w-full h-64">
      //                         <div className="absolute inset-0 flex items-center justify-center">
      //                           <div className="bg-white rounded-full h-32 w-32 flex items-center justify-center shadow-md">
      //                             <span className="text-lg font-semibold text-gray-800">219</span>
      //                           </div>
      //                         </div>
      //                         <svg className="w-full h-full" viewBox="0 0 100 100">
      //                           <circle
      //                             cx="50" cy="50" r="45"
      //                             fill="none"
      //                             stroke="#ddd"
      //                             strokeWidth="10"
      //                           />
      //                           <circle
      //                             cx="50" cy="50" r="45"
      //                             fill="none"
      //                             stroke="#3b82f6"
      //                             strokeWidth="10"
      //                             strokeDasharray="205 283"
      //                             strokeDashoffset="0"
      //                             strokeLinecap="round"
      //                             transform="rotate(-90 50 50)"
      //                           >
      //                             <animate
      //                               attributeName="stroke-dasharray"
      //                               values="0 283;205 283"
      //                               dur="1.5s"
      //                               fill="freeze"
      //                             />
      //                           </circle>
      //                           <circle
      //                             cx="50" cy="50" r="45"
      //                             fill="none"
      //                             stroke="#10b981"
      //                             strokeWidth="10"
      //                             strokeDasharray="75 283"
      //                             strokeDashoffset="-205"
      //                             strokeLinecap="round"
      //                             transform="rotate(-90 50 50)"
      //                           >
      //                             <animate
      //                               attributeName="stroke-dasharray"
      //                               values="0 283;75 283"
      //                               dur="1.5s"
      //                               fill="freeze"
      //                             />
      //                           </circle>
      //                           <circle
      //                             cx="50" cy="50" r="45"
      //                             fill="none"
      //                             stroke="#ef4444"
      //                             strokeWidth="10"
      //                             strokeDasharray="3 283"
      //                             strokeDashoffset="-280"
      //                             strokeLinecap="round"
      //                             transform="rotate(-90 50 50)"
      //                           >
      //                             <animate
      //                               attributeName="stroke-dasharray"
      //                               values="0 283;3 283"
      //                               dur="1.5s"
      //                               fill="freeze"
      //                             />
      //                           </circle>
      //                         </svg>
      //                       </div>
      //                     </div>
      //                     <div className="grid grid-cols-3 gap-4 mt-4">
      //                       <div className="flex items-center">
      //                         <span className="w-4 h-4 bg-blue-500 rounded-full mr-2"></span>
      //                         <span className="text-sm font-medium">民事 (85%)</span>
      //                       </div>
      //                       <div className="flex items-center">
      //                         <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span>
      //                         <span className="text-sm font-medium">刑事 (12%)</span>
      //                       </div>
      //                       <div className="flex items-center">
      //                         <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
      //                         <span className="text-sm font-medium">行政 (3%)</span>
      //                       </div>
      //                     </div>
      //                   </div>

      //                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
      //                     <div className="text-xl font-medium text-gray-900 mb-2">時間趨勢分析</div>
      //                     <div className="h-64 relative">
      //                       <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200"></div>
      //                       <div className="absolute left-0 bottom-0 top-0 w-px bg-gray-200"></div>
      //                       <div className="absolute flex items-end inset-0 pb-6 pl-6">
      //                         <svg viewBox="0 0 300 200" className="w-full h-full overflow-visible">
      //                           <defs>
      //                             <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      //                               <stop offset="0%" stopColor="#8b5cf6" />
      //                               <stop offset="100%" stopColor="#ec4899" />
      //                             </linearGradient>
      //                             <linearGradient id="gradientFill" x1="0%" y1="0%" x2="100%" y2="0%">
      //                               <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
      //                               <stop offset="100%" stopColor="rgba(236, 72, 153, 0.2)" />
      //                             </linearGradient>
      //                           </defs>

      //                           <path
      //                             d="M0,150 L50,130 L100,140 L150,90 L200,100 L250,70 L300,30 V200 H0 Z"
      //                             fill="url(#gradientFill)"
      //                           />

      //                           <polyline
      //                             points="0,150 50,130 100,140 150,90 200,100 250,70 300,30"
      //                             fill="none"
      //                             stroke="url(#gradient)"
      //                             strokeWidth="3"
      //                             strokeLinecap="round"
      //                             strokeLinejoin="round"
      //                             className="trend-line"
      //                           >
      //                             <animate
      //                               attributeName="points"
      //                               dur="1.5s"
      //                               values="0,150 0,150 0,150 0,150 0,150 0,150 0,150;0,150 50,130 100,140 150,90 200,100 250,70 300,30"
      //                               fill="freeze"
      //                             />
      //                           </polyline>

      //                           <circle cx="0" cy="150" r="4" fill="#8b5cf6" />
      //                           <circle cx="50" cy="130" r="4" fill="#8b5cf6" />
      //                           <circle cx="100" cy="140" r="4" fill="#8b5cf6" />
      //                           <circle cx="150" cy="90" r="4" fill="#8b5cf6" />
      //                           <circle cx="200" cy="100" r="4" fill="#ec4899" />
      //                           <circle cx="250" cy="70" r="4" fill="#ec4899" />
      //                           <circle cx="300" cy="30" r="4" fill="#ec4899" />
      //                         </svg>
      //                       </div>
      //                       <div className="absolute left-0 bottom-0 flex justify-between w-full px-6 text-xs text-gray-500">
      //                         <span>2018</span>
      //                         <span>2019</span>
      //                         <span>2020</span>
      //                         <span>2021</span>
      //                         <span>2022</span>
      //                         <span>2023</span>
      //                         <span>2024</span>
      //                       </div>
      //                     </div>
      //                     <div className="mt-4 text-sm text-gray-600">
      //                       <p className="font-medium">近3年案件數量增長<span className="text-red-500 font-bold">25%</span></p>
      //                       <p className="text-xs text-gray-500 mt-1">趨勢預測：未來一年可能增加15-20件新案件</p>
      //                     </div>
      //                   </div>
      //                 </div>
      //               </div>
      //             </div>

      //             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      //               <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col transform hover:scale-105 transition-transform duration-300">
      //                 <div className="flex justify-between items-center mb-4">
      //                   <h4 className="text-lg font-semibold text-gray-800">風險評估指數</h4>
      //                   <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
      //                     <AlertTriangle className="h-5 w-5 text-amber-600" />
      //                   </div>
      //                 </div>
      //                 <div className="flex-1 relative pt-2">
      //                   <div className="text-3xl font-bold text-amber-500 mb-4">36</div>
      //                   <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
      //                     <div className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full animate-pulse-slow" style={{ width: '36%' }}></div>
      //                   </div>
      //                   <div className="flex justify-between text-xs text-gray-500 mt-1">
      //                     <span>低風險</span>
      //                     <span>中等風險</span>
      //                     <span>高風險</span>
      //                   </div>
      //                 </div>
      //                 <div className="mt-4 text-sm text-gray-600">
      //                   基於判決書分析的綜合風險評估<br/>
      //                   <span className="text-amber-600 font-medium">需關注：財務爭議、智財權訴訟</span>
      //                 </div>
      //               </div>

      //               <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform duration-300">
      //                 <div className="flex justify-between items-center mb-4">
      //                   <h4 className="text-lg font-semibold text-gray-800">主要風險類型</h4>
      //                   <div className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
      //                     關鍵指標
      //                   </div>
      //                 </div>
      //                 <div className="space-y-4">
      //                   <div>
      //                     <div className="flex justify-between items-center mb-1">
      //                       <span className="text-sm font-medium flex items-center">
      //                         <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
      //                         合約糾紛
      //                       </span>
      //                       <span className="text-sm font-medium">32%</span>
      //                     </div>
      //                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      //                       <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }}>
      //                         <animate
      //                           attributeName="width"
      //                           values="0%;42%"
      //                           dur="1s"
      //                           fill="freeze"
      //                         />
      //                       </div>
      //                     </div>
      //                   </div>
      //                   <div>
      //                     <div className="flex justify-between items-center mb-1">
      //                       <span className="text-sm font-medium flex items-center">
      //                         <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
      //                         財務爭議
      //                       </span>
      //                       <span className="text-sm font-medium">31%</span>
      //                     </div>
      //                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      //                       <div className="h-full bg-green-500 rounded-full" style={{ width: '31%' }}>
      //                         <animate
      //                           attributeName="width"
      //                           values="0%;31%"
      //                           dur="1s"
      //                           fill="freeze"
      //                         />
      //                       </div>
      //                     </div>
      //                   </div>
      //                   <div>
      //                     <div className="flex justify-between items-center mb-1">
      //                       <span className="text-sm font-medium flex items-center">
      //                         <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
      //                         智慧財產
      //                       </span>
      //                       <span className="text-sm font-medium">18%</span>
      //                     </div>
      //                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      //                       <div className="h-full bg-purple-500 rounded-full" style={{ width: '18%' }}>
      //                         <animate
      //                           attributeName="width"
      //                           values="0%;18%"
      //                           dur="1s"
      //                           fill="freeze"
      //                         />
      //                       </div>
      //                     </div>
      //                   </div>
      //                   <div>
      //                     <div className="flex justify-between items-center mb-1">
      //                       <span className="text-sm font-medium flex items-center">
      //                         <span className="inline-block w-2 h-2 rounded-full bg-gray-500 mr-2"></span>
      //                         其他
      //                       </span>
      //                       <span className="text-sm font-medium">9%</span>
      //                     </div>
      //                     <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
      //                       <div className="h-full bg-gray-500 rounded-full" style={{ width: '9%' }}>
      //                         <animate
      //                           attributeName="width"
      //                           values="0%;9%"
      //                           dur="1s"
      //                           fill="freeze"
      //                         />
      //                       </div>
      //                     </div>
      //                   </div>
      //                 </div>
      //                 <div className="mt-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
      //                   <div className="flex items-center">
      //                     <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1"></div>
      //                     <span>同行業合約糾紛平均僅為27%</span>
      //                   </div>
      //                 </div>
      //               </div>

      //               <div className="bg-white rounded-xl shadow-sm p-6 transform hover:scale-105 transition-transform duration-300">
      //                 <div className="text-lg font-semibold text-gray-800 mb-4">法院審理分布</div>
      //                 <div className="space-y-3">
      //                   <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
      //                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
      //                       1
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">臺灣臺北地方法院</div>
      //                       <div className="text-xs text-gray-500">89 件案件</div>
      //                     </div>
      //                     <div className="text-sm font-medium">31%</div>
      //                   </div>
      //                   <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
      //                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
      //                       2
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">臺灣士林地方法院</div>
      //                       <div className="text-xs text-gray-500">58 件案件</div>
      //                     </div>
      //                     <div className="text-sm font-medium">21%</div>
      //                   </div>
      //                   <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
      //                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-3">
      //                       3
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">臺灣新北地方法院</div>
      //                       <div className="text-xs text-gray-500">34 件案件</div>
      //                     </div>
      //                     <div className="text-sm font-medium">16%</div>
      //                   </div>
      //                   <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
      //                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium mr-3">
      //                       4+
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">其他法院</div>
      //                       <div className="text-xs text-gray-500">76 件案件</div>
      //                     </div>
      //                     <div className="text-sm font-medium">35%</div>
      //                   </div>
      //                   <div className="flex items-center p-2 rounded-lg hover:bg-blue-50 transition-colors">
      //                     <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium mr-3">
      //                       5
      //                     </div>
      //                     <div className="flex-1">
      //                       <div className="text-sm font-medium">臺灣桃園地方法院</div>
      //                       <div className="text-xs text-gray-500">35 件案件</div>
      //                     </div>
      //                     <div className="text-sm font-medium">12%</div>
      //                   </div>
      //                 </div>
      //                 <button className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors">
      //                   查看所有法院分佈 →
      //                 </button>
      //               </div>
      //             </div>
      //           </div>
      //         ) : (
      //           <div className="bg-white rounded-xl shadow-sm">
      //             <div className="px-6 py-4 border-b border-gray-200">
      //               <p className="text-sm text-gray-500 mt-1">共有 219 筆資料</p>
      //             </div>

      //             <div className="p-4 bg-gray-50 border-b border-gray-200">
      //               <div className="flex flex-wrap items-center gap-3">
      //                 <div className="flex-1">
      //                   <div className="relative">
      //                     <input
      //                       type="search"
      //                       placeholder="搜尋判決書關鍵字..."
      //                       className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      //                     />
      //                     <div className="absolute left-3 top-2.5 text-gray-400">
      //                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      //                       </svg>
      //                     </div>
      //                   </div>
      //                 </div>

      //                 <div className="flex gap-2">
      //                   <div className="relative inline-block">
      //                     <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50">
      //                       <Filter className="h-4 w-4 text-gray-500" />
      //                       <span>過濾條件</span>
      //                     </button>
      //                   </div>

      //                   <div className="relative inline-block">
      //                     <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium hover:bg-gray-50">
      //                       <Clock className="h-4 w-4 text-gray-500" />
      //                       <span>日期範圍</span>
      //                     </button>
      //                   </div>

      //                   <div className="relative inline-block">
      //                     <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm font-medium text-blue-600 hover:bg-blue-100">
      //                       <Download className="h-4 w-4" />
      //                       <span>匯出報告</span>
      //                     </button>
      //                   </div>
      //                 </div>
      //               </div>
      //             </div>

      //             <div className="overflow-x-auto">
      //               <table className="min-w-full divide-y divide-gray-200">
      //                 <thead className="bg-gray-50">
      //                   <tr>
      //                     <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[15%]">日期</th>
      //                     <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[85%]">內容</th>
      //                   </tr>
      //                 </thead>
      //                 <tbody className="bg-white divide-y divide-gray-200">
      //                   <tr className="hover:bg-gray-50 transition-colors risk-item-hover">
      //                     <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
      //                       <div className="flex flex-col">
      //                         <span className="font-medium">2024/11/08</span>
      //                         <span className="text-xs text-gray-400">5天前</span>
      //                       </div>
      //                     </td>
      //                     <td className="px-6 py-4">
      //                       <div className="flex items-start gap-3">
      //                         <div className="mt-1 flex-shrink-0">
      //                           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
      //                             <FileText className="h-4 w-4 text-blue-600" />
      //                           </div>
      //                         </div>
      //                         <div className="flex-1">
      //                           <div className="text-base text-gray-900 font-medium mb-1">給付買賣價金等</div>
      //                           <div className="text-sm text-gray-500">
      //                             <p><span className="font-medium">法院案號：</span>臺灣新竹地方法院 113年度補字1196號</p>
      //                             <p><span className="font-medium">案件類別：</span><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">民事</span></p>
      //                             <p><span className="font-medium">相關人員：</span>彭義,楊明,超群,彭義誠,楊明箴,王超群,葉欣宜,郭家慧,聲明第二項,國眾電腦股份有限公司</p>
      //                           </div>
      //                           <div className="mt-2">
      //                             <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
      //                               查看詳情 →
      //                             </button>
      //                           </div>
      //                         </div>
      //                       </div>
      //                     </td>
      //                   </tr>
      //                   <tr className="hover:bg-gray-50 transition-colors risk-item-hover">
      //                     <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
      //                       <div className="flex flex-col">
      //                         <span className="font-medium">2024/09/24</span>
      //                         <span className="text-xs text-gray-400">1個月前</span>
      //                       </div>
      //                     </td>
      //                     <td className="px-6 py-4">
      //                       <div className="flex items-start gap-3">
      //                         <div className="mt-1 flex-shrink-0">
      //                           <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
      //                             <FileText className="h-4 w-4 text-orange-600" />
      //                           </div>
      //                         </div>
      //                         <div className="flex-1">
      //                           <div className="text-base text-gray-900 font-medium mb-1">侵權行為損害賠償</div>
      //                           <div className="text-sm text-gray-500">
      //                             <p><span className="font-medium">法院案號：</span>臺灣新北地方法院 113年度簡上附民移簡字4號</p>
      //                             <p><span className="font-medium">案件類別：</span><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">民事</span></p>
      //                             <p><span className="font-medium">相關人員：</span>冠麟,少華,方圓,日盛,李水,筱琪,周少華,張筱琪,李水哲,李瑞芝,胡修辰,莊佩頴,蔡明興,許嘉展,郭冠麟,中和分公司,營造有限公司,耀營造有限公司,銘耀營造有限公司,國眾電腦股份有限公司</p>
      //                           </div>
      //                           <div className="mt-2">
      //                             <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
      //                               查看詳情 →
      //                             </button>
      //                           </div>
      //                         </div>
      //                       </div>
      //                     </td>
      //                   </tr>
      //                   <tr className="hover:bg-gray-50 transition-colors risk-item-hover">
      //                     <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
      //                       <div className="flex flex-col">
      //                         <span className="font-medium">2024/06/28</span>
      //                         <span className="text-xs text-gray-400">4個月前</span>
      //                       </div>
      //                     </td>
      //                     <td className="px-6 py-4">
      //                       <div className="flex items-start gap-3">
      //                         <div className="mt-1 flex-shrink-0">
      //                           <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
      //                             <FileText className="h-4 w-4 text-purple-600" />
      //                           </div>
      //                         </div>
      //                         <div className="flex-1">
      //                           <div className="text-base text-gray-900 font-medium mb-1">除權判決（股票）</div>
      //                           <div className="text-sm text-gray-500">
      //                             <p><span className="font-medium">法院案號：</span>臺灣士林地方法院 113年度除字315號</p>
      //                             <p><span className="font-medium">案件類別：</span><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">民事</span></p>
      //                             <p><span className="font-medium">相關人員：</span>宋姿,純真,吳純真,林榮毅,昇科技股份有限公司,國眾電腦股份有限公司,岱昇科技股份有限公司</p>
      //                           </div>
      //                           <div className="mt-2">
      //                             <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
      //                               查看詳情 →
      //                             </button>
      //                           </div>
      //                         </div>
      //                       </div>
      //                     </td>
      //                   </tr>
      //                   <tr className="hover:bg-gray-50 transition-colors risk-item-hover">
      //                     <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
      //                       <div className="flex flex-col">
      //                         <span className="font-medium">2024/04/26</span>
      //                         <span className="text-xs text-gray-400">6個月前</span>
      //                       </div>
      //                     </td>
      //                     <td className="px-6 py-4">
      //                       <div className="flex items-start gap-3">
      //                         <div className="mt-1 flex-shrink-0">
      //                           <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
      //                             <FileText className="h-4 w-4 text-red-600" />
      //                           </div>
      //                         </div>
      //                         <div className="flex-1">
      //                           <div className="text-base text-gray-900 font-medium mb-1">貪污等</div>
      //                           <div className="text-sm text-gray-500">
      //                             <p><span className="font-medium">法院案號：</span>臺灣臺北地方法院 108年度訴字624號</p>
      //                             <p><span className="font-medium">案件類別：</span><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">刑事</span></p>
      //                             <p><span className="font-medium">相關人員：</span>台北,吳素,告⑫,告⑬,安心,宋瑋,張羅,張耀,彭麗,李碧,李維,林炳,林艷,林裕,楊立,王坤,部長,陳春,陳泰,CO.,劉彥良,劉永紘,劉金安,吳佩蓉,吳祚綏,周家弘,張世杰,張文霞,張淑華,張義明,施汎泉,曾子瑜,李允斌,李敏雄,李文中,李浩陽,李紹齊,李維中,李鐘鑫,林子堯,林志遠,林淑慧,楊...</p>
      //                           </div>
      //                           <div className="mt-2 flex gap-2">
      //                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
      //                               需關注
      //                             </span>
      //                             <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
      //                               查看詳情 →
      //                             </button>
      //                           </div>
      //                         </div>
      //                       </div>
      //                     </td>
      //                   </tr>
      //                   <tr className="hover:bg-gray-50 transition-colors risk-item-hover">
      //                     <td className="px-6 py-4 whitespace-nowrap text-base text-gray-500">
      //                       <div className="flex flex-col">
      //                         <span className="font-medium">2023/11/14</span>
      //                         <span className="text-xs text-gray-400">12個月前</span>
      //                       </div>
      //                     </td>
      //                     <td className="px-6 py-4">
      //                       <div className="flex items-start gap-3">
      //                         <div className="mt-1 flex-shrink-0">
      //                           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
      //                             <FileText className="h-4 w-4 text-blue-600" />
      //                           </div>
      //                         </div>
      //                         <div className="flex-1">
      //                           <div className="text-base text-gray-900 font-medium mb-1">公示催告</div>
      //                           <div className="text-sm text-gray-500">
      //                             <p><span className="font-medium">法院案號：</span>臺灣臺北地方法院 112年度司催字2014號</p>
      //                             <p><span className="font-medium">案件類別：</span><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">民事</span></p>
      //                             <p><span className="font-medium">相關人員：</span>慧萍,超群,林慧萍,王超群,北新分公司,業銀行股份,業銀行股份有限公司,國眾電腦股份有限公司</p>
      //                           </div>
      //                           <div className="mt-2">
      //                             <button className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium">
      //                               查看詳情 →
      //                             </button>
      //                           </div>
      //                         </div>
      //                       </div>
      //                     </td>
      //                   </tr>
      //                 </tbody>
      //               </table>
      //             </div>
      //             <div className="px-6 py-4">
      //               <Pagination
      //                 currentPage={riskCurrentPage}
      //                 totalPages={riskTotalPages}
      //                 onPageChange={(page) => {
      //                   setRiskCurrentPage(page);
      //                   trackEvent('risk_assessment_page_change', { page });
      //                 }}
      //               />
      //             </div>
      //           </div>
      //         )}
      //       </div>

      //       <DataSource
      //         sources={[
      //           {
      //             name: '司法院全球資訊網',
      //             url: 'https://www.judicial.gov.tw/tw/np-117-1.html'
      //           }
      //         ]}
      //       />
      //     </div>
      //   );
      default:
        return <UnderDevelopment />;
    }
  };

  return (
    <div className="space-y-6">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={`/company/detail/${taxId}`}
      />

      <div className="flex items-center justify-between">
        <BackButton
          returnPath="/company/search"
          sessionKey="companySearchParams"
        />
      </div>
      <div className="bg-white shadow-sm rounded-lg p-8">
        <div className="flex items-start justify-between items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {SearchData.name}
            </h2>
          </div>

          <div className="flex space-x-4">
            <button className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-pink-400 hover:bg-pink-500 transition-colors duration-2000">
              一鍵生成精美官網
            </button>
            <button className="inline-flex items-center px-6 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              加入追蹤
            </button>
            <button className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
              下載報表
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "bg-white shadow-sm"
                  : "hover:bg-white/60"
              } flex-1 flex items-center justify-center py-2.5 px-3 rounded-md text-base font-medium transition-all duration-200`}
            >
              <Icon
                className={`h-6 w-6 ${
                  activeTab === tab.id ? "text-blue-600" : "text-gray-400"
                } mr-2`}
              />
              {tab.name}
            </button>
          );
        })}
      </div>

      {renderTabContent()}
    </div>
  );
}
