'use client'
import { useEffect, useState } from 'react'
import { Badge }    from '@/components/ui/badge'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, Search } from 'lucide-react'

interface ItemStock {
  id_sku:            string
  codigo_sku:        string
  talla:             string
  stock:             number
  stock_inicial:     number
  nombre_prenda:     string
  categoria:         string
  subcategoria:      string
  coleccion:         string
  estado_coleccion:  string
  temporada:         string
}

type FiltroCol = 'activa' | 'todas' | 'rezagadas'
type FiltroCat = 'TODAS' | 'ROPA' | 'ACCESORIOS'

export default function InventarioPage() {
  const [items, setItems]                       = useState<ItemStock[]>([])
  const [loading, setLoading]                   = useState(true)
  const [filtroColeccion, setFiltroColeccion]   = useState<FiltroCol>('activa')
  const [filtroCategoria, setFiltroCategoria]   = useState<FiltroCat>('TODAS')
  const [busqueda, setBusqueda]                 = useState('')

  const cargar = () => {
    setLoading(true)
    let url = '/api/inventario'
    if (filtroColeccion === 'activa')    url += '?soloActiva=true'
    if (filtroColeccion === 'rezagadas') url += '?soloRezagadas=true'
    fetch(url)
      .then(r => r.json())
      .then(d => { setItems(d); setLoading(false) })
  }

  useEffect(() => { cargar() }, [filtroColeccion])

  const filtrados = items.filter(i => {
    const catOk  = filtroCategoria === 'TODAS' || i.categoria === filtroCategoria
    const busOk  = busqueda === '' ||
      i.nombre_prenda.toLowerCase().includes(busqueda.toLowerCase()) ||
      i.codigo_sku.toLowerCase().includes(busqueda.toLowerCase())
    return catOk && busOk
  })

  const totalUnidades  = filtrados.reduce((s, i) => s + i.stock, 0)
  const itemsBajoStock = filtrados.filter(i => i.stock <= 5 && i.stock > 0).length
  const itemsSinStock  = filtrados.filter(i => i.stock === 0).length

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Inventario</h2>
        <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
          Stock en tiempo real por SKU, talla y colección
        </p>
      </div>

      {/* ── Métricas ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Total unidades',  value: totalUnidades,        color: '#ffffff' },
          { label: 'SKUs mostrados',  value: filtrados.length,     color: '#ffffff' },
          { label: 'Stock bajo (≤5)', value: itemsBajoStock,       color: itemsBajoStock > 0 ? '#c8922a' : '#ffffff' },
          { label: 'Sin stock',       value: itemsSinStock,        color: itemsSinStock  > 0 ? '#b84444' : '#ffffff' },
        ].map(c => (
          <div key={c.label} style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '16px 18px' }}>
            <p style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
              {c.label}
            </p>
            <p style={{ fontSize: '24px', fontWeight: '700', color: c.color, fontFamily: 'var(--font-mono)' }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Filtros ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '18px 22px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          {/* Búsqueda */}
          <div style={{ flex: 2, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label>Buscar prenda o SKU</Label>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: '#3f3f46' }} />
              <Input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="ej: Hoodie, OVER-BLK-M…"
                style={{ paddingLeft: '32px' }} />
            </div>
          </div>

          {/* Filtro colección */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label>Colección</Label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['activa', 'todas', 'rezagadas'] as FiltroCol[]).map(f => (
                <button key={f} onClick={() => setFiltroColeccion(f)} style={{
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid',
                  fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                  textTransform: 'capitalize', letterSpacing: '0.3px',
                  borderColor: filtroColeccion === f ? '#ffffff' : '#27272a',
                  backgroundColor: filtroColeccion === f ? '#ffffff' : 'transparent',
                  color: filtroColeccion === f ? '#09090b' : '#71717a',
                  transition: 'all 0.12s',
                }}>
                  {f === 'activa' ? 'Activa' : f === 'todas' ? 'Todas' : 'Rezagadas'}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro categoría */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Label>Categoría</Label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['TODAS', 'ROPA', 'ACCESORIOS'] as FiltroCat[]).map(f => (
                <button key={f} onClick={() => setFiltroCategoria(f)} style={{
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid',
                  fontSize: '11px', fontWeight: '500', cursor: 'pointer',
                  borderColor: filtroCategoria === f ? '#ffffff' : '#27272a',
                  backgroundColor: filtroCategoria === f ? '#ffffff' : 'transparent',
                  color: filtroCategoria === f ? '#09090b' : '#71717a',
                  transition: 'all 0.12s',
                }}>
                  {f === 'TODAS' ? 'Todas' : f === 'ROPA' ? 'Ropa' : 'Acces.'}
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={cargar}>
            <RefreshCw style={{ width: '13px', height: '13px' }} />
            Refrescar
          </Button>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Stock en Bodega{' '}
            <span style={{ color: '#52525b', fontWeight: '400' }}>({filtrados.length} SKUs)</span>
          </h3>
          {filtroColeccion === 'rezagadas' && (
            <Badge variant="warning">Colecciones anteriores con stock</Badge>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                {['SKU', 'Prenda', 'Subcategoría', 'Talla', 'Colección', 'Stock', 'Inicial', 'Estado'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} style={{ padding: '10px 22px' }}>
                    <Skeleton style={{ height: '14px', borderRadius: '4px' }} />
                  </td>
                </tr>
              ))}
              {!loading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
                    No hay ítems que coincidan con los filtros
                  </td>
                </tr>
              )}
              {!loading && filtrados.map(item => (
                <tr key={item.id_sku} style={{ borderBottom: '1px solid #1c1c1f' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '13px 22px', fontSize: '11px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>
                    {item.codigo_sku}
                  </td>
                  <td style={{ padding: '13px 22px', fontSize: '13px', color: '#e4e4e7', fontWeight: '500' }}>
                    {item.nombre_prenda}
                  </td>
                  <td style={{ padding: '13px 22px', fontSize: '12px', color: '#71717a' }}>
                    {item.subcategoria}
                  </td>
                  <td style={{ padding: '13px 22px' }}>
                    <span style={{ backgroundColor: '#1c1c1f', color: '#71717a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                      {item.talla}
                    </span>
                  </td>
                  <td style={{ padding: '13px 22px', fontSize: '12px', color: '#71717a' }}>
                    {item.coleccion}
                  </td>
                  <td style={{ padding: '13px 22px' }}>
                    <span style={{
                      fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-mono)',
                      color: item.stock === 0 ? '#3f3f46' : item.stock <= 5 ? '#c8922a' : '#22c55e',
                    }}>
                      {item.stock}
                    </span>
                  </td>
                  <td style={{ padding: '13px 22px', fontSize: '12px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>
                    {item.stock_inicial}
                  </td>
                  <td style={{ padding: '13px 22px' }}>
                    <Badge variant={
                      item.stock === 0    ? 'destructive' :
                      item.stock <= 5     ? 'warning'     : 'success'
                    }>
                      {item.stock === 0 ? 'Agotado' : item.stock <= 5 ? 'Bajo' : 'OK'}
                    </Badge>
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

const thStyle: React.CSSProperties = {
  padding: '10px 22px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
}
