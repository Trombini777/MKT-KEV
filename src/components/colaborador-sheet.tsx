"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { createClient } from "@/lib/supabase/client";
import { SQUADS, type Colaborador, type StatusColaborador } from "@/lib/mock";

const STATUS_OPCOES: StatusColaborador[] = [
  "Ativo",
  "Em Licença",
  "Férias",
  "Não operacional",
  "Inativo",
];

// Ordem hierárquica de cima pra baixo — do mais sênior pro mais júnior. Times são todos de
// Marketing, então o cargo já vem com o sufixo — evita duplicidade tipo "Superintendente" (aqui)
// vs. "Superintendente de Marketing" (dado real) aparecendo como duas opções diferentes.
const CARGOS_OPCOES = [
  "Superintendente de Marketing",
  "Gerente de Marketing",
  "Coordenador de Marketing",
  "Analista de Marketing Sênior",
  "Analista de Marketing Pleno",
  "Analista de Marketing Júnior",
] as const;

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
  const [avatarUrl, setAvatarUrl] = useState(colaboradorParaEditar?.avatarUrl ?? "");
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  function resetar() {
    setNome(colaboradorParaEditar?.nome ?? "");
    setCargo(colaboradorParaEditar?.cargo ?? "");
    setSquadId(colaboradorParaEditar?.squadId ?? "");
    setHoras(String(colaboradorParaEditar?.capacidadeHorasSemana ?? 40));
    setStatus(colaboradorParaEditar?.status ?? "Ativo");
    setEmail(colaboradorParaEditar?.email ?? "");
    setWhatsapp(colaboradorParaEditar?.whatsapp ?? "");
    setDataNascimento(colaboradorParaEditar?.dataNascimento ?? "");
    setAvatarUrl(colaboradorParaEditar?.avatarUrl ?? "");
  }

  async function enviarFoto(arquivo: File) {
    setEnviandoFoto(true);
    const supabase = createClient();
    const extensao = arquivo.name.split(".").pop() ?? "jpg";
    const caminho = `${colaboradorParaEditar?.id ?? "novo"}/${Date.now()}.${extensao}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(caminho, arquivo, { upsert: true });
    if (error) {
      console.error("Falha ao enviar foto:", error.message);
      setEnviandoFoto(false);
      return;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(caminho);
    setAvatarUrl(data.publicUrl);
    setEnviandoFoto(false);
  }

  function salvar() {
    if (!nome.trim()) return;
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
      avatarUrl: avatarUrl || undefined,
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              disabled={enviandoFoto}
              className="group/avatar-btn relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label="Trocar foto"
            >
              <Avatar className="size-14">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
                <AvatarFallback className="text-sm">
                  {nome ? iniciaisDoNome(nome) : "?"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover/avatar-btn:opacity-100">
                {enviandoFoto ? (
                  <Loader2 className="size-4 animate-spin text-white" />
                ) : (
                  <Camera className="size-4 text-white" />
                )}
              </span>
              <input
                ref={inputFotoRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) enviarFoto(arquivo);
                  e.target.value = "";
                }}
              />
            </button>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Foto de perfil</p>
              <button
                type="button"
                onClick={() => inputFotoRef.current?.click()}
                disabled={enviandoFoto}
                className="w-fit text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {avatarUrl ? "Trocar foto" : "Adicionar foto"}
              </button>
            </div>
          </div>

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
              <Label>Cargo</Label>
              <Select value={cargo} onValueChange={(v) => v && setCargo(v)}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CARGOS_OPCOES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  {cargo && !(CARGOS_OPCOES as readonly string[]).includes(cargo) && (
                    <SelectItem value={cargo}>{cargo}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Squad (opcional)</Label>
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
          <Button onClick={salvar} disabled={!nome.trim() || enviandoFoto}>
            {editando ? "Salvar alterações" : "Cadastrar membro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
