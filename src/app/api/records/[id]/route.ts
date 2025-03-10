import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

// GET 获取单条记录
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { id } = await params; // 修改这里，添加 await

        // 确保id格式正确
        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "无效的记录ID" }, { status: 400 });
        }

        // 查询记录，包括分类信息
        const record = await prisma.record.findUnique({
            where: {
                id,
                userId, // 确保只能访问自己的记录
            },
            include: {
                category: true,
            },
        });

        if (!record) {
            return NextResponse.json({ error: "记录不存在" }, { status: 404 });
        }

        return NextResponse.json(record);
    } catch (error) {
        console.error("获取记录失败:", error);
        return NextResponse.json(
            { error: "获取记录失败" },
            { status: 500 }
        );
    }
}

// PUT 更新记录
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { id } = await params; // 修改这里，添加 await

        // 确保id格式正确
        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "无效的记录ID" }, { status: 400 });
        }

        // 获取请求体
        const data = await request.json();

        // 基本验证
        if (!data.amount || !data.categoryId || !data.date) {
            return NextResponse.json(
                { error: "金额、分类和日期为必填项" },
                { status: 400 }
            );
        }

        // 检查记录是否存在且属于当前用户
        const existingRecord = await prisma.record.findUnique({
            where: {
                id,
                userId,
            },
        });

        if (!existingRecord) {
            return NextResponse.json(
                { error: "记录不存在或无权修改" },
                { status: 404 }
            );
        }

        // 检查分类是否存在且属于当前用户
        const category = await prisma.category.findUnique({
            where: {
                id: data.categoryId,
                userId,
            },
        });

        if (!category) {
            return NextResponse.json({ error: "分类不存在" }, { status: 400 });
        }

        // 更新记录
        const updatedRecord = await prisma.record.update({
            where: {
                id,
            },
            data: {
                amount: parseFloat(data.amount),
                categoryId: data.categoryId,
                date: new Date(data.date),
                note: data.note || null,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(updatedRecord);
    } catch (error) {
        console.error("更新记录失败:", error);
        return NextResponse.json(
            { error: "更新记录失败" },
            { status: 500 }
        );
    }
}

// DELETE 删除记录
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "未授权" }, { status: 401 });
        }

        const userId = session.user.id;
        const { id } = await params; // 修改这里，添加 await

        // 确保id格式正确
        if (!id || typeof id !== "string") {
            return NextResponse.json({ error: "无效的记录ID" }, { status: 400 });
        }

        // 检查记录是否存在且属于当前用户
        const existingRecord = await prisma.record.findUnique({
            where: {
                id,
                userId,
            },
        });

        if (!existingRecord) {
            return NextResponse.json(
                { error: "记录不存在或无权删除" },
                { status: 404 }
            );
        }

        // 删除记录
        await prisma.record.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("删除记录失败:", error);
        return NextResponse.json(
            { error: "删除记录失败" },
            { status: 500 }
        );
    }
}