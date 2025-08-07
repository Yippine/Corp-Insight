import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

// 定義 global_settings collection 的文件結構
interface GlobalSetting {
  _id: string;
  description: string;
  template: string;
  createdAt: Date;
  updatedAt: Date;
}

async function getDb() {
  const uri =
    process.env.MONGODB_URI ||
    'mongodb://admin:password@localhost:27017/corp-insight?authSource=admin';
  const client = new MongoClient(uri);
  await client.connect();
  return client.db('corp-insight');
}

export async function POST(request: Request) {
  // 1. 環境安全檢查：確保此 API 僅在開發環境中可用
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: '此功能僅在開發環境中可用' },
      { status: 403 }
    );
  }

  try {
    const { template } = await request.json();

    // 2. 輸入驗證
    if (typeof template !== 'string') {
      return NextResponse.json(
        { success: false, error: '無效的輸入：template 必須是字串' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<GlobalSetting>('global_settings');
    const documentId = 'common_tool_system_prompt';

    // 3. 更新資料庫
    const result = await collection.updateOne(
      { _id: documentId },
      {
        $set: {
          template: template,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: `找不到 _id 為 ${documentId} 的文件` },
        { status: 404 }
      );
    }

    // 4. 成功回應
    return NextResponse.json({
      success: true,
      message: '通用系統提示詞已成功更新',
      data: {
        _id: documentId,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('❌ 更新通用系統提示詞時發生錯誤：', error);
    const errorMessage =
      error instanceof Error ? error.message : '未知伺服器錯誤';
    return NextResponse.json(
      { success: false, error: `伺服器錯誤：${errorMessage}` },
      { status: 500 }
    );
  }
}
