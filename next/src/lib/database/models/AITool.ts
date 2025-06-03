import mongoose, { Schema, Document, Model } from 'mongoose';
import { getDb } from '@/lib/mongodbUtils';
import { Collection, ObjectId } from 'mongodb';

// AI 工具資料介面定義
export interface IAITool extends Document {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  
  // 工具配置
  config: {
    icon: string;
    placeholder: string;
    instructions: {
      what: string;
      why: string;
      how: string;
    };
    promptTemplate: {
      prefix: string;
      suffix: string;
    };
  };
  
  // 使用統計
  usage: {
    totalUses: number;
    lastUsed?: Date;
    popularityScore: number;
  };
  
  // RAG 向量支援 (未來擴展)
  embedding?: number[];
  
  // 版本控制
  version: string;
  isActive: boolean;
  
  // 時間戳
  createdAt: Date;
  updatedAt: Date;
}

// AI 工具 Schema 定義
const AIToolSchema = new Schema<IAITool>({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  
  name: {
    type: String,
    required: true,
    trim: true,
    index: 'text' // 文字搜尋索引
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    index: 'text'
  },
  
  category: {
    type: String,
    required: true,
    trim: true,
    index: true,
    enum: [
      '提示詞',
      '寫作',
      '分析',
      '創意',
      '商業',
      '教育',
      '技術',
      '生活',
      '娛樂',
      '其他'
    ]
  },
  
  tags: [{
    type: String,
    trim: true,
    index: true
  }],
  
  // 工具配置
  config: {
    icon: {
      type: String,
      required: true,
      trim: true
    },
    
    placeholder: {
      type: String,
      required: true,
      trim: true
    },
    
    instructions: {
      what: {
        type: String,
        required: true,
        trim: true
      },
      why: {
        type: String,
        required: true,
        trim: true
      },
      how: {
        type: String,
        required: true,
        trim: true
      }
    },
    
    promptTemplate: {
      prefix: {
        type: String,
        required: true
      },
      suffix: {
        type: String,
        required: true
      }
    }
  },
  
  // 使用統計
  usage: {
    totalUses: {
      type: Number,
      default: 0,
      min: 0
    },
    lastUsed: {
      type: Date
    },
    popularityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  
  // RAG 向量支援 (未來擴展)
  embedding: [{
    type: Number
  }],
  
  // 版本控制
  version: {
    type: String,
    default: '1.0.0',
    trim: true
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true, // 自動添加 createdAt 和 updatedAt
  collection: 'aitools' // 指定集合名稱
});

// 複合索引
AIToolSchema.index({ category: 1, isActive: 1 });
AIToolSchema.index({ tags: 1, isActive: 1 });
AIToolSchema.index({ 'usage.popularityScore': -1 });
AIToolSchema.index({ name: 'text', description: 'text' });

// 中介軟體：儲存前自動計算熱門度分數
AIToolSchema.pre('save', function(next) {
  if (this.isModified('usage.totalUses')) {
    // 基於使用次數和最近使用時間計算熱門度分數
    const baseScore = Math.min(this.usage.totalUses * 2, 80); // 最高 80 分
    
    if (this.usage.lastUsed) {
      const daysSinceLastUse = (Date.now() - this.usage.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBonus = Math.max(20 - daysSinceLastUse, 0); // 最近使用加分
      this.usage.popularityScore = Math.min(baseScore + recencyBonus, 100);
    } else {
      this.usage.popularityScore = baseScore;
    }
  }
  
  next();
});

// 靜態方法：根據 ID 查找工具
AIToolSchema.statics.findByToolId = function(toolId: string) {
  return this.findOne({ id: toolId, isActive: true });
};

// 靜態方法：搜尋 AI 工具
AIToolSchema.statics.searchTools = function(
  query: string, 
  options: { 
    category?: string; 
    tags?: string[]; 
    page?: number; 
    limit?: number; 
    sortBy?: string 
  } = {}
) {
  const { category, tags, page = 1, limit = 20, sortBy = 'usage.popularityScore' } = options;
  const skip = (page - 1) * limit;
  
  const searchCondition: any = { isActive: true };
  
  // 文字搜尋
  if (query) {
    searchCondition.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
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
  
  const sortOrder = sortBy.startsWith('usage.') ? -1 : 1;
  
  return this.find(searchCondition)
    .sort({ [sortBy]: sortOrder })
    .skip(skip)
    .limit(limit);
};

// 靜態方法：取得熱門工具
AIToolSchema.statics.getPopularTools = function(limit: number = 10) {
  return this.find({ isActive: true })
    .sort({ 'usage.popularityScore': -1 })
    .limit(limit);
};

// 靜態方法：根據分類取得工具
AIToolSchema.statics.getToolsByCategory = function(category: string, limit: number = 20) {
  return this.find({ category, isActive: true })
    .sort({ 'usage.popularityScore': -1 })
    .limit(limit);
};

// 實例方法：記錄使用
AIToolSchema.methods.recordUsage = async function() {
  this.usage.totalUses += 1;
  this.usage.lastUsed = new Date();
  return this.save();
};

// 實例方法：停用工具
AIToolSchema.methods.deactivate = async function() {
  this.isActive = false;
  return this.save();
};

// 實例方法：啟用工具
AIToolSchema.methods.activate = async function() {
  this.isActive = true;
  return this.save();
};

// 虛擬欄位：是否為熱門工具
AIToolSchema.virtual('isPopular').get(function() {
  return this.usage.popularityScore >= 70;
});

// 虛擬欄位：是否為新工具
AIToolSchema.virtual('isNew').get(function() {
  const daysSinceCreated = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceCreated <= 7; // 7 天內建立的算新工具
});

// 虛擬欄位：完整的提示詞範本
AIToolSchema.virtual('fullPromptTemplate').get(function() {
  return {
    prefix: this.config.promptTemplate.prefix,
    suffix: this.config.promptTemplate.suffix,
    combined: `${this.config.promptTemplate.prefix}\n\n[使用者輸入]\n\n${this.config.promptTemplate.suffix}`
  };
});

// 確保虛擬欄位在 JSON 序列化時包含
AIToolSchema.set('toJSON', { virtuals: true });
AIToolSchema.set('toObject', { virtuals: true });

// 建立並匯出模型
const AITool: Model<IAITool> = mongoose.models.AITool || mongoose.model<IAITool>('AITool', AIToolSchema);

export default AITool;

export interface AIToolDocument {
  _id?: ObjectId;
  id: string;
  name: string;
  description: string;
  icon: string; // 儲存 icon 名稱而非函數
  tags: string[];
  instructions: {
    what: string;
    why: string;
    how: string;
  };
  placeholder: string;
  promptTemplate: {
    prefix: string;
    suffix: string;
  };
  category?: string;
  subCategory?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
      return await collection
        .find({ isActive: true })
        .sort({ createdAt: 1 })
        .toArray();
    } catch (error) {
      console.error('Error fetching AI tools:', error);
      return [];
    }
  }

  // 根據 ID 獲取工具
  static async getById(id: string): Promise<AIToolDocument | null> {
    try {
      const collection = await this.getCollection();
      return await collection.findOne({ id, isActive: true });
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
          isActive: true 
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
                { description: { $regex: query, $options: 'i' } }
              ]
            }
          ]
        })
        .sort({ createdAt: 1 })
        .toArray();
    } catch (error) {
      console.error('Error searching AI tools:', error);
      return [];
    }
  }

  // 創建新工具
  static async create(toolData: Omit<AIToolDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<string | null> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      const result = await collection.insertOne({
        ...toolData,
        createdAt: now,
        updatedAt: now
      });
      return result.insertedId.toString();
    } catch (error) {
      console.error('Error creating AI tool:', error);
      return null;
    }
  }

  // 更新工具
  static async update(id: string, updateData: Partial<Omit<AIToolDocument, '_id' | 'id' | 'createdAt'>>): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { id },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating AI tool:', error);
      return false;
    }
  }

  // 軟刪除工具
  static async softDelete(id: string): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { id },
        { 
          $set: {
            isActive: false,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error soft deleting AI tool:', error);
      return false;
    }
  }

  // 批量插入工具（用於資料遷移）
  static async insertMany(tools: Omit<AIToolDocument, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      const toolsWithTimestamps = tools.map(tool => ({
        ...tool,
        createdAt: now,
        updatedAt: now
      }));
      
      const result = await collection.insertMany(toolsWithTimestamps);
      return result.insertedCount === tools.length;
    } catch (error) {
      console.error('Error batch inserting AI tools:', error);
      return false;
    }
  }

  // 清空所有工具（謹慎使用）
  static async deleteAll(): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      await collection.deleteMany({});
      return true;
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
      
      // 文字搜尋索引
      await collection.createIndex(
        { 
          name: 'text', 
          description: 'text' 
        },
        { 
          weights: { 
            name: 10, 
            description: 5 
          } 
        }
      );
      
      console.log('AI Tools indexes created successfully');
    } catch (error) {
      console.error('Error creating AI tools indexes:', error);
    }
  }
}