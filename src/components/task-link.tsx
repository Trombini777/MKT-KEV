"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

export function TaskLink({
  taskId,
  className,
  children,
}: {
  taskId: string;
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());
  params.set("tarefa", taskId);

  return (
    <Link href={`${pathname}?${params.toString()}`} scroll={false} className={className}>
      {children}
    </Link>
  );
}
