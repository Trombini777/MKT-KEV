"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDepartamentos } from "@/lib/departamentos-store";
import { createClient } from "@/lib/supabase/client";
import { obterColaboradorAtual } from "@/lib/current-colaborador-client";
import { recarregarTarefas, vincularProjeto } from "@/lib/task-store";
import { anoDoPrazoValido, MENSAGEM_ANO_INVALIDO } from "@/lib/validacao-data";
import type { PrioridadeSugerida } from "@/lib/mock";

const FIELD_LABEL_CLASS = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";

const PRIORIDADES = [
  { value: "alta", label: "Alta" },
  { value: "regular", label: "Regular" },
  { value: "baixa", label: "Baixa" },
] as const;

const PRIORIDADE_SUGERIDA: Record<string, PrioridadeSugerida> = {
  alta: "Alta",
  regular: "Regular",
  baixa: "Baixa",
};

const atividadeInternaSchema = z.object({
  titulo: z.string().trim().min(1, "Informe um título."),
  descricao: z.string().trim().min(1, "Descreva a atividade."),
  departamento: z.string().min(1, "Selecione o departamento/área."),
  prioridade: z.enum(["alta", "regular", "baixa"]),
  prazo: z
    .string()
    .optional()
    .refine((v) => !v || anoDoPrazoValido(v), { message: MENSAGEM_ANO_INVALIDO }),
});

type ErrosAtividade = Partial<Record<keyof z.infer<typeof atividadeInternaSchema>, string>>;

function CampoErro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return <p className="text-xs text-destructive">{mensagem}</p>;
}

/**
 * "Criar solicitação" dentro do sistema (PRD E1) — pra registrar rápido uma demanda recebida por
 * outro canal (reunião, WhatsApp, ligação). Diferente do formulário público: quem está criando
 * já está autenticado, então nome/e-mail do solicitante são preenchidos automaticamente a partir
 * da sessão em vez de perguntados, e o formulário fica só com o essencial (sem justificativas —
 * isso é pra quando o pedido é externo e precisa se explicar pro time).
 */
export function NovaAtividadeDialog({
  onCriada,
  projetoId,
  projetoNome,
}: {
  onCriada?: () => void;
  /** Quando presente (ex.: aberto a partir de "Tarefas do projeto"), a atividade já nasce
   * vinculada a esse projeto/campanha, em vez de precisar vincular depois manualmente. */
  projetoId?: string;
  projetoNome?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const DEPARTAMENTOS = useDepartamentos();
  const [open, setOpen] = useState(false);
  const [prioridade, setPrioridade] = useState<string>("regular");
  const [departamento, setDepartamento] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erros, setErros] = useState<ErrosAtividade>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  function resetar() {
    setPrioridade("regular");
    setDepartamento("");
    setErros({});
    setErroEnvio(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);
    const titulo = String(dados.get("titulo") ?? "").trim();
    const descricao = String(dados.get("descricao") ?? "").trim();
    const prazo = String(dados.get("prazo") ?? "").trim();

    const resultado = atividadeInternaSchema.safeParse({
      titulo,
      descricao,
      departamento,
      prioridade,
      prazo,
    });
    if (!resultado.success) {
      const novosErros: ErrosAtividade = {};
      for (const issue of resultado.error.issues) {
        const campo = issue.path[0] as keyof ErrosAtividade;
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      }
      setErros(novosErros);
      return;
    }
    setErros({});
    setErroEnvio(null);
    setIsSubmitting(true);

    const autor = await obterColaboradorAtual();
    const supabase = createClient();
    // Uma única RPC (criar_atividade_interna) cria a tarefa já em Triagem e grava os 3 eventos
    // de histórico (registrada/aprovada/movida) no servidor — evita a cadeia de ~6 idas
    // sequenciais ao banco que a versão anterior fazia no cliente (criar + recarregar lista +
    // aprovar + mover fase + 2x histórico), frágil o bastante em rede real pra parecer travada.
    const { data: novaTarefaId, error } = await supabase.rpc("criar_atividade_interna", {
      p_titulo: titulo,
      p_descricao: descricao,
      p_departamento: departamento,
      p_prioridade_sugerida: PRIORIDADE_SUGERIDA[prioridade],
      p_solicitante_nome: autor?.nome ?? null,
      p_solicitante_email: autor?.email ?? null,
      p_prazo: prazo || null,
    });
    if (error || !novaTarefaId) {
      console.error("Falha ao criar atividade:", error?.message);
      setErroEnvio("Não foi possível criar a atividade. Tente novamente.");
      setIsSubmitting(false);
      return;
    }

    // recarregarTarefas ANTES de vincularProjeto: essa função só age sobre tarefa que já está no
    // estado local (`tasks.find`), e a recém-criada só existe ali depois de recarregar do banco.
    await recarregarTarefas();
    if (projetoId) await vincularProjeto(novaTarefaId, projetoId, projetoNome ?? "");
    setIsSubmitting(false);
    setOpen(false);
    onCriada?.();

    const params = new URLSearchParams(searchParams.toString());
    params.set("tarefa", novaTarefaId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isSubmitting) return;
        setOpen(v);
        if (v) resetar();
      }}
    >
      <DialogTrigger render={<Button className="gap-1.5 shadow-sm" />}>
        <Plus className="size-4" />
        Nova atividade
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-1 p-5 pb-4">
          <DialogTitle>Nova atividade</DialogTitle>
          <DialogDescription>
            Registre uma demanda recebida por outro canal (reunião, WhatsApp, ligação). Já entra
            aprovada e cai direto na Triagem pra você continuar até gerar a atividade.
          </DialogDescription>
        </DialogHeader>
        {isSubmitting ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 pb-10 text-center">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Criando a atividade e abrindo a triagem…
            </p>
          </div>
        ) : (
        <ScrollArea className="min-h-0 flex-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 pb-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="titulo" className={FIELD_LABEL_CLASS}>
                Título
              </Label>
              <Input
                id="titulo"
                name="titulo"
                autoFocus
                placeholder="Ex.: Banner para campanha de renovação"
                className="h-11"
                required
              />
              <CampoErro mensagem={erros.titulo} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="descricao" className={FIELD_LABEL_CLASS}>
                Descrição
              </Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva a atividade de forma clara: contexto, objetivo esperado, referências."
                className="min-h-24"
                required
              />
              <CampoErro mensagem={erros.descricao} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="departamento" className={FIELD_LABEL_CLASS}>
                Departamento/Área
              </Label>
              <Select
                value={departamento}
                onValueChange={(value) => setDepartamento(value ?? "")}
                name="departamento"
                required
              >
                <SelectTrigger id="departamento" className="h-11 w-full">
                  <SelectValue placeholder="Selecione a área" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTOS.map((dep) => (
                    <SelectItem key={dep} value={dep}>
                      {dep}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <CampoErro mensagem={erros.departamento} />
            </div>

            <div className="flex flex-col gap-2">
              <Label className={FIELD_LABEL_CLASS}>Prioridade</Label>
              <RadioGroup
                value={prioridade}
                onValueChange={setPrioridade}
                name="prioridade"
                className="grid-flow-col justify-start gap-6"
              >
                {PRIORIDADES.map((p) => (
                  <label key={p.value} className="flex items-center gap-2 text-sm">
                    <RadioGroupItem value={p.value} />
                    {p.label}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="prazo" className={FIELD_LABEL_CLASS}>
                Prazo (opcional)
              </Label>
              <Input id="prazo" name="prazo" type="date" className="h-11" />
              <CampoErro mensagem={erros.prazo} />
            </div>

            {erroEnvio && <p className="text-sm text-destructive">{erroEnvio}</p>}

            <Button type="submit" size="lg" className="mt-1 h-11 w-full text-base">
              Criar atividade
            </Button>
          </form>
        </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
