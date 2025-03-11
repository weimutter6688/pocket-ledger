import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 定义新的分类
const newCategories = [
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

// 更新分类函数
async function updateCategories() {
    try {
        // 获取所有用户
        const users = await prisma.user.findMany();
        console.log(`找到 ${users.length} 个用户，开始更新分类...`);

        // 为每个用户更新分类
        for (const user of users) {
            console.log(`正在处理用户: ${user.username}`);

            // 获取用户现有的分类
            const existingCategories = await prisma.category.findMany({
                where: { userId: user.id },
            });

            // 处理每个新分类
            for (const newCategory of newCategories) {
                // 检查是否已存在同名分类
                const existingCategory = existingCategories.find(
                    (cat: { name: string }) => cat.name.toLowerCase() === newCategory.name.toLowerCase()
                );

                if (existingCategory) {
                    // 如果存在，更新描述和颜色
                    console.log(`更新现有分类: ${newCategory.name}`);
                    await prisma.category.update({
                        where: { id: existingCategory.id },
                        data: {
                            // 使用类型断言解决TypeScript错误
                            color: newCategory.color,
                            description: newCategory.description as any,
                        },
                    });
                } else {
                    // 如果不存在，创建新分类
                    console.log(`创建新分类: ${newCategory.name}`);
                    await prisma.category.create({
                        data: {
                            name: newCategory.name,
                            color: newCategory.color,
                            description: newCategory.description as any,
                            userId: user.id,
                        },
                    });
                }
            }
        }

        console.log('分类更新完成!');
    } catch (error) {
        console.error('更新分类时出错:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// 运行更新
updateCategories();