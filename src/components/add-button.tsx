"use client";

import React from "react";
import Link from "next/link";

interface AddButtonProps {
  href?: string;
  onClick?: () => void;
}

export default function AddButton({ href, onClick }: AddButtonProps) {
  // 如果提供了href，使用Link组件
  if (href) {
    return (
      <Link
        href={href}
        className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:bg-blue-700 hover:scale-105 active:scale-95"
        aria-label="添加记录"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Link>
    );
  }

  // 否则使用按钮元素
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:bg-blue-700 hover:scale-105 active:scale-95"
      aria-label="添加记录"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  );
}