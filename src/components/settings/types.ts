// 分类的共享类型定义
export interface Category {
    id: string;
    name: string;
    color: string;
    description?: string;
    _count?: {
        records: number;
    };
}

// 分类表单数据类型
export interface CategoryFormData {
    name: string;
    color: string;
    description: string;
}