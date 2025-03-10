import React from "react";
import { Button } from "@/components/ui/button";

interface DataManagementProps {
  onExport: () => Promise<void>;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataManagement({ onExport, onImport }: DataManagementProps) {
  return (
    <div className="space-y-4">
      <div>
        <Button onClick={onExport}>导出数据</Button>
        <p className="mt-1 text-xs text-gray-500">
          将您的所有记录和分类导出为JSON文件
        </p>
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="import-file"
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-gray-300 bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            导入数据
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />
          </label>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          从JSON文件导入记录和分类
        </p>
      </div>
    </div>
  );
}