import { Suspense } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { TaskDetailSheet } from "@/components/task-detail-sheet";
import { CatalogoHydrator } from "@/components/catalogo-hydrator";
import { AssistantOrb } from "@/components/assistant-orb";
import { getUsuarioAtual } from "@/lib/usuario-atual";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuarioAtual = await getUsuarioAtual();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <CatalogoHydrator />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar usuarioAtual={usuarioAtual} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl px-6 py-6">
            <Suspense>{children}</Suspense>
          </div>
        </main>
      </div>
      <Suspense>
        <TaskDetailSheet />
      </Suspense>
      <Suspense>
        <AssistantOrb />
      </Suspense>
    </div>
  );
}
