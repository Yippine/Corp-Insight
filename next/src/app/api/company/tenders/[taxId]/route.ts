import { NextResponse } from 'next/server';

// 標案API路由
export async function GET(
  request: Request,
  { params }: { params: { taxId: string } }
) {
  const { taxId } = params;
  
  try {
    // 這裡應該是從標案數據庫或API獲取數據
    // 因為演示目的，返回模擬數據
    const mockTenders = [
      {
        tenderId: 'tender-001',
        title: '資訊系統維護服務',
        unitName: '經濟部資訊中心',
        date: '2023-12-15',
        status: '得標',
        amount: 1200000,
      },
      {
        tenderId: 'tender-002',
        title: '辦公設備採購案',
        unitName: '臺北市政府',
        date: '2023-10-05',
        status: '得標',
        amount: 750000,
      },
      {
        tenderId: 'tender-003',
        title: '網路資安防護服務',
        unitName: '國家通訊傳播委員會',
        date: '2023-08-22',
        status: '參與投標',
        amount: 1800000,
      }
    ];

    return NextResponse.json({
      success: true,
      tenders: mockTenders,
    });
  } catch (error) {
    console.error('獲取標案資料失敗:', error);
    return NextResponse.json(
      {
        success: false,
        message: '獲取標案資料時發生錯誤',
      },
      { status: 500 }
    );
  }
}