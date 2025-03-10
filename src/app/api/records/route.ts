import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET 获取记录列表
export async function GET(request: Request) {
    try {
        // 获取当前用户会话
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { searchParams } = new URL(request.url);

        // 分页参数
        const limit = Number(searchParams.get("limit")) || 10;
        const page = Number(searchParams.get("page")) || 1;
        const skip = (page - 1) * limit;

        // 日期范围过滤
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        let dateFilter = {};

        if (startDate && endDate) {
            dateFilter = {
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            };
        } else if (startDate) {
            dateFilter = {
                date: {
                    gte: new Date(startDate),
                },
            };
        } else if (endDate) {
            dateFilter = {
                date: {
                    lte: new Date(endDate),
                },
            };
        }

        // 分类过滤
        const categoryId = searchParams.get("categoryId");
        const categoryFilter = categoryId
            ? { categoryId }
            : {};

        // 获取记录总数
        const totalRecords = await prisma.record.count({
            where: {
                userId,
                ...dateFilter,
                ...categoryFilter,
            },
        });

        // 获取记录列表
        const records = await prisma.record.findMany({
            where: {
                userId,
                ...dateFilter,
                ...categoryFilter,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
            skip,
            take: limit,
        });

        return NextResponse.json({
            records,
            pagination: {
                total: totalRecords,
                totalPages: Math.ceil(totalRecords / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("获取记录失败:", error);
        return NextResponse.json(
            { error: "获取记录失败" },
            { status: 500 }
        );
    }
}

// POST 创建新记录
export async function POST(request: Request) {
    try {
        // 获取当前用户会话
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();

        // 验证必填字段
        const { amount, categoryId, date } = body;

        if (!amount || !categoryId) {
            return NextResponse.json(
                { error: "金额和分类为必填项" },
                { status: 400 }
            );
        }

        // 验证分类是否存在且属于当前用户
        const category = await prisma.category.findFirst({
            where: {
                id: categoryId,
                userId,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "分类不存在" },
                { status: 404 }
            );
        }

        // 创建记录
        const record = await prisma.record.create({
            data: {
                amount: Number(amount),
                categoryId,
                date: date ? new Date(date) : new Date(),
                note: body.note || "",
                userId,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
            },
        });

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error("创建记录失败:", error);
        return NextResponse.json(
            { error: "创建记录失败" },
            { status: 500 }
        );
    }
}