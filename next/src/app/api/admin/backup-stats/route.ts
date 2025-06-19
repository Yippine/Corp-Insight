import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import * as tar from 'tar';

const ADMIN_SECRET_TOKEN = process.env.ADMIN_SECRET_TOKEN;
const BACKUP_DIR = path.join(process.cwd(), 'db', 'backups');

interface BackupCollectionDetails {
  [collectionName: string]: number;
}

export interface BackupAnalysis {
  fileName: string;
  fileSize: number;
  collections: BackupCollectionDetails;
  totalRecords: number;
  modifiedTime: Date;
  error?: string;
}

async function analyzeBackupFile(filePath: string): Promise<BackupAnalysis> {
  const collections: BackupCollectionDetails = {};
  let totalRecords = 0;

  try {
    await new Promise<void>((resolve, reject) => {
      const entryPromises: Promise<void>[] = [];
      const fileStream = fs.createReadStream(filePath);

      fileStream.on('error', reject);

      const tarStream = tar.t({
        onentry: (entry) => {
          if (entry.type === 'File' && entry.path.endsWith('.json')) {
            const entryPromise = new Promise<void>((resolveEntry, rejectEntry) => {
              const content: Buffer[] = [];
              entry.on('data', (chunk) => content.push(chunk));
              entry.on('error', rejectEntry);
              entry.on('end', () => {
                try {
                  const collectionName = path.basename(entry.path, '.json');
                  const fileContent = Buffer.concat(content).toString('utf8');
                  let recordCount = 0;
                  
                  if (fileContent.trim()) {
                    try {
                      const data = JSON.parse(fileContent);
                      if (Array.isArray(data)) {
                        recordCount = data.length;
                      }
                    } catch (e) {
                      recordCount = fileContent.split('\n').filter(line => line.trim().startsWith('{')).length;
                    }
                  }

                  collections[collectionName] = recordCount;
                  totalRecords += recordCount;
                  resolveEntry();
                } catch (parseError) {
                  rejectEntry(parseError);
                }
              });
            });
            entryPromises.push(entryPromise);
          }
        },
      });

      tarStream.on('error', reject);
      tarStream.on('end', async () => {
        try {
          await Promise.all(entryPromises);
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      fileStream.pipe(tarStream);
    });

    const stats = await fs.promises.stat(filePath);
    return {
      fileName: path.basename(filePath),
      fileSize: stats.size,
      collections,
      totalRecords,
      modifiedTime: stats.mtime,
    };
  } catch (error: any) {
    console.error(`Failed to analyze backup file ${filePath}:`, error);
    const stats = await fs.promises.stat(filePath).catch(() => null);
    return {
      fileName: path.basename(filePath),
      fileSize: stats?.size || 0,
      collections: {},
      totalRecords: 0,
      modifiedTime: stats?.mtime || new Date(),
      error: error.message,
    };
  }
}

export async function GET(req: NextRequest) {
  const authToken = req.headers.get('Authorization')?.split(' ')[1];
  if (!ADMIN_SECRET_TOKEN || authToken !== ADMIN_SECRET_TOKEN) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await fs.promises.access(BACKUP_DIR);
  } catch (error) {
    return NextResponse.json([]);
  }

  try {
    const files = (await fs.promises.readdir(BACKUP_DIR))
      .filter(file => file.endsWith('.tar.gz'))
      .sort((a, b) => b.localeCompare(a));

    if (files.length === 0) {
      return NextResponse.json([]);
    }

    const analyses = await Promise.all(
      files.map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        return analyzeBackupFile(filePath);
      })
    );

    return NextResponse.json(analyses);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: 'Failed to analyze backup files', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}