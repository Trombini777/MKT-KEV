"use client";

import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartamentos } from "@/lib/departamentos-store";
import { anoDoPrazoValido, MENSAGEM_ANO_INVALIDO } from "@/lib/validacao-data";
import type { PrioridadeSugerida } from "@/lib/mock";

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

const FIELD_LABEL_CLASS = "text-xs font-semibold tracking-wider text-muted-foreground uppercase";

const atividadeSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe o nome de quem pediu."),
    email: z.string().trim().min(1, "Informe o e-mail.").email("Informe um e-mail válido."),
    departamento: z.string().min(1, "Selecione o departamento/área."),
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
      } else if (!anoDoPrazoValido(dados.prazoData)) {
        ctx.addIssue({ code: "custom", path: ["prazoData"], message: MENSAGEM_ANO_INVALIDO });
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

type ErrosAtividade = Partial<Record<keyof z.infer<typeof atividadeSchema>, string>>;

export type DadosAtividade = {
  titulo: string;
  descricao: string;
  departamento: string;
  solicitanteNome: string;
  solicitanteEmail: string;
  prioridadeSugerida: PrioridadeSugerida;
  justificativaPrioridade?: string;
  prazo?: string;
  justificativaPrazo?: string;
  observacoes?: string;
  anexos: string[];
};

function CampoErro({ mensagem }: { mensagem?: string }) {
  if (!mensagem) return null;
  return <p className="text-xs text-destructive">{mensagem}</p>;
}

/**
 * Campos do formulário de solicitação — compartilhados entre o formulário público
 * (solicitacao-form.tsx) e o dialog "Nova atividade" usado dentro do sistema (PRD E1: mesmo
 * conjunto de campos, dois pontos de entrada). Quem chama decide o que fazer com os dados
 * validados (RPC pública, texto do CTA, o que acontece depois do sucesso).
 */
export function AtividadeFormFields({
  onSubmit,
  ctaLabel = "Enviar solicitação",
  ctaLabelEnviando = "Enviando…",
}: {
  onSubmit: (dados: DadosAtividade) => Promise<{ erro?: string } | void>;
  ctaLabel?: string;
  ctaLabelEnviando?: string;
}) {
  const DEPARTAMENTOS = useDepartamentos();
  const [prioridade, setPrioridade] = useState<string>("regular");
  const [departamento, setDepartamento] = useState<string>("");
  const [temPrazo, setTemPrazo] = useState<string>("nao");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erros, setErros] = useState<ErrosAtividade>({});
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    const resultado = atividadeSchema.safeParse({
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
    const resposta = await onSubmit({
      titulo,
      descricao,
      departamento,
      solicitanteNome: nome,
      solicitanteEmail: email,
      prioridadeSugerida: PRIORIDADE_SUGERIDA[prioridade],
      justificativaPrioridade: justificativaPrioridade || undefined,
      prazo: prazoData || undefined,
      justificativaPrazo: justificativaPrazo || undefined,
      observacoes: observacoes || undefined,
      anexos,
    });
    setIsSubmitting(false);
    if (resposta?.erro) setErroEnvio(resposta.erro);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome" className={FIELD_LABEL_CLASS}>
            Nome completo
          </Label>
          <Input id="nome" name="nome" placeholder="Nome de quem está pedindo" className="h-11" required />
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
        <Label htmlFor="titulo" className={FIELD_LABEL_CLASS}>
          Título
        </Label>
        <Input
          id="titulo"
          name="titulo"
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
          placeholder="Descreva a solicitação de forma clara e detalhada. Sempre que possível, inclua o contexto da demanda, o objetivo esperado, prazos desejados, referências e qualquer outra informação que ajude no desenvolvimento da atividade."
          className="min-h-24"
          required
        />
        <CampoErro mensagem={erros.descricao} />
      </div>

      <div className="flex flex-col gap-2">
        <Label className={FIELD_LABEL_CLASS}>Prioridade</Label>
        <p className="text-xs text-muted-foreground">
          Selecione a prioridade da solicitação de acordo com o impacto e urgência da demanda:
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
          Obs: Selecionar uma prioridade maior não acelera automaticamente a solicitação. A
          classificação correta ajuda o time a organizar melhor as entregas e definir prazos de
          forma equilibrada.
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

      {erroEnvio && <p className="text-sm text-destructive">{erroEnvio}</p>}

      <Button type="submit" size="lg" className="mt-1 h-11 w-full text-base" disabled={isSubmitting}>
        {isSubmitting ? ctaLabelEnviando : ctaLabel}
      </Button>
    </form>
  );
}
