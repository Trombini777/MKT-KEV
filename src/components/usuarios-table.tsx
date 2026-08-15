"use client";

import { useState } from "react";
import { ColaboradorAvatar } from "@/components/colaborador-avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { USUARIOS, colaboradorById, type PerfilUsuario } from "@/lib/mock";

const PERFIS: PerfilUsuario[] = ["Admin", "Editor", "Viewer"];

export function UsuariosTable() {
  const [perfis, setPerfis] = useState<Record<string, PerfilUsuario>>(() =>
    Object.fromEntries(USUARIOS.map((u) => [u.id, u.perfil]))
  );

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pessoa</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Perfil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {USUARIOS.map((usuario) => {
              const colaborador = colaboradorById(usuario.colaboradorId);
              if (!colaborador) return null;
              return (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ColaboradorAvatar
                        colaboradorId={colaborador.id}
                        className="size-7"
                        fallbackClassName="text-xs"
                      />
                      <span className="font-medium">{colaborador.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{colaborador.email}</TableCell>
                  <TableCell>
                    <Badge variant={colaborador.status === "Ativo" ? "secondary" : "outline"}>
                      {colaborador.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={perfis[usuario.id]}
                      onValueChange={(v) =>
                        v &&
                        setPerfis((prev) => ({ ...prev, [usuario.id]: v as PerfilUsuario }))
                      }
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERFIS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
