import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "./CategoryForm";
import { CategoryList } from "./CategoryList";
import { Category, CategoryFormData } from "./types";

interface CategoryManagementProps {
  userId: string;
  // 这些状态可以在父组件中共享，以便显示全局成功/错误消息
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}

export function CategoryManagement({ userId, setError, setSuccess }: CategoryManagementProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 分类表单状态
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    color: "#6c5ce7",
    description: "",
  });

  // 获取分类列表
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/categories");
      
      if (!response.ok) {
        throw new Error("获取分类失败");
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("获取分类失败:", err);
      setError("获取分类失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, setError, setCategories]);

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId, fetchCategories]);

  // 处理添加分类
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("分类名称不能为空");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "添加分类失败");
      }

      setSuccess("分类添加成功");
      setFormData({
        name: "",
        color: "#6c5ce7",
        description: "",
      });
      fetchCategories();
    } catch (err) {
      console.error("添加分类失败:", err);
      setError(err instanceof Error ? err.message : "添加分类失败，请稍后再试");
    }
  };

  // 开始编辑分类
  const startEditCategory = (category: Category) => {
    setIsEditing(true);
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color,
      description: category.description || "",
    });
  };

  // 取消编辑
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingCategory(null);
    setFormData({
      name: "",
      color: "#6c5ce7",
      description: "",
    });
  };

  // 处理更新分类
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("分类名称不能为空");
      return;
    }

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新分类失败");
      }

      setSuccess("分类更新成功");
      setIsEditing(false);
      setEditingCategory(null);
      setFormData({
        name: "",
        color: "#6c5ce7",
        description: "",
      });
      fetchCategories();
    } catch (err) {
      console.error("更新分类失败:", err);
      setError(err instanceof Error ? err.message : "更新分类失败，请稍后再试");
    }
  };

  // 处理删除分类
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("确定要删除这个分类吗？关联的记录也将被删除。")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除分类失败");
      }

      setSuccess("分类删除成功");
      fetchCategories();
    } catch (err) {
      console.error("删除分类失败:", err);
      setError(err instanceof Error ? err.message : "删除分类失败，请稍后再试");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>分类管理</CardTitle>
      </CardHeader>
      <CardContent>
        <CategoryForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={isEditing ? handleUpdateCategory : handleAddCategory}
          isEditing={isEditing}
          onCancel={cancelEdit}
        />

        <CategoryList
          categories={categories}
          isLoading={isLoading}
          onEdit={startEditCategory}
          onDelete={handleDeleteCategory}
        />
      </CardContent>
    </Card>
  );
}