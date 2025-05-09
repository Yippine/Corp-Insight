import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getToolsData } from '@/lib/aitool/tools';
import { AiToolDetailStructuredData, generateAiToolDetailMetadata } from '@/components/SEO/AiToolDetailSEO';

// 使用動態導入以避免 SSR 和客戶端狀態不一致的問題
const AiToolDetail = dynamic(() => import('@/components/aitool/AiToolDetail'), { ssr: false });

interface AiToolDetailPageProps {
  params: {
    toolId: string;
  };
}

export default function AiToolDetailPage({ params }: AiToolDetailPageProps) {
  const { toolId } = params;
  const tools = getToolsData();
  const tool = tools.find(t => t.id === toolId);

  if (!tool) {
    notFound();
  }

  return (
    <div className="space-y-4">
      {/* 結構化數據標記 */}
      <AiToolDetailStructuredData tool={tool} />
      
      {/* 詳情頁面 */}
      <AiToolDetail tool={tool} />
    </div>
  );
}

export function generateMetadata({ params }: AiToolDetailPageProps) {
  const { toolId } = params;
  const tools = getToolsData();
  const tool = tools.find(t => t.id === toolId);

  if (!tool) {
    return {
      title: '找不到工具 | 企業放大鏡™',
      description: '您請求的工具無法找到。請嘗試瀏覽我們的工具列表。'
    };
  }

  return generateAiToolDetailMetadata({ tool });
}

// 靜態生成可能的路徑，以提升性能
export async function generateStaticParams() {
  const tools = getToolsData();
  
  return tools.map(tool => ({
    toolId: tool.id
  }));
}