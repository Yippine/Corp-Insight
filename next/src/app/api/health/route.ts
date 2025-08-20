import { NextResponse } from 'next/server';

/**
 * 健康檢查 API 端點
 * 用於 Docker 容器健康檢查和服務監控
 */
export async function GET() {
  try {
    // 基本的健康檢查，確認應用程式正在運行
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      node_version: process.version,
      platform: process.platform,
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
