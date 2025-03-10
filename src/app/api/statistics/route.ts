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

        // 获取分类详情
        const categories = await prisma.category.findMany({
            where: {
                userId,
                id: {
                    in: categoryStats.map((stat) => stat.categoryId),
                },
            },
            select: {
                id: true,
                name: true,
                color: true,
            },
        });

        // 合并分类统计数据
        const categoryStatistics = categoryStats.map((stat) => {
            const category = categories.find((cat) => cat.id === stat.categoryId);
            return {
                categoryId: stat.categoryId,
                categoryName: category?.name || "未知分类",
                categoryColor: category?.color || "#ccc",
                totalAmount: stat._sum.amount || 0,
            };
        });

        // 计算总支出
        const totalSpending = categoryStatistics.reduce(
            (sum, stat) => sum + stat.totalAmount,
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

        if (period === "month") {
            // 按天统计
            const dailyStats = await prisma.$queryRaw`
        SELECT 
          date(date) as day, 
          SUM(amount) as totalAmount
        FROM "Record"
        WHERE "userId" = ${userId}
          AND date >= ${startDateTime}
          AND date <= ${endDateTime}
        GROUP BY day
        ORDER BY day ASC
      `;
            timeSeriesStats = Array.isArray(dailyStats) ? dailyStats : [];
        } else if (period === "year") {
            // 按月统计
            const monthlyStats = await prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', date) as month, 
          SUM(amount) as totalAmount
        FROM "Record"
        WHERE "userId" = ${userId}
          AND date >= ${startDateTime}
          AND date <= ${endDateTime}
        GROUP BY month
        ORDER BY month ASC
      `;
            timeSeriesStats = Array.isArray(monthlyStats) ? monthlyStats : [];
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