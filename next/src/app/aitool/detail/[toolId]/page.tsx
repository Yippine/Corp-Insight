import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getToolsDataFromAPI } from '@/lib/aitool/apiHelpers';
import { AiToolDetailStructuredData, generateAiToolDetailMetadata } from '@/components/SEO/AiToolDetailSEO';
import { staticTitles } from '@/config/pageTitles';
import { SimpleSpinner } from '@/components/common/loading/LoadingTypes';

// 優化動態導入以減少分階段渲染
const AiToolDetail = dynamic(() => import('@/components/aitool/AiToolDetail'), {
  ssr: true,
  loading: () => <SimpleSpinner />
});

interface AiToolDetailPageProps {
  params: {
    toolId: string;
  };
}

export default async function AiToolDetailPage({ params }: AiToolDetailPageProps) {
  const { toolId } = params;
  const tools = await getToolsDataFromAPI();
  const tool = tools.find(t => t.id === toolId);

  if (!tool) {
    notFound();
  }

  return (
    <div className="space-y-4">
      {/* 結構化數據標記 */}
      <AiToolDetailStructuredData tool={tool} />
      
      {/* 詳情頁面 - 直接渲染，不用 Suspense 包裹 */}
      <AiToolDetail tool={tool} />
    </div>
  );
}

export async function generateMetadata({ params }: AiToolDetailPageProps) {
  const { toolId } = params;
  const tools = await getToolsDataFromAPI();
  const tool = tools.find(t => t.id === toolId);

  if (!tool) {
    return {
      title: staticTitles.aiToolNotFound,
      description: '您請求的工具無法找到。請嘗試瀏覽我們的工具列表。'
    };
  }

  return generateAiToolDetailMetadata({ tool });
}