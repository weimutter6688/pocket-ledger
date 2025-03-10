import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar";
import AddButton from "@/components/add-button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // 获取会话状态，验证用户是否已登录
  const session = await getServerSession(authOptions);

  // 如果未登录，重定向到登录页面
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <main className="flex-1 pb-20">
        {/* 主内容区域，使用容器限制最大宽度 */}
        <div className="mx-auto max-w-md px-4 py-8">
          {children}
        </div>
      </main>

      {/* 底部导航栏 */}
      <Navbar />

      {/* 添加记录浮动按钮 */}
      <AddButton href="/new" />
    </div>
  );
}