import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 根路径页面 - 处理重定向
export default async function HomePage() {
  // 获取用户会话状态
  const session = await getServerSession(authOptions);

  // 根据登录状态重定向
  if (!session) {
    // 未登录用户重定向到登录页面
    redirect("/login");
  } else {
    // 已登录用户重定向到记录页面
    // 避免重定向循环，不要重定向回根路径
    redirect("/records");
  }

  // 由于上面的重定向，这里的内容实际上不会被渲染
  return null;
}
