import mongoose, { Document, Schema, Model } from 'mongoose';

// 單次錯誤日誌的介面
interface IErrorLog {
  errorType: string;
  errorMessage: string;
  timestamp: Date;
}

// ApiKeyStatus 文件的主介面
export interface IApiKeyStatus extends Document {
  keyIdentifier: string;
  status: 'HEALTHY' | 'UNHEALTHY';
  failureCount: number;
  dailyFailureCount: number;
  lastCheckedAt: Date;
  retryAt?: Date;
  recentErrors: IErrorLog[];
}

const ErrorLogSchema: Schema<IErrorLog> = new Schema(
  {
    errorType: { type: String, required: true },
    errorMessage: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ApiKeyStatusSchema: Schema<IApiKeyStatus> = new Schema(
  {
    // 金鑰的環境變數名稱，作為唯一識別符 (例如 'NEXT_PUBLIC_GEMINI_API_KEY_PROD_PRIMARY')
    keyIdentifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // 金鑰當前的健康狀態
    status: {
      type: String,
      enum: ['HEALTHY', 'UNHEALTHY'],
      required: true,
      default: 'HEALTHY',
    },
    // 連續失敗次數
    failureCount: {
      type: Number,
      default: 0,
    },
    // 每日失敗次數
    dailyFailureCount: {
      type: Number,
      default: 0,
    },
    // 最後一次檢查此金鑰的時間
    lastCheckedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    // 當狀態為 UNHEALTHY 時，允許再次嘗試的時間點
    retryAt: {
      type: Date,
    },
    // 最近的錯誤日誌 (固定大小陣列)
    recentErrors: {
      type: [ErrorLogSchema],
      default: [],
    },
  },
  {
    timestamps: true, // 自動加入 createdAt 和 updatedAt
    collection: 'api_key_statuses',
  }
);

// 索引優化，提升查詢效能
ApiKeyStatusSchema.index({ status: 1 });

// 限制 recentErrors 陣列的大小，僅保留最新的 3 筆錯誤紀錄
ApiKeyStatusSchema.pre<IApiKeyStatus>('save', function (next) {
  const maxErrors = 3;
  if (this.recentErrors.length > maxErrors) {
    this.recentErrors = this.recentErrors.slice(-maxErrors);
  }
  next();
});

// 檢查模型是否已經存在，若無則建立新模型，以避免重複編譯
const ApiKeyStatus: Model<IApiKeyStatus> =
  mongoose.models.ApiKeyStatus ||
  mongoose.model<IApiKeyStatus>('ApiKeyStatus', ApiKeyStatusSchema);

export default ApiKeyStatus;