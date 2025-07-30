import mongoose, { Document, Schema, Model } from 'mongoose';

// 附件的介面
interface IAttachment {
  fileName: string;
  fileSize: number;
  fileType: string;
}

// 狀態變更歷史的介面
interface IHistory {
  status: string;
  changedAt: Date;
  changedBy?: string; // 可選，未來可擴充為管理員名稱
}

// Feedback Document 的主介面
export interface IFeedback extends Document {
  submittedAt: Date;
  submittedByEmail: string;
  category: {
    id: string;
    name: string;
  };
  title: string;
  content: string;
  attachment?: IAttachment;
  status: '新建立' | '評估中' | '開發中' | '已解決' | '已關閉';
  priority: '高' | '中' | '低';
  assignee?: string;
  resolutionNotes?: string;
  history: IHistory[];
}

// Mongoose Schema
const AttachmentSchema: Schema = new Schema({
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
});

const HistorySchema: Schema = new Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: String },
});

const FeedbackSchema: Schema<IFeedback> = new Schema(
  {
    submittedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    submittedByEmail: {
      type: String,
      required: [true, '提交者 Email 為必填項'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '請輸入有效的 Email 格式'],
    },
    category: {
      id: { type: String, required: true },
      name: { type: String, required: true },
    },
    title: {
      type: String,
      required: [true, '標題為必填項'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, '詳細內容為必填項'],
      trim: true,
    },
    attachment: {
      type: AttachmentSchema,
      required: false,
    },
    status: {
      type: String,
      enum: ['新建立', '評估中', '開發中', '已解決', '已關閉'],
      default: '新建立',
    },
    priority: {
      type: String,
      enum: ['高', '中', '低'],
      default: '中',
    },
    assignee: {
      type: String,
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    history: [HistorySchema],
  },
  {
    timestamps: true, // 自動加入 createdAt 和 updatedAt
    collection: 'feedbacks',
  }
);

// 索引優化
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ priority: 1 });
FeedbackSchema.index({ submittedByEmail: 1 });
FeedbackSchema.index({ submittedAt: -1 });

// 在儲存前自動加入初始狀態到歷史紀錄
FeedbackSchema.pre<IFeedback>('save', function (next) {
  if (this.isNew) {
    this.history.push({
      status: this.status,
      changedAt: new Date(),
    });
  }
  next();
});

// 檢查模型是否已經存在，避免重複編譯
const Feedback: Model<IFeedback> =
  mongoose.models.Feedback ||
  mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default Feedback;
