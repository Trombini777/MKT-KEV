import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { SimpleBarRow } from "@/components/simple-bar-row";
import {
  resumoProdutividade,
  atividadesPorPessoa,
  atividadesPorEtapa,
  atividadesPorSquad,
  atividadesPorDepartamento,
  COMPARATIVO_SEMANAL,
  SQUADS,
} from "@/lib/mock";

export default function DashboardsPage() {
  const resumo = resumoProdutividade();
  const porPessoa = atividadesPorPessoa();
  const porEtapa = atividadesPorEtapa();
  const porSquad = atividadesPorSquad();
  const porDepartamento = atividadesPorDepartamento();

  const maxPessoa = Math.max(1, ...porPessoa.map((p) => p.ativas));
  const maxEtapa = Math.max(1, ...porEtapa.map((e) => e.total));
  const maxSquad = Math.max(1, ...SQUADS.map((s) => porSquad.get(s.id) ?? 0));
  const maxDepto = Math.max(1, ...porDepartamento.map((d) => d.total));
  const maxComparativo = Math.max(
    1,
    ...COMPARATIVO_SEMANAL.flatMap((c) => [c.planejado, c.entregue])
  );

  return (
    <div>
      <PageHeader
        title="Dashboards"
        description="Camada analítica para acompanhar produtividade e fechar o ciclo do planejamento semanal."
      />

      <Tabs defaultValue="produtividade">
        <TabsList>
          <TabsTrigger value="produtividade">Produtividade</TabsTrigger>
          <TabsTrigger value="pessoa">Por Pessoa</TabsTrigger>
          <TabsTrigger value="etapa">Por Etapa</TabsTrigger>
          <TabsTrigger value="squad">Por Squad</TabsTrigger>
          <TabsTrigger value="departamento">Por Departamento</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
        </TabsList>

        <TabsContent value="produtividade" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="py-4">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Ativas
                </p>
                <p className="mt-1 text-2xl font-semibold">{resumo.ativas}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  A vencer (7 dias)
                </p>
                <p className="mt-1 text-2xl font-semibold">{resumo.aVencer}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Atrasadas
                </p>
                <p className="mt-1 text-2xl font-semibold text-destructive">{resumo.atrasadas}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-4">
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Em risco
                </p>
                <p className="mt-1 text-2xl font-semibold text-destructive">{resumo.emRisco}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pessoa" className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-3 py-4">
              {porPessoa.map((p) => (
                <SimpleBarRow
                  key={p.colaborador.id}
                  label={p.colaborador.nome}
                  value={p.ativas}
                  max={maxPessoa}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="etapa" className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-3 py-4">
              {porEtapa.map((e) => (
                <SimpleBarRow key={e.fase.id} label={e.fase.nome} value={e.total} max={maxEtapa} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="squad" className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-3 py-4">
              {SQUADS.map((s) => (
                <SimpleBarRow
                  key={s.id}
                  label={s.nome}
                  value={porSquad.get(s.id) ?? 0}
                  max={maxSquad}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departamento" className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-3 py-4">
              {porDepartamento.length === 0 && (
                <p className="text-sm text-muted-foreground">Sem solicitações registradas ainda.</p>
              )}
              {porDepartamento.map((d) => (
                <SimpleBarRow
                  key={d.departamento}
                  label={d.departamento}
                  value={d.total}
                  max={maxDepto}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparativo" className="mt-4">
          <Card>
            <CardContent className="flex flex-col gap-4 py-4">
              {COMPARATIVO_SEMANAL.map((c) => (
                <div key={c.semana}>
                  <p className="mb-1.5 text-sm font-medium">Semana de {c.semana}</p>
                  <div className="flex flex-col gap-1.5">
                    <SimpleBarRow label="Planejado" value={c.planejado} max={maxComparativo} />
                    <SimpleBarRow label="Entregue" value={c.entregue} max={maxComparativo} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
