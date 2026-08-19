"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { COLABORADORES, colaboradorEhOperacional } from "@/lib/mock";
import { horarioParaDecimal, decimalParaHorarioInput } from "@/lib/time-format";
import {
  obterConfiguracoesFluxo,
  atualizarConfiguracaoFluxo,
  CONFIG_VAZIA,
  type ConfiguracoesFluxo,
} from "@/lib/configuracoes-fluxo";
import { recarregarConfiguracoesFluxo } from "@/lib/configuracoes-fluxo-store";

type Linha = {
  label: string;
  campoResponsavel: "responsavel_padrao_aprovacao_id" | "responsavel_padrao_triagem_id";
  campoHoras: "estimativa_horas_aprovacao" | "estimativa_horas_triagem";
  campoSla: "sla_horas_aprovacao" | "sla_horas_triagem";
  chaveResponsavel: "responsavelPadraoAprovacaoId" | "responsavelPadraoTriagemId";
  chaveHoras: "estimativaHorasAprovacao" | "estimativaHorasTriagem";
  chaveSla: "slaHorasAprovacao" | "slaHorasTriagem";
};

const LINHAS: Linha[] = [
  {
    label: "Aprovação (Solicitações)",
    campoResponsavel: "responsavel_padrao_aprovacao_id",
    campoHoras: "estimativa_horas_aprovacao",
    campoSla: "sla_horas_aprovacao",
    chaveResponsavel: "responsavelPadraoAprovacaoId",
    chaveHoras: "estimativaHorasAprovacao",
    chaveSla: "slaHorasAprovacao",
  },
  {
    label: "Triagem",
    campoResponsavel: "responsavel_padrao_triagem_id",
    campoHoras: "estimativa_horas_triagem",
    campoSla: "sla_horas_triagem",
    chaveResponsavel: "responsavelPadraoTriagemId",
    chaveHoras: "estimativaHorasTriagem",
    chaveSla: "slaHorasTriagem",
  },
];

/** Um input de horário (HH:MM) controlado, convertendo pra/de decimal por fora. */
function CampoHoras({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (decimal: number | null) => void;
}) {
  return (
    <div className="relative inline-block">
      <Input
        type="time"
        value={value != null ? decimalParaHorarioInput(value) : ""}
        onChange={(e) => onChange(horarioParaDecimal(e.target.value) ?? null)}
        className="h-8 w-32 pr-9"
      />
      <span className="pointer-events-none absolute top-1/2 right-8 -translate-y-1/2 text-xs font-medium text-muted-foreground">
        h
      </span>
    </div>
  );
}

/**
 * Toda tarefa nasce em Solicitações (Aprovação) -> Triagem antes de ganhar um tipo/planejamento
 * — sem um responsável e um SLA padrão configurados aqui, essas duas etapas universais ficam
 * sem dono e sem meta de tempo pra medir depois se o time está cumprindo (ver task-store.ts/
 * migrações 0004, 0005 e 0006).
 *
 * "Horas estimadas" e "SLA" são coisas diferentes: a primeira é o esforço real (o que ocupa o
 * workload da pessoa — ex.: 5min pra triar), a segunda é a meta de quanto tempo pode passar até
 * a etapa estar concluída (ex.: até 2h depois de entrar na fila) — por isso os dois em horas, e
 * não um em horas e outro em dias.
 *
 * Edição é em rascunho local + botão "Salvar" explícito (não salva a cada tecla) — cada campo
 * alterado vira uma escrita separada no Supabase (não um único PATCH com tudo junto), porque se
 * uma coluna estiver faltando no banco (ex.: SLA antes da migração 0006 rodar), um PATCH com
 * todos os campos juntos falha por inteiro e derruba até os campos que teriam funcionado.
 */
export function ResponsaveisPadraoFluxo() {
  // "Não operacional" não aparece como opção de responsável padrão.
  const colaboradoresOperacionais = COLABORADORES.filter(colaboradorEhOperacional);
  const [config, setConfig] = useState<ConfiguracoesFluxo>(CONFIG_VAZIA);
  const [rascunho, setRascunho] = useState<ConfiguracoesFluxo>(CONFIG_VAZIA);
  const [carregado, setCarregado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvoAgora, setSalvoAgora] = useState(false);

  useEffect(() => {
    obterConfiguracoesFluxo().then(({ config: c, erro: e }) => {
      setConfig(c);
      setRascunho(c);
      setErro(e);
      setCarregado(true);
    });
  }, []);

  if (!carregado) return null;

  const alterado = JSON.stringify(rascunho) !== JSON.stringify(config);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    setSalvoAgora(false);

    const falhas: string[] = [];
    for (const linha of LINHAS) {
      if (rascunho[linha.chaveResponsavel] !== config[linha.chaveResponsavel]) {
        const r = await atualizarConfiguracaoFluxo({
          [linha.campoResponsavel]: rascunho[linha.chaveResponsavel] || null,
        });
        if (!r.ok) falhas.push(`Executor (${linha.label}): ${r.erro}`);
      }
      if (rascunho[linha.chaveHoras] !== config[linha.chaveHoras]) {
        const r = await atualizarConfiguracaoFluxo({ [linha.campoHoras]: rascunho[linha.chaveHoras] });
        if (!r.ok) falhas.push(`Horas estimadas (${linha.label}): ${r.erro}`);
      }
      if (rascunho[linha.chaveSla] !== config[linha.chaveSla]) {
        const r = await atualizarConfiguracaoFluxo({ [linha.campoSla]: rascunho[linha.chaveSla] });
        if (!r.ok) falhas.push(`SLA (${linha.label}): ${r.erro}`);
      }
    }

    // Relê do banco pra saber com certeza o que ficou salvo de verdade, em vez de confiar no
    // rascunho local — assim os campos que falharam voltam a mostrar o valor real (não o digitado).
    const { config: recarregado, erro: erroLeitura } = await obterConfiguracoesFluxo();
    setConfig(recarregado);
    setRascunho(recarregado);
    setSalvando(false);
    recarregarConfiguracoesFluxo();

    if (falhas.length > 0) {
      setErro(falhas.join(" · "));
    } else if (erroLeitura) {
      setErro(erroLeitura);
    } else {
      setSalvoAgora(true);
      setTimeout(() => setSalvoAgora(false), 3000);
    }
  }

  const linhasRascunho = LINHAS.map((l) => ({
    ...l,
    responsavelId: rascunho[l.chaveResponsavel] ?? "",
    horas: rascunho[l.chaveHoras],
    sla: rascunho[l.chaveSla],
  }));

  return (
    <Card className="mb-4">
      <CardContent className="py-4">
        <p className="text-sm font-semibold">Responsáveis e SLA padrão</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Quem assume toda tarefa nova automaticamente, antes mesmo de escolher o tipo —
          &quot;Horas estimadas&quot; é o esforço real (ocupa o workload), &quot;SLA&quot; é até
          quanto tempo pode levar pra etapa sair da fila.
        </p>

        <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-48">Etapa</TableHead>
                <TableHead>Executor padrão</TableHead>
                <TableHead className="w-36">Horas estimadas</TableHead>
                <TableHead className="w-36">SLA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhasRascunho.map((linha) => (
                <TableRow key={linha.label}>
                  <TableCell className="font-medium whitespace-nowrap">{linha.label}</TableCell>
                  <TableCell>
                    <Select
                      // `items` alimenta o label do valor selecionado — lista completa pra manter o
                      // nome de quem já era responsável padrão mesmo se virar "Não operacional"; as
                      // opções do dropdown continuam restritas abaixo.
                      items={Object.fromEntries(COLABORADORES.map((c) => [c.id, c.nome]))}
                      value={linha.responsavelId}
                      onValueChange={(v) => {
                        if (typeof v !== "string") return;
                        setRascunho((prev) => ({ ...prev, [linha.chaveResponsavel]: v }));
                      }}
                    >
                      <SelectTrigger className="h-8 w-44 gap-1.5">
                        <ColaboradorAvatar
                          colaboradorId={linha.responsavelId || undefined}
                          className="size-5 shrink-0"
                          fallbackClassName="text-[0.55rem]"
                        />
                        <SelectValue placeholder="Ninguém definido" />
                      </SelectTrigger>
                      <SelectContent>
                        {colaboradoresOperacionais.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <CampoHoras
                      value={linha.horas}
                      onChange={(decimal) =>
                        setRascunho((prev) => ({ ...prev, [linha.chaveHoras]: decimal }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <CampoHoras
                      value={linha.sla}
                      onChange={(decimal) =>
                        setRascunho((prev) => ({ ...prev, [linha.chaveSla]: decimal }))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <Button onClick={salvar} disabled={!alterado || salvando} className="gap-1.5">
            {salvando && <Loader2 className="size-4 animate-spin" />}
            {salvando ? "Salvando..." : "Salvar alterações"}
          </Button>
          {salvoAgora && (
            <span className="flex items-center gap-1 text-sm text-success">
              <Check className="size-4" />
              Salvo no banco de dados.
            </span>
          )}
        </div>

        {erro && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{erro}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
