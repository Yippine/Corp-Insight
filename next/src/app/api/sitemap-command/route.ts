import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// 允許執行的指令白名單
const ALLOWED_COMMANDS = [
  'sitemap:test',
  'sitemap:status', 
  'sitemap:monitor',
  'sitemap:stop',
  'sitemap:clear-cache'
];

interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
}

/**
 * 執行 npm 指令
 */
async function executeNpmCommand(command: string): Promise<CommandResult> {
  return new Promise((resolve) => {
    // 安全檢查：只允許白名單中的指令
    if (!ALLOWED_COMMANDS.includes(command)) {
      resolve({
        success: false,
        output: '',
        error: `❌ 不允許的指令：${command}`
      });
      return;
    }

    const isWindows = process.platform === 'win32';
    const npmCommand = isWindows ? 'npm.cmd' : 'npm';
    
    // 設置工作目錄為 next 項目根目錄
    const cwd = process.cwd();
    
    const child = spawn(npmCommand, ['run', command], {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: isWindows,
      env: { ...process.env }
    });

    let output = '';
    let errorOutput = '';

    // 收集標準輸出
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });

    // 收集錯誤輸出
    child.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });

    // 設置超時 (30 秒)
    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      resolve({
        success: false,
        output: output,
        error: '⏰ 指令執行超時 (30秒)',
        exitCode: -1
      });
    }, 30000);

    // 處理指令完成
    child.on('close', (code) => {
      clearTimeout(timeout);
      
      const isSuccess = code === 0;
      const finalOutput = output || errorOutput;
      
      resolve({
        success: isSuccess,
        output: finalOutput,
        error: isSuccess ? undefined : errorOutput || `指令執行失敗，退出代碼：${code}`,
        exitCode: code || 0
      });
    });

    // 處理執行錯誤
    child.on('error', (error) => {
      clearTimeout(timeout);
      resolve({
        success: false,
        output: '',
        error: `❌ 執行錯誤：${error.message}`,
        exitCode: -1
      });
    });
  });
}

/**
 * 清除緩存文件
 */
async function clearCacheFiles(): Promise<void> {
  try {
    const cacheFiles = [
      '.sitemap-status.json',
      '.sitemap-monitor.pid'
    ];
    
    for (const file of cacheFiles) {
      const filePath = path.join(process.cwd(), file);
      try {
        await fs.unlink(filePath);
      } catch (error) {
        // 文件不存在，忽略錯誤
      }
    }
  } catch (error) {
    console.warn('清除緩存文件時發生錯誤:', error);
  }
}

/**
 * POST /api/sitemap-command
 * 執行 sitemap 相關指令
 */
export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();
    
    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: '❌ 缺少有效的指令參數' },
        { status: 400 }
      );
    }

    console.log(`🚀 執行指令：npm run ${command}`);
    
    // 如果是清除緩存指令，先清除文件
    if (command === 'sitemap:clear-cache') {
      await clearCacheFiles();
    }
    
    // 執行指令
    const result = await executeNpmCommand(command);
    
    // 格式化輸出
    const formattedOutput = `🚀 指令：npm run ${command}\n` +
                           `📅 時間：${new Date().toLocaleString()}\n` +
                           `${result.success ? '✅' : '❌'} 狀態：${result.success ? '成功' : '失敗'}\n\n` +
                           `📋 執行結果：\n${result.output}\n` +
                           (result.error ? `\n❌ 錯誤信息：\n${result.error}` : '');

    return NextResponse.json({
      success: result.success,
      output: formattedOutput,
      command,
      timestamp: new Date().toISOString(),
      exitCode: result.exitCode
    });

  } catch (error) {
    console.error('API 錯誤:', error);
    
    return NextResponse.json(
      { 
        error: '❌ 服務器內部錯誤',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sitemap-command
 * 獲取可用的指令列表
 */
export async function GET() {
  return NextResponse.json({
    commands: ALLOWED_COMMANDS,
    description: 'Sitemap 管理系統可用指令',
    timestamp: new Date().toISOString()
  });
}