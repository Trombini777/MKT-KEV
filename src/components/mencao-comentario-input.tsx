"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useColaboradores } from "@/lib/colaborador-store";
import { cn } from "@/lib/utils";

const ALTURA_MAXIMA_PX = 96;

export type MencaoPendente = { colaboradorId: string; nome: string };

/**
 * Acha o `@` mais próximo antes do cursor, sem `\n` entre ele e o cursor — o texto depois dele é
 * o filtro de busca. Fecha sozinho quando o texto digitado deixa de casar com ninguém (ver
 * `candidatos` abaixo), sem precisar rastrear "fim da menção" separado do texto.
 */
function detectarMencao(texto: string, cursor: number): { pos: number; query: string } | null {
  const antes = texto.slice(0, cursor);
  const pos = antes.lastIndexOf("@");
  if (pos === -1) return null;
  const query = antes.slice(pos + 1);
  if (query.includes("\n")) return null;
  return { pos, query };
}

/**
 * Input de comentário com autocomplete de @menção. Ao confirmar um colaborador, substitui
 * `@busca` pelo nome completo (texto puro — sem marcação) e avisa `onMencionar` pra quem chama
 * registrar a menção estruturada (ver `adicionarComentario`, task-store.ts).
 */
export function MencaoComentarioInput({
  value,
  onChange,
  onMencionar,
  placeholder,
  className,
}: {
  value: string;
  onChange: (texto: string) => void;
  onMencionar: (mencao: MencaoPendente) => void;
  placeholder?: string;
  className?: string;
}) {
  const colaboradores = useColaboradores();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState(0);
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [fechadaEm, setFechadaEm] = useState<number | null>(null);

  const mencaoAtual = detectarMencao(value, cursor);

  const candidatos = useMemo(() => {
    if (!mencaoAtual) return [];
    const q = mencaoAtual.query.trim().toLowerCase();
    return colaboradores.filter((c) => c.nome.toLowerCase().includes(q)).slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mencaoAtual?.query, colaboradores]);

  const aberto = mencaoAtual !== null && fechadaEm !== mencaoAtual.pos && candidatos.length > 0;

  // Depois do envio, `value` volta a "" por fora (task-detail-sheet.tsx) — sem isso a altura
  // esticada pelo JS do onChange ficaria presa até a próxima tecla digitada.
  useEffect(() => {
    if (value === "" && inputRef.current) inputRef.current.style.height = "auto";
  }, [value]);

  function confirmar(colaborador: { id: string; nome: string }) {
    if (!mencaoAtual) return;
    const antes = value.slice(0, mencaoAtual.pos);
    const depois = value.slice(mencaoAtual.pos + 1 + mencaoAtual.query.length);
    const inserido = `@${colaborador.nome} `;
    onChange(`${antes}${inserido}${depois}`);
    onMencionar({ colaboradorId: colaborador.id, nome: colaborador.nome });
    const novaPosicao = antes.length + inserido.length;
    setCursor(novaPosicao);
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(novaPosicao, novaPosicao);
      inputRef.current?.focus();
    });
  }

  return (
    <div className="relative flex-1">
      <textarea
        ref={inputRef}
        value={value}
        rows={1}
        onChange={(e) => {
          onChange(e.target.value);
          setCursor(e.target.selectionStart ?? e.target.value.length);
          setIndiceAtivo(0);
          const el = e.target;
          el.style.height = "auto";
          el.style.height = `${Math.min(el.scrollHeight, ALTURA_MAXIMA_PX)}px`;
        }}
        onSelect={(e) => setCursor(e.currentTarget.selectionStart ?? 0)}
        onKeyDown={(e) => {
          if (aberto) {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIndiceAtivo((i) => Math.min(i + 1, candidatos.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIndiceAtivo((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              const escolhido = candidatos[indiceAtivo];
              if (escolhido) confirmar(escolhido);
            } else if (e.key === "Escape") {
              e.preventDefault();
              setFechadaEm(mencaoAtual!.pos);
            }
            return;
          }
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder={placeholder}
        className={cn(
          "min-h-8 w-full min-w-0 resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          className
        )}
      />
      {aberto && (
        <div className="absolute bottom-full left-0 z-50 mb-1 w-64 rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
          {candidatos.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                confirmar(c);
              }}
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1.5 text-left",
                i === indiceAtivo ? "bg-primary/10 text-foreground" : "hover:bg-secondary/50"
              )}
            >
              {c.nome}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
