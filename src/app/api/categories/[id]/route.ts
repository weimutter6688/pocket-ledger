import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

interface RouteParams {
    params: {
        id: string;
    };
}

// GET 获取单个分类详情
export async function GET(request: Request, { params }: RouteParams) {
    try {
        // 获取当前用户会话
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { id } = await params; // 添加await

        // 获取分类详情，包括父分类信息
        const category = await prisma.category.findFirst({
            where: {
                id,
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
                records: {
                    take: 5,
                    orderBy: {
                        date: "desc",
                    },
                    select: {
                        id: true,
                        amount: true,
                        date: true,
                        note: true,
                    },
                },
                _count: {
                    select: {
                        records: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "分类不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error("获取分类详情失败:", error);
        return NextResponse.json(
            { error: "获取分类详情失败" },
            { status: 500 }
        );
    }
}

// PATCH 更新分类
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        // 获取当前用户会话
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { id } = await params; // 添加await
        const body = await request.json();

        // 检查分类是否存在
        const category = await prisma.category.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "分类不存在" },
                { status: 404 }
            );
        }

        // 如果更新名称，检查名称是否已存在
        if (body.name && body.name !== category.name) {
            const existingCategory = await prisma.category.findFirst({
                where: {
                    name: body.name,
                    userId,
                    id: {
                        not: id,
                    },
                },
            });

            if (existingCategory) {
                return NextResponse.json(
                    { error: "分类名称已存在" },
                    { status: 409 }
                );
            }
        }

        // 如果有父分类，验证父分类是否存在
        if (body.parentId && body.parentId !== category.parentId) {
            // 检查不能将自己作为子分类（避免循环依赖）
            if (body.parentId === id) {
                return NextResponse.json(
                    { error: "不能将分类设为自身的父分类" },
                    { status: 400 }
                );
            }

            const parentCategory = await prisma.category.findFirst({
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

        // 更新分类
        const updatedCategory = await prisma.category.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                color: body.color,
                parentId: body.parentId,
            },
        });

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("更新分类失败:", error);
        return NextResponse.json(
            { error: "更新分类失败" },
            { status: 500 }
        );
    }
}

// DELETE 删除分类
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        // 获取当前用户会话
        const session = await getServerSession(authOptions);

        if (!session || !session.user.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { id } = await params; // 添加await

        // 检查分类是否存在
        const category = await prisma.category.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                _count: {
                    select: {
                        records: true,
                        children: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: "分类不存在" },
                { status: 404 }
            );
        }

        // 如果分类有子分类，不允许删除
        if (category._count.children > 0) {
            return NextResponse.json(
                { error: "该分类包含子分类，请先删除子分类" },
                { status: 400 }
            );
        }

        // 删除分类
        await prisma.category.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("删除分类失败:", error);
        return NextResponse.json(
            { error: "删除分类失败" },
            { status: 500 }
        );
    }
}