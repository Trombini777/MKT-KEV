"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const ORDER = ["system", "light", "dark"] as const;
const ICON = { system: Monitor, light: Sun, dark: Moon } as const;
const LABEL = { system: "Sistema", light: "Claro", dark: "Escuro" } as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const current = (theme ?? "system") as (typeof ORDER)[number];
  const Icon = ICON[current] ?? Monitor;

  function cycle() {
    const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
    setTheme(next);
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={cycle}
      aria-label={`Tema: ${LABEL[current]}. Clique para trocar.`}
      title={`Tema: ${LABEL[current]}`}
    >
      <Icon className="size-4" />
    </Button>
  );
}
