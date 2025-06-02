import { NextResponse } from 'next/server';

/**
 * 健康檢查 API 端點
 * 用於 Docker 容器健康檢查和服務監控
 */
export async function GET() {
  try {
    // 檢查基本服務狀態
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'business-magnifier',
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}