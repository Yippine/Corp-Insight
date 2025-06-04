#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

// 顏色輸出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

async function findLatestBackup() {
    const backupDir = path.join(__dirname, '..', 'db', 'backups');
    
    if (!fs.existsSync(backupDir)) {
        throw new Error('備份目錄不存在！');
    }
    
    const files = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('ai_tools_backup_') && file.endsWith('.json'))
        .map(file => ({
            name: file,
            path: path.join(backupDir, file),
            timestamp: file.match(/ai_tools_backup_(\d{8}_\d{6})\.json/)?.[1] || '00000000_000000'
        }))
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    
    if (files.length === 0) {
        throw new Error('找不到備份檔案！');
    }
    
    return files[0];
}

async function checkDockerContainer() {
    try {
        const { stdout } = await execAsync('docker ps --filter "name=business-magnifier-mongo" --format "{{.Names}}"');
        if (!stdout.trim().includes('business-magnifier-mongo')) {
            throw new Error('MongoDB 容器未運行！請先啟動 Docker 服務。');
        }
        console.log(colorize('✅ Docker 容器檢查通過', 'green'));
    } catch (error) {
        throw new Error(`Docker 容器檢查失敗：${error.message}`);
    }
}

async function copyFileToContainer(sourceFile, targetPath) {
    try {
        const command = `docker cp "${sourceFile}" business-magnifier-mongo:${targetPath}`;
        console.log(colorize(`📋 複製檔案到容器：${path.basename(sourceFile)}`, 'blue'));
        await execAsync(command);
        console.log(colorize('✅ 檔案複製成功', 'green'));
    } catch (error) {
        throw new Error(`檔案複製失敗：${error.message}`);
    }
}

async function restoreData(containerFilePath) {
    try {
        console.log(colorize('🔄 開始還原資料...', 'blue'));
        
        // 使用更簡化的 mongoimport 指令
        const command = [
            'docker exec business-magnifier-mongo',
            'bash -c',
            `"mongoimport`,
            `--host=localhost:27017`,
            `--db=business-magnifier`,
            `--collection=ai_tools`,
            `--username=admin`,
            `--password=password`,
            `--authenticationDatabase=admin`,
            `--jsonArray`,
            `--drop`,
            `--file=${containerFilePath}"`
        ].join(' ');
        
        console.log(colorize('📝 執行指令：', 'yellow'));
        console.log(colorize(command, 'yellow'));
        
        const { stdout, stderr } = await execAsync(command);
        
        if (stderr && !stderr.includes('connected to:')) {
            console.warn(colorize(`⚠️  警告：${stderr}`, 'yellow'));
        }
        
        if (stdout) {
            console.log(colorize('📊 輸出：', 'blue'));
            console.log(stdout);
        }
        
        console.log(colorize('✅ 資料還原成功！', 'green'));
    } catch (error) {
        throw new Error(`資料還原失敗：${error.message}`);
    }
}

async function cleanupTempFile(containerFilePath) {
    try {
        await execAsync(`docker exec business-magnifier-mongo rm -f ${containerFilePath}`);
        console.log(colorize('🧹 臨時檔案清理完成', 'blue'));
    } catch (error) {
        console.warn(colorize(`⚠️  清理警告：${error.message}`, 'yellow'));
    }
}

async function main() {
    const args = process.argv.slice(2);
    let backupFile;
    
    try {
        console.log(colorize('\n🔄 MongoDB AI Tools 資料還原', 'bright'));
        console.log(colorize('=' .repeat(40), 'blue'));
        
        // 檢查 Docker 容器狀態
        await checkDockerContainer();
        
        // 決定使用哪個備份檔案
        if (args.length > 0 && args[0] !== '--latest') {
            const specifiedFile = args[0];
            const backupPath = path.join(__dirname, '..', 'db', 'backups', specifiedFile);
            
            if (!fs.existsSync(backupPath)) {
                throw new Error(`指定的備份檔案不存在：${specifiedFile}`);
            }
            
            backupFile = {
                name: specifiedFile,
                path: backupPath
            };
            console.log(colorize(`📂 使用指定備份檔案：${specifiedFile}`, 'blue'));
        } else {
            console.log(colorize('🔍 搜尋最新的備份檔案...', 'blue'));
            backupFile = await findLatestBackup();
            console.log(colorize(`📂 找到最新備份：${backupFile.name}`, 'green'));
        }
        
        // 檢查備份檔案內容
        const fileContent = fs.readFileSync(backupFile.path, 'utf8');
        let recordCount = 0;
        try {
            const data = JSON.parse(fileContent);
            recordCount = Array.isArray(data) ? data.length : 0;
        } catch (e) {
            // 可能是 JSONL 格式
            recordCount = fileContent.split('\n').filter(line => line.trim()).length;
        }
        
        console.log(colorize(`📊 備份檔案包含 ${recordCount} 筆記錄`, 'cyan'));
        
        // 複製檔案到容器
        const containerFilePath = '/tmp/restore_' + Date.now() + '.json';
        await copyFileToContainer(backupFile.path, containerFilePath);
        
        // 還原資料
        await restoreData(containerFilePath);
        
        // 清理臨時檔案
        await cleanupTempFile(containerFilePath);
        
        console.log(colorize('\n🎉 還原作業完成！', 'bright'));
        console.log(colorize(`📄 使用檔案：${backupFile.name}`, 'green'));
        console.log(colorize(`📊 還原記錄：${recordCount} 筆`, 'green'));
        
    } catch (error) {
        console.error(colorize(`\n❌ 錯誤：${error.message}`, 'red'));
        process.exit(1);
    }
}

// 如果是直接執行此腳本
if (require.main === module) {
    main();
}