import { NextRequest, NextResponse } from 'next/server';
import { AIToolModel, AIToolDocument } from '@/lib/database/models/AITool';

// GET - 獲取所有 AI 工具或根據查詢參數篩選
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const tag = searchParams.get('tag');
    const id = searchParams.get('id');

    let tools: AIToolDocument[] = [];

    if (id) {
      // 獲取特定工具
      const tool = await AIToolModel.getById(id);
      if (tool) {
        tools = [tool];
      }
    } else if (query && tag) {
      // 同時有查詢詞和標籤
      const searchResults = await AIToolModel.search(query);
      tools = searchResults.filter(tool => tool.tags.includes(tag));
    } else if (query) {
      // 只有查詢詞
      tools = await AIToolModel.search(query);
    } else if (tag) {
      // 只有標籤
      tools = await AIToolModel.getByTags([tag]);
    } else {
      // 獲取所有工具
      tools = await AIToolModel.getAllActive();
    }

    return NextResponse.json({ 
      success: true, 
      data: tools,
      count: tools.length
    });
  } catch (error) {
    console.error('Error in GET /api/aitool:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch AI tools' 
      },
      { status: 500 }
    );
  }
}

// POST - 創建新的 AI 工具
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 驗證必要欄位
    const requiredFields = ['id', 'name', 'description', 'icon', 'tags', 'instructions', 'placeholder', 'promptTemplate'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // 檢查 ID 是否已存在
    const existingTool = await AIToolModel.getById(body.id);
    if (existingTool) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tool with this ID already exists' 
        },
        { status: 409 }
      );
    }

    const toolData = {
      id: body.id,
      name: body.name,
      description: body.description,
      icon: body.icon,
      tags: Array.isArray(body.tags) ? body.tags : [body.tags],
      instructions: body.instructions,
      placeholder: body.placeholder,
      promptTemplate: body.promptTemplate,
      category: body.category || 'AI 工具',
      subCategory: body.subCategory,
      isActive: body.isActive !== false // 預設為 true
    };

    const createdId = await AIToolModel.create(toolData);
    
    if (createdId) {
      return NextResponse.json({ 
        success: true, 
        message: 'AI tool created successfully',
        id: createdId
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create AI tool' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/aitool:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create AI tool' 
      },
      { status: 500 }
    );
  }
}

// PUT - 更新 AI 工具
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tool ID is required' 
        },
        { status: 400 }
      );
    }

    const success = await AIToolModel.update(id, updateData);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'AI tool updated successfully' 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update AI tool' 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in PUT /api/aitool:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update AI tool' 
      },
      { status: 500 }
    );
  }
}

// DELETE - 軟刪除 AI 工具
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tool ID is required' 
        },
        { status: 400 }
      );
    }

    const success = await AIToolModel.softDelete(id);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'AI tool deleted successfully' 
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete AI tool' 
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Error in DELETE /api/aitool:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete AI tool' 
      },
      { status: 500 }
    );
  }
}