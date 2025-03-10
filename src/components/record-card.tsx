"use client";

import React from "react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Record {
  id: string;
  amount: number;
  date: string | Date;
  note?: string | null;
  category: Category;
}

interface RecordCardProps {
  record: Record;
  onClick?: () => void;
}

export default function RecordCard({ record, onClick }: RecordCardProps) {
  // 格式化日期，如果传入的是字符串，则转换为Date对象
  const date = record.date instanceof Date ? record.date : new Date(record.date);
  
  return (
    <div 
      className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 hover:shadow"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {/* 分类颜色标识 */}
        <div 
          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: record.category.color }}
        >
          {record.category.name.substring(0, 1)}
        </div>
        
        <div>
          {/* 分类名称 */}
          <h3 className="font-medium text-gray-900">{record.category.name}</h3>
          
          {/* 日期和备注 */}
          <div className="text-sm text-gray-500">
            <span>{formatDate(date)}</span>
            {record.note && <span className="ml-2">· {record.note}</span>}
          </div>
        </div>
      </div>
      
      {/* 金额 */}
      <div className="text-right">
        <span className="text-lg font-semibold text-gray-900">
          {formatCurrency(record.amount)}
        </span>
      </div>
    </div>
  );
}