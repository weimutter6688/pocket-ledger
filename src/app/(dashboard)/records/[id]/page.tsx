"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

// 将Record接口改名为TransactionRecord，避免与TypeScript内置类型冲突
interface TransactionRecord {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  categoryId: string;
  category: Category;
}

// 表单验证模式
const recordSchema = z.object({
  amount: z.string().min(1, "请输入金额").refine(
    (value) => !isNaN(parseFloat(value)) && parseFloat(value) > 0,
    "金额必须大于0"
  ),
  categoryId: z.string().min(1, "请选择分类"),
  date: z.string().refine(
    (value) => !isNaN(Date.parse(value)),
    "请输入有效的日期"
  ),
  note: z.string().optional(),
});

// 表单数据类型
interface FormData {
  amount: string;
  categoryId: string;
  date: string;
  note: string;
}

export default function RecordEditPage() {
  const params = useParams();
  const recordId = params.id as string;
  const router = useRouter();
  const { data: session } = useSession();
  
  // 获取当前日期，格式为YYYY-MM-DD
  const currentDate = new Date().toISOString().split('T')[0];
  
  const [record, setRecord] = useState<TransactionRecord | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    amount: "",
    categoryId: "",
    date: currentDate, // 默认使用当前日期
    note: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // 获取记录和分类
  useEffect(() => {
    async function fetchData() {
      if (!session?.user || !recordId) return;
      
      setIsLoading(true);
      setError("");

      try {
        // 获取分类
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error("获取分类失败");
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        // 获取记录详情
        const recordResponse = await fetch(`/api/records/${recordId}`);
        if (!recordResponse.ok) {
          throw new Error("获取记录失败");
        }
        
        const recordData = await recordResponse.json();
        setRecord(recordData);
        
        // 设置表单数据 - 使用记录的金额、分类和备注，但日期使用当前日期
        setFormData({
          amount: recordData.amount.toString(),
          categoryId: recordData.categoryId,
          date: currentDate, // 使用当前日期，而不是记录的原始日期
          note: recordData.note || "",
        });
      } catch (err) {
        console.error("获取数据失败:", err);
        setError("获取数据失败，请稍后再试");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [session, recordId, currentDate]);

  // 验证表单
  const validateForm = () => {
    try {
      recordSchema.parse(formData);
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setFormErrors(newErrors);
      }
      return false;
    }
  };

  // 处理输入变化
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FormData) => ({ ...prev, [name]: value }));
    
    // 清除字段错误
    if (formErrors[name]) {
      setFormErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryId,
          date: new Date(formData.date),
          note: formData.note || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "更新记录失败");
      }

      // 更新成功，直接使用window.location进行强制跳转
      window.location.href = "/records";
    } catch (err) {
      console.error("更新记录失败:", err);
      setError(err instanceof Error ? err.message : "更新记录失败，请稍后再试");
      setIsSaving(false);
    }
  };

  // 处理删除
  const handleDelete = async () => {
    if (!confirm("确定要删除这条记录吗？此操作无法撤销。")) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/records/${recordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "删除记录失败");
      }

      // 删除成功，直接使用window.location进行强制跳转
      window.location.href = "/records";
    } catch (err) {
      console.error("删除记录失败:", err);
      setError(err instanceof Error ? err.message : "删除记录失败，请稍后再试");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-8">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          记录不存在或已被删除
        </div>
        <Button
          className="mt-4"
          onClick={() => router.push("/records")}
        >
          返回记录列表
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-center">编辑记录</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>修改支出记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 金额输入 */}
            <div className="space-y-2">
              <label htmlFor="amount" className="text-sm font-medium">
                金额
              </label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                error={formErrors.amount}
              />
            </div>

            {/* 分类选择 */}
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                分类
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  formErrors.categoryId ? "border-red-500" : ""
                }`}
              >
                <option value="">选择分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.description ? ` - ${category.description}` : ''}
                  </option>
                ))}
              </select>
              {formErrors.categoryId && (
                <p className="mt-1 text-xs text-red-500">
                  {formErrors.categoryId}
                </p>
              )}
            </div>

            {/* 日期选择 */}
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">
                日期
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                error={formErrors.date}
                // 移除defaultValue，因为已经有value属性了
              />
            </div>

            {/* 备注输入 */}
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                备注 (可选)
              </label>
              <Input
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="添加备注..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <div className="flex w-full gap-2">
              <Button
                type="submit"
                className="flex-1"
                isLoading={isSaving}
              >
                保存修改
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                取消
              </Button>
            </div>
            
            <Button
              type="button"
              variant="danger"
              className="w-full"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              删除记录
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
