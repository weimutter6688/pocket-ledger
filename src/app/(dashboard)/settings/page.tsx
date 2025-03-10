"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CategoryManagement, 
  DataManagement, 
  AccountManagement 
} from "@/components/settings";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // 处理数据导出
  const handleExportData = async () => {
    try {
      // 获取所有记录
      const recordsResponse = await fetch("/api/records?limit=10000");
      const recordsData = await recordsResponse.json();
      
      // 获取所有分类
      const categoriesResponse = await fetch("/api/categories");
      const categoriesData = await categoriesResponse.json();
      
      // 创建导出数据
      const exportData = {
        records: recordsData.records,
        categories: categoriesData,
        exportDate: new Date().toISOString(),
        version: "1.0",
      };
      
      // 创建下载链接
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileName = `pocket-ledger-export-${new Date().toISOString().substring(0, 10)}.json`;
      
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileName);
      linkElement.click();
      
      setSuccess("数据导出成功");
    } catch (err) {
      console.error("导出数据失败:", err);
      setError("导出数据失败，请稍后再试");
    }
  };
  
  // 处理数据导入（通过文件上传）
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setSuccess("");
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const importData = JSON.parse(content);
        
        // 验证导入数据格式
        if (!importData.categories || !importData.records) {
          throw new Error("导入数据格式不正确");
        }
        
        // 确认导入
        if (!confirm(`确定要导入数据吗？将导入 ${importData.categories.length} 个分类和 ${importData.records.length} 条记录。`)) {
          return;
        }
        
        // TODO: 实现实际的导入逻辑，这需要在后端API中添加导入端点
        
        // 模拟成功
        setSuccess("数据导入功能正在开发中");
      } catch (err) {
        console.error("导入数据失败:", err);
        setError("导入数据失败，请确保文件格式正确");
      }
      
      // 重置文件输入
      e.target.value = "";
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      {/* 成功/错误信息 */}
      {success && (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-600">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 分类管理 */}
      <CategoryManagement 
        userId={session?.user?.id || ''} 
        setError={setError} 
        setSuccess={setSuccess} 
      />

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle>数据管理</CardTitle>
        </CardHeader>
        <CardContent>
          <DataManagement
            onExport={handleExportData}
            onImport={handleImportData}
          />
        </CardContent>
      </Card>

      {/* 账户管理 */}
      <Card>
        <CardHeader>
          <CardTitle>账户管理</CardTitle>
        </CardHeader>
        <CardContent>
          <AccountManagement />
        </CardContent>
      </Card>
    </div>
  );
}
