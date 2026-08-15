import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { TaskDetailSheet } from "@/components/task-detail-sheet";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl px-6 py-6">
            <Suspense>{children}</Suspense>
          </div>
        </main>
      </div>
      <Suspense>
        <TaskDetailSheet />
      </Suspense>
    </div>
  );
}
