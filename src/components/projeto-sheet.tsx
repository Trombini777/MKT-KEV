"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTAMENTOS } from "@/lib/departamentos";
import { useColaboradores } from "@/lib/colaborador-store";
import type { Projeto, StatusProjeto } from "@/lib/mock";

const STATUS_OPCOES: StatusProjeto[] = ["Planejado", "Ativo", "Concluído", "Cancelado"];

export function ProjetoSheet({
  tipo,
  onCriar,
  onEditar,
  projetoParaEditar,
  open: openControlado,
  onOpenChange: onOpenChangeControlado,
}: {
  /** Fixo pela página que abriu o sheet (/projetos ou /campanhas) — não editável no form. */
  tipo: "Projeto" | "Campanha";
  onCriar?: (projeto: Projeto) => void;
  onEditar?: (projeto: Projeto) => void;
  /** Quando informado, o sheet abre em modo de edição, pré-preenchido com os dados desse projeto. */
  projetoParaEditar?: Projeto;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const colaboradores = useColaboradores();
  const editando = !!projetoParaEditar;
  const controlado = openControlado !== undefined;
  const [openInterno, setOpenInterno] = useState(false);
  const open = openControlado ?? openInterno;
  const setOpen = onOpenChangeControlado ?? setOpenInterno;

  const [nome, setNome] = useState(projetoParaEditar?.nome ?? "");
  const [sigla, setSigla] = useState(projetoParaEditar?.sigla ?? "");
  const [descricao, setDescricao] = useState(projetoParaEditar?.descricao ?? "");
  const [departamento, setDepartamento] = useState(projetoParaEditar?.departamento ?? "");
  const [responsavelId, setResponsavelId] = useState(projetoParaEditar?.responsavelId ?? "");
  const [dataInicio, setDataInicio] = useState(projetoParaEditar?.dataInicio ?? "");
  const [dataFim, setDataFim] = useState(projetoParaEditar?.dataFim ?? "");
  const [status, setStatus] = useState<StatusProjeto>(projetoParaEditar?.status ?? "Planejado");

  function resetar() {
    setNome(projetoParaEditar?.nome ?? "");
    setSigla(projetoParaEditar?.sigla ?? "");
    setDescricao(projetoParaEditar?.descricao ?? "");
    setDepartamento(projetoParaEditar?.departamento ?? "");
    setResponsavelId(projetoParaEditar?.responsavelId ?? "");
    setDataInicio(projetoParaEditar?.dataInicio ?? "");
    setDataFim(projetoParaEditar?.dataFim ?? "");
    setStatus(projetoParaEditar?.status ?? "Planejado");
  }

  const valido = nome.trim() && sigla.trim() && departamento && responsavelId && dataInicio && dataFim;

  function salvar() {
    if (!valido) return;
    const dados: Projeto = {
      id: projetoParaEditar?.id ?? "",
      nome: nome.trim(),
      sigla: sigla.trim(),
      descricao: descricao.trim(),
      tipo,
      departamento: departamento as Projeto["departamento"],
      responsavelId,
      dataInicio,
      dataFim,
      notasEncerramento: projetoParaEditar?.notasEncerramento,
      status,
    };
    if (editando) {
      onEditar?.(dados);
    } else {
      onCriar?.(dados);
    }
    setOpen(false);
  }

  const rotulo = tipo === "Campanha" ? "campanha" : "projeto";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetar();
      }}
    >
      {!controlado && (
        <DialogTrigger render={<Button className="gap-1.5 shadow-sm" />}>
          <Plus className="size-4" />
          {tipo === "Campanha" ? "Nova campanha" : "Novo projeto"}
        </DialogTrigger>
      )}
      <DialogContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-1 p-5 pb-4">
          <DialogTitle>
            {editando
              ? `Editar ${rotulo}`
              : rotulo === "campanha"
                ? "Nova campanha"
                : "Novo projeto"}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? `Altere os dados dess${rotulo === "campanha" ? "a" : "e"} ${rotulo}.`
              : `Cadastre ${rotulo === "campanha" ? "uma" : "um"} ${rotulo} pra agrupar tarefas relacionadas.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 pb-5">
          <div className="grid grid-cols-[1fr_6rem] gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="proj-nome">Nome</Label>
              <Input
                id="proj-nome"
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={tipo === "Campanha" ? "Ex.: Dia das Mães 2027" : "Ex.: Renovação de Apólice"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="proj-sigla">Sigla</Label>
              <Input
                id="proj-sigla"
                value={sigla}
                onChange={(e) => setSigla(e.target.value.toUpperCase())}
                placeholder="Ex.: DMÃES27"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="proj-descricao">Descrição</Label>
            <Textarea
              id="proj-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Do que se trata essa iniciativa."
              className="min-h-16"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Departamento</Label>
              <Select value={departamento} onValueChange={(v) => v && setDepartamento(v)}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTOS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Responsável</Label>
              <Select value={responsavelId} onValueChange={(v) => v && setResponsavelId(v)}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Selecione">
                    {(value: string) =>
                      value ? (colaboradores.find((c) => c.id === value)?.nome ?? "") : "Selecione"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="proj-inicio">Data de início</Label>
              <Input
                id="proj-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="proj-fim">Prazo final</Label>
              <Input
                id="proj-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as StatusProjeto)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPCOES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 border-t border-border/60 bg-transparent p-4">
          <Button onClick={salvar} disabled={!valido}>
            {editando ? "Salvar alterações" : `Cadastrar ${rotulo}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
