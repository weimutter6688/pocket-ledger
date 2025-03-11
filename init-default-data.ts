// 用于在容器启动时初始化默认用户和分类数据
import * as prismaModule from '@prisma/client';
import { hashSync } from 'bcryptjs';

const PrismaClient = prismaModule.PrismaClient;

const prisma = new PrismaClient();

// 默认分类数据
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

async function initDefaultData() {
    try {
        console.log('开始初始化默认数据...');

        // 检查是否已存在用户
        const existingUsers = await prisma.user.count();

        if (existingUsers === 0) {
            console.log('创建默认用户...');

            // 创建默认用户
            const defaultUser = await prisma.user.create({
                data: {
                    username: 'admin',
                    password: hashSync('password', 10), // 使用bcrypt加密密码
                }
            });

            console.log(`默认用户创建成功: ${defaultUser.username}, ID: ${defaultUser.id}`);

            // 为默认用户创建默认分类
            console.log('创建默认分类...');

            for (const category of defaultCategories) {
                await prisma.category.create({
                    data: {
                        name: category.name,
                        description: category.description,
                        color: category.color,
                        userId: defaultUser.id,
                    }
                });
                console.log(`创建分类成功: ${category.name}`);
            }

            console.log('默认分类创建完成');
        } else {
            console.log(`已存在 ${existingUsers} 个用户，跳过默认数据初始化`);
        }

        console.log('数据初始化完成!');
    } catch (error) {
        console.error('初始化数据时出错:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// 执行初始化
initDefaultData();