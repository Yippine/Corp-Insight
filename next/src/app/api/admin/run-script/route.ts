import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;

// Whitelist of allowed scripts to prevent arbitrary code execution
const SCRIPT_WHITELIST = [
  // Sitemap Management
  'sitemap:test', 'sitemap:monitor', 'sitemap:stop', 'sitemap:status', 'sitemap:clear',
  // Database Operations
  'db:init', 'db:connect', 'db:backup', 'db:backup:core', 'db:restore', 'db:list', 'db:clean',
  // System Diagnostics
  'health:check', 'format:check', 'lint',
];

export async function POST(req: NextRequest) {
  // 1. Security Check: Validate Admin Secret Token
  const authToken = req.headers.get('Authorization')?.split(' ')[1];
  if (!ADMIN_SECRET_TOKEN || authToken !== ADMIN_SECRET_TOKEN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { scriptName } = await req.json();

  // 2. Whitelist Check: Validate script name
  if (typeof scriptName !== 'string' || !SCRIPT_WHITELIST.includes(scriptName)) {
    return new NextResponse(JSON.stringify({ error: 'Invalid or unauthorized script' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Stream Execution: Spawn npm script and stream output
  try {
    const stream = new ReadableStream({
      start(controller) {
        const child = spawn('npm', ['run', scriptName], {
          stdio: 'pipe',
          shell: true, // Use shell to correctly interpret npm scripts
          env: { ...process.env, FORCE_COLOR: '1' }, // Force color for terminal-like output
        });

        const encoder = new TextEncoder();
        const pushToStream = (chunk: any) => {
          controller.enqueue(encoder.encode(chunk.toString()));
        };

        child.stdout.on('data', pushToStream);
        child.stderr.on('data', pushToStream);

        child.on('close', (code) => {
          pushToStream(`\n--- Process finished with exit code ${code} ---\n`);
          controller.close(); // End the stream
        });

        child.on('error', (err) => {
          pushToStream(`\n--- Error spawning process: ${err.message} ---\n`);
          controller.error(err);
        });
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) {
    return new NextResponse(JSON.stringify({ error: 'Failed to execute script', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}