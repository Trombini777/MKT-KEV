"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SQUADS, type Colaborador, type StatusColaborador } from "@/lib/mock";

const STATUS_OPCOES: StatusColaborador[] = ["Ativo", "Em Licença", "Inativo"];

function iniciaisDoNome(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  const primeira = partes[0]?.[0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

export function ColaboradorSheet({
  onCriar,
  onEditar,
  onExcluir,
  colaboradorParaEditar,
  open: openControlado,
  onOpenChange: onOpenChangeControlado,
}: {
  onCriar?: (colaborador: Colaborador) => void;
  onEditar?: (colaborador: Colaborador) => void;
  onExcluir?: (id: string) => void;
  /** Quando informado, o sheet abre em modo de edição, pré-preenchido com os dados desse colaborador. */
  colaboradorParaEditar?: Colaborador;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const editando = !!colaboradorParaEditar;
  const controlado = openControlado !== undefined;
  const [openInterno, setOpenInterno] = useState(false);
  const open = openControlado ?? openInterno;
  const setOpen = onOpenChangeControlado ?? setOpenInterno;

  const [nome, setNome] = useState(colaboradorParaEditar?.nome ?? "");
  const [cargo, setCargo] = useState(colaboradorParaEditar?.cargo ?? "");
  const [squadId, setSquadId] = useState(colaboradorParaEditar?.squadId ?? "");
  const [horas, setHoras] = useState(String(colaboradorParaEditar?.capacidadeHorasSemana ?? 40));
  const [status, setStatus] = useState<StatusColaborador>(colaboradorParaEditar?.status ?? "Ativo");
  const [email, setEmail] = useState(colaboradorParaEditar?.email ?? "");
  const [whatsapp, setWhatsapp] = useState(colaboradorParaEditar?.whatsapp ?? "");
  const [dataNascimento, setDataNascimento] = useState(colaboradorParaEditar?.dataNascimento ?? "");

  function resetar() {
    setNome(colaboradorParaEditar?.nome ?? "");
    setCargo(colaboradorParaEditar?.cargo ?? "");
    setSquadId(colaboradorParaEditar?.squadId ?? "");
    setHoras(String(colaboradorParaEditar?.capacidadeHorasSemana ?? 40));
    setStatus(colaboradorParaEditar?.status ?? "Ativo");
    setEmail(colaboradorParaEditar?.email ?? "");
    setWhatsapp(colaboradorParaEditar?.whatsapp ?? "");
    setDataNascimento(colaboradorParaEditar?.dataNascimento ?? "");
  }

  function salvar() {
    if (!nome.trim() || !squadId) return;
    const dados: Colaborador = {
      id: colaboradorParaEditar?.id ?? `colaborador-${Date.now()}`,
      nome: nome.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim() || undefined,
      dataNascimento: dataNascimento || undefined,
      cargo: cargo.trim(),
      skills: colaboradorParaEditar?.skills ?? [],
      capacidadeHorasSemana: Number(horas) || 0,
      status,
      squadId,
      avatarIniciais: iniciaisDoNome(nome),
      avatarUrl: colaboradorParaEditar?.avatarUrl,
    };
    if (editando) {
      onEditar?.(dados);
    } else {
      onCriar?.(dados);
    }
    setOpen(false);
  }

  function excluir() {
    if (!colaboradorParaEditar) return;
    onExcluir?.(colaboradorParaEditar.id);
    setOpen(false);
  }

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
          Adicionar Membro
        </DialogTrigger>
      )}
      <DialogContent className="w-full gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="gap-1 p-5 pb-4">
          <DialogTitle>{editando ? "Editar membro da equipe" : "Novo membro da equipe"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Altere os dados desse colaborador."
              : "Cadastre um colaborador. Esses dados aparecem no time, na capacidade semanal e no plano de execução das tarefas."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-5 pb-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="colab-nome">Nome completo</Label>
            <Input
              id="colab-nome"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Ana Souza"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="colab-cargo">Cargo</Label>
              <Input
                id="colab-cargo"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ex.: Social Media"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Squad</Label>
              <Select value={squadId} onValueChange={(v) => v && setSquadId(v)}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Selecione">
                    {(value: string) =>
                      value ? (SQUADS.find((s) => s.id === value)?.nome ?? "") : "Selecione"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {SQUADS.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="colab-horas">Horas semanais</Label>
              <Input
                id="colab-horas"
                type="number"
                min={0}
                max={60}
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => v && setStatus(v as StatusColaborador)}
              >
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="colab-email">E-mail</Label>
            <Input
              id="colab-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@kevseguros.com.br"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="colab-whatsapp">WhatsApp</Label>
              <Input
                id="colab-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 91234-5678"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="colab-nascimento">Data de nascimento</Label>
              <Input
                id="colab-nascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0 flex-row items-center justify-between border-t border-border/60 bg-transparent p-4">
          {editando ? (
            <Button
              variant="ghost"
              onClick={excluir}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={salvar} disabled={!nome.trim() || !squadId}>
            {editando ? "Salvar alterações" : "Cadastrar membro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
