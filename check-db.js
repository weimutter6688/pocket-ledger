// 用于检查数据库内容的脚本
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('====== 数据库检查开始 ======');
    
    // 检查用户
    const users = await prisma.user.findMany();
    console.log(`\n找到 ${users.length} 个用户:`);
    console.log(users.map(user => ({ id: user.id, username: user.username })));
    
    // 检查分类
    const categories = await prisma.category.findMany();
    console.log(`\n找到 ${categories.length} 个分类:`);
    console.log(categories.map(cat => ({ 
      id: cat.id, 
      name: cat.name, 
      userId: cat.userId 
    })));
    
    // 检查每个用户的分类
    for (const user of users) {
      const userCategories = await prisma.category.findMany({
        where: { userId: user.id }
      });
      console.log(`\n用户 "${user.username}" (ID: ${user.id}) 拥有 ${userCategories.length} 个分类`);
    }
    
    console.log('\n====== 数据库检查完成 ======');
  } catch (error) {
    console.error('检查数据库时出错:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();