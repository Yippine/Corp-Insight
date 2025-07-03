import { NextRequest, NextResponse } from 'next/server';
import { AIToolModel } from '@/lib/database/models/AITool';
import { searchTools } from '@/lib/aitool/data';
import {
  mapAiToolDocumentToTool,
  mapAiToolDocumentsToTools,
} from '@/lib/aitool/utils';

// GET - 獲取所有工具（AI 工具 + 基礎工具）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const tag = searchParams.get('tag') || '';
    const toolId = searchParams.get('id');

    // 如果請求特定工具
    if (toolId) {
      const tool = await AIToolModel.getById(toolId);
      if (!tool) {
        return NextResponse.json(
          {
            success: false,
            error: 'Tool not found',
          },
          { status: 404 }
        );
      }
      // 在回傳前轉換為前端格式
      const formattedTool = mapAiToolDocumentToTool(tool);
      return NextResponse.json({
        success: true,
        data: formattedTool,
      });
    }

    // 使用重構後的 searchTools 函數
    const allTools = await searchTools(query, tag);

    // 在回傳前轉換為前端格式
    const formattedTools = mapAiToolDocumentsToTools(allTools);

    return NextResponse.json({
      success: true,
      data: formattedTools,
      count: formattedTools.length,
      filters: {
        query: query || null,
        tag: tag || null,
        category: null, // category is not supported by searchTools yet
      },
    });
  } catch (error) {
    console.error('Error fetching AI tools:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch AI tools',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - 創建新工具（管理功能）
export async function POST(request: NextRequest) {
  try {
    const toolData = await request.json();

    const success = await AIToolModel.insertOne(toolData);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Tool created successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create tool',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating AI tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create tool',
      },
      { status: 500 }
    );
  }
}

// PUT - 更新工具（管理功能）
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('id');

    if (!toolId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool ID is required',
        },
        { status: 400 }
      );
    }

    const updates = await request.json();
    const success = await AIToolModel.updateOne(toolId, updates);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Tool updated successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found or update failed',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error updating AI tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update tool',
      },
      { status: 500 }
    );
  }
}

// DELETE - 軟刪除工具
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('id');

    if (!toolId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool ID is required',
        },
        { status: 400 }
      );
    }

    const success = await AIToolModel.updateOne(toolId, { isActive: false });

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Tool deleted successfully',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Tool not found or delete failed',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete tool',
      },
      { status: 500 }
    );
  }
}
