"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CardContent, CardHeader } from "@/components/ui/card";
import { KevLogo } from "@/components/kev-logo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import { Check, Inbox } from "lucide-react";
import { addTask } from "@/lib/task-store";
import type { PrioridadeFinal, PrioridadeSugerida } from "@/lib/mock";
import { isoHoje } from "@/lib/hoje";

function CabecalhoSolicitacao({ mostrarDescricao }: { mostrarDescricao: boolean }) {
  return (
    <CardHeader className="flex flex-col items-center gap-2 text-center">
      <KevLogo className="h-6 w-auto text-foreground" />
      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-primary-foreground">
        <Inbox className="size-4" />
        <span className="text-sm font-medium">Solicitações de Marketing</span>
      </div>
      {mostrarDescricao && (
        <p className="max-w-sm text-sm text-muted-foreground">
          Preencha os campos abaixo e envie sua solicitação para o time de marketing da KEV.
        </p>
      )}
    </CardHeader>
  );
}

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

const PRIORIDADE_FINAL: Record<string, PrioridadeFinal> = {
  alta: "Alta",
  regular: "Normal",
  baixa: "Baixa",
};

const FIELD_LABEL_CLASS = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";

const solicitacaoSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe seu nome completo."),
    email: z.string().trim().min(1, "Informe seu e-mail.").email("Informe um e-mail válido."),
    departamento: z.string().min(1, "Selecione seu departamento/área."),
    titulo: z.string().trim().min(1, "Informe um título."),
    descricao: z.string().trim().min(1, "Descreva a solicitação."),
    prioridade: z.enum(["alta", "regular", "baixa"]),
    justificativaPrioridade: z.string().trim().optional(),
    temPrazo: z.enum(["sim", "nao"]),
    prazoData: z.string().optional(),
    justificativaPrazo: z.string().trim().optional(),
  })
  .superRefine((dados, ctx) => {
    if (dados.prioridade === "alta" && !dados.justificativaPrioridade) {
      ctx.addIssue({
        code: "custom",
        path: ["justificativaPrioridade"],
        message: "Explique por que essa solicitação é de prioridade Alta.",
      });
    }
    if (dados.temPrazo === "sim") {
      if (!dados.prazoData) {
        ctx.addIssue({ code: "custom", path: ["prazoData"], message: "Informe a data do prazo." });
      }
      if (!dados.justificativaPrazo) {
        ctx.addIssue({
          code: "custom",
          path: ["justificativaPrazo"],
          message: "Explique por que esse prazo é necessário.",
        });
      }
    }
  });

type ErrosSolicitacao = Partial<Record<keyof z.infer<typeof solicitacaoSchema>, string>>;

function CampoErro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return <p className="text-xs text-destructive">{mensagem}</p>;
}

export function SolicitacaoForm() {
  const [prioridade, setPrioridade] = useState<string>("regular");
  const [departamento, setDepartamento] = useState<string>("");
  const [temPrazo, setTemPrazo] = useState<string>("nao");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [erros, setErros] = useState<ErrosSolicitacao>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dados = new FormData(event.currentTarget);
    const nome = String(dados.get("nome") ?? "").trim();
    const email = String(dados.get("email") ?? "").trim();
    const titulo = String(dados.get("titulo") ?? "").trim();
    const descricao = String(dados.get("descricao") ?? "").trim();
    const prazoData = temPrazo === "sim" ? String(dados.get("prazoData") ?? "") : "";
    const justificativaPrazo =
      temPrazo === "sim" ? String(dados.get("justificativaPrazo") ?? "").trim() : "";
    const justificativaPrioridade =
      prioridade === "alta" ? String(dados.get("justificativaPrioridade") ?? "").trim() : "";
    const observacoes = String(dados.get("observacoes") ?? "").trim();
    const anexos = dados
      .getAll("anexos")
      .filter((arquivo): arquivo is File => arquivo instanceof File && arquivo.name.length > 0)
      .map((arquivo) => arquivo.name);

    const resultado = solicitacaoSchema.safeParse({
      nome,
      email,
      departamento,
      titulo,
      descricao,
      prioridade,
      justificativaPrioridade,
      temPrazo,
      prazoData,
      justificativaPrazo,
    });

    if (!resultado.success) {
      const novosErros: ErrosSolicitacao = {};
      for (const issue of resultado.error.issues) {
        const campo = issue.path[0] as keyof ErrosSolicitacao;
        if (!novosErros[campo]) novosErros[campo] = issue.message;
      }
      setErros(novosErros);
      return;
    }
    setErros({});

    setIsSubmitting(true);
    window.setTimeout(() => {
      addTask({
        id: `tarefa-${Date.now()}`,
        titulo,
        descricao,
        origem: "Solicitação",
        solicitanteNome: nome,
        solicitanteEmail: email,
        departamento,
        anexos,
        justificativaPrioridade: justificativaPrioridade || undefined,
        justificativaPrazo: justificativaPrazo || undefined,
        observacoes: observacoes || undefined,
        prioridadeSugerida: PRIORIDADE_SUGERIDA[prioridade],
        prioridadeFinal: PRIORIDADE_FINAL[prioridade],
        faseAtualId: "solicitacoes",
        dataInicio: isoHoje(),
        prazo: prazoData,
        previsaoConclusao: "",
        executoresPorFase: {},
        estimativaPorFase: {},
        participantesIds: [],
        tagIds: [],
        checklist: [],
        comentarios: [],
        historico: [
          {
            id: `h-${Date.now()}`,
            data: new Date().toISOString(),
            autorId: "sistema",
            descricao: `${nome}, ${departamento}, abriu a solicitação da atividade "${titulo}"`,
            faseId: "solicitacoes",
          },
        ],
      });
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  if (submitted) {
    return (
      <>
        <CabecalhoSolicitacao mostrarDescricao={false} />
        <CardContent className="mt-2">
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-neutral-900 shadow-lg shadow-primary/25 dark:bg-neutral-800">
              <Check className="size-8 text-primary" strokeWidth={3} />
            </div>
            <h2 className="text-lg font-semibold">Solicitação enviada</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Recebemos seu pedido. O time de marketing vai avaliar e você será
              contatado pelo e-mail informado assim que a triagem for feita.
            </p>
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CabecalhoSolicitacao mostrarDescricao />
      <CardContent className="mt-2">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome" className={FIELD_LABEL_CLASS}>
            Nome completo
          </Label>
          <Input
            id="nome"
            name="nome"
            placeholder="Seu nome"
            className="h-11"
            required
          />
          <CampoErro mensagem={erros.nome} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className={FIELD_LABEL_CLASS}>
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@kevseguros.com.br"
            className="h-11"
            required
          />
          <CampoErro mensagem={erros.email} />
        </div>
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
            <SelectValue placeholder="Selecione sua área" />
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
        <Label htmlFor="titulo" className={FIELD_LABEL_CLASS}>
          Título
        </Label>
        <Input id="titulo" name="titulo" placeholder="Ex.: Banner para campanha de renovação" className="h-11" required />
        <CampoErro mensagem={erros.titulo} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao" className={FIELD_LABEL_CLASS}>
          Descrição
        </Label>
        <Textarea
          id="descricao"
          name="descricao"
          placeholder="Descreva a solicitação de forma clara e detalhada. Sempre que possível, inclua o contexto da demanda, o objetivo esperado, prazos desejados, referências e qualquer outra informação que ajude no desenvolvimento da atividade."
          className="min-h-24"
          required
        />
        <CampoErro mensagem={erros.descricao} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className={FIELD_LABEL_CLASS}>Prioridade</Label>
        <p className="text-xs text-muted-foreground">
          Selecione a prioridade da sua solicitação de acordo com o impacto e
          urgência da demanda:
        </p>
        <RadioGroup
          value={prioridade}
          onValueChange={setPrioridade}
          name="prioridade"
          className="mt-1 grid-flow-col justify-start gap-6"
        >
          {PRIORIDADES.map((p) => (
            <label key={p.value} className="flex items-center gap-2 text-sm">
              <RadioGroupItem value={p.value} />
              {p.label}
            </label>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          Obs: Selecionar uma prioridade maior não acelera automaticamente sua
          solicitação. A classificação correta ajuda o time a organizar
          melhor as entregas e definir prazos de forma equilibrada.
        </p>
      </div>

      {prioridade === "alta" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="justificativa-prioridade" className={FIELD_LABEL_CLASS}>
            Justificativa da prioridade
          </Label>
          <Textarea
            id="justificativa-prioridade"
            name="justificativaPrioridade"
            placeholder="Por que essa solicitação é de prioridade Alta?"
            className="min-h-20"
            required
          />
          <CampoErro mensagem={erros.justificativaPrioridade} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label className={FIELD_LABEL_CLASS}>Tem um prazo limite?</Label>
        <RadioGroup
          value={temPrazo}
          onValueChange={setTemPrazo}
          name="temPrazo"
          className="grid-flow-col justify-start gap-6"
        >
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="sim" />
            Sim
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="nao" />
            Não
          </label>
        </RadioGroup>
      </div>

      {temPrazo === "sim" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prazo-data" className={FIELD_LABEL_CLASS}>
              Data do prazo
            </Label>
            <Input id="prazo-data" name="prazoData" type="date" className="h-11" required />
            <CampoErro mensagem={erros.prazoData} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="justificativa-prazo" className={FIELD_LABEL_CLASS}>
              Justificativa do prazo
            </Label>
            <Textarea
              id="justificativa-prazo"
              name="justificativaPrazo"
              placeholder="Por que esse prazo é necessário?"
              className="h-11 min-h-11"
              required
            />
            <CampoErro mensagem={erros.justificativaPrazo} />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="anexos" className={FIELD_LABEL_CLASS}>
          Anexos (opcional)
        </Label>
        <Input id="anexos" name="anexos" type="file" multiple className="h-11 pt-2" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="observacoes" className={FIELD_LABEL_CLASS}>
          Observações (opcional)
        </Label>
        <Textarea id="observacoes" name="observacoes" className="min-h-16" />
      </div>

        <Button type="submit" size="lg" className="mt-1 h-11 w-full text-base" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : "Enviar solicitação"}
        </Button>
        </form>
      </CardContent>
    </>
  );
}
