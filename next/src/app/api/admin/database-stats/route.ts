import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connection';
import fs from 'fs/promises';
import path from 'path';
import { Collection } from 'mongodb';

async function getLatestBackupInfo() {
  const backupDir = path.join(process.cwd(), 'db', 'backups');
  try {
    try {
      await fs.access(backupDir);
    } catch (e) {
      console.log('Backup directory does not exist, creating it.');
      await fs.mkdir(backupDir, { recursive: true });
      return { latestBackupDate: null, backupCount: 0 };
    }

    const files = await fs.readdir(backupDir);
    const backupFiles = files.filter(f => f.endsWith('.tar.gz') && f.startsWith('db-backup-'));
    
    if (backupFiles.length === 0) {
      return { latestBackupDate: null, backupCount: 0 };
    }

    const fileStats = await Promise.all(
      backupFiles.map(async file => {
        const filePath = path.join(backupDir, file);
        const stat = await fs.stat(filePath);
        return { file, mtime: stat.mtime };
      })
    );

    fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    
    const latestFile = fileStats[0];

    return {
      latestBackupDate: latestFile.mtime.toISOString(),
      backupCount: backupFiles.length,
    };
  } catch (error) {
    console.error('Error reading backup directory:', error);
    return { latestBackupDate: null, backupCount: 0 };
  }
}

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (token !== process.env.ADMIN_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not found.');
    }

    const stats = await db.stats();
    const collections = await db.listCollections().toArray();
    const backupInfo = await getLatestBackupInfo();

    const collectionDetails = await Promise.all(
      collections.map(async (col) => {
        const collectionStats = await db.command({ collStats: col.name });
        return {
          name: col.name,
          count: collectionStats.count,
          size: collectionStats.size,
          avgObjSize: collectionStats.avgObjSize || 0,
          storageSize: collectionStats.storageSize,
          totalIndexSize: collectionStats.totalIndexSize,
        };
      })
    );

    return NextResponse.json({
      connection: true,
      collections: collections.length,
      objects: stats.objects,
      dataSize: stats.dataSize,
      ...backupInfo,
      collectionDetails,
    });
  } catch (error) {
    console.error('Database stats error:', error);
    const backupInfo = await getLatestBackupInfo();
    return NextResponse.json({
      connection: false,
      collections: 0,
      objects: 0,
      dataSize: 0,
      ...backupInfo,
      collectionDetails: [],
    }, { status: 500 });
  }
}