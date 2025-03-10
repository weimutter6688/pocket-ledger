const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 定义新的标准分类
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

    for (const user of users) {
      console.log(`正在处理用户: ${user.username}`);
      
      // 1. 获取用户现有的所有分类
      const existingCategories = await prisma.category.findMany({
        where: { userId: user.id },
        include: { _count: { select: { records: true } } },
      });
      
      console.log(`找到 ${existingCategories.length} 个现有分类`);
      
      // 2. 首先创建"其他支出"分类（如果不存在），用于转移记录
      let otherCategory = existingCategories.find(
        cat => cat.name.toLowerCase() === "其他支出"
      );
      
      if (!otherCategory) {
        console.log('创建"其他支出"分类...');
        const otherCategoryDef = newCategories.find(c => c.name === "其他支出");
        const id = Math.random().toString(36).substring(2, 15);
        const now = new Date().toISOString();
        
        await prisma.$executeRawUnsafe(`
          INSERT INTO "Category" ("id", "name", "color", "description", "userId", "createdAt", "updatedAt")
          VALUES (
            '${id}', 
            '${otherCategoryDef.name}', 
            '${otherCategoryDef.color}', 
            '${otherCategoryDef.description}', 
            '${user.id}', 
            '${now}', 
            '${now}'
          )
        `);
        
        // 重新获取分类列表，以获取新创建的"其他支出"分类
        otherCategory = await prisma.category.findFirst({
          where: { 
            userId: user.id,
            name: "其他支出"
          }
        });
      }
      
      // 3. 处理需要保留的旧分类和需要删除的旧分类
      const categoriesToKeep = [];
      const categoriesToDelete = [];
      
      for (const existingCat of existingCategories) {
        // 检查是否是新分类列表中的分类
        const matchingNewCat = newCategories.find(
          newCat => newCat.name.toLowerCase() === existingCat.name.toLowerCase()
        );
        
        if (matchingNewCat) {
          // 分类要保留，稍后更新
          categoriesToKeep.push(existingCat);
        } else {
          // 不在新分类列表中，需要删除
          categoriesToDelete.push(existingCat);
        }
      }
      
      console.log(`需要保留 ${categoriesToKeep.length} 个分类，需要删除 ${categoriesToDelete.length} 个分类`);
      
      // 4. 处理需要删除的分类
      for (const catToDelete of categoriesToDelete) {
        if (catToDelete._count.records > 0) {
          console.log(`将分类 "${catToDelete.name}" 的 ${catToDelete._count.records} 条记录转移到"其他支出"...`);
          
          // 将该分类下的记录转移到"其他支出"分类
          await prisma.$executeRawUnsafe(`
            UPDATE "Record"
            SET "categoryId" = '${otherCategory.id}'
            WHERE "categoryId" = '${catToDelete.id}'
          `);
        }
        
        // 删除该分类
        console.log(`删除分类: ${catToDelete.name}`);
        await prisma.$executeRawUnsafe(`
          DELETE FROM "Category"
          WHERE "id" = '${catToDelete.id}'
        `);
      }
      
      // 5. 创建或更新新分类列表中的分类
      for (const newCategory of newCategories) {
        // 检查是否已存在同名分类
        const existingCategory = categoriesToKeep.find(
          cat => cat.name.toLowerCase() === newCategory.name.toLowerCase()
        );
        
        if (existingCategory) {
          // 如果存在，更新描述和颜色
          console.log(`更新现有分类: ${newCategory.name}`);
          
          await prisma.$executeRawUnsafe(`
            UPDATE "Category"
            SET "color" = '${newCategory.color}', "description" = '${newCategory.description}'
            WHERE "id" = '${existingCategory.id}'
          `);
        } else if (newCategory.name !== "其他支出") {
          // 如果不存在且不是"其他支出"（已经创建过），创建新分类
          console.log(`创建新分类: ${newCategory.name}`);
          
          const id = Math.random().toString(36).substring(2, 15);
          const now = new Date().toISOString();
          
          await prisma.$executeRawUnsafe(`
            INSERT INTO "Category" ("id", "name", "color", "description", "userId", "createdAt", "updatedAt")
            VALUES (
              '${id}', 
              '${newCategory.name}', 
              '${newCategory.color}', 
              '${newCategory.description}', 
              '${user.id}', 
              '${now}', 
              '${now}'
            )
          `);
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