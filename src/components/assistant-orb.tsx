"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  apagarConversaKev,
  carregarHistoricoKev,
  gerarMensagemNovaConversa,
  gerarSaudacaoKev,
  obterSugestoesKev,
  type SugestaoKev,
} from "@/lib/kev";
import { avaliarConviteTarefaKev } from "@/lib/kev-tarefa";

// Comando de manutenção (não exposto na UI): apaga de verdade o histórico salvo em
// kev_mensagens, diferente do botão "Nova conversa" (que só reinicia a tela).
const COMANDO_APAGAR_HISTORICO = "/apagarhistorico";

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
  // Atalhos de sugestão: sempre 4, variam por cargo (ver obterSugestoesKev) — carregados junto
  // com a mensagem de abertura, tanto em "Continuar conversa" quanto em "Nova conversa".
  const [sugestoes, setSugestoes] = useState<SugestaoKev[]>([]);

  const { messages, sendMessage, status, error, setMessages } = useChat();
  const digitando = status === "submitted" || status === "streaming" || limpando;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  // Tarefa aberta agora no detalhe (?tarefa=<id>, mesma fonte que task-detail-sheet.tsx usa) —
  // enquanto setada, toda mensagem enviada ao keV leva o contexto completo dessa tarefa (ver
  // enviar()). Também dispara o convite proativo abaixo quando muda pra uma tarefa nova.
  const tarefaFocadaId = useSearchParams().get("tarefa");

  // Ref pra ler o estado mais recente de dentro do .then() do convite proativo sem precisar
  // colocar `aberto` nas deps do efeito (que só deve rodar quando a tarefa muda).
  const abertoRef = useRef(aberto);
  useEffect(() => {
    abertoRef.current = aberto;
  }, [aberto]);

  // Convite proativo pendente (painel fechado): só um balãozinho perto do mascote com a fala do
  // keV, não o chat inteiro — ver o efeito de "Convite proativo" abaixo. `null` = nenhum aviso
  // pendente (ou já resolvido/dispensado).
  const [convitePendente, setConvitePendente] = useState<{ id: string; texto: string } | null>(null);

  // Setado logo antes de abrir o painel pelo convite proativo de tarefa — avisa o efeito abaixo
  // (que normalmente pede a decisão continuar/nova sempre que o painel abre) pra não sobrescrever
  // a conversa já carregada pelo convite.
  const abrindoPorConviteRef = useRef(false);

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
          setAberto((v) => {
            const novoAberto = !v;
            // Abrindo o chat (por qualquer caminho) supera o balãozinho pendente — ver
            // `convitePendente` mais abaixo.
            if (novoAberto) setConvitePendente(null);
            return novoAberto;
          });
        }
      }

      window.addEventListener("pointermove", aoMover);
      window.addEventListener("pointerup", aoSoltar);
    },
    [posicao]
  );

  // Toda vez que o painel abre, volta a pedir a decisão (continuar/nova conversa) — exceto quando
  // foi o convite proativo de tarefa que abriu o painel (ele já decide "continuar" sozinho).
  useEffect(() => {
    if (!aberto) return;
    if (abrindoPorConviteRef.current) {
      abrindoPorConviteRef.current = false;
      return;
    }
    Promise.resolve().then(() => setDecisaoPendente(true));
  }, [aberto]);

  // "Continuar conversa" — carrega o histórico de hoje; se ainda não tiver nenhuma mensagem hoje,
  // pede pro keV gerar a saudação de abertura (ele mesmo comenta sobre o horário/dia).
  const continuarConversa = useCallback(async () => {
    setDecisaoPendente(false);
    setLimpando(true);
    try {
      const [historico, novasSugestoes] = await Promise.all([carregarHistoricoKev(), obterSugestoesKev()]);
      setSugestoes(novasSugestoes);
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

  // "Nova conversa" — limpa só a TELA, como se fosse assunto novo. O histórico em kev_mensagens
  // não é apagado: o keV não se reapresenta, só reconhece a virada de assunto e pergunta o que
  // vem a seguir (ver gerarMensagemNovaConversa).
  const novaConversa = useCallback(async () => {
    setDecisaoPendente(false);
    setLimpando(true);
    setMessages([]);
    try {
      const [mensagem, novasSugestoes] = await Promise.all([
        gerarMensagemNovaConversa(),
        obterSugestoesKev(),
      ]);
      setSugestoes(novasSugestoes);
      if (mensagem) {
        setMessages([{ id: mensagem.id, role: "assistant", parts: [{ type: "text", text: mensagem.texto }] }]);
      }
    } catch {
      setMessages([MENSAGEM_ERRO_CARREGAMENTO]);
    } finally {
      setLimpando(false);
    }
  }, [setMessages]);

  // Comando de manutenção /apagarhistorico — apaga de verdade o histórico salvo e recomeça do
  // zero, como se fosse a primeira conversa (diferente de "Nova conversa", que preserva o back-end).
  const apagarHistoricoCompleto = useCallback(async () => {
    setLimpando(true);
    setMessages([]);
    try {
      await apagarConversaKev();
      const [saudacao, novasSugestoes] = await Promise.all([gerarSaudacaoKev(), obterSugestoesKev()]);
      setSugestoes(novasSugestoes);
      if (saudacao) {
        setMessages([{ id: saudacao.id, role: "assistant", parts: [{ type: "text", text: saudacao.texto }] }]);
      }
    } catch {
      setMessages([MENSAGEM_ERRO_CARREGAMENTO]);
    } finally {
      setLimpando(false);
    }
  }, [setMessages]);

  // Convite proativo: sempre que o id da tarefa aberta na URL muda pra um valor novo, pergunta ao
  // servidor se essa é a vez do usuário agir nela (etapa atual dele) e se ainda não foi convidado
  // nessa etapa. Painel já aberto (conversa em andamento) -> só acrescenta a mensagem do convite,
  // sem mexer no que já estava sendo falado. Painel fechado -> NÃO abre o chat inteiro sozinho:
  // só mostra um balãozinho perto do mascote com a fala do keV (ver `convitePendente`), que a
  // pessoa escolhe abrir ou dispensar. A mensagem já fica salva no histórico do servidor de
  // qualquer forma — só decide o que aparece na tela.
  useEffect(() => {
    if (!tarefaFocadaId) return;
    let cancelado = false;
    avaliarConviteTarefaKev(tarefaFocadaId).then((resultado) => {
      if (cancelado || !resultado.elegivel || resultado.jaConvidado) return;
      if (abertoRef.current) {
        const novaMensagem: UIMessage = {
          id: resultado.mensagem.id,
          role: "assistant",
          parts: [{ type: "text", text: resultado.mensagem.texto }],
        };
        // Dedup por id: se o "Continuar conversa" já recarregou o histórico (que já inclui esse
        // convite, inserido no servidor antes de chegar aqui) enquanto essa promise estava em
        // andamento, não duplica a mesma fala na tela.
        setMessages((atuais) => (atuais.some((m) => m.id === novaMensagem.id) ? atuais : [...atuais, novaMensagem]));
      } else {
        setConvitePendente({ id: resultado.mensagem.id, texto: resultado.mensagem.texto });
      }
    }).catch((erro) => {
      // Convite proativo é um "a mais", não uma ação que o usuário pediu agora — falha aqui não
      // deve abrir nada só pra mostrar um erro. Só registra pra investigação.
      if (!cancelado) console.error("Falha ao avaliar convite de tarefa do keV:", erro);
    });
    return () => {
      cancelado = true;
    };
  }, [tarefaFocadaId, setMessages]);

  // Saudação proativa do primeiro acesso do dia: 5s depois de abrir o sistema, se ainda não falou
  // com o keV hoje (em nenhuma aba/sessão), mostra o balãozinho com uma saudação (mesmo mecanismo
  // do convite de tarefa acima) — sem abrir o chat inteiro sozinho. `AssistantOrb` vive no layout
  // raiz, então esse efeito roda uma vez por carregamento de página, não a cada navegação.
  useEffect(() => {
    let cancelado = false;
    const timer = setTimeout(async () => {
      try {
        const historicoHoje = await carregarHistoricoKev();
        if (cancelado || historicoHoje.length > 0) return;
        const saudacao = await gerarSaudacaoKev();
        if (cancelado || !saudacao) return;
        if (abertoRef.current) {
          const novaMensagem: UIMessage = {
            id: saudacao.id,
            role: "assistant",
            parts: [{ type: "text", text: saudacao.texto }],
          };
          setMessages((atuais) =>
            atuais.some((m) => m.id === novaMensagem.id) ? atuais : [...atuais, novaMensagem]
          );
        } else {
          // Guarda funcional: se o convite de tarefa já colocou algo pendente (ex.: a pessoa abriu
          // uma atividade nesses primeiros 5s), não sobrescreve — o convite de tarefa é mais
          // específico/acionável que uma saudação genérica.
          setConvitePendente((atual) => atual ?? { id: saudacao.id, texto: saudacao.texto });
        }
      } catch (erro) {
        // Mesma lógica do convite de tarefa: isso é proativo, uma falha aqui não deve incomodar
        // ninguém com um erro na tela, só registrar pra investigação.
        if (!cancelado) console.error("Falha ao gerar saudação proativa do keV:", erro);
      }
    }, 5000);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só na primeira montagem da página
  }, []);

  // Clique no balãozinho: abre o chat já "limpo", só com a fala do convite na tela — sem carregar
  // o resto da conversa de hoje (isso ficaria visualmente misturado com o assunto da tarefa).
  const abrirPorConvite = useCallback(async () => {
    if (!convitePendente) return;
    abrindoPorConviteRef.current = true;
    setConvitePendente(null);
    setDecisaoPendente(false);
    setMessages([{ id: convitePendente.id, role: "assistant", parts: [{ type: "text", text: convitePendente.texto }] }]);
    setAberto(true);
    const novasSugestoes = await obterSugestoesKev();
    setSugestoes(novasSugestoes);
  }, [convitePendente, setMessages]);

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
      if (inputRef.current) inputRef.current.style.height = "auto";

      if (conteudo.toLowerCase() === COMANDO_APAGAR_HISTORICO) {
        apagarHistoricoCompleto();
        return;
      }

      sendMessage({ text: conteudo }, tarefaFocadaId ? { body: { tarefaFocadaId } } : undefined);
    },
    [texto, digitando, sendMessage, apagarHistoricoCompleto, tarefaFocadaId]
  );

  // Atalhos somem depois da primeira pergunta do usuário, pra não poluir a conversa.
  const mostrarSugestoes = !digitando && messages.filter((m) => m.role === "user").length === 0;

  // Convite proativo pendente com o chat fechado: mesmo painel de sempre, só que "encolhido" —
  // sem input, altura só do necessário pra mostrar a fala do keV. Clicar em qualquer parte dele
  // (fora do X) expande pro chat cheio, já aberto por `abrirPorConvite`.
  const compacto = !aberto && convitePendente != null;

  return (
    <>
      {/* Painel de chat (cheio quando `aberto`, ou "encolhido" só com o convite pendente) */}
      {(aberto || compacto) && (
        <div
          role={compacto ? "button" : "dialog"}
          tabIndex={compacto ? 0 : undefined}
          onClick={compacto ? abrirPorConvite : undefined}
          onKeyDown={
            compacto
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    abrirPorConvite();
                  }
                }
              : undefined
          }
          aria-label="keV, assistente pessoal de trabalho"
          className={cn(
            "fixed z-[60] flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 backdrop-blur-xl",
            "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35),0_0_18px_-4px_rgba(0,0,0,0.35),0_0_36px_-12px_rgba(0,0,0,0.25)]",
            compacto ? "cursor-pointer" : "h-[520px] max-h-[calc(100vh-8rem)]",
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
              onClick={(e) => {
                e.stopPropagation();
                setAberto(false);
                setConvitePendente(null);
              }}
              aria-label={compacto ? "Dispensar aviso do keV" : "Fechar chat"}
              className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Mensagens */}
          {compacto && convitePendente ? (
            <div className="px-4 py-4">
              <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-3.5 py-2 text-sm leading-relaxed text-foreground">
                {convitePendente.texto}
              </div>
            </div>
          ) : (
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
          )}

          {/* Input */}
          {!compacto && !decisaoPendente && (
          <div className="border-t border-border/60 p-3">
            {mostrarSugestoes && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {sugestoes.map((s) => (
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
              className="flex items-end gap-2 rounded-2xl border border-border bg-background px-2 py-1 focus-within:ring-1 focus-within:ring-primary/40"
            >
              <textarea
                ref={inputRef}
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
                placeholder="Escreva sua mensagem…"
                rows={1}
                className="min-w-0 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
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
