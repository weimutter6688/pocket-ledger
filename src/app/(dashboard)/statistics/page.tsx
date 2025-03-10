"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CategoryPieChart from "@/components/charts/category-pie-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
}

interface TimeSeriesStat {
  day?: string;
  month?: string;
  totalAmount: number;
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

export default function StatisticsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  });
  const [period, setPeriod] = useState<"month" | "year">("month");

  // 获取统计数据
  useEffect(() => {
    async function fetchStatistics() {
      if (!session?.user) return;
      
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          period,
        });
        
        const response = await fetch(`/api/statistics?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error("获取统计数据失败");
        }
        
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        console.error("获取统计数据失败:", err);
        setError("获取统计数据失败，请稍后再试");
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatistics();
  }, [session, dateRange, period]);

  // 处理日期范围变化
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({ ...prev, [name]: value }));
  };

  // 处理周期变化
  const handlePeriodChange = (newPeriod: "month" | "year") => {
    setPeriod(newPeriod);
    
    // 更新日期范围
    if (newPeriod === "month") {
      // 当前月
      setDateRange({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
          .toISOString()
          .split("T")[0],
      });
    } else {
      // 当前年
      setDateRange({
        startDate: new Date(new Date().getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0],
        endDate: new Date(new Date().getFullYear(), 11, 31)
          .toISOString()
          .split("T")[0],
      });
    }
  };

  // 格式化时间序列数据
  const formatTimeSeriesData = (data: TimeSeriesStat[]) => {
    if (!data || data.length === 0) return [];

    return data.map((item) => ({
      ...item,
      date: item.day || item.month,
      // 使用本地数字格式
      formattedAmount: formatCurrency(item.totalAmount).replace(/[^\d,.]/g, ""),
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">消费统计</h1>

      {/* 时间范围和周期选择 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">统计范围</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 周期切换按钮 */}
            <div className="flex space-x-2">
              <Button
                variant={period === "month" ? "primary" : "outline"}
                onClick={() => handlePeriodChange("month")}
              >
                月度统计
              </Button>
              <Button
                variant={period === "year" ? "primary" : "outline"}
                onClick={() => handlePeriodChange("year")}
              >
                年度统计
              </Button>
            </div>

            {/* 日期范围选择 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  开始日期
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  结束日期
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 错误提示 */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {isLoading ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          加载中...
        </div>
      ) : (
        <>
          {/* 总支出卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>总支出</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">
                {formatCurrency(statistics?.totalSpending || 0)}
              </p>
              <p className="text-center text-gray-500 text-sm mt-1">
                {dateRange.startDate} 至 {dateRange.endDate}
              </p>
            </CardContent>
          </Card>

          {/* 分类统计饼图 */}
          <Card>
            <CardHeader>
              <CardTitle>分类占比</CardTitle>
            </CardHeader>
            <CardContent>
              {statistics?.categoryStatistics && statistics.categoryStatistics.length > 0 ? (
                <CategoryPieChart data={statistics.categoryStatistics} />
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">暂无数据</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 时间序列图表 */}
          <Card>
            <CardHeader>
              <CardTitle>
                {period === "month" ? "日消费趋势" : "月消费趋势"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statistics?.timeSeriesStats && statistics.timeSeriesStats.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={formatTimeSeriesData(statistics.timeSeriesStats)}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={true}
                        tickLine={true}
                      />
                      <YAxis
                        tickFormatter={(value) => `¥${value}`}
                        axisLine={true}
                        tickLine={true}
                      />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => 
                          period === "month" 
                            ? `${label} 日消费` 
                            : `${label} 月消费`
                        }
                      />
                      <Legend />
                      <Bar
                        dataKey="totalAmount"
                        name="支出"
                        fill="#6c5ce7"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">暂无数据</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}