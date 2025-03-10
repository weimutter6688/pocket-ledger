import React from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface AccountManagementProps {
  className?: string; // 添加一个可选的className属性，使接口非空
  // 可以根据需要添加更多属性，例如修改密码等功能
}

export function AccountManagement({}: AccountManagementProps) {
  return (
    <div className="space-y-4">
      <div>
        <Button
          variant="danger"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          退出登录
        </Button>
      </div>
    </div>
  );
}