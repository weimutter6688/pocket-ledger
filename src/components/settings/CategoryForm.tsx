import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Category, CategoryFormData } from "./types";

interface CategoryFormProps {
  formData: CategoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isEditing: boolean;
  onCancel?: () => void;
}

export function CategoryForm({
  formData,
  setFormData,
  onSubmit,
  isEditing,
  onCancel,
}: CategoryFormProps) {
  return (
    <form onSubmit={onSubmit} className="mb-6">
      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="分类名称"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="h-10 w-full rounded-md border border-input"
            />
          </div>
        </div>
        {/* 添加描述输入字段 */}
        <div>
          <Input
            placeholder="分类描述 (例如: 包括日常饮食、外出就餐等)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <Button type="submit">
          {isEditing ? "更新分类" : "添加分类"}
        </Button>
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
      </div>
    </form>
  );
}