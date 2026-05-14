import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { CAPTURAS_MOCK } from '@/data/mock'
import { ESPECIES } from '@/data/especies'
import type { Captura } from '@/types'

// Centro da TI Pequizal do Naruv'ytu
const CENTRO: [number, number] = [-11.72, -53.58]
const ZOOM_INICIAL = 13

// Corrige o ícone padrão quebrado do Leaflet no Vite
import L from 'leaflet'
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl

type ModoTempo = 'ao-vivo' | 'historico'

// Captura o mapa e expõe flyTo
function MapController({ centro, zoom }: { centro: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(centro, zoom)
  }, [map, centro, zoom])
  return null
}

function horaLabel(h: number) {
  return `${String(h).padStart(2, '0')}:00`
}

function formatarData(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function MapaPage() {
  const [modo, setModo] = useState<ModoTempo>('historico')
  const [dataSelecionada, setDataSelecionada] = useState<string>('2024-04-15')
  const [horaAtual, setHoraAtual] = useState<number>(6)
  const [reproduzindo, setReproduzindo] = useState(false)
  const [especieDestaque, setEspecieDestaque] = useState<string | null>(null)
  const [opacidadeAnteriores, setOpacidadeAnteriores] = useState(0.25)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Datas disponíveis no mock
  const datasDisponiveis = useMemo(() => {
    const set = new Set(CAPTURAS_MOCK.map((c) => c.data))
    return Array.from(set).sort()
  }, [])

  // Capturas do dia selecionado
  const capturasDoDia = useMemo(() => {
    const dataAlvo = modo === 'ao-vivo'
      ? datasDisponiveis[datasDisponiveis.length - 1]
      : dataSelecionada
    return CAPTURAS_MOCK.filter((c) => c.data === dataAlvo)
  }, [modo, dataSelecionada, datasDisponiveis])

  // Horas disponíveis no dia
  const horasDisponiveis = useMemo(() => {
    const horas = new Set(capturasDoDia.map((c) => parseInt(c.datetime.split('T')[1].split(':')[0])))
    return Array.from(horas).sort((a, b) => a - b)
  }, [capturasDoDia])

  // Capturas para mostrar no mapa
  const capturasMostradas = useMemo(() => {
    const horasAMostrar = horasDisponiveis.filter((h) => h <= horaAtual)
    return capturasDoDia.filter((c) => {
      const h = parseInt(c.datetime.split('T')[1].split(':')[0])
      if (!horasAMostrar.includes(h)) return false
      if (especieDestaque && c.especie_id !== especieDestaque) return false
      return true
    })
  }, [capturasDoDia, horaAtual, horasDisponiveis, especieDestaque])

  // Autoplay: avança uma hora a cada 10s
  const avancarHora = useCallback(() => {
    setHoraAtual((h) => {
      const idx = horasDisponiveis.indexOf(h)
      if (idx < horasDisponiveis.length - 1) return horasDisponiveis[idx + 1]
      setReproduzindo(false)
      return h
    })
  }, [horasDisponiveis])

  useEffect(() => {
    if (reproduzindo) {
      intervalRef.current = setInterval(avancarHora, 10000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [reproduzindo, avancarHora])

  // Reset ao mudar data
  useEffect(() => {
    setReproduzindo(false)
    if (horasDisponiveis.length) setHoraAtual(horasDisponiveis[0])
  }, [dataSelecionada, modo, horasDisponiveis])

  function getOpacidade(captura: Captura) {
    const h = parseInt(captura.datetime.split('T')[1].split(':')[0])
    return h === horaAtual ? 0.85 : opacidadeAnteriores
  }

  const contagemPorEspecie = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of capturasMostradas) {
      map.set(c.especie_id, (map.get(c.especie_id) ?? 0) + 1)
    }
    return map
  }, [capturasMostradas])

  return (
    <div className="flex h-screen flex-col bg-[#f1f5f9]">
      {/* Header da página */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-4 py-3">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-xs text-[#94a3b8] hover:text-[#475569] transition-colors">
            ← Dashboard
          </a>
          <span className="text-[#cbd5e1]">/</span>
          <h1 className="text-sm font-semibold text-[#0f172a]">Mapa de Capturas</h1>
        </div>
        <span className="text-xs text-[#94a3b8]">
          {capturasMostradas.length} capturas visíveis · até {horaLabel(horaAtual)}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Painel lateral de controles */}
        <aside className="flex w-72 flex-col gap-4 overflow-y-auto border-r border-[#e2e8f0] bg-[#f8fafc] p-4">

          {/* Modo */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Modo de tempo</p>
            <div className="flex rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] p-0.5">
              {(['historico', 'ao-vivo'] as ModoTempo[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setModo(m)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${
                    modo === m ? 'bg-[#1d4ed8] text-[#f1f5f9]' : 'text-[#94a3b8]'
                  }`}
                >
                  {m === 'ao-vivo' ? '🔴 Ao Vivo' : '📅 Histórico'}
                </button>
              ))}
            </div>
          </div>

          {/* Seleção de data (modo histórico) */}
          {modo === 'historico' && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Data</p>
              <select
                value={dataSelecionada}
                onChange={(e) => setDataSelecionada(e.target.value)}
                className="w-full rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-3 py-2 text-xs text-[#0f172a] outline-none focus:border-[#1d4ed8]"
              >
                {datasDisponiveis.map((d) => (
                  <option key={d} value={d}>{formatarData(d)}</option>
                ))}
              </select>
            </div>
          )}

          {/* Controles de animação */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
              Animação — cada hora = 10s
            </p>

            {/* Hora atual */}
            <div className="mb-3 flex items-center justify-between rounded-lg bg-[#ffffff] px-3 py-2">
              <span className="text-xs text-[#475569]">Hora atual</span>
              <span className="text-lg font-bold text-[#1d4ed8]">{horaLabel(horaAtual)}</span>
            </div>

            {/* Slider de hora */}
            <input
              type="range"
              min={horasDisponiveis[0] ?? 6}
              max={horasDisponiveis[horasDisponiveis.length - 1] ?? 18}
              value={horaAtual}
              step={1}
              onChange={(e) => {
                setReproduzindo(false)
                setHoraAtual(parseInt(e.target.value))
              }}
              className="mb-3 w-full accent-[#1d4ed8]"
            />

            {/* Play/Pause/Reset */}
            <div className="flex gap-2">
              <button
                onClick={() => setReproduzindo((v) => !v)}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1d4ed8] py-2 text-xs font-semibold text-[#f1f5f9] hover:bg-[#1e40af] transition-colors"
              >
                {reproduzindo ? '⏸ Pausar' : '▶ Play'}
              </button>
              <button
                onClick={() => {
                  setReproduzindo(false)
                  if (horasDisponiveis.length) setHoraAtual(horasDisponiveis[0])
                }}
                className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-xs text-[#94a3b8] hover:text-[#475569] transition-colors"
              >
                ↺
              </button>
            </div>
          </div>

          {/* Opacidade capturas anteriores */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Capturas anteriores</p>
              <span className="text-xs text-[#475569]">{Math.round(opacidadeAnteriores * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.6}
              step={0.05}
              value={opacidadeAnteriores}
              onChange={(e) => setOpacidadeAnteriores(parseFloat(e.target.value))}
              className="w-full accent-[#1d4ed8]"
            />
          </div>

          {/* Filtro por espécie */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">Espécies</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setEspecieDestaque(null)}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                  especieDestaque === null ? 'bg-[#e2e8f0] text-[#0f172a]' : 'text-[#94a3b8] hover:bg-[#ffffff]'
                }`}
              >
                <span>Todas</span>
                <span className="text-[#94a3b8]">{capturasDoDia.length}</span>
              </button>
              {ESPECIES.map((e) => {
                const total = contagemPorEspecie.get(e.id) ?? 0
                return (
                  <button
                    key={e.id}
                    onClick={() => setEspecieDestaque(especieDestaque === e.id ? null : e.id)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                      especieDestaque === e.id ? 'text-[#f1f5f9] font-medium' : 'text-[#94a3b8] hover:bg-[#ffffff]'
                    }`}
                    style={especieDestaque === e.id ? { backgroundColor: e.cor } : {}}
                  >
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.cor }} />
                      {e.nome_popular}
                    </span>
                    <span>{total}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">Legenda</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-[10px] text-[#475569]">
                <div className="h-3 w-3 rounded-full border-2 border-[#1d4ed8] bg-[#1d4ed833]" />
                Captura da hora atual
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#475569]">
                <div className="h-3 w-3 rounded-full border border-[#cbd5e1] bg-[#cbd5e133]" />
                Capturas anteriores (fade)
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#475569]">
                <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                Peixe grande (≥ Lopt)
              </div>
            </div>
          </div>
        </aside>

        {/* Mapa */}
        <div className="relative flex-1">
          <MapContainer
            center={CENTRO}
            zoom={ZOOM_INICIAL}
            style={{ height: '100%', width: '100%', background: '#f1f5f9' }}
            zoomControl={true}
          >
            <MapController centro={CENTRO} zoom={ZOOM_INICIAL} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN'
              maxZoom={19}
            />

            {capturasMostradas.map((c) => {
              const especie = ESPECIES.find((e) => e.id === c.especie_id)
              if (!especie) return null
              const horaC = parseInt(c.datetime.split('T')[1].split(':')[0])
              const ehAtual = horaC === horaAtual
              const opacidade = getOpacidade(c)
              const ehGrande = c.comprimento_cm >= especie.lopt_cm
              const raio = ehGrande ? 8 : 5

              return (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lon]}
                  radius={raio}
                  pathOptions={{
                    color: ehAtual ? especie.cor : '#cbd5e1',
                    fillColor: ehGrande ? '#ef4444' : especie.cor,
                    fillOpacity: opacidade,
                    weight: ehAtual ? 2 : 1,
                    opacity: opacidade,
                  }}
                >
                  <Popup className="pescra-popup">
                    <div style={{ background: '#ffffff', color: '#0f172a', borderRadius: 8, padding: 12, minWidth: 180 }}>
                      <p style={{ color: especie.cor, fontWeight: 700, marginBottom: 4 }}>
                        {especie.emoji} {especie.nome_popular}
                      </p>
                      <p style={{ fontSize: 11, color: '#475569', fontStyle: 'italic', marginBottom: 8 }}>
                        {especie.nome_cientifico}
                      </p>
                      <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <p>📏 {c.comprimento_cm} cm {ehGrande ? '⭐ grande' : ''}</p>
                        {c.peso_g && <p>⚖️ {c.peso_g} g</p>}
                        <p>🕐 {c.datetime.split('T')[1].slice(0, 5)}</p>
                        <p>🚤 {c.barco_id}</p>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>

          {/* HUD — hora atual sobreposto no mapa */}
          <div className="pointer-events-none absolute right-4 top-4 z-[1000] flex flex-col items-end gap-2">
            <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff]/95 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Hora exibida</p>
              <p className="text-3xl font-bold text-[#1d4ed8]">{horaLabel(horaAtual)}</p>
              <p className="text-xs text-[#94a3b8]">
                {modo === 'ao-vivo' ? 'Ao Vivo' : formatarData(dataSelecionada)}
              </p>
            </div>
            {reproduzindo && (
              <div className="rounded-full border border-[#1d4ed8] bg-[#ffffff]/95 px-3 py-1.5 text-xs font-medium text-[#1d4ed8] backdrop-blur-md">
                ▶ Reproduzindo
              </div>
            )}
          </div>

          {/* Mini-legenda de espécies sobreposta */}
          <div className="pointer-events-none absolute bottom-6 left-4 z-[1000] rounded-xl border border-[#cbd5e1] bg-[#ffffff]/95 px-3 py-3 backdrop-blur-md">
            <p className="mb-2 text-[10px] uppercase tracking-wider text-[#94a3b8]">Espécies visíveis</p>
            <div className="flex flex-col gap-1">
              {ESPECIES.filter((e) => (contagemPorEspecie.get(e.id) ?? 0) > 0).map((e) => (
                <div key={e.id} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.cor }} />
                  <span className="text-[#475569]">{e.nome_popular}</span>
                  <span className="ml-auto text-[#94a3b8]">{contagemPorEspecie.get(e.id)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
