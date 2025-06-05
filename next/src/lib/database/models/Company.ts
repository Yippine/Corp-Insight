import mongoose, { Schema, Document, Model } from 'mongoose';

// 企業資料介面定義
export interface ICompany extends Document {
  taxId: string;
  name: string;
  fullName?: string;
  englishName?: string;
  status?: string;
  chairman?: string;
  industry?: string;
  address?: string;
  establishedDate?: Date;
  lastChanged?: Date;

  // 財務資訊
  financial?: {
    totalCapital?: string;
    paidInCapital?: string;
    employees?: string;
    revenue?: string;
  };

  // 聯絡資訊
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    fax?: string;
  };

  // 上市公司財報資訊
  financialReport?: {
    marketType?: string;
    code?: string;
    abbreviation?: string;
    englishAbbreviation?: string;
    englishAddress?: string;
    listingDate?: string;
    chairman?: string;
    generalManager?: string;
    spokesperson?: string;
    spokespersonTitle?: string;
    deputySpokesperson?: string;
    establishmentDate?: string;
    parValuePerShare?: string;
    privatePlacementShares?: string;
    preferredShares?: string;
    stockTransferAgency?: string;
    transferPhone?: string;
    transferAddress?: string;
    certifiedPublicAccountantFirm?: string;
    certifiedPublicAccountant1?: string;
    certifiedPublicAccountant2?: string;
  };

  // 董監事資訊
  directors?: Array<{
    name: string;
    title: string;
    shares?: string;
    representative?: string;
  }>;

  // 經理人資訊
  managers?: Array<{
    序號: string;
    姓名: string;
    到職日期: Date;
  }>;

  // 營業項目 (二維陣列)
  businessScope?: string[][];

  // 關聯標案數量
  tenderCount?: number;

  // 搜尋和索引
  searchKeywords?: string[];
  lastUpdated?: Date;

  // 時間戳
  createdAt: Date;
  updatedAt: Date;
}

// 企業 Schema 定義
const CompanySchema = new Schema<ICompany>(
  {
    taxId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^\d{8}$/.test(v); // 驗證統一編號格式
        },
        message: '統一編號必須是 8 位數字',
      },
    },

    name: {
      type: String,
      required: true,
      trim: true,
      index: 'text', // 文字搜尋索引
    },

    fullName: {
      type: String,
      trim: true,
      index: 'text',
    },

    englishName: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      trim: true,
      enum: ['核准設立', '撤銷', '廢止', '解散', '合併解散', '其他'],
    },

    chairman: {
      type: String,
      trim: true,
    },

    industry: {
      type: String,
      trim: true,
      index: true,
    },

    address: {
      type: String,
      trim: true,
    },

    establishedDate: {
      type: Date,
      index: true,
    },

    lastChanged: {
      type: Date,
    },

    // 財務資訊 (巢狀物件)
    financial: {
      totalCapital: String,
      paidInCapital: String,
      employees: String,
      revenue: String,
    },

    // 聯絡資訊
    contact: {
      phone: String,
      email: {
        type: String,
        validate: {
          validator: function (v: string) {
            return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          },
          message: '請輸入有效的電子郵件地址',
        },
      },
      website: {
        type: String,
        validate: {
          validator: function (v: string) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: '請輸入有效的網址',
        },
      },
      fax: String,
    },

    // 上市公司財報資訊
    financialReport: {
      marketType: String,
      code: String,
      abbreviation: String,
      englishAbbreviation: String,
      englishAddress: String,
      listingDate: String,
      chairman: String,
      generalManager: String,
      spokesperson: String,
      spokespersonTitle: String,
      deputySpokesperson: String,
      establishmentDate: String,
      parValuePerShare: String,
      privatePlacementShares: String,
      preferredShares: String,
      stockTransferAgency: String,
      transferPhone: String,
      transferAddress: String,
      certifiedPublicAccountantFirm: String,
      certifiedPublicAccountant1: String,
      certifiedPublicAccountant2: String,
    },

    // 董監事資訊
    directors: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        title: {
          type: String,
          required: true,
          trim: true,
        },
        shares: String,
        representative: String,
      },
    ],

    // 經理人資訊
    managers: [
      {
        序號: String,
        姓名: {
          type: String,
          required: true,
          trim: true,
        },
        到職日期: Date,
      },
    ],

    // 營業項目 (二維陣列)
    businessScope: [[String]],

    // 關聯標案數量
    tenderCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // 搜尋關鍵字陣列
    searchKeywords: [
      {
        type: String,
        trim: true,
      },
    ],

    // 最後更新時間
    lastUpdated: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true, // 自動添加 createdAt 和 updatedAt
    collection: 'companies', // 指定集合名稱
  }
);

// 複合索引
CompanySchema.index({ name: 'text', fullName: 'text' });
CompanySchema.index({ searchKeywords: 1 });
CompanySchema.index({ industry: 1, status: 1 });
CompanySchema.index({ 'financial.paidInCapital': -1 });
CompanySchema.index({ establishedDate: -1 });

// 中介軟體：儲存前自動更新搜尋關鍵字
CompanySchema.pre('save', function (next) {
  if (
    this.isModified('name') ||
    this.isModified('fullName') ||
    this.isModified('englishName')
  ) {
    const keywords = [];

    if (this.name) keywords.push(this.name);
    if (this.fullName) keywords.push(this.fullName);
    if (this.englishName) keywords.push(this.englishName);
    if (this.chairman) keywords.push(this.chairman);
    if (this.industry) keywords.push(this.industry);

    // 移除重複和空值
    this.searchKeywords = [...new Set(keywords.filter(Boolean))];
  }

  this.lastUpdated = new Date();
  next();
});

// 靜態方法：根據統一編號查找企業
CompanySchema.statics.findByTaxId = function (taxId: string) {
  return this.findOne({ taxId });
};

// 靜態方法：搜尋企業
CompanySchema.statics.searchCompanies = function (
  query: string,
  options: { page?: number; limit?: number; sortBy?: string } = {}
) {
  const { page = 1, limit = 20, sortBy = 'name' } = options;
  const skip = (page - 1) * limit;

  const searchCondition = {
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { fullName: { $regex: query, $options: 'i' } },
      { englishName: { $regex: query, $options: 'i' } },
      { taxId: query },
      { searchKeywords: { $in: [new RegExp(query, 'i')] } },
    ],
  };

  return this.find(searchCondition)
    .sort({ [sortBy]: 1 })
    .skip(skip)
    .limit(limit);
};

// 實例方法：更新標案數量
CompanySchema.methods.updateTenderCount = async function () {
  // 這裡之後會與 Tender 模型整合
  // const count = await mongoose.model('Tender').countDocuments({ 'company.taxId': this.taxId });
  // this.tenderCount = count;
  // return this.save();
};

// 虛擬欄位：完整顯示名稱
CompanySchema.virtual('displayName').get(function () {
  return this.fullName || this.name;
});

// 虛擬欄位：是否為上市公司
CompanySchema.virtual('isListed').get(function () {
  return !!(this.financialReport && this.financialReport.code);
});

// 確保虛擬欄位在 JSON 序列化時包含
CompanySchema.set('toJSON', { virtuals: true });
CompanySchema.set('toObject', { virtuals: true });

// 建立並匯出模型
const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export default Company;
