'use client'
import { useEffect, useState } from 'react'
import { Badge }    from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface DashboardData {
  coleccionActiva:       { id_coleccion: string; nombre: string; temporada: string; fecha_lanzamiento: string } | null
  totalSkusActivos:      number
  totalUnidades:         number
  solicitudesPendientes: number
  prendasRezagadas:      number
  stockReciente:         StockItem[]
}

interface StockItem {
  id_sku:           string
  codigo_sku:       string
  nombre_prenda:    string
  talla:            string
  stock:            number
  stock_inicial:    number
  categoria:        string
  coleccion:        string
  estado_coleccion: string
}

function stockVariant(stock: number): 'destructive' | 'warning' | 'success' {
  if (stock === 0)  return 'destructive'
  if (stock <= 5)   return 'warning'
  return 'success'
}

function fmtFecha(s: string) {
  return new Date(s + 'T00:00:00').toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const col = data?.coleccionActiva

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', letterSpacing: '0.2px' }}>
          Dashboard
        </h2>
        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
          Resumen del sistema en tiempo real
        </p>
      </div>

      {/* ── Colección activa ── */}
      {loading ? (
        <Skeleton style={{ height: '68px', borderRadius: '12px', marginBottom: '20px' }} />
      ) : col ? (
        <div style={{
          backgroundColor: '#111113',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '16px 22px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            backgroundColor: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0,
          }} />
          <div>
            <p style={{ fontSize: '9px', color: '#3f3f46', letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '3px' }}>
              Colección activa
            </p>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>{col.nombre}</p>
            <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>
              {col.temporada} · {fmtFecha(col.fecha_lanzamiento)}
            </p>
          </div>
        </div>
      ) : null}

      {/* ── Métricas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} style={{ height: '90px', borderRadius: '12px' }} />
            ))
          : [
              { label: 'Unidades en bodega', value: data?.totalUnidades ?? 0,        sub: 'Stock disponible',      warn: false },
              { label: 'Referencias SKU',    value: data?.totalSkusActivos ?? 0,      sub: 'SKUs activos',          warn: false },
              { label: 'Solicitudes pend.',  value: data?.solicitudesPendientes ?? 0, sub: 'Sin procesar',          warn: !!(data?.solicitudesPendientes) },
              { label: 'Prendas rezagadas',  value: data?.prendasRezagadas ?? 0,      sub: 'Colecciones inactivas', warn: !!(data?.prendasRezagadas) },
            ].map(m => (
              <div key={m.label} style={{
                backgroundColor: '#111113',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '18px 20px',
              }}>
                <p style={{ fontSize: '10px', color: '#52525b', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {m.label}
                </p>
                <p style={{
                  fontSize: '26px', fontWeight: '700', lineHeight: 1,
                  color: m.warn ? (m.label.includes('rezagadas') ? '#b84444' : '#c8922a') : '#ffffff',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {m.value}
                </p>
                <p style={{ fontSize: '11px', color: '#3f3f46', marginTop: '6px' }}>{m.sub}</p>
              </div>
            ))
        }
      </div>

      {/* ── Tabla stock reciente ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Stock colección activa
          </h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                {['Código SKU', 'Prenda', 'Talla', 'Stock inicial', 'Stock actual'].map(h => (
                  <th key={h} style={{
                    padding: '10px 20px', textAlign: 'left',
                    fontSize: '10px', color: '#3f3f46', fontWeight: '500',
                    textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} style={{ padding: '10px 20px' }}>
                      <Skeleton style={{ height: '16px', borderRadius: '4px' }} />
                    </td>
                  </tr>
                ))
              )}
              {!loading && (data?.stockReciente ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
                    Sin datos de stock
                  </td>
                </tr>
              )}
              {!loading && (data?.stockReciente ?? []).map(item => (
                <tr key={item.id_sku} style={{ borderBottom: '1px solid #1c1c1f' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '12px 20px', color: '#52525b', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    {item.codigo_sku}
                  </td>
                  <td style={{ padding: '12px 20px', color: '#e4e4e7', fontWeight: '500' }}>
                    {item.nombre_prenda}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <span style={{
                      backgroundColor: '#1c1c1f', color: '#71717a',
                      padding: '2px 8px', borderRadius: '4px',
                      fontSize: '11px', fontFamily: 'var(--font-mono)',
                    }}>
                      {item.talla}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', color: '#52525b', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                    {item.stock_inicial}
                  </td>
                  <td style={{ padding: '12px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontWeight: '700', fontSize: '15px', fontFamily: 'var(--font-mono)',
                        color: item.stock === 0 ? '#3f3f46' : item.stock <= 5 ? '#c8922a' : '#22c55e',
                      }}>
                        {item.stock}
                      </span>
                      <Badge variant={stockVariant(item.stock)}>
                        {item.stock === 0 ? 'Agotado' : item.stock <= 5 ? 'Bajo' : 'OK'}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
