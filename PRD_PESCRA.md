# PRD — PESCRA
## Plataforma de Estudos de Sustentabilidade e Conservação de Recursos Aquáticos

**Versão:** 1.0  
**Data:** Maio 2026  
**Elaborado por:** Antigravity / IBAMA  
**Base normativa:** IBAMA Informação Técnica nº 22/2025 — Anexo I  
**Status:** MVP implementado — dados mock em produção local

---

## 1. Visão Geral

### 1.1 Contexto

O PESCRA é um sistema de monitoramento pesqueiro desenvolvido para apoiar a gestão da pesca artesanal de subsistência na Terra Indígena Pequizal do Naruv'ytu (MT), área de confluência dos rios Sete de Setembro e Kuluene. O sistema operacionaliza o protocolo de monitoramento estabelecido no Anexo I da Informação Técnica nº 22/2025 do IBAMA, que define metodologia, indicadores e limites de esforço de pesca para a anuência de atividade pesqueira na TI.

### 1.2 Problema

O gestor do IBAMA responsável pela TI não possui visibilidade centralizada sobre:
- Evolução da eficiência de captura (CPUE) ao longo das temporadas
- Cumprimento dos indicadores de conservação de estoques (Protocolo Froese)
- Conformidade do esforço de pesca com os limites definidos na anuência (máx. 8 barcos/dia)
- Composição de espécies e padrões geográficos e temporais das capturas

### 1.3 Solução

Dashboard web institucional com visualizações interativas, filtros temporais e geográficos, mapa animado de capturas e rankings de pirangueiros (pilotos de embarcação), alimentado pela base de dados do programa de monitoramento.

### 1.4 Público-alvo

| Perfil | Uso esperado |
|---|---|
| Gestor IBAMA | Tomada de decisão sobre renovação/revogação da anuência, relatórios periódicos |
| Analista ambiental | Análise técnica dos indicadores, identificação de tendências |
| Coordenador de campo | Acompanhamento operacional, controle de pirangueiros |

---

## 2. Objetivos e Métricas de Sucesso

### 2.1 Objetivos

1. **Transparência**: centralizar todos os indicadores do protocolo em uma interface única
2. **Rastreabilidade**: permitir análise histórica por temporada, mês, semana e dia
3. **Conformidade**: evidenciar desvios de esforço em relação ao limite da anuência
4. **Conservação**: monitorar a estrutura de comprimento das capturas pelos indicadores Froese

### 2.2 KPIs do sistema

| Indicador | Meta |
|---|---|
| Tempo de carregamento inicial | < 2s em conexão 4G |
| Cobertura de indicadores do Anexo I | 100% |
| Granularidade temporal mínima | Diária |
| Precisão geográfica das capturas | Raio definido por local (0,4–1,5 km) |

---

## 3. Escopo

### 3.1 Dentro do escopo (MVP)

- Painel de CPUE (CPUEn e CPUEb) com série temporal
- Indicadores de conservação Froese (2004): % adultos, % comprimento ótimo, % megarreprodutores
- Painel de esforço de pesca com linha de referência no limite da anuência
- Composição de espécies: gráfico de pizza e tabela de detalhamento
- Ranking de pirangueiros: por total de capturas e por maior peixe por espécie
- Mapa interativo com satélite Esri, visualização de capturas e animação temporal (24h → 10s/h)
- Filtros: temporada, granularidade temporal (temporada/mês/semana/dia/entre datas), espécie, local de pesca
- Dados mock com geração determinística baseada em parâmetros biológicos reais das espécies

### 3.2 Fora do escopo (MVP)

- Autenticação e controle de acesso
- Integração com banco de dados real
- Exportação de relatórios (PDF/Excel)
- Notificações e alertas automáticos
- Modo offline / PWA
- Inserção ou edição de dados via interface

---

## 4. Especificações Funcionais

### 4.1 Filtros Globais

Disponíveis no header em todas as páginas do dashboard (exceto Mapa).

| Filtro | Tipo | Opções | Padrão |
|---|---|---|---|
| Temporada | MultiSelect | 2019, 2021, 2022, 2023, 2024 | 2024 |
| Granularidade | Select | Temporada, Mês, Semana, Dia, Entre datas | Mês |
| Espécie | MultiSelect | 6 espécies | Todas |
| Local | MultiSelect | 5 locais | Todos |
| Data Início / Fim | Date input | Qualquer data | — (só quando "Entre datas") |

**Regra**: quando granularidade = "Entre datas", o filtro de temporada é ignorado; as capturas são filtradas exclusivamente pelo intervalo de datas.

### 4.2 Bloco CPUE — Captura por Unidade de Esforço

**Metodologia**: CPUE = capturas / (barcos × dias)

| KPI | Fórmula | Unidade |
|---|---|---|
| CPUEn | Nº capturas ÷ nº barcos-dia | peixes/barco/dia |
| CPUEb | Peso total (kg) ÷ nº barcos-dia | kg/barco/dia |
| Total Capturas | Contagem direta | capturas |
| Períodos | Nº de intervalos com dados | — |

- Exibe variação percentual (▲/▼) em relação ao período anterior
- Série temporal em gráfico de área com gradiente, dois eixos sobrepostos (CPUEn e CPUEb)

### 4.3 Bloco Indicadores de Conservação — Protocolo Froese (2004)

**Referência**: Froese, R. (2004). Keep it simple: three indicators to deal with overfishing. _Fish and Fisheries_, 5(1), 86–91.

| Indicador | Definição | Parâmetro | Meta |
|---|---|---|---|
| % Adultos | Peixes com L ≥ Lm | Comprimento de 1ª maturação (Lm) por espécie | 100% |
| % Comprimento Ótimo | Peixes com L ∈ [Lopt×0,9 ; Lopt×1,1] | Comprimento ótimo (Lopt) por espécie | 100% |
| % Megarreprodutores | Peixes com L > Lopt×1,1 | Idem | 30–40% |

- Cartões com barra de progresso por indicador
- Gráfico de barras empilhadas com série temporal das classes de comprimento

### 4.4 Bloco Esforço de Pesca

**Limite da anuência (IBAMA IT nº 22/2025):** máximo 8 embarcações/dia

| KPI | Descrição |
|---|---|
| Barcos / Dia | Média de embarcações por dia no período |
| Pescadores / Dia | Média de pescadores por dia |
| Dias de Operação | Total de dias com pelo menos 1 captura |
| Horas Efetivas | Soma das horas efetivas de pesca registradas |

- Gráfico de linha temporal com linha de referência vermelha tracejada no limite (y = 8)
- Série com barcos/dia e pescadores/dia

### 4.5 Bloco Composição de Espécies

- Gráfico de pizza (donut) com proporção por espécie
- Tabela com: espécie, capturas, % do total, comprimento médio (cm), barra proporcional
- Tooltip interativo com dados biológicos completos (nome científico, peso médio)

### 4.6 Bloco Ranking de Pirangueiros

**Modos de visualização:**

| Modo | Métrica de ordenação | Granularidade |
|---|---|---|
| Total Capturas | Nº absoluto de capturas por piloto | Por espécie ou todas |
| Maior Peixe | Comprimento máximo capturado | Por espécie ou todas |

- Cards individuais com medalhas (🥇🥈🥉) para os 3 primeiros
- Barra de progresso relativa ao 1º colocado
- Detalhamento de capturas por espécie (modo Total) ou maior peixe por espécie (modo Maior)

### 4.7 Página Mapa

**URL:** `/mapa`

#### Camada base
- Tiles: Esri World Imagery (satélite, gratuito, sem API key)
- Controles nativos de zoom e navegação

#### Painel de controle lateral
| Controle | Tipo | Descrição |
|---|---|---|
| Modo Ao Vivo / Histórico | Toggle | Ao Vivo mostra captura mais recente; Histórico habilita animação |
| Play / Pause / Reset | Botões | Controlam a animação |
| Velocidade | Informativo | 10 segundos por hora (24h em ~4 minutos) |
| Opacidade capturas passadas | Slider | 0–100%, controla transparência de marcadores históricos |
| Período exibido | Informativo | Hora atual da animação |

#### Animação
- Cada "hora" do dia representada por 10 segundos de animação
- Marcadores aparecem gradualmente conforme o horário de captura avança
- Cores dos marcadores seguem a paleta por espécie
- Popup em cada marcador com: espécie, comprimento (cm), pirangueiro, horário, local

#### HUD (heads-up display)
- Total de capturas exibidas no momento
- Horário atual da animação
- Mini-legenda de espécies com contagens

---

## 5. Dados

### 5.1 Modelo de Captura

```typescript
interface Captura {
  id: string
  data: string           // ISO 8601: "YYYY-MM-DD"
  datetime: string       // ISO 8601 com hora
  temporada: number      // Ano da temporada de pesca
  especie_id: string     // ID da espécie
  comprimento_cm: number // Comprimento total (cm)
  peso_g: number | null  // Peso (g) — null quando não medido
  barco_id: string       // ID da embarcação
  pirangueiro_id: string // ID do piloto
  pescadores: number     // Número de pescadores a bordo
  horas_efetivas: number // Horas efetivas de pesca no dia
  local_id: string       // ID do local de pesca
  lat: number            // Latitude WGS84
  lon: number            // Longitude WGS84
}
```

### 5.2 Espécies Monitoradas

| Espécie | Nome científico | Lm (cm) | Lopt (cm) | Lmax (cm) |
|---|---|---|---|---|
| Tucunaré | _Cichla melaniae_ | 28 | 42 | 65 |
| Bicuda | _Boulengerella cuvieri_ | 35 | 52 | 80 |
| Cachorra Larga | _Hydrolycus armatus_ | 32 | 48 | 75 |
| Cachorra Facão | _Hydrolycus tatauaia_ | 24 | 36 | 55 |
| Piraíba | _Brachyplatystoma filamentosum_ | 95 | 128 | 180 |
| Jaú | _Zungaro jahu_ | 70 | 98 | 140 |

### 5.3 Locais de Pesca

Todos dentro da TI Pequizal do Naruv'ytu, MT (região do alto Xingu):

| ID | Nome | Tipo | Lat | Lon | Raio |
|---|---|---|---|---|---|
| confluencia | Confluência Sete de Set./Kuluene | canal | -11,72 | -53,58 | 1,5 km |
| lago_grande | Lago Grande | lago | -11,68 | -53,62 | 0,8 km |
| ressaca_norte | Ressaca Norte | ressaca | -11,65 | -53,55 | 0,6 km |
| pedrais_sul | Pedrais Sul | pedrais | -11,78 | -53,60 | 0,4 km |
| igarape_leste | Igarapé Leste | igarapé | -11,70 | -53,50 | 0,5 km |

### 5.4 Temporadas Mock

| Ano | Meses | Barcos base | Pescadores base |
|---|---|---|---|
| 2019 | Mar–Ago | 6 | 12 |
| 2021 | Mar–Ago | 6 | 12 |
| 2022 | Mar–Ago | 6 | 11 |
| 2023 | Mar–Ago | 8 | 14 |
| 2024 | Mar–Abr | 5 | 10 |

> Nota: 2020 não possui dados (Covid-19 — paralisação das atividades).

---

## 6. Arquitetura Técnica

### 6.1 Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework UI | React | 19 |
| Linguagem | TypeScript | 5 |
| Build tool | Vite | 8 |
| Estilização | Tailwind CSS | v4 (`@tailwindcss/vite`) |
| Gráficos | Recharts | — |
| Estado global | Zustand | — |
| Roteamento | react-router-dom | v7 |
| Mapa | react-leaflet + leaflet | — |
| Tiles mapa | Esri World Imagery | Gratuito |
| Datas | date-fns | — |
| Alias de módulos | `@/` → `./src/` | — |

### 6.2 Estrutura de diretórios

```
pescra-dashboard/
├── src/
│   ├── types/index.ts          # Interfaces TypeScript globais
│   ├── data/
│   │   ├── especies.ts         # Espécies, locais, pirangueiros
│   │   └── mock.ts             # Gerador determinístico de dados mock
│   ├── store/
│   │   └── filtros.ts          # Zustand store — estado dos filtros
│   ├── lib/
│   │   └── agregacoes.ts       # Funções de agregação e cálculo de KPIs
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.tsx        # Card genérico + KpiCard
│   │   │   └── SectionTitle.tsx
│   │   ├── blocos/
│   │   │   ├── BlocoCPUE.tsx
│   │   │   ├── BlocoFroese.tsx
│   │   │   ├── BlocoEsforco.tsx
│   │   │   ├── BlocoEspecies.tsx
│   │   │   └── BlocoRanking.tsx
│   │   ├── Header.tsx
│   │   └── Filtros.tsx
│   ├── pages/
│   │   └── MapaPage.tsx
│   ├── App.tsx                 # BrowserRouter com rotas /  e /mapa
│   └── index.css               # Tailwind v4 import + variáveis base
```

### 6.3 Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | Dashboard | Todos os blocos analíticos com filtros |
| `/mapa` | MapaPage | Mapa interativo com animação temporal |

### 6.4 Fluxo de dados

```
CAPTURAS_MOCK (geração one-time) 
  → filtrarCapturas(capturas, filtros)
    → calcularCPUE / calcularFroese / calcularEsforco / calcularEspecies / calcularRankingPirangueiros
      → Recharts / react-leaflet (renderização)
```

O estado dos filtros é gerenciado globalmente via Zustand. Todos os blocos reagem às mudanças de filtro via `useMemo`.

---

## 7. Design System

### 7.1 Paleta de cores

| Token | Hex | Uso |
|---|---|---|
| Background page | `#f1f5f9` | Fundo geral |
| Surface card | `#ffffff` | Cards e painéis |
| Border | `#e2e8f0` | Bordas de cards |
| Text primary | `#0f172a` | Títulos, valores KPI |
| Text secondary | `#475569` | Descrições, labels de seção |
| Text muted | `#64748b` | Labels de cards, unidades |
| Accent blue | `#1d4ed8` | Elementos de ênfase, série CPUE |
| Success | `#10b981` (emerald-500) | Badge positiva |
| Danger | `#ef4444` | Badge negativa, linha de limite |

### 7.2 Cores por espécie

| Espécie | Hex |
|---|---|
| Tucunaré | `#1d4ed8` |
| Bicuda | `#8b5cf6` |
| Cachorra Larga | `#0d9488` |
| Cachorra Facão | `#f59e0b` |
| Piraíba | `#ef4444` |
| Jaú | `#ec4899` |

### 7.3 Tipografia

- Fonte: `system-ui, -apple-system, sans-serif`
- Títulos de seção: `font-bold text-base text-[#0f172a]` com barra accent vertical azul
- Labels KPI: `text-xs font-semibold uppercase tracking-wider text-[#64748b]`
- Valores KPI: `text-3xl font-bold tracking-tight text-[#0f172a]`

---

## 8. Roadmap

### Fase 1 — MVP (concluída)
- [x] Dashboard analítico completo com dados mock
- [x] Filtros temporais e por espécie/local
- [x] Mapa interativo com satélite e animação temporal
- [x] Ranking de pirangueiros
- [x] Design system institucional (tema claro)

### Fase 2 — Integração de dados reais
- [ ] Definição da API ou conexão direta com banco de dados do monitoramento
- [ ] Autenticação (SSO IBAMA ou Keycloak)
- [ ] Substituição dos dados mock pela camada de dados real
- [ ] Tratamento de dados ausentes e validação de entrada

### Fase 3 — Funcionalidades avançadas
- [ ] Exportação de relatório periódico em PDF (dados + gráficos)
- [ ] Exportação de tabelas em CSV/Excel
- [ ] Alertas automáticos: notificação quando esforço excede limite da anuência
- [ ] Comparativo entre temporadas lado a lado
- [ ] Análise de tendência com regressão linear sobre CPUE

### Fase 4 — Campo e operação
- [ ] Formulário de entrada de dados (capturas, esforço) para uso no campo
- [ ] Modo offline / PWA para áreas sem conectividade
- [ ] App mobile (React Native ou PWA)
- [ ] Sincronização de dados off-line com o servidor

---

## 9. Requisitos Não Funcionais

| Requisito | Especificação |
|---|---|
| Compatibilidade | Chrome 120+, Firefox 120+, Edge 120+ |
| Responsividade | Desktop (1280px+) como referência; tablet (768px+) funcional |
| Performance | First Contentful Paint < 2s, bundle < 900KB gzip |
| Acessibilidade | Contraste mínimo WCAG AA em todos os textos |
| Segurança | Sem dados sensíveis no frontend; HTTPS obrigatório em produção |
| Internacionalização | Português brasileiro (pt-BR) exclusivamente no MVP |

---

## 10. Glossário

| Termo | Definição |
|---|---|
| CPUE | Captura por Unidade de Esforço — índice de abundância relativa |
| CPUEn | CPUE numérica: nº de peixes por barco por dia |
| CPUEb | CPUE em biomassa: kg de peixe por barco por dia |
| Lm | Comprimento de primeira maturação sexual |
| Lopt | Comprimento ótimo de captura (máximo rendimento sustentável por indivíduo) |
| Lmax | Comprimento máximo registrado para a espécie |
| L∞ | Comprimento assintótico (parâmetro de crescimento de von Bertalanffy) |
| Megarreprodutor | Peixe com comprimento acima de Lopt×1,1 — alta capacidade reprodutiva |
| Pirangueiro | Piloto de embarcação de pesca artesanal na região do Xingu |
| Anuência | Autorização do IBAMA para a atividade pesqueira na TI, com condicionantes |
| TI | Terra Indígena |
| IT | Informação Técnica (documento normativo interno do IBAMA) |
| Temporada | Período anual de pesca autorizado (tipicamente março a agosto) |

---

_Documento gerado com base na Informação Técnica IBAMA nº 22/2025 (Anexo I) e nas especificações do sistema PESCRA desenvolvido em maio de 2026._
