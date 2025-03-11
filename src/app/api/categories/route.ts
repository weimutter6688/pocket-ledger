import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET 获取分类列表
export async function GET() {
    try {
        // 获取当前用户会话
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;

        // 获取分类列表，包括父分类信息
        const categories = await prisma.category.findMany({
            where: {
                userId,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                _count: {
                    select: {
                        records: true,
                    },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("获取分类失败:", error);
        return NextResponse.json(
            { error: "获取分类失败" },
            { status: 500 }
        );
    }
}

// POST 创建新分类
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
        const { name, color } = body;

        if (!name) {
            return NextResponse.json(
                { error: "分类名称为必填项" },
                { status: 400 }
            );
        }

        // 检查分类名称是否已存在
        const existingCategory = await prisma.category.findFirst({
            where: {
                name,
                userId,
            },
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "分类名称已存在" },
                { status: 409 }
            );
        }

        // 如果有父分类，验证父分类是否存在
        let parentCategory = null;
        if (body.parentId) {
            parentCategory = await prisma.category.findFirst({
                where: {
                    id: body.parentId,
                    userId,
                },
            });

            if (!parentCategory) {
                return NextResponse.json(
                    { error: "父分类不存在" },
                    { status: 404 }
                );
            }
        }

        // 创建分类
        const category = await prisma.category.create({
            data: {
                name,
                color: color || "#6c5ce7", // 默认颜色
                parentId: body.parentId || null,
                userId,
                description: body.description || null,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.error("创建分类失败:", error);
        return NextResponse.json(
            { error: "创建分类失败" },
            { status: 500 }
        );
    }
}