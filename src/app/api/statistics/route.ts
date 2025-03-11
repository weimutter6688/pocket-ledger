import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET 获取统计数据
export async function GET(request: Request) {
    try {
        // 获取当前用户会话
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);

        // 获取时间范围参数
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const period = searchParams.get("period") || "month"; // month, year

        // 计算日期范围
        let startDateTime: Date;
        let endDateTime: Date;

        if (startDate && endDate) {
            startDateTime = new Date(startDate);
            endDateTime = new Date(endDate);
        } else {
            // 默认为当前月份
            const now = new Date();
            startDateTime = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        }

        // 定义日期过滤器
        const dateFilter = {
            date: {
                gte: startDateTime,
                lte: endDateTime,
            },
        };

        // 按分类统计
        const categoryStats = await prisma.record.groupBy({
            by: ["categoryId"],
            where: {
                userId,
                ...dateFilter,
            },
            _sum: {
                amount: true,
            },
        });

        type CategoryStat = {
            categoryId: string;
            _sum: {
                amount: number | null;
            };
        };

        // 获取分类详情
        const categories = await prisma.category.findMany({
            where: {
                userId,
                id: {
                    in: categoryStats.map((stat: CategoryStat) => stat.categoryId),
                },
            },
            select: {
                id: true,
                name: true,
                color: true,
            },
        });

        // 合并分类统计数据
        const categoryStatistics = categoryStats.map((stat: { categoryId: string, _sum: { amount: number | null } }) => {
            const category = categories.find((cat: { id: string, name: string, color: string }) => cat.id === stat.categoryId);
            return {
                categoryId: stat.categoryId,
                categoryName: category?.name || "未知分类",
                categoryColor: category?.color || "#ccc",
                totalAmount: stat._sum.amount || 0,
            };
        });

        // 计算总支出
        const totalSpending = categoryStatistics.reduce(
            (sum: number, stat: { totalAmount: number }) => sum + stat.totalAmount,
            0
        );

        // 定义时间序列统计类型
        interface DailyStats {
            day: string;
            totalAmount: number;
        }

        interface MonthlyStats {
            month: string;
            totalAmount: number;
        }

        type TimeSeriesStat = DailyStats | MonthlyStats;

        // 按天或月份统计
        let timeSeriesStats: TimeSeriesStat[] = [];

        // 直接使用Prisma的类型安全查询，而不是原始SQL
        if (period === "month") {
            // 按天统计
            const records = await prisma.record.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDateTime,
                        lte: endDateTime,
                    },
                },
                select: {
                    date: true,
                    amount: true,
                },
                orderBy: {
                    date: 'asc',
                },
            });

            // 使用JavaScript进行日期分组和汇总，保证时区一致性
            const dailyMap = new Map<string, number>();
            records.forEach((record: { date: Date; amount: number }) => {
                // 提取日期部分 (YYYY-MM-DD)，确保使用记录的实际日期
                const dateKey = record.date.toISOString().split('T')[0];
                const currentAmount = dailyMap.get(dateKey) || 0;
                dailyMap.set(dateKey, currentAmount + record.amount);
            });

            // 转换为时间序列统计格式
            timeSeriesStats = Array.from(dailyMap.entries()).map(([day, totalAmount]) => ({
                day,
                totalAmount,
            })).sort((a, b) => a.day.localeCompare(b.day));

        } else if (period === "year") {
            // 按月统计
            const records = await prisma.record.findMany({
                where: {
                    userId,
                    date: {
                        gte: startDateTime,
                        lte: endDateTime,
                    },
                },
                select: {
                    date: true,
                    amount: true,
                },
                orderBy: {
                    date: 'asc',
                },
            });

            // 使用JavaScript进行月份分组和汇总
            const monthlyMap = new Map<string, number>();
            records.forEach((record: { date: Date; amount: number }) => {
                // 提取年月部分 (YYYY-MM)
                const dateObj = record.date;
                const month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
                const currentAmount = monthlyMap.get(month) || 0;
                monthlyMap.set(month, currentAmount + record.amount);
            });

            // 转换为时间序列统计格式
            timeSeriesStats = Array.from(monthlyMap.entries()).map(([month, totalAmount]) => ({
                month,
                totalAmount,
            })).sort((a, b) => a.month.localeCompare(b.month));
        }

        return NextResponse.json({
            totalSpending,
            categoryStatistics,
            timeSeriesStats,
            dateRange: {
                startDate: startDateTime,
                endDate: endDateTime,
            },
        });
    } catch (error) {
        console.error("获取统计数据失败:", error);
        return NextResponse.json(
            { error: "获取统计数据失败" },
            { status: 500 }
        );
    }
}