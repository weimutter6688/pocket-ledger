import React from "react";
import { Category } from "./types";

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryList({
  categories,
  isLoading,
  onEdit,
  onDelete,
}: CategoryListProps) {
  if (isLoading) {
    return <div className="text-center text-gray-500">加载中...</div>;
  }
  
  if (categories.length === 0) {
    return <div className="text-center text-gray-500">暂无分类</div>;
  }
  
  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between rounded-md border border-gray-200 p-3"
        >
          <div className="flex flex-col">
            <div className="flex items-center space-x-3">
              <div
                className="h-6 w-6 rounded-full"
                style={{ backgroundColor: category.color }}
              ></div>
              <span className="font-medium">{category.name}</span>
              {category._count && (
                <span className="text-xs text-gray-500">
                  ({category._count.records} 条记录)
                </span>
              )}
            </div>
            {/* 显示分类描述 */}
            {category.description && (
              <div className="ml-9 mt-1 text-sm text-gray-500">
                {category.description}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(category)}
              className="rounded-md px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
            >
              编辑
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
            >
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}