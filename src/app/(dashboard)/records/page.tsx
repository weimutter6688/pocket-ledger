"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RecordCard, { Record } from "@/components/record-card";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface PaginationInfo {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function RecordsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [records, setRecords] = useState<Record[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 过滤条件
  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || "",
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
  });

  // 获取数据
  useEffect(() => {
    async function fetchData() {
      if (!session?.user) return;
      
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

        // 构建查询参数
        const page = searchParams.get("page") || "1";
        const queryParams = new URLSearchParams({
          page,
          limit: "10",
        });
        
        if (filters.categoryId) {
          queryParams.append("categoryId", filters.categoryId);
        }
        
        if (filters.startDate) {
          queryParams.append("startDate", filters.startDate);
        }
        
        if (filters.endDate) {
          queryParams.append("endDate", filters.endDate);
        }

        // 获取记录
        const recordsResponse = await fetch(`/api/records?${queryParams.toString()}`);
        if (!recordsResponse.ok) {
          throw new Error("获取记录失败");
        }
        
        const data = await recordsResponse.json();
        setRecords(data.records);
        setPagination(data.pagination);
      } catch (err) {
        console.error("获取数据失败:", err);
        setError("获取数据失败，请稍后再试");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [session, searchParams]);

  // 处理过滤条件变化
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 应用过滤器
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (filters.categoryId) {
      params.append("categoryId", filters.categoryId);
    }
    
    if (filters.startDate) {
      params.append("startDate", filters.startDate);
    }
    
    if (filters.endDate) {
      params.append("endDate", filters.endDate);
    }
    
    router.push(`/records?${params.toString()}`);
  };

  // 重置过滤器
  const resetFilters = () => {
    setFilters({
      categoryId: "",
      startDate: "",
      endDate: "",
    });
    router.push("/records");
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/records?${params.toString()}`);
  };

  // 导航到记录编辑页面
  const navigateToRecordEdit = (recordId: string) => {
    router.push(`/records/${recordId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-center">交易记录</h1>

      {/* 过滤器 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 分类筛选 */}
            <div className="space-y-2">
              <label htmlFor="categoryId" className="text-sm font-medium">
                分类
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                <option value="">全部分类</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* 日期范围 - 改进布局，特别是在移动设备上 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">日期范围</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label htmlFor="startDate" className="text-xs text-gray-500">开始日期</label>
                  <Input
                    id="startDate"
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="endDate" className="text-xs text-gray-500">结束日期</label>
                  <Input
                    id="endDate"
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex gap-2 justify-center">
            <Button onClick={applyFilters}>应用筛选</Button>
            <Button variant="outline" onClick={resetFilters}>
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 记录列表 */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          加载中...
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onClick={() => navigateToRecordEdit(record.id)}
              />
            ))}
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                上一页
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (page) =>
                      page === 1 ||
                      page === pagination.totalPages ||
                      Math.abs(page - pagination.currentPage) <= 1
                  )
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {index > 0 && array[index - 1] !== page - 1 && (
                        <span className="px-2">...</span>
                      )}
                      <Button
                        variant={
                          page === pagination.currentPage ? "primary" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
          <p className="text-gray-500">暂无交易记录</p>
          <Button className="mt-3" onClick={() => router.push("/new")}>
            添加记录
          </Button>
        </div>
      )}
    </div>
  );
}