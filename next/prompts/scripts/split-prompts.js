#!/usr/bin/env node

/*
  Split a combined awesome-chatgpt-prompts.md into individual .md files.
  - Detect sections starting with '## ' (assistant name)
  - Ignore non-quote lines like "Contributed by:" and any other metadata
  - Collect only lines that start with '>' (blockquotes)
  - Strip leading '>' characters and spaces, then collapse to a single line
  - Save each as `${assistantName}.md` under ../entries/
*/

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const scriptDir = __dirname;
const rootDir = path.resolve(scriptDir, '..');
const srcPath = path.resolve(rootDir, 'awesome-chatgpt-prompts.md');
const outDir = path.resolve(rootDir, 'entries');

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function sanitizeFileName(name) {
  // Replace invalid characters and collapse whitespace
  const replaced = name.replace(/[\\/:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
  // Avoid empty filenames
  return replaced.length > 0 ? replaced : 'untitled';
}

function getUniqueFilePath(dir, baseName, ext) {
  let candidate = path.join(dir, `${baseName}${ext}`);
  if (!fs.existsSync(candidate)) return candidate;
  let i = 2;
  while (true) {
    candidate = path.join(dir, `${baseName} (${i})${ext}`);
    if (!fs.existsSync(candidate)) return candidate;
    i += 1;
  }
}

async function splitFile() {
  ensureDir(outDir);
  if (!fs.existsSync(srcPath)) {
    console.error(`Source file not found: ${srcPath}`);
    process.exit(1);
  }

  const input = fs.createReadStream(srcPath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input, crlfDelay: Infinity });

  let currentTitle = null;
  let quoteLines = [];
  let sectionsWritten = 0;

  function flushCurrent() {
    if (!currentTitle) return;
    const contentSingleLine = quoteLines
      .filter(line => line.trim().length > 0)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    const sanitized = sanitizeFileName(currentTitle);
    const destPath = getUniqueFilePath(outDir, sanitized, '.md');
    fs.writeFileSync(destPath, contentSingleLine + '\n', 'utf8');
    sectionsWritten += 1;
  }

  for await (const rawLine of rl) {
    const line = rawLine; // keep as-is, we'll trim selectively

    // Detect start of a new section
    if (line.startsWith('## ')) {
      // When encountering a new title, flush the previous one
      if (currentTitle) {
        flushCurrent();
      }
      currentTitle = line.substring(3).trim();
      quoteLines = [];
      continue;
    }

    // Collect only blockquote lines for current section
    if (currentTitle) {
      if (/^>+\s?/.test(line)) {
        // Remove all leading '>' and following spaces
        const stripped = line.replace(/^>+\s?/, '');
        quoteLines.push(stripped);
        continue;
      }
      // Non-quote lines are ignored entirely (e.g., Contributed by, Reference, blanks)
    }
  }

  // Flush the last collected section
  if (currentTitle) {
    flushCurrent();
  }

  rl.close();

  console.log(`Done. Wrote ${sectionsWritten} files to ${outDir}`);
}

splitFile().catch(err => {
  console.error(err);
  process.exit(1);
});
