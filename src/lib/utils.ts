import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并className，结合clsx和tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * 格式化金额为货币格式
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "CNY",
    }).format(amount);
}

/**
 * 格式化日期
 */
export function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(date);
}

/**
 * 生成颜色数组，用于图表
 */
export const chartColors = [
    "#FF6384", // 红色
    "#36A2EB", // 蓝色
    "#FFCE56", // 黄色
    "#4BC0C0", // 青色
    "#9966FF", // 紫色
    "#FF9F40", // 橙色
    "#C9CBCF", // 灰色
    "#7FD4C1", // 青绿
    "#FFA7A7", // 浅红
    "#A5D8F3", // 浅蓝
];