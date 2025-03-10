import React from 'react';

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface Record {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  category: Category;
}

interface TodayRecordsListProps {
  records: Record[];
  isLoading: boolean;
}

export function TodayRecordsList({ records, isLoading }: TodayRecordsListProps) {
  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">加载中...</div>;
  }

  if (!records || records.length === 0) {
    return <div className="text-center py-4 text-gray-500">今日暂无记录</div>;
  }

  // 计算总金额
  const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">今日记录</h3>
        <div className="text-sm">
          总计: <span className="font-medium text-red-600">¥{totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {records.map((record) => (
          <div 
            key={record.id} 
            className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: record.category.color }} 
              />
              <div>
                <div className="font-medium">{record.category.name}</div>
                {record.note && (
                  <div className="text-xs text-gray-500">{record.note}</div>
                )}
              </div>
            </div>
            <div className="text-red-600 font-medium">
              ¥{record.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}