"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TodayRecordsList } from "@/components/today-records-list";

// 添加这个依赖
import { useSession } from "next-auth/react";

// 定义表单验证模式
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

type RecordFormValues = z.infer<typeof recordSchema>;

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

export default function NewRecordPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 添加当日记录相关状态
  const [todayRecords, setTodayRecords] = useState<Record[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // 获取当前日期，格式为YYYY-MM-DD
  const currentDate = new Date().toISOString().split('T')[0];
  
  // 初始化表单
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      amount: "",
      categoryId: "",
      date: currentDate, // 在这里设置默认日期
      note: "",
    },
  });

  // 获取分类列表
  useEffect(() => {
    async function fetchData() {
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
      }
    }

    if (session?.user) {
      fetchData();
      fetchTodayRecords(); // 加载当日记录
    }
  }, [session]);

  // 获取当日记录
  const fetchTodayRecords = async () => {
    if (!session?.user) return;
    
    setIsLoadingRecords(true);
    try {
      // 构建当日日期范围
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const startDate = today.toISOString().split('T')[0];
      const endDate = tomorrow.toISOString().split('T')[0];
      
      // 获取当日记录
      const response = await fetch(
        `/api/records?startDate=${startDate}&endDate=${endDate}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error("获取当日记录失败");
      }
      
      const data = await response.json();
      setTodayRecords(data.records);
    } catch (err) {
      console.error("获取当日记录失败:", err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // 处理表单提交
  const onSubmit = async (data: RecordFormValues) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          categoryId: data.categoryId,
          date: new Date(data.date),
          note: data.note,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "添加记录失败");
      }

      // 添加成功后
      const newRecord = await response.json();
      
      // 1. 刷新当日记录
      await fetchTodayRecords();
      
      // 2. 重置表单
      reset({
        amount: "",
        categoryId: "",
        date: currentDate,
        note: "",
      });
      
      // 3. 显示成功消息
      setError("");
      setIsLoading(false);
      
      // 注意：不再自动跳转，而是保留在当前页面以便继续添加
    } catch (err) {
      console.error("添加记录失败:", err);
      setError(err instanceof Error ? err.message : "添加记录失败，请稍后再试");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">添加记录</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>新支出</CardTitle>
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
                {...register("amount")}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                error={errors.amount?.message}
              />
            </div>

            {/* 分类选择 */}
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                分类
              </label>
              <select
                id="categoryId"
                {...register("categoryId")}
                className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                  errors.categoryId ? "border-red-500" : ""
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
              {errors.categoryId && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.categoryId.message}
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
                {...register("date")}
                type="date"
                error={errors.date?.message}
                // 移除defaultValue属性，因为register已经处理了默认值
              />
            </div>

            {/* 备注输入 */}
            <div className="space-y-2">
              <label htmlFor="note" className="text-sm font-medium">
                备注 (可选)
              </label>
              <Input
                id="note"
                {...register("note")}
                placeholder="添加备注..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-2">
            <Button type="submit" fullWidth isLoading={isLoading}>
              保存
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => router.push("/records")}
            >
              查看所有记录
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* 当日记录列表 */}
      <Card>
        <CardContent className="pt-6">
          <TodayRecordsList 
            records={todayRecords} 
            isLoading={isLoadingRecords} 
          />
        </CardContent>
      </Card>
    </div>
  );
}