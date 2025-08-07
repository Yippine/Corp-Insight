import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { IAITool } from '@/lib/database/models/AITool';

async function getDb() {
  const uri =
    process.env.MONGODB_URI ||
    'mongodb://admin:password@localhost:27017/corp-insight?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  return client.db('corp-insight');
}

export async function POST(request: Request) {
  // 1. 環境安全檢查
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: '此功能僅在開發環境中可用' },
      { status: 403 }
    );
  }

  try {
    const { toolId, prefix, suffix } = await request.json();

    // 2. 輸入驗證
    if (!toolId || typeof toolId !== 'string') {
      return NextResponse.json(
        { success: false, error: '無效的輸入：toolId 是必要的且必須是字串' },
        { status: 400 }
      );
    }
    // 允許 prefix 和 suffix 為空字串，但型別必須是字串
    if (typeof prefix !== 'string' || typeof suffix !== 'string') {
      return NextResponse.json(
        { success: false, error: '無效的輸入：prefix 和 suffix 必須是字串' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<IAITool>('ai_tools');

    // 3. 更新資料庫：使用聚合管線確保操作的健壯性
    // 這樣即使 promptTemplate 為 null，也能正常更新其子欄位
    const result = await collection.updateOne({ id: toolId }, [
      {
        $set: {
          promptTemplate: { $ifNull: ['$promptTemplate', {}] },
        },
      },
      {
        $set: {
          'promptTemplate.prefix': prefix,
          'promptTemplate.suffix': suffix,
          updatedAt: new Date(),
        },
      },
    ]);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: `找不到 id 為 ${toolId} 的 AI 工具` },
        { status: 404 }
      );
    }

    // 4. 成功回應
    return NextResponse.json({
      success: true,
      message: `AI 工具（id：${toolId}）的提示詞已成功更新`,
      data: {
        toolId: toolId,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ 更新 AI 工具提示詞時發生錯誤：', error);
    const errorMessage =
      error instanceof Error ? error.message : '未知伺服器錯誤';
    return NextResponse.json(
      { success: false, error: `伺服器錯誤：${errorMessage}` },
      { status: 500 }
    );
  }
}
