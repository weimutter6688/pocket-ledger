/*
 * 此脚本用于修复数据库中可能存在的记录日期问题
 * 问题描述：之前的一个bug可能导致一些记录使用了添加日期而非用户选择的实际日期
 * 此脚本会检查所有记录，确保它们使用的是正确的日期
 */

// 使用CommonJS语法导入PrismaClient
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 设置时区为中国时区 (UTC+8)
process.env.TZ = 'Asia/Shanghai';

async function fixRecordDates() {
    console.log('开始修复记录日期...');

    // 获取所有记录
    const records = await prisma.record.findMany();
    console.log(`找到 ${records.length} 条记录`);

    let fixedCount = 0;

    for (const record of records) {
        // 在本脚本中，我们无法确定用户原本想要设置的日期
        // 我们可以检查date和createdAt的差距，如果差距过大，提示用户手动检查
        const dateTime = new Date(record.date).getTime();
        const createdTime = new Date(record.createdAt).getTime();
        const dayDiff = Math.abs(dateTime - createdTime) / (1000 * 60 * 60 * 24);

        if (dayDiff < 1) {
            // 如果日期与创建时间在同一天，可能是使用了默认日期
            // 在实际应用中，您需要决定如何处理这些记录
            console.log(`记录ID: ${record.id}, 日期与创建时间相近 (差距: ${dayDiff.toFixed(2)} 天)`);
            console.log(`  记录日期: ${record.date.toISOString().split('T')[0]}`);
            console.log(`  创建时间: ${record.createdAt.toISOString().split('T')[0]}`);

            // 这里我们不自动修改，因为我们无法确定用户想要的日期
            // 如果您确定需要修改，可以取消下面的注释，并根据实际情况修改
            /*
            await prisma.record.update({
              where: { id: record.id },
              data: {
                // 设置为您确定的正确日期
                date: new Date(someCorrectDate)
              }
            });
            fixedCount++;
            */
        }
    }

    console.log(`检查完成。请手动确认需要修复的记录。`);
}

fixRecordDates()
    .catch((e) => {
        console.error('修复过程中出错:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });

// 添加CommonJS导出
module.exports = { fixRecordDates };