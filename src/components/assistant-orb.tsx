"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apagarConversaKev, carregarHistoricoKev, gerarSaudacaoKev } from "@/lib/kev";

const COMANDO_LIMPAR_CONVERSA = "/deleteconversa";

const MENSAGEM_ERRO_CARREGAMENTO: UIMessage = {
  id: "erro-carregamento",
  role: "assistant",
  parts: [{ type: "text", text: "Não consegui carregar a conversa agora. Tenta de novo em instantes." }],
};

const MASCOTE_LIGHT_SRC = "/assistente-kev-light.png";
const MASCOTE_DARK_SRC = "/assistente-kev-dark.png";

/**
 * Mascote do assistente — troca por CSS (`dark:`), sem depender de estado JS de tema.
 *
 * `unoptimized`: o otimizador do next/image gera PNG indexado (paleta) sem canal alpha
 * especificamente no breakpoint de 64px, descartando a transparência do PNG original —
 * então serve o arquivo local direto, sem passar pelo otimizador.
 */
const SUGESTOES = [
  { label: "O que olho primeiro hoje?", mensagem: "O que eu preciso olhar primeiro hoje?" },
  { label: "Atividades atrasadas", mensagem: "Quais das minhas atividades estão atrasadas?" },
  { label: "Aprovações pendentes", mensagem: "O que está aguardando minha aprovação?" },
  { label: "Carga da equipe", mensagem: "Quem está mais sobrecarregado no time agora?" },
  { label: "Conhecer o sistema", mensagem: "Me explica como esse sistema funciona e como ele pode me ajudar." },
];

type Posicao = { x: number; y: number };

const TAMANHO_BOTAO = 64;
const MARGEM_BORDA = 8;
const CHAVE_POSICAO = "kev-orb-posicao";
const LIMIAR_ARRASTE_PX = 4;

function posicaoPadrao(): Posicao {
  return { x: window.innerWidth - TAMANHO_BOTAO - 56, y: window.innerHeight - TAMANHO_BOTAO - 20 };
}

function limitarNaTela(pos: Posicao): Posicao {
  const maxX = window.innerWidth - TAMANHO_BOTAO - MARGEM_BORDA;
  const maxY = window.innerHeight - TAMANHO_BOTAO - MARGEM_BORDA;
  return {
    x: Math.min(Math.max(pos.x, MARGEM_BORDA), Math.max(MARGEM_BORDA, maxX)),
    y: Math.min(Math.max(pos.y, MARGEM_BORDA), Math.max(MARGEM_BORDA, maxY)),
  };
}

/** Painel abre do lado/direção com mais espaço em relação à posição atual do botão arrastável. */
function estiloPainel(pos: Posicao | null): React.CSSProperties {
  if (!pos) return { bottom: 96, right: 32 };
  const centroX = pos.x + TAMANHO_BOTAO / 2;
  const centroY = pos.y + TAMANHO_BOTAO / 2;
  const style: React.CSSProperties = {};
  if (centroX > window.innerWidth / 2) {
    style.right = Math.max(MARGEM_BORDA, window.innerWidth - (pos.x + TAMANHO_BOTAO));
  } else {
    style.left = Math.max(MARGEM_BORDA, pos.x);
  }
  if (centroY > window.innerHeight / 2) {
    style.bottom = Math.max(MARGEM_BORDA, window.innerHeight - pos.y + 12);
  } else {
    style.top = Math.max(MARGEM_BORDA, pos.y + TAMANHO_BOTAO + 12);
  }
  return style;
}

function MascoteImage({ size, className }: { size: number; className?: string }) {
  return (
    <>
      <Image
        src={MASCOTE_LIGHT_SRC}
        alt=""
        width={size}
        height={size}
        priority
        unoptimized
        draggable={false}
        className={cn("dark:hidden", className)}
        style={{ width: size, height: size, objectFit: "cover" }}
      />
      <Image
        src={MASCOTE_DARK_SRC}
        alt=""
        width={size}
        height={size}
        priority
        unoptimized
        draggable={false}
        className={cn("hidden dark:block", className)}
        style={{ width: size, height: size, objectFit: "cover" }}
      />
    </>
  );
}

export function AssistantOrb() {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [limpando, setLimpando] = useState(false);
  const [posicao, setPosicao] = useState<Posicao | null>(null);
  // Toda vez que o chat é reaberto, pergunta se é pra continuar de onde parou ou começar do zero
  // (ver `continuarConversa`/`novaConversa`) — só depois de escolher é que mensagens/input aparecem.
  const [decisaoPendente, setDecisaoPendente] = useState(true);

  const { messages, sendMessage, status, error, setMessages } = useChat();
  const digitando = status === "submitted" || status === "streaming" || limpando;

  const inputRef = useRef<HTMLInputElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  // Posição salva do botão arrastável (ou canto inferior direito, se nunca movido). Recalcula os
  // limites quando a janela muda de tamanho, pra não deixar o botão preso fora da tela.
  useEffect(() => {
    function carregarPosicaoInicial() {
      const salva = localStorage.getItem(CHAVE_POSICAO);
      if (salva) {
        try {
          return limitarNaTela(JSON.parse(salva));
        } catch {
          // ignora JSON inválido e cai pro padrão
        }
      }
      return posicaoPadrao();
    }
    Promise.resolve().then(() => setPosicao(carregarPosicaoInicial()));

    function aoRedimensionar() {
      setPosicao((atual) => (atual ? limitarNaTela(atual) : atual));
    }
    window.addEventListener("resize", aoRedimensionar);
    return () => window.removeEventListener("resize", aoRedimensionar);
  }, []);

  // Arraste via listeners no window (em vez de pointer capture no botão) — mais confiável entre
  // navegadores: continua recebendo os eventos de movimento mesmo se o ponteiro sair da área do
  // botão no meio do arraste.
  const aoPressionarBotao = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (!posicao) return;
      const inicio = { pointerX: e.clientX, pointerY: e.clientY, origX: posicao.x, origY: posicao.y };
      let moveu = false;

      function aoMover(ev: PointerEvent) {
        const dx = ev.clientX - inicio.pointerX;
        const dy = ev.clientY - inicio.pointerY;
        if (Math.abs(dx) > LIMIAR_ARRASTE_PX || Math.abs(dy) > LIMIAR_ARRASTE_PX) moveu = true;
        setPosicao(limitarNaTela({ x: inicio.origX + dx, y: inicio.origY + dy }));
      }

      function aoSoltar() {
        window.removeEventListener("pointermove", aoMover);
        window.removeEventListener("pointerup", aoSoltar);
        if (moveu) {
          setPosicao((atual) => {
            if (atual) localStorage.setItem(CHAVE_POSICAO, JSON.stringify(atual));
            return atual;
          });
        } else {
          // Sem movimento além do limiar: foi um clique, não um arraste — abre/fecha o chat.
          setAberto((v) => !v);
        }
      }

      window.addEventListener("pointermove", aoMover);
      window.addEventListener("pointerup", aoSoltar);
    },
    [posicao]
  );

  // Toda vez que o painel abre, volta a pedir a decisão (continuar/nova conversa).
  useEffect(() => {
    if (aberto) Promise.resolve().then(() => setDecisaoPendente(true));
  }, [aberto]);

  // "Continuar conversa" — carrega o histórico de hoje; se ainda não tiver nenhuma mensagem hoje,
  // pede pro keV gerar a saudação de abertura (ele mesmo comenta sobre o horário/dia).
  const continuarConversa = useCallback(async () => {
    setDecisaoPendente(false);
    setLimpando(true);
    try {
      const historico = await carregarHistoricoKev();
      if (historico.length > 0) {
        setMessages(
          historico.map((m) => ({ id: m.id, role: m.role, parts: [{ type: "text", text: m.texto }] }))
        );
      } else {
        const saudacao = await gerarSaudacaoKev();
        if (saudacao) {
          setMessages([{ id: saudacao.id, role: "assistant", parts: [{ type: "text", text: saudacao.texto }] }]);
        }
      }
    } catch {
      setMessages([MENSAGEM_ERRO_CARREGAMENTO]);
    } finally {
      setLimpando(false);
    }
  }, [setMessages]);

  // "Nova conversa" (e comando /deleteconversa) — apaga todo o histórico salvo e recomeça do
  // zero, como se fosse a primeira conversa.
  const novaConversa = useCallback(async () => {
    setDecisaoPendente(false);
    setLimpando(true);
    setMessages([]);
    try {
      await apagarConversaKev();
      const saudacao = await gerarSaudacaoKev();
      if (saudacao) {
        setMessages([{ id: saudacao.id, role: "assistant", parts: [{ type: "text", text: saudacao.texto }] }]);
      }
    } catch {
      setMessages([MENSAGEM_ERRO_CARREGAMENTO]);
    } finally {
      setLimpando(false);
    }
  }, [setMessages]);

  // Foco no input ao abrir.
  useEffect(() => {
    if (!aberto) return;
    const focus = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(focus);
  }, [aberto]);

  // Fechar com Esc.
  useEffect(() => {
    if (!aberto) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aberto]);

  // Auto-scroll pro fim quando chega mensagem.
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, digitando]);

  const enviar = useCallback(
    (mensagem?: string) => {
      const conteudo = (mensagem ?? texto).trim();
      if (!conteudo || digitando) return;
      setTexto("");

      if (conteudo.toLowerCase() === COMANDO_LIMPAR_CONVERSA) {
        novaConversa();
        return;
      }

      sendMessage({ text: conteudo });
    },
    [texto, digitando, sendMessage, novaConversa]
  );

  // Atalhos somem depois da primeira pergunta do usuário, pra não poluir a conversa.
  const mostrarSugestoes = !digitando && messages.filter((m) => m.role === "user").length === 0;

  return (
    <>
      {/* Painel de chat */}
      {aberto && (
        <div
          role="dialog"
          aria-label="keV, assistente pessoal de trabalho"
          className={cn(
            "fixed z-[60] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 backdrop-blur-xl",
            "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35),0_0_18px_-4px_rgba(0,0,0,0.35),0_0_36px_-12px_rgba(0,0,0,0.25)]",
            "h-[520px] max-h-[calc(100vh-8rem)]",
          )}
          style={{ animation: "kev-panel-in 0.28s cubic-bezier(0.22,1,0.36,1)", ...estiloPainel(posicao) }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent px-4 py-3">
            <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-border/60 dark:bg-black">
              <MascoteImage size={36} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">keV Marketing</p>
              <p className="truncate text-xs text-muted-foreground">Assistente pessoal de trabalho</p>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar chat"
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {decisaoPendente ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Quer continuar de onde paramos ou começar uma conversa nova?
                </p>
                <div className="flex flex-col gap-2 w-full max-w-56">
                  <button
                    type="button"
                    onClick={continuarConversa}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95"
                  >
                    Continuar conversa
                  </button>
                  <button
                    type="button"
                    onClick={novaConversa}
                    className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    Nova conversa
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => {
                  const texto = m.parts
                    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
                    .map((p) => p.text)
                    .join("");

                  // Balões do keV quebram por parágrafo (linha em branco) — várias mensagens
                  // curtas seguidas leem melhor que um textão só. Exceção: a "Daily" é um bloco
                  // único formatado (título + lista + total), não deve virar vários balões.
                  const paragrafos =
                    m.role === "assistant" && !texto.trimStart().startsWith("Daily ")
                      ? texto.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean)
                      : [texto];

                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col gap-1.5",
                        m.role === "user" ? "items-end" : "items-start",
                      )}
                    >
                      {(paragrafos.length > 0 ? paragrafos : [""]).map((paragrafo, i) => (
                        <div
                          key={i}
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                            m.role === "user"
                              ? "rounded-br-md bg-primary text-primary-foreground"
                              : "rounded-bl-md bg-muted text-foreground",
                          )}
                        >
                          {paragrafo}
                        </div>
                      ))}
                    </div>
                  );
                })}

                {digitando && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-muted px-3.5 py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-destructive/10 px-3.5 py-2 text-sm text-destructive">
                      Não consegui responder agora. Tenta de novo em instantes.
                    </div>
                  </div>
                )}
                <div ref={fimRef} />
              </>
            )}
          </div>

          {/* Input */}
          {!decisaoPendente && (
          <div className="border-t border-border/60 p-3">
            {mostrarSugestoes && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {SUGESTOES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => enviar(s.mensagem)}
                    className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-primary/20"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enviar();
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1 focus-within:ring-1 focus-within:ring-primary/40"
            >
              <input
                ref={inputRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva sua mensagem…"
                className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                disabled={!texto.trim() || digitando}
                aria-label="Enviar mensagem"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="size-4" />
              </button>
            </form>
          </div>
          )}
        </div>
      )}

      {/* Botão-mascote flutuante — arraste pra qualquer canto da tela; clique (sem arrastar) abre o chat. */}
      <button
        type="button"
        onPointerDown={aoPressionarBotao}
        onDragStart={(e) => e.preventDefault()}
        aria-label={aberto ? "Fechar keV" : "Abrir keV, assistente pessoal de trabalho (arraste para mover)"}
        aria-expanded={aberto}
        className="group fixed z-[60] grid size-16 cursor-grab place-items-center touch-none transition-transform duration-200 hover:scale-105 active:scale-95 active:cursor-grabbing"
        style={posicao ? { left: posicao.x, top: posicao.y } : { bottom: 20, right: 56 }}
      >
        <MascoteImage
          size={64}
          className="motion-safe:animate-[kev-orb-float_4s_ease-in-out_infinite]"
        />
      </button>
    </>
  );
}
