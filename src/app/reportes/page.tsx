'use client'
import { useEffect, useState } from 'react'
import { Badge }    from '@/components/ui/badge'
import { Input }    from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search }   from 'lucide-react'

interface Resumen {
  totalStock: number; totalRezagadas: number; totalSalidas: number
  skusActivos: number; solicitudesPendientes: number
}
interface StockItem  { codigo_sku: string; nombre_prenda: string; categoria: string; talla: string; stock: number; nombre_coleccion: string }
interface Rezagada   { codigo_sku: string; nombre_prenda: string; talla: string; stock: number; nombre_coleccion: string }
interface Salida     { id_salida: string; fecha_salida: string; cantidad: number; observacion: string | null;
                       sku: { codigo_sku: string; talla: string; prenda: { nombre: string } }; usuario: { nombre: string } }
interface Solicitud  { id_solicitud: string; fecha_solicitud: string; estado: string; proveedor: { nombre: string } }

type Tab = 'stock' | 'rezagadas' | 'salidas' | 'solicitudes'

function fmtFecha(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function estadoVariant(e: string) {
  if (e === 'recibido_completo') return 'success'  as const
  if (e === 'recibido_parcial')  return 'warning'  as const
  return 'outline' as const
}

export default function ReportesPage() {
  const [loading, setLoading]       = useState(true)
  const [resumen, setResumen]       = useState<Resumen | null>(null)
  const [stockActual, setStockActual] = useState<StockItem[]>([])
  const [rezagadas, setRezagadas]   = useState<Rezagada[]>([])
  const [salidas, setSalidas]       = useState<Salida[]>([])
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [tab, setTab]               = useState<Tab>('stock')
  const [busqueda, setBusqueda]     = useState('')

  useEffect(() => {
    fetch('/api/reportes').then(r => r.json()).then(d => {
      setResumen(d.resumen); setStockActual(d.stockActual)
      setRezagadas(d.rezagadas); setSalidas(d.salidas)
      setSolicitudes(d.solicitudes); setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const stockFiltrado       = stockActual.filter(i => i.nombre_prenda?.toLowerCase().includes(busqueda.toLowerCase()) || i.codigo_sku?.toLowerCase().includes(busqueda.toLowerCase()))
  const rezagadasFiltradas  = rezagadas.filter(i => i.nombre_prenda?.toLowerCase().includes(busqueda.toLowerCase()) || i.codigo_sku?.toLowerCase().includes(busqueda.toLowerCase()))
  const salidasFiltradas    = salidas.filter(i => i.sku?.prenda?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || i.sku?.codigo_sku?.toLowerCase().includes(busqueda.toLowerCase()))
  const solicitudesFiltradas = solicitudes.filter(i => i.proveedor?.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || i.estado?.toLowerCase().includes(busqueda.toLowerCase()))

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'stock',       label: 'Stock Activo', count: stockActual.length },
    { key: 'rezagadas',   label: 'Rezagadas',    count: rezagadas.length },
    { key: 'salidas',     label: 'Salidas',      count: salidas.length },
    { key: 'solicitudes', label: 'Solicitudes',  count: solicitudes.length },
  ]

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Reportes</h2>
        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
          Visión general del inventario, movimientos y solicitudes
        </p>
      </div>

      {/* ── Métricas ── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} style={{ height: '80px', borderRadius: '12px' }} />)}
        </div>
      ) : resumen && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Unidades bodega',     value: resumen.totalStock,            color: '#ffffff' },
            { label: 'SKUs activos',         value: resumen.skusActivos,           color: '#71717a' },
            { label: 'Rezagadas',            value: resumen.totalRezagadas,        color: resumen.totalRezagadas > 0 ? '#c8922a' : '#3f3f46' },
            { label: 'Despachadas',          value: resumen.totalSalidas,          color: '#b84444' },
            { label: 'Sol. pendientes',      value: resumen.solicitudesPendientes, color: resumen.solicitudesPendientes > 0 ? '#22c55e' : '#3f3f46' },
          ].map(c => (
            <div key={c.label} style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '16px 18px' }}>
              <p style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>{c.label}</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: c.color, fontFamily: 'var(--font-mono)' }}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Buscador + Tabs ── */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        {/* Buscador */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px', maxWidth: '360px' }}>
          <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#3f3f46' }} />
          <Input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por prenda, SKU…" style={{ paddingLeft: '32px' }} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '2px', backgroundColor: '#111113', padding: '3px', borderRadius: '8px', border: '1px solid #27272a' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '12px', fontWeight: tab === t.key ? '600' : '400',
              backgroundColor: tab === t.key ? '#ffffff' : 'transparent',
              color: tab === t.key ? '#09090b' : '#71717a',
              transition: 'all 0.12s',
            }}>
              {t.label}
              <span style={{ marginLeft: '6px', fontSize: '10px', opacity: 0.6 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>

        {/* STOCK ACTIVO */}
        {tab === 'stock' && (
          <>
            <div style={panelHeader}>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>Stock en colección activa</span>
              <span style={{ color: '#52525b' }}>({stockFiltrado.length} SKUs)</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                  {['Prenda', 'Categoría', 'SKU', 'Talla', 'Stock'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} style={{ padding: '10px 22px' }}><Skeleton style={{ height: '14px', borderRadius: '4px' }} /></td></tr>
                ))}
                {!loading && stockFiltrado.length === 0 && <EmptyRow colSpan={5} />}
                {!loading && stockFiltrado.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1c1c1f' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={tdStyle}><p style={{ color: '#e4e4e7', fontWeight: '500', fontSize: '13px' }}>{item.nombre_prenda}</p></td>
                    <td style={tdStyle}><p style={{ color: '#71717a', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.categoria}</p></td>
                    <td style={tdStyle}><p style={{ color: '#52525b', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{item.codigo_sku}</p></td>
                    <td style={tdStyle}><span style={{ backgroundColor: '#1c1c1f', color: '#71717a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{item.talla}</span></td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '15px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: item.stock > 10 ? '#22c55e' : item.stock > 0 ? '#c8922a' : '#3f3f46' }}>
                        {item.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* REZAGADAS */}
        {tab === 'rezagadas' && (
          <>
            <div style={panelHeader}>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>Prendas rezagadas</span>
              <span style={{ color: '#52525b' }}>SKUs con stock en colecciones inactivas ({rezagadasFiltradas.length})</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                  {['Prenda', 'SKU / Talla', 'Colección', 'Stock rezagado'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rezagadasFiltradas.length === 0 ? <EmptyRow colSpan={4} text="No hay prendas rezagadas ✓" /> : rezagadasFiltradas.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1c1c1f' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={tdStyle}><p style={{ color: '#e4e4e7', fontWeight: '500', fontSize: '13px' }}>{item.nombre_prenda}</p></td>
                    <td style={tdStyle}>
                      <p style={{ color: '#52525b', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{item.codigo_sku}</p>
                      <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '12px', marginTop: '2px' }}>Talla {item.talla}</p>
                    </td>
                    <td style={tdStyle}><p style={{ color: '#71717a', fontSize: '12px' }}>{item.nombre_coleccion}</p></td>
                    <td style={tdStyle}><span style={{ fontSize: '15px', fontWeight: '700', color: '#c8922a', fontFamily: 'var(--font-mono)' }}>{item.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* SALIDAS */}
        {tab === 'salidas' && (
          <>
            <div style={panelHeader}>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>Últimas 50 salidas de bodega</span>
              <span style={{ color: '#52525b' }}>({salidasFiltradas.length})</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                  {['Prenda', 'SKU / Talla', 'Cantidad', 'Responsable', 'Fecha'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {salidasFiltradas.length === 0 ? <EmptyRow colSpan={5} /> : salidasFiltradas.map(s => (
                  <tr key={s.id_salida} style={{ borderBottom: '1px solid #1c1c1f' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={tdStyle}><p style={{ color: '#e4e4e7', fontWeight: '500', fontSize: '13px' }}>{s.sku?.prenda?.nombre ?? '—'}</p></td>
                    <td style={tdStyle}>
                      <p style={{ color: '#52525b', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{s.sku?.codigo_sku}</p>
                      <p style={{ color: '#ffffff', fontWeight: '600', fontSize: '12px', marginTop: '2px' }}>Talla {s.sku?.talla}</p>
                    </td>
                    <td style={tdStyle}><span style={{ fontSize: '16px', fontWeight: '700', color: '#b84444', fontFamily: 'var(--font-mono)' }}>-{s.cantidad}</span></td>
                    <td style={tdStyle}><p style={{ color: '#71717a', fontSize: '12px' }}>{s.usuario?.nombre ?? '—'}</p></td>
                    <td style={tdStyle}>
                      <p style={{ color: '#71717a', fontSize: '12px' }}>{fmtFecha(s.fecha_salida)}</p>
                      {s.observacion && <p style={{ color: '#3f3f46', fontSize: '11px', marginTop: '3px', fontStyle: 'italic' }}>"{s.observacion}"</p>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* SOLICITUDES */}
        {tab === 'solicitudes' && (
          <>
            <div style={panelHeader}>
              <span style={{ color: '#ffffff', fontWeight: '600' }}>Historial de solicitudes</span>
              <span style={{ color: '#52525b' }}>({solicitudesFiltradas.length})</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                  {['Proveedor', 'Fecha', 'Estado'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.length === 0 ? <EmptyRow colSpan={3} /> : solicitudesFiltradas.map(s => (
                  <tr key={s.id_solicitud} style={{ borderBottom: '1px solid #1c1c1f' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={tdStyle}><p style={{ color: '#e4e4e7', fontWeight: '500', fontSize: '13px' }}>{s.proveedor?.nombre ?? '—'}</p></td>
                    <td style={tdStyle}><p style={{ color: '#71717a', fontSize: '12px' }}>{fmtFecha(s.fecha_solicitud)}</p></td>
                    <td style={tdStyle}>
                      <Badge variant={estadoVariant(s.estado)}>
                        {s.estado === 'recibido_completo' ? 'Completo' : s.estado === 'recibido_parcial' ? 'Parcial' : 'Pendiente'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyRow({ colSpan, text = 'Sin resultados' }: { colSpan: number; text?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '40px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
        {text}
      </td>
    </tr>
  )
}

const panelHeader: React.CSSProperties = {
  padding: '14px 22px', borderBottom: '1px solid #27272a',
  display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px',
}

const thStyle: React.CSSProperties = {
  padding: '10px 22px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '13px 22px', transition: 'background-color 0.1s',
}
