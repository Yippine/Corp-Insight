import mongoose, { Schema, Document, Model } from 'mongoose';
import { getDb } from '@/lib/mongodbUtils';
import { Collection } from 'mongodb';

// AI 工具資料介面定義
export interface IAITool extends Document {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  instructions?: {
    what: string;
    why: string;
    how: string;
  };
  placeholder?: string;
  promptTemplate?: {
    prefix: string;
    suffix: string;
  };
  componentId?: string;
  renderType?: 'prompt' | 'component';
  isAITool?: boolean;
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 簡化的介面，用於 API 回傳
export interface AIToolDocument {
  _id?: any;
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  instructions?: {
    what: string;
    why: string;
    how: string;
  };
  placeholder?: string;
  promptTemplate?: {
    prefix: string;
    suffix: string;
  };
  category?: string;
  subCategory?: string;
  componentId?: string;
  renderType?: 'prompt' | 'component';
  isAITool?: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 用於 API 回傳的欄位投影，集中管理以遵循 DRY 原則
const toolProjection = {
  _id: 0,
  id: 1,
  name: 1,
  description: 1,
  icon: 1,
  tags: 1,
  category: 1,
  subCategory: 1,
  componentId: 1,
  renderType: 1,
  isAITool: 1,
  instructions: 1,
  placeholder: 1,
  promptTemplate: 1,
  isActive: 1,
  createdAt: 1,
  updatedAt: 1,
};

// AI 工具 Schema 定義 - 更新以支援工具類別
const AIToolSchema = new Schema<IAITool>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text', // 文字搜尋索引
    },

    description: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },

    icon: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
      enum: [
        '提示詞',
        'AI 工具',
        'SEO',
        '健康',
        '電腦',
        '金融',
        '製造',
        '寫作',
        '分析',
        '創意',
        '商業',
        '教育',
        '技術',
        '生活',
        '娛樂',
        '其他',
      ],
    },

    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],

    instructions: {
      what: { type: String, trim: true },
      why: { type: String, trim: true },
      how: { type: String, trim: true },
    },

    placeholder: {
      type: String,
      trim: true,
    },

    promptTemplate: {
      prefix: { type: String },
      suffix: { type: String },
    },

    componentId: {
      type: String,
      trim: true,
    },

    renderType: {
      type: String,
      enum: ['prompt', 'component'],
      default: 'prompt',
    },

    isAITool: {
      type: Boolean,
      default: true,
    },

    version: {
      type: String,
      default: '1.0.0',
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true, // 自動添加 createdAt 和 updatedAt
    collection: 'ai_tools', // 指定集合名稱
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 複合索引
AIToolSchema.index({ category: 1, isActive: 1 });
AIToolSchema.index({ tags: 1, isActive: 1 });
AIToolSchema.index({ isAITool: 1, isActive: 1 });

// 文字搜尋索引
AIToolSchema.index(
  {
    name: 'text',
    description: 'text',
    category: 'text',
    tags: 'text',
  },
  {
    weights: {
      name: 10,
      description: 5,
      category: 3,
      tags: 2,
    },
  }
);

// 靜態方法：根據 ID 查找工具
AIToolSchema.statics.findByToolId = function (toolId: string) {
  return this.findOne({ id: toolId, isActive: true });
};

// 靜態方法：搜尋 AI 工具
AIToolSchema.statics.searchTools = function (
  query: string,
  options: {
    category?: string;
    tags?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    isAITool?: boolean; // 新增：按工具類型篩選
  } = {}
) {
  const {
    category,
    tags,
    page = 1,
    limit = 20,
    sortBy = 'name', // 預設排序欄位更改為 name
    isAITool,
  } = options;
  const skip = (page - 1) * limit;

  const searchCondition: any = { isActive: true };

  // 文字搜尋
  if (query) {
    searchCondition.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ];
  }

  // 分類篩選
  if (category) {
    searchCondition.category = category;
  }

  // 標籤篩選
  if (tags && tags.length > 0) {
    searchCondition.tags = { $in: tags };
  }

  // 工具類型篩選
  if (typeof isAITool === 'boolean') {
    searchCondition['isAITool'] = isAITool;
  }

  const sortOrder = sortBy.startsWith('name') ? 1 : -1; // 簡化排序邏輯

  return this.find(searchCondition)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// 靜態方法：取得熱門工具
AIToolSchema.statics.getPopularTools = function (
  limit: number = 10,
  isAITool?: boolean
) {
  const condition: any = { isActive: true };
  if (typeof isAITool === 'boolean') {
    condition['isAITool'] = isAITool;
  }

  return this.find(condition)
    .sort({ name: 1 }) // 預設排序欄位更改為 name
    .limit(limit);
};

// 靜態方法：根據分類取得工具
AIToolSchema.statics.getToolsByCategory = function (
  category: string,
  limit: number = 20
) {
  return this.find({ category, isActive: true })
    .sort({ name: 1 }) // 預設排序欄位更改為 name
    .limit(limit);
};

// 實例方法：記錄使用
AIToolSchema.methods.recordUsage = async function () {
  this.usage.totalUses += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// 實例方法：停用工具
AIToolSchema.methods.deactivate = async function () {
  this.isActive = false;
  return this.save();
};

// 實例方法：啟用工具
AIToolSchema.methods.activate = async function () {
  this.isActive = true;
  return this.save();
};

// 虛擬欄位：完整的提示詞範本
AIToolSchema.virtual('fullPromptTemplate').get(function () {
  if (!this.promptTemplate) {
    return {
      prefix: '',
      suffix: '',
      combined: '[此工具沒有提示詞範本]',
    };
  }

  const prefix = this.promptTemplate.prefix || '';
  const suffix = this.promptTemplate.suffix || '';

  return {
    prefix,
    suffix,
    combined: `${prefix}\\n\\n[使用者輸入]\\n\\n${suffix}`,
  };
});

// 建立並匯出模型
const AITool: Model<IAITool> =
  mongoose.models.AITool || mongoose.model<IAITool>('AITool', AIToolSchema);

export default AITool;

export class AIToolModel {
  private static collectionName = 'ai_tools';

  private static async getCollection(): Promise<Collection<AIToolDocument>> {
    const db = await getDb();
    return db.collection<AIToolDocument>(this.collectionName);
  }

  // 獲取所有啟用的 AI 工具
  static async getAllActive(): Promise<AIToolDocument[]> {
    try {
      const collection = await this.getCollection();
      const tools = await collection
        .find({ isActive: true })
        .project(toolProjection)
        .sort({ createdAt: 1 })
        .toArray();
      return tools as AIToolDocument[];
    } catch (error) {
      console.error('Error fetching AI tools:', error);
      return [];
    }
  }

  // 根據工具類型獲取工具
  static async getByToolType(isAITool: boolean): Promise<AIToolDocument[]> {
    try {
      const collection = await this.getCollection();
      return await collection
        .find({
          isActive: true,
          $or: [
            { 'config.renderConfig.isAITool': isAITool },
            { isAITool: isAITool }, // 向後兼容
          ],
        })
        .sort({ createdAt: 1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching AI tools by type:', error);
      return [];
    }
  }

  // 根據 ID 獲取工具
  static async getById(id: string): Promise<AIToolDocument | null> {
    try {
      const collection = await this.getCollection();
      const result = await collection.findOne(
        { id, isActive: true },
        {
          projection: toolProjection,
        }
      );
      return result;
    } catch (error) {
      console.error('Error fetching AI tool by ID:', error);
      return null;
    }
  }

  // 根據標籤搜尋工具
  static async getByTags(tags: string[]): Promise<AIToolDocument[]> {
    try {
      const collection = await this.getCollection();
      return await collection
        .find({
          tags: { $in: tags },
          isActive: true,
        })
        .sort({ createdAt: 1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching AI tools by tags:', error);
      return [];
    }
  }

  // 搜尋工具（名稱或描述）
  static async search(query: string): Promise<AIToolDocument[]> {
    try {
      const collection = await this.getCollection();
      return await collection
        .find({
          $and: [
            { isActive: true },
            {
              $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
              ],
            },
          ],
        })
        .sort({ createdAt: 1 })
        .toArray();
    } catch (error) {
      console.error('Error searching AI tools:', error);
      return [];
    }
  }

  // 新增工具
  static async insertOne(
    tool: Omit<AIToolDocument, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      const toolWithTimestamps = {
        ...tool,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(toolWithTimestamps);
      return !!result.insertedId;
    } catch (error) {
      console.error('Error inserting AI tool:', error);
      return false;
    }
  }

  // 批量插入工具（用於資料遷移）
  static async insertMany(
    tools: Omit<AIToolDocument, '_id' | 'createdAt' | 'updatedAt'>[]
  ): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      const toolsWithTimestamps = tools.map(tool => ({
        ...tool,
        createdAt: now,
        updatedAt: now,
      }));

      const result = await collection.insertMany(toolsWithTimestamps);
      return result.insertedCount === tools.length;
    } catch (error) {
      console.error('Error batch inserting AI tools:', error);
      return false;
    }
  }

  // 更新工具
  static async updateOne(
    id: string,
    updates: Partial<AIToolDocument>
  ): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { id },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          },
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating AI tool:', error);
      return false;
    }
  }

  // 刪除所有工具（僅用於測試）
  static async deleteAll(): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.deleteMany({});
      return result.acknowledged;
    } catch (error) {
      console.error('Error deleting all AI tools:', error);
      return false;
    }
  }

  // 創建索引以提升查詢效能
  static async createIndexes(): Promise<void> {
    try {
      const collection = await this.getCollection();

      // 為常用查詢字段創建索引
      await collection.createIndex({ id: 1 }, { unique: true });
      await collection.createIndex({ tags: 1 });
      await collection.createIndex({ isActive: 1 });
      await collection.createIndex({ createdAt: 1 });
      await collection.createIndex({ category: 1 });
      await collection.createIndex({ 'config.renderConfig.isAITool': 1 });

      // 文字搜尋索引
      await collection.createIndex(
        {
          name: 'text',
          description: 'text',
          category: 'text',
        },
        {
          weights: {
            name: 10,
            description: 5,
            category: 3,
          },
        }
      );

      console.log('AI Tools indexes created successfully');
    } catch (error) {
      console.error('Error creating AI tools indexes:', error);
    }
  }
}
