import connectToDatabase from '../connection';
import AITool from '../models/AITool';
import { promptTools } from '../../aitool/promptTools';

/**
 * 將 promptTools.ts 中的 AI 工具資料遷移到 MongoDB
 */
export async function migrateAIToolsToMongoDB(): Promise<void> {
  try {
    console.log('🚀 開始遷移 AI 工具資料到 MongoDB...');
    
    // 連線到資料庫
    await connectToDatabase();
    
    // 清空現有資料 (可選，根據需求決定)
    // await AITool.deleteMany({});
    // console.log('🗑️ 已清空現有 AI 工具資料');
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];
    
    for (const tool of promptTools) {
      try {
        // 檢查是否已存在
        const existingTool = await AITool.findOne({ id: tool.id });
        
        if (existingTool) {
          console.log(`⚠️ 工具 "${tool.name}" (${tool.id}) 已存在，跳過...`);
          continue;
        }
        
        // 分類映射 (將英文標籤轉換為中文分類)
        const categoryMapping: { [key: string]: string } = {
          '提示詞': '提示詞',
          '寫作': '寫作',
          '分析': '分析',
          '創意': '創意',
          '商業': '商業',
          '教育': '教育',
          '技術': '技術',
          '生活': '生活',
          '娛樂': '娛樂'
        };
        
        // 根據標籤推斷分類
        let category = '其他';
        for (const tag of tool.tags) {
          if (categoryMapping[tag]) {
            category = categoryMapping[tag];
            break;
          }
        }
        
        // 建立新的 AI 工具記錄
        const newTool = new AITool({
          id: tool.id,
          name: tool.name,
          description: tool.description,
          category: category,
          tags: tool.tags,
          config: {
            icon: tool.icon.name || 'FileCode2', // 預設圖示
            placeholder: tool.placeholder,
            instructions: {
              what: tool.instructions.what,
              why: tool.instructions.why,
              how: tool.instructions.how
            },
            promptTemplate: {
              prefix: tool.promptTemplate.prefix,
              suffix: tool.promptTemplate.suffix
            }
          },
          usage: {
            totalUses: 0,
            popularityScore: 0
          },
          version: '1.0.0',
          isActive: true
        });
        
        await newTool.save();
        successCount++;
        console.log(`✅ 成功遷移工具: "${tool.name}" (${tool.id})`);
        
      } catch (error) {
        errorCount++;
        const errorMsg = `❌ 遷移工具 "${tool.name}" (${tool.id}) 失敗: ${error}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
    
    // 遷移結果統計
    console.log('\n📊 遷移結果統計:');
    console.log(`✅ 成功遷移: ${successCount} 個工具`);
    console.log(`❌ 遷移失敗: ${errorCount} 個工具`);
    console.log(`📝 總計工具: ${promptTools.length} 個`);
    
    if (errors.length > 0) {
      console.log('\n🔍 錯誤詳情:');
      errors.forEach(error => console.log(error));
    }
    
    console.log('\n🎉 AI 工具資料遷移完成！');
    
  } catch (error) {
    console.error('💥 遷移過程中發生嚴重錯誤:', error);
    throw error;
  }
}

/**
 * 驗證遷移結果
 */
export async function validateMigration(): Promise<void> {
  try {
    console.log('🔍 開始驗證遷移結果...');
    
    await connectToDatabase();
    
    // 統計資料庫中的工具數量
    const totalTools = await AITool.countDocuments();
    const activeTools = await AITool.countDocuments({ isActive: true });
    
    console.log(`📊 資料庫統計:`);
    console.log(`- 總工具數: ${totalTools}`);
    console.log(`- 啟用工具數: ${activeTools}`);
    console.log(`- 原始工具數: ${promptTools.length}`);
    
    // 檢查分類分布
    const categoryStats = await AITool.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📈 分類分布:');
    categoryStats.forEach(stat => {
      console.log(`- ${stat._id}: ${stat.count} 個工具`);
    });
    
    // 檢查是否有重複的 ID
    const duplicateIds = await AITool.aggregate([
      { $group: { _id: '$id', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (duplicateIds.length > 0) {
      console.log('\n⚠️ 發現重複的工具 ID:');
      duplicateIds.forEach(dup => {
        console.log(`- ID "${dup._id}" 重複 ${dup.count} 次`);
      });
    } else {
      console.log('\n✅ 沒有發現重複的工具 ID');
    }
    
    console.log('\n🎯 遷移驗證完成！');
    
  } catch (error) {
    console.error('💥 驗證過程中發生錯誤:', error);
    throw error;
  }
}

/**
 * 更新工具的熱門度分數 (基於使用統計)
 */
export async function updatePopularityScores(): Promise<void> {
  try {
    console.log('📈 開始更新工具熱門度分數...');
    
    await connectToDatabase();
    
    const tools = await AITool.find({ isActive: true });
    let updateCount = 0;
    
    for (const tool of tools) {
      // 基於工具名稱長度和描述複雜度給予初始分數
      const nameScore = Math.max(10 - tool.name.length * 0.1, 1);
      const descScore = Math.min(tool.description.length * 0.01, 10);
      const tagScore = tool.tags.length * 2;
      
      const initialScore = Math.min(nameScore + descScore + tagScore, 50);
      
      tool.usage.popularityScore = initialScore;
      await tool.save();
      updateCount++;
    }
    
    console.log(`✅ 已更新 ${updateCount} 個工具的熱門度分數`);
    
  } catch (error) {
    console.error('💥 更新熱門度分數時發生錯誤:', error);
    throw error;
  }
}

/**
 * 執行完整的遷移流程
 */
export async function runFullMigration(): Promise<void> {
  try {
    console.log('🚀 開始執行完整的 AI 工具遷移流程...\n');
    
    // 步驟 1: 遷移資料
    await migrateAIToolsToMongoDB();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 步驟 2: 驗證遷移
    await validateMigration();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 步驟 3: 更新熱門度分數
    await updatePopularityScores();
    
    console.log('\n🎉 完整遷移流程執行完成！');
    console.log('💡 提示: 您現在可以透過 MongoDB 來管理 AI 工具資料了');
    
  } catch (error) {
    console.error('💥 遷移流程執行失敗:', error);
    process.exit(1);
  }
}

// 如果直接執行此檔案，則運行完整遷移
if (require.main === module) {
  runFullMigration()
    .then(() => {
      console.log('✅ 遷移腳本執行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 遷移腳本執行失敗:', error);
      process.exit(1);
    });
}