"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import RecordCard, { Record } from "@/components/record-card";
import CategoryPieChart from "@/components/charts/category-pie-chart";

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
}
interface TimeSeriesStat {
  date: string;
  amount: number;
}

interface StatisticsData {
  totalSpending: number;
  categoryStatistics: CategoryStat[];
  timeSeriesStats: TimeSeriesStat[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export default function DashboardPage() {
  const router = useRouter(); // 添加 router 用于导航
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [recentRecords, setRecentRecords] = useState<Record[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [error, setError] = useState("");

  // 获取最近记录和统计数据
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError("");

      try {
        // 获取最近记录
        const recordsResponse = await fetch("/api/records?limit=5");
        
        if (!recordsResponse.ok) {
          throw new Error("获取记录失败");
        }
        
        const recordsData = await recordsResponse.json();
        setRecentRecords(recordsData.records);

        // 获取统计数据
        const statsResponse = await fetch("/api/statistics");
        
        if (!statsResponse.ok) {
          throw new Error("获取统计数据失败");
        }
        
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      } catch (err) {
        console.error("获取数据失败:", err);
        setError("获取数据失败，请稍后再试");
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchData();
    }
  }, [session]);

  // 导航到记录编辑页面
  const navigateToRecordEdit = (recordId: string) => {
    router.push(`/records/${recordId}`);
  };

  return (
    <div className="space-y-6">
      {/* 欢迎信息 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {session?.user?.username ? `你好，${session.user.username}` : "口袋记账"}
        </h1>
        <p className="mt-1 text-gray-600">
          {new Date().toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 本月汇总卡片 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">本月支出</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {/* 总金额 */}
            <div className="mb-4 text-center">
              <span className="text-3xl font-bold text-gray-900">
                {isLoading
                  ? "加载中..."
                  : formatCurrency(statistics?.totalSpending || 0)}
              </span>
            </div>

            {/* 饼图 */}
            {isLoading ? (
              <div className="h-64 w-full flex items-center justify-center">
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : statistics?.categoryStatistics && statistics.categoryStatistics.length > 0 ? (
              <CategoryPieChart data={statistics.categoryStatistics} />
            ) : (
              <div className="h-64 w-full flex items-center justify-center">
                <p className="text-gray-500">暂无数据</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 最近交易 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">最近交易</h2>
          <Link
            href="/records"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            查看全部
          </Link>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
            加载中...
          </div>
        ) : recentRecords.length > 0 ? (
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                onClick={() => navigateToRecordEdit(record.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center">
            <p className="text-gray-500">暂无交易记录</p>
            <Link
              href="/new"
              className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              添加第一笔记录
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}