import { NextRequest, NextResponse } from 'next/server';
import { AIToolModel, AIToolDocument } from '@/lib/database/models/AITool';
import { getPromptTools } from '@/lib/aitool/promptTools';

// POST - 執行資料遷移
export async function POST(request: NextRequest) {
  try {
    // 檢查是否已有資料（避免重複遷移）
    const existingTools = await AIToolModel.getAllActive();
    if (existingTools.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Migration already completed. Database contains AI tools.',
        existingCount: existingTools.length
      }, { status: 409 });
    }

    // 從 promptTools.ts 獲取資料
    const promptTools = getPromptTools();
    
    if (!promptTools || promptTools.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No prompt tools found to migrate'
      }, { status: 404 });
    }

    // 轉換資料格式
    const toolsToMigrate: Omit<AIToolDocument, '_id' | 'createdAt' | 'updatedAt'>[] = promptTools.map(tool => {
      // 提取 icon 名稱
      let iconName = 'Zap'; // 預設值
      if (tool.icon && typeof tool.icon === 'function') {
        iconName = tool.icon.displayName || tool.icon.name || 'Zap';
      }

      return {
        id: tool.id,
        name: tool.name,
        description: tool.description,
        icon: iconName,
        tags: tool.tags || ['提示詞'],
        instructions: tool.instructions,
        placeholder: tool.placeholder,
        promptTemplate: tool.promptTemplate,
        category: 'AI 工具',
        subCategory: undefined,
        isActive: true
      };
    });

    // 批量插入到 MongoDB
    const success = await AIToolModel.insertMany(toolsToMigrate);
    
    if (success) {
      // 創建索引以提升查詢效能
      await AIToolModel.createIndexes();
      
      return NextResponse.json({
        success: true,
        message: 'Migration completed successfully',
        migratedCount: toolsToMigrate.length,
        tools: toolsToMigrate.map(t => ({ id: t.id, name: t.name }))
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to migrate tools to database'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in migration:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - 檢查遷移狀態
export async function GET() {
  try {
    const existingTools = await AIToolModel.getAllActive();
    const promptTools = getPromptTools();
    
    return NextResponse.json({
      success: true,
      migrationStatus: {
        toolsInDatabase: existingTools.length,
        toolsInPromptFile: promptTools.length,
        isMigrated: existingTools.length > 0,
        needsMigration: existingTools.length === 0 && promptTools.length > 0
      },
      databaseTools: existingTools.map(t => ({ id: t.id, name: t.name })),
      promptFileTools: promptTools.map(t => ({ id: t.id, name: t.name }))
    });
  } catch (error) {
    console.error('Error checking migration status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check migration status'
    }, { status: 500 });
  }
}

// DELETE - 清空資料庫（僅用於重新遷移）
export async function DELETE() {
  try {
    const success = await AIToolModel.deleteAll();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'All AI tools deleted from database'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete AI tools'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting all tools:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete AI tools'
    }, { status: 500 });
  }
}