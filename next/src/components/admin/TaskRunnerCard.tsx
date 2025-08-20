'use client';

import { useState } from 'react';
import {
  Terminal,
  Play,
  StopCircle,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface TaskRunnerCardProps {
  title: string;
  description: string;
  scriptName: string;
}

// A simple ANSI-to-HTML converter
function ansiToHtml(text: string) {
  const ansiRegex = /\\u001b\[([0-9;]*)m/g;
  let html = text.replace(ansiRegex, (match, code) => {
    if (code === '32') return '<span style="color: limegreen;">';
    if (code === '31') return '<span style="color: red;">';
    if (code === '33') return '<span style="color: yellow;">';
    if (code === '0') return '</span>';
    return '';
  });
  // Ensure all spans are closed
  const openSpans = (html.match(/<span/g) || []).length;
  const closedSpans = (html.match(/<\/span>/g) || []).length;
  html += '</span>'.repeat(openSpans - closedSpans);
  return html.replace(/\\n/g, '<br />');
}

export default function TaskRunnerCard({
  title,
  description,
  scriptName,
}: TaskRunnerCardProps) {
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);

  const runScript = async () => {
    setOutput('');
    setError(null);
    setIsRunning(true);
    setExitCode(null);

    try {
      const response = await fetch('/api/admin/run-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET_TOKEN}`,
        },
        body: JSON.stringify({ scriptName }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error || `HTTP error! status: ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        setOutput(prev => prev + chunk);

        // Check for exit code in the final chunk
        const exitCodeMatch = chunk.match(
          /--- Process finished with exit code (\d+) ---/
        );
        if (exitCodeMatch) {
          setExitCode(parseInt(exitCodeMatch[1], 10));
        }
      }
    } catch (err: any) {
      setError(err.message);
      setExitCode(1); // Assume error exit code
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = () => {
    if (isRunning)
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (exitCode === 0)
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (exitCode !== null && exitCode !== 0)
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    if (error) return <AlertTriangle className="h-5 w-5 text-red-500" />;
    return <Terminal className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="flex-grow p-6">
        <h3 className="mb-2 text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>

      {output && (
        <div className="mx-4 mb-4 max-h-60 overflow-y-auto rounded-md bg-gray-900 p-4 font-mono text-xs text-white">
          <pre
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: ansiToHtml(JSON.stringify(output)),
            }}
          ></pre>
        </div>
      )}

      <div className="flex items-center justify-between rounded-b-lg bg-gray-50 px-6 py-4">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-500">
            {isRunning
              ? '執行中...'
              : exitCode !== null
                ? `已結束 (Code: ${exitCode})`
                : '待命中'}
          </span>
        </div>
        <button
          onClick={runScript}
          disabled={isRunning}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? (
            <StopCircle className="mr-2 h-4 w-4" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          {isRunning ? '執行中' : '執行'}
        </button>
      </div>
    </div>
  );
}
