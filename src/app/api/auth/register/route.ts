import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/db";
import { z } from "zod";

// 注册表单验证模式
const registerSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = registerSchema.parse(body);

        // 检查用户名是否已存在
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "用户名已被使用" },
                { status: 409 }
            );
        }

        // 定义包含描述的预设分类
        const defaultCategories = [
            {
                name: "餐饮食品",
                description: "包括日常饮食、外出就餐等",
                color: "#FF6384"
            },
            {
                name: "交通出行",
                description: "公共交通、打车、汽车费用等",
                color: "#36A2EB"
            },
            {
                name: "购物消费",
                description: "衣物、日用品、电子产品等",
                color: "#FFCE56"
            },
            {
                name: "居家住房",
                description: "房租、水电费、物业费等",
                color: "#4BC0C0"
            },
            {
                name: "娱乐休闲",
                description: "旅游、电影、健身等",
                color: "#9966FF"
            },
            {
                name: "医疗健康",
                description: "看病、药品、保健品等",
                color: "#FF9F40"
            },
            {
                name: "教育学习",
                description: "学费、书籍、课程等",
                color: "#8AC926"
            },
            {
                name: "人情往来",
                description: "礼金、红包等社交支出",
                color: "#F15BB5"
            },
            {
                name: "金融理财",
                description: "投资、保险等",
                color: "#00BBF9"
            },
            {
                name: "其他支出",
                description: "无法归类的其他消费",
                color: "#C9CBCF"
            },
        ];

        // 哈希密码并创建用户
        const hashedPassword = await hash(password, 10);

        // 使用断言解决TypeScript类型问题
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                // 创建默认分类 - 带描述的10个分类
                categories: {
                    create: defaultCategories as any, // 使用类型断言
                },
            },
        });

        // 返回成功响应（不包含密码）
        return NextResponse.json(
            {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("注册失败:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "验证失败", details: error.errors },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { error: "注册失败" },
            { status: 500 }
        );
    }
}