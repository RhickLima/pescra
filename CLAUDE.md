# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PESCRA — Plataforma de Estudos de Sustentabilidade e Conservação de Recursos Aquáticos.
Dashboard institucional para o IBAMA monitorar a pesca artesanal na TI Pequizal do Naruv'ytu (MT), baseado na Informação Técnica nº 22/2025 (Anexo I). Ver `PRD_PESCRA.md` para especificações completas.

O app React está em `pescra-dashboard/`. Todo trabalho de código ocorre dentro desse subdiretório.

## Commands

```bash
cd pescra-dashboard
npm run dev      # dev server em http://localhost:5173
npm run build    # build de produção (tsc -b && vite build)
npm run lint     # ESLint
```

## Architecture

### Stack
- React 19 + TypeScript 5 + Vite 8
- Tailwind CSS v4 via `@tailwindcss/vite` (sem `tailwind.config.js` — configuração inline no CSS)
- Recharts para gráficos (área, barra, linha, pizza)
- Zustand para estado global dos filtros
- react-router-dom v7 — duas rotas: `/` (dashboard) e `/mapa`
- react-leaflet + leaflet — mapa com tiles Esri World Imagery (satélite, sem API key)
- date-fns — cálculo de semanas ISO (`getISOWeek`, `getISOWeekYear`)
- Path alias `@/` → `./src/` configurado em `vite.config.ts` e `tsconfig.app.json`

### Data flow

```
CAPTURAS_MOCK (gerado uma vez em src/data/mock.ts)
  → filtrarCapturas(capturas, filtros)         # src/lib/agregacoes.ts
    → calcular*(...)                            # uma função por bloco
      → Recharts / react-leaflet               # renderização
```

O store Zustand (`src/store/filtros.ts`) expõe `useFiltros()`. Todos os blocos consomem o store e recalculam via `useMemo` a cada mudança de filtro.

### Key files

| Arquivo | Responsabilidade |
|---|---|
| `src/types/index.ts` | Todas as interfaces TypeScript do projeto |
| `src/data/especies.ts` | Espécies (6), locais de pesca (5), pirangueiros (8) |
| `src/data/mock.ts` | Gerador determinístico de ~2400 capturas com RNG linear congruencial |
| `src/lib/agregacoes.ts` | `filtrarCapturas`, `calcularCPUE`, `calcularFroese`, `calcularEsforco`, `calcularEspecies`, `calcularRankingPirangueiros`, `calcularVariacao` |
| `src/store/filtros.ts` | Zustand store — `FiltroState` com temporadas, granularidade, especies, locais, dataInicio, dataFim |
| `src/components/ui/Card.tsx` | `Card` (wrapper) + `KpiCard` (cartão de KPI com variação ▲▼) |
| `src/components/ui/SectionTitle.tsx` | Título de seção com barra accent azul vertical |
| `src/components/Header.tsx` | Header sticky com nav e `<Filtros />` embutido (só na rota `/`) |
| `src/components/Filtros.tsx` | Barra de filtros: granularidade, temporada, espécie, local, datas |
| `src/pages/MapaPage.tsx` | Mapa satelite com animação temporal (10s/hora), sidebar de controles |

### Blocos do dashboard (`src/components/blocos/`)

| Bloco | Função de agregação | Gráfico |
|---|---|---|
| `BlocoCPUE.tsx` | `calcularCPUE` | AreaChart (CPUEn + CPUEb) |
| `BlocoFroese.tsx` | `calcularFroese` | BarChart empilhado (classes de comprimento) |
| `BlocoEsforco.tsx` | `calcularEsforco` | LineChart com ReferenceLine em y=8 |
| `BlocoEspecies.tsx` | `calcularEspecies` | PieChart (donut) + tabela |
| `BlocoRanking.tsx` | `calcularRankingPirangueiros` | Cards com barras de progresso |

## Domain Rules

### Filtros
- Granularidade `'entre-datas'`: ignora o filtro de temporadas; usa `dataInicio`/`dataFim`
- Granularidade `'semana'`: chave `"YYYY-Www"` usando ISO week (trata virada de ano corretamente)
- `nBarcos` na CPUE = `barcos.size || 1` onde o set armazena `"data-barcoId"` (barcos-dia únicos)

### Indicadores Froese (2004)
- **% Adultos**: `comprimento_cm >= especie.lm_cm`
- **% Comprimento Ótimo**: `comprimento_cm ∈ [lopt_cm × 0.9, lopt_cm × 1.1]`
- **% Megarreprodutores**: `comprimento_cm > lopt_cm × 1.1`
- Meta de megarreprodutores: 30–40% indica estoque saudável; < 20% = atenção

### Limite de esforço (anuência IBAMA)
- Máximo 8 embarcações/dia — linha de referência vermelha tracejada no `BlocoEsforco`

## Design Tokens

Paleta fixa (tema claro institucional — não usar dark mode):

| Uso | Hex |
|---|---|
| Background | `#f1f5f9` |
| Card surface | `#ffffff` |
| Border | `#e2e8f0` |
| Text primary | `#0f172a` |
| Text secondary | `#475569` |
| Text muted (labels, unidades) | `#64748b` |
| Accent / série principal | `#1d4ed8` |

Cores por espécie: Tucunaré `#1d4ed8`, Bicuda `#8b5cf6`, Cachorra Larga `#0d9488`, Cachorra Facão `#f59e0b`, Piraíba `#ef4444`, Jaú `#ec4899`.

Badges de variação: positiva `bg-emerald-100 text-emerald-700`, negativa `bg-red-100 text-red-700`.

## Gotchas

- `tsconfig.app.json` não tem `baseUrl` (removido — causava erro TS de deprecação); usa apenas `paths` para o alias `@/`
- Tailwind v4 não usa `tailwind.config.js`; classes arbitrárias como `text-[#0f172a]` funcionam diretamente
- O mock usa RNG linear congruencial com seed 42 — resultados são determinísticos; não alterar o seed sem regenerar os testes visuais
- `peso_g` pode ser `null` nos dados; em `calcularCPUE` usar `c.peso_g != null ? c.peso_g : c.comprimento_cm * 8.5` (não `??` puro, pois `0` seria falsy incorretamente — embora na prática o mock nunca gere 0)
- O mapa usa tiles Esri World Imagery sem autenticação — funciona em localhost; em produção verificar ToS da Esri
