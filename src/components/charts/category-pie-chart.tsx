"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface CategoryStat {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  percentage?: number;
}

interface CategoryPieChartProps {
  data: CategoryStat[];
  title?: string;
}

export default function CategoryPieChart({ data, title }: CategoryPieChartProps) {
  // 如果没有数据，显示空状态
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <p className="text-center text-gray-500">暂无数据</p>
      </div>
    );
  }

  // 计算百分比
  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const chartData = data.map((item) => ({
    ...item,
    percentage: (item.totalAmount / total) * 100,
  }));

  // 定义自定义标签的参数接口
  interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percentage: number;
  }

  // 自定义标签
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percentage,
  }: LabelProps) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // 只显示大于5%的标签
    if (percentage < 5) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-64 w-full pt-2">
      {title && <h3 className="mb-2 text-center text-lg font-medium">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="totalAmount"
            nameKey="categoryName"
            label={renderCustomizedLabel}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.categoryColor} 
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${formatCurrency(value)} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}