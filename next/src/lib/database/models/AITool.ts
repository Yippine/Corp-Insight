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
  componentId?: string;
  renderType?: 'prompt' | 'component';
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
  tags: 1,
  category: 1,
  componentId: 1,
  renderType: 1,
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
      return await collection.find({ tags: { $in: tags }, isActive: true }).toArray();
    } catch (error) {
      console.error('Error fetching AI tools by tags:', error);
      return [];
    }
  }

  // 向 ai_tools 集合中插入單一文件
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
      await collection.createIndex({ category: 1, isActive: 1 });
      await collection.createIndex({ tags: 1, isActive: 1 });

      // 文字搜尋索引
      await collection.createIndex(
        {
          name: 'text',
        },
        {
          weights: {
            name: 10,
          },
        }
      );

      console.log('AI Tools indexes created successfully');
    } catch (error) {
      console.error('Error creating AI tools indexes:', error);
      throw error;
    }
  }
}
