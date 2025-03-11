# Pocket Ledger Docker使用指南

这是Pocket Ledger应用的Docker容器版本。应用已经预先配置了默认用户和分类，可以直接使用。

## 访问应用

应用运行后，可以通过浏览器访问：

```
http://localhost:3000
```

## 默认账户

系统已预先创建了一个管理员账户，可以直接使用：

- **用户名**: admin
- **密码**: admin123

## 默认分类

登录后，系统已预先创建了以下分类：

1. 餐饮食品
2. 交通出行
3. 购物消费
4. 居家住房
5. 娱乐休闲
6. 医疗健康
7. 教育学习
8. 人情往来
9. 金融理财
10. 其他支出

## 使用Docker Compose运行

```bash
# 启动应用
docker-compose -f docker-compose.optimized.yml up -d

# 查看日志
docker logs pocket-ledger

# 停止应用
docker-compose -f docker-compose.optimized.yml down