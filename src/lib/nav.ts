import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Columns3,
  FolderKanban,
  Megaphone,
  Shapes,
  Waypoints,
  Users,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavSection = {
  title: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Trabalho",
    items: [
      { href: "/painel", label: "Painel de Trabalho", icon: LayoutDashboard },
      { href: "/visualizacoes", label: "Gestão de Tarefas", icon: Columns3 },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/projetos", label: "Projetos", icon: FolderKanban },
      { href: "/campanhas", label: "Campanhas", icon: Megaphone },
      { href: "/tipos-de-tarefa", label: "Tipos de Tarefa", icon: Shapes },
      { href: "/etapas", label: "Etapas", icon: Waypoints },
      { href: "/pessoas", label: "Equipe", icon: Users },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/dashboards", label: "Dashboards", icon: BarChart3 },
      { href: "/usuarios", label: "Usuários", icon: ShieldCheck },
    ],
  },
];
