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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function RecordCard({ record, onEdit, onDelete }: RecordCardProps) {
  // 格式化日期，如果传入的是字符串，则转换为Date对象
  const date = record.date instanceof Date ? record.date : new Date(record.date);
  
  // 处理编辑点击
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (onEdit) {
      onEdit(record.id);
    }
  };
  
  // 处理删除点击
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (onDelete) {
      // 确认删除
      if (window.confirm(`确定要删除"${record.category.name}"的记录吗？`)) {
        onDelete(record.id);
      }
    }
  };
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-gray-200 hover:shadow">
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
      
      <div className="flex items-center gap-3">
        {/* 金额 */}
        <div className="text-right">
          <span className="text-lg font-semibold text-gray-900">
            {formatCurrency(record.amount)}
          </span>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          {/* 编辑按钮 */}
          <button
            onClick={handleEditClick}
            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
            title="编辑"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          </button>
          
          {/* 删除按钮 */}
          <button
            onClick={handleDeleteClick}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
            title="删除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}