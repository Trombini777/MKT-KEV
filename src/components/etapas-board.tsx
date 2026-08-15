"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEtapas, adicionarEtapa, editarEtapa, excluirEtapa as removerEtapa } from "@/lib/etapa-store";
import { type CategoriaEtapa, type EtapaTarefa } from "@/lib/mock";

const CATEGORIAS: CategoriaEtapa[] = ["Backlog", "Em Execução", "Em Aprovação", "Concluído"];

export function EtapasBoard() {
  const etapas = useEtapas();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCategoria, setDragOverCategoria] = useState<CategoriaEtapa | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState("");
  const [criandoEm, setCriandoEm] = useState<CategoriaEtapa | null>(null);
  const [nomeNovo, setNomeNovo] = useState("");

  function iniciarCriacao(categoria: CategoriaEtapa) {
    setCriandoEm(categoria);
    setNomeNovo("");
  }

  function confirmarCriacao(categoria: CategoriaEtapa) {
    const nome = nomeNovo.trim();
    if (nome) {
      adicionarEtapa({ id: `etapa-${Date.now()}`, nome, categoria });
    }
    setCriandoEm(null);
    setNomeNovo("");
  }

  function iniciarEdicao(etapa: EtapaTarefa) {
    setEditandoId(etapa.id);
    setNomeEdicao(etapa.nome);
  }

  function confirmarEdicao(id: string) {
    const nome = nomeEdicao.trim();
    if (nome) {
      editarEtapa(id, { nome });
    }
    setEditandoId(null);
  }

  function moverParaCategoria(id: string, categoria: CategoriaEtapa) {
    editarEtapa(id, { categoria });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CATEGORIAS.map((categoria) => {
        const itens = etapas.filter((e) => e.categoria === categoria);
        return (
          <Card
            key={categoria}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCategoria(categoria);
            }}
            onDragLeave={() =>
              setDragOverCategoria((atual) => (atual === categoria ? null : atual))
            }
            onDrop={() => {
              if (draggingId) moverParaCategoria(draggingId, categoria);
              setDraggingId(null);
              setDragOverCategoria(null);
            }}
            className={cn(
              "transition-colors",
              draggingId && dragOverCategoria === categoria && "ring-2 ring-primary/50"
            )}
          >
            <CardContent className="py-4">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="text-sm font-semibold">{categoria}</h3>
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  {itens.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {itens.map((etapa) =>
                  editandoId === etapa.id ? (
                    <div key={etapa.id} className="flex items-center gap-1.5">
                      <Input
                        autoFocus
                        value={nomeEdicao}
                        onChange={(e) => setNomeEdicao(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") confirmarEdicao(etapa.id);
                          if (e.key === "Escape") setEditandoId(null);
                        }}
                        className="h-8"
                      />
                      <button
                        onClick={() => confirmarEdicao(etapa.id)}
                        className="text-success shrink-0"
                        aria-label="Salvar"
                      >
                        <Check className="size-4" />
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="text-muted-foreground shrink-0"
                        aria-label="Cancelar"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      key={etapa.id}
                      draggable
                      onDragStart={() => setDraggingId(etapa.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setDragOverCategoria(null);
                      }}
                      className="group flex cursor-grab items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2 text-sm font-medium transition-colors hover:border-primary active:cursor-grabbing"
                    >
                      <span className="min-w-0 flex-1 truncate">{etapa.nome}</span>
                      <button
                        onClick={() => iniciarEdicao(etapa)}
                        className="hidden shrink-0 text-muted-foreground hover:text-foreground group-hover:block"
                        aria-label="Editar nome"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={() => removerEtapa(etapa.id)}
                        className="hidden shrink-0 text-muted-foreground hover:text-destructive group-hover:block"
                        aria-label="Excluir etapa"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )
                )}
              </div>

              {criandoEm === categoria ? (
                <div className="mt-2 flex items-center gap-1.5">
                  <Input
                    autoFocus
                    placeholder="Nome da etapa"
                    value={nomeNovo}
                    onChange={(e) => setNomeNovo(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmarCriacao(categoria);
                      if (e.key === "Escape") setCriandoEm(null);
                    }}
                    className="h-8"
                  />
                  <button
                    onClick={() => confirmarCriacao(categoria)}
                    className="text-success shrink-0"
                    aria-label="Adicionar"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    onClick={() => setCriandoEm(null)}
                    className="text-muted-foreground shrink-0"
                    aria-label="Cancelar"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => iniciarCriacao(categoria)}
                  className="mt-2 flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Plus className="size-3.5" />
                  Nova etapa
                </button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
