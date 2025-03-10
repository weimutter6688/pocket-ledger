import { redirect } from "next/navigation";

// 创建一个dashboard路径的重定向页面
// 将所有对/dashboard的访问重定向到/records
export default function DashboardRedirectPage() {
  redirect("/records");
  
  // 由于重定向，这里的内容不会被渲染
  return null;
}