# PRD: KEV Studio

Baseado no pitch [KEV_Studio_Pitch .html](../KEV_Studio_Pitch%20.html) (outubro de 2026).

## 1. Visão geral

Portal web de autoatendimento com IA para as áreas de negócio (BUs) da KEV Seguros. As áreas
produzem sozinhas, em minutos, materiais de menor complexidade na identidade visual KEV. O time
de Marketing passa a receber só o que exige especialista, com briefing pronto.

## 2. Problema

- Uma solicitação simples (ex.: 6 slides para reunião com parceiro) leva em média **2,5 dias**
  entre o pedido e a entrega.
- **70%** do tempo dos analistas sêniores do Marketing vai para esse tipo de demanda, o que
  equivale a **224h/mês** de capacidade sênior em produção operacional.
- As áreas recorrem a ferramentas de IA genéricas, que não são treinadas na identidade visual
  da KEV e não mantêm consistência de marca entre as peças.

## 3. Usuários

| Perfil | Quem | O que faz |
|---|---|---|
| Colaborador de BU | Qualquer pessoa das áreas de negócio | Cria pedidos, ajusta por chat, baixa materiais, encaminha ao Marketing |
| Gestor de área | Responsável indicado por cada BU | Tudo do colaborador + vê pedidos e consumo da própria área |
| Admin do Marketing | Time de Marketing | Vê tudo, define cotas por área, gerencia templates, acompanha a fila encaminhada |

Login com a conta corporativa (Microsoft ou Google, a definir com TI), restrito ao domínio
`@kevseguros.com.br`.

## 4. Escopo

**Atende (demandas de menor complexidade):**

- **Apresentações:** comerciais e institucionais, em .pptx no template KEV
- **Artes:** comunicados, posts internos, convites, em PNG nos formatos 1080x1080, 1080x1920 e
  1200x628
- **Textos e ajustes de documentos:** e-mails, comunicados, revisão de .docx

**Encaminha ao Marketing:**

- Campanhas, vídeos e peças de maior complexidade ou impacto
- Pedidos que a IA classificar como estratégicos, ou que o colaborador escolher encaminhar

**Fora do MVP:**

- Editor visual de slides no navegador (ajustes são feitos por chat)
- Geração de vídeo
- Base de conhecimento de produtos (coberturas, condições): os agentes trabalham com o conteúdo
  que o colaborador fornece no pedido e nos anexos

## 5. Fluxo principal

1. **Pedido:** o colaborador descreve o material em texto livre, com anexos e tom opcionais.
2. **Roteamento:** o agente de roteamento classifica tipo de material e complexidade.
3. **Criação:** o agente especialista gera o conteúdo; o sistema aplica o template KEV.
4. **Ajuste:** o colaborador pede mudanças por chat; cada ajuste gera uma nova versão.
5. **Entrega:** download do arquivo final. Tudo fica registrado: quem pediu, de qual área,
   quanto consumiu.
6. **Encaminhamento:** se for estratégico, o pedido vira uma solicitação no Sistema de Gestão
   de Marketing, na fase Solicitações, com briefing gerado pela IA.

## 6. Requisitos funcionais

- **RF1** Login corporativo; primeiro acesso vincula o usuário a uma área.
- **RF2** Tela Novo pedido com descrição, anexos, tom e atalhos por tipo de material.
- **RF3** Agente de Roteamento com saída estruturada e decisão "gerar" ou "encaminhar".
- **RF4** Agentes especialistas de Apresentações, Artes e Textos.
- **RF5** Preview na tela, ajuste por chat com histórico de versões, download do arquivo.
- **RF6** Encaminhar ao Marketing via integração com o Sistema de Gestão de Marketing.
- **RF7** Meus pedidos e Biblioteca da área (materiais reutilizáveis).
- **RF8** Catálogo de Templates KEV.
- **RF9** Painel de Consumo: pedidos, tokens, créditos de imagem, custo estimado, entrega média
  e % encaminhado ao Marketing, por área e por tipo de material.
- **RF10** Cotas mensais configuráveis por área, verificadas antes de cada geração, com alerta
  a 80%.
- **RF11** Fila do Marketing: pedidos encaminhados e seu andamento.

## 7. Requisitos não funcionais

- **Marca:** 100% dos materiais nos templates oficiais. A IA não define cor, logo nem layout.
- **Tempo de entrega:** minutos para demandas simples.
- **Segurança:** RLS por usuário e área; segredos só em variáveis de ambiente; arquivos em
  buckets privados com URL assinada.
- **Integração:** mesmo projeto Supabase do Sistema de Marketing, com tabelas `studio_`. Os
  dois sistemas conversam pelo banco; usuários de BU não acessam dados nem telas internas do
  Marketing.
- **Custo:** consumo medido por chamada e limitado por cota de área.

## 8. Métricas de sucesso (avaliação de 30 dias)

- Tempo médio de entrega de demandas simples: de 2,5 dias para minutos
- Capacidade sênior devolvida ao Marketing: meta de 112h/mês, com metade dos pedidos resolvida
  no portal
- 100% dos materiais do portal nos templates oficiais
- Consumo de tokens e volume de pedidos por área visíveis no painel

## 9. Investimento

- Implantação: R$ 1.800 (domínio, Supabase Pro, Vercel Pro, Claude API, Higgsfield Ultra,
  reserva técnica)
- Recorrente projetado: R$ 1.170 (piloto) a R$ 2.470/mês (todas as BUs), a recalibrar com os
  dados reais dos primeiros meses
