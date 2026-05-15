'use client'
import { useEffect, useState } from 'react'
import { toast }    from 'sonner'
import { Button }   from '@/components/ui/button'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, ArrowUpRight } from 'lucide-react'

interface Salida {
  id_salida:    string
  fecha_salida: string
  cantidad:     number
  observacion:  string | null
  sku:          { codigo_sku: string; talla: string; prenda: { nombre: string; categoria: string } }
  usuario:      { nombre: string }
  cliente:      { nombre: string; ciudad: string; departamento: string }
}
interface Opcion { id: string; nombre: string }

function fmtFecha(s: string) {
  return new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function SalidasPage() {
  const [salidas, setSalidas]         = useState<Salida[]>([])
  const [loading, setLoading]         = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [skus, setSkus]               = useState<any[]>([])
  const [usuarios, setUsuarios]       = useState<Opcion[]>([])
  const [clientes, setClientes]       = useState<any[]>([])

  const [form, setForm] = useState({ id_sku: '', id_usuario: '', id_cliente: '', cantidad: '', observacion: '' })

  const cargarSalidas = () => {
    setLoading(true)
    fetch('/api/salidas')
      .then(r => r.json())
      .then(d => { setSalidas(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { setSalidas([]); setLoading(false) })
  }

  const cargarSelects = () => {
    fetch('/api/sku').then(r => r.json()).then(setSkus)
    fetch('/api/usuarios').then(r => r.json())
      .then(d => setUsuarios(d.map((u: any) => ({ id: u.id_usuario, nombre: `${u.nombre} (${u.rol})` }))))
    fetch('/api/clientes').then(r => r.json())
      .then(d => setClientes(Array.isArray(d) ? d.filter((c: any) => c.estado === 'activo') : []))
  }

  useEffect(() => { cargarSalidas(); cargarSelects() }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault(); setGuardando(true)
    const res  = await fetch('/api/salidas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, cantidad: Number(form.cantidad) }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al registrar salida')
    } else {
      toast.success('Salida registrada — stock descontado')
      setForm({ id_sku: '', id_usuario: '', id_cliente: '', cantidad: '', observacion: '' })
      setMostrarForm(false); cargarSalidas()
    }
    setGuardando(false)
  }

  const skuSel     = skus.find(s => s.id_sku === form.id_sku)
  const clienteSel = clientes.find(c => c.id_cliente === form.id_cliente)

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Salidas de Bodega</h2>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            Despachos hacia aliados multimarca — stock descontado automáticamente
          </p>
        </div>
        <Button size="sm" onClick={() => setMostrarForm(!mostrarForm)}>
          <Plus style={{ width: '14px', height: '14px' }} />
          {mostrarForm ? 'Cancelar' : 'Nueva Salida'}
        </Button>
      </div>

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Registrar Salida
          </p>
          <form onSubmit={handleCrear}>
            {/* Fila 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>SKU *</Label>
                <select required value={form.id_sku} onChange={e => setForm({ ...form, id_sku: e.target.value })} style={selectStyle}>
                  <option value="">Selecciona SKU</option>
                  {skus.map((s: any) => (
                    <option key={s.id_sku} value={s.id_sku}>
                      {s.codigo_sku} — Talla {s.talla} (Stock: {s.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Cantidad *</Label>
                <Input required type="number" min="1" value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })} placeholder="ej: 5" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Responsable *</Label>
                <select required value={form.id_usuario} onChange={e => setForm({ ...form, id_usuario: e.target.value })} style={selectStyle}>
                  <option value="">Selecciona usuario</option>
                  {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Preview SKU */}
            {skuSel && (
              <div style={previewBox}>
                <PreviewItem label="Prenda"  value={skuSel.prenda?.nombre ?? '—'} />
                <PreviewItem label="Talla"   value={skuSel.talla} bold />
                <PreviewItem label="Stock disponible" value={`${skuSel.stock} unidades`}
                  valueColor={skuSel.stock > 0 ? '#22c55e' : '#b84444'} bold />
              </div>
            )}

            {/* Fila 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              <Label>Aliado destino *</Label>
              <select required value={form.id_cliente} onChange={e => setForm({ ...form, id_cliente: e.target.value })} style={selectStyle}>
                <option value="">Selecciona el aliado multimarca</option>
                {clientes.map((c: any) => (
                  <option key={c.id_cliente} value={c.id_cliente}>
                    {c.nombre} — {c.ciudad}, {c.departamento}
                  </option>
                ))}
              </select>
            </div>

            {/* Preview cliente */}
            {clienteSel && (
              <div style={previewBox}>
                <PreviewItem label="Aliado"      value={clienteSel.nombre} />
                <PreviewItem label="Ciudad"      value={clienteSel.ciudad} />
                <PreviewItem label="Departamento" value={clienteSel.departamento ?? '—'} />
                {clienteSel.telefono && <PreviewItem label="Teléfono" value={clienteSel.telefono} />}
              </div>
            )}

            {/* Observación */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              <Label>Observación</Label>
              <Input value={form.observacion} onChange={e => setForm({ ...form, observacion: e.target.value })}
                placeholder="Notas adicionales sobre el despacho…" />
            </div>

            <Button type="submit" disabled={guardando} size="sm">
              {guardando ? 'Registrando…' : 'Registrar Salida'}
            </Button>
          </form>
        </div>
      )}

      {/* ── Historial ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Historial de salidas{' '}
            <span style={{ color: '#52525b', fontWeight: '400' }}>({salidas.length})</span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} style={{ height: '52px', borderRadius: '6px' }} />)}
          </div>
        ) : salidas.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#3f3f46', fontSize: '13px' }}>
            No hay salidas registradas
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                {['Prenda', 'SKU / Talla', 'Cantidad', 'Aliado destino', 'Fecha'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salidas.map(s => (
                <tr key={s.id_salida} style={{ borderBottom: '1px solid #1c1c1f' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 22px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{s.sku?.prenda?.nombre ?? '—'}</p>
                    <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.sku?.prenda?.categoria ?? '—'}</p>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <p style={{ fontSize: '11px', color: '#52525b', fontFamily: 'var(--font-mono)' }}>{s.sku?.codigo_sku}</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginTop: '2px' }}>Talla {s.sku?.talla}</p>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowUpRight style={{ width: '13px', height: '13px', color: '#b84444' }} />
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#b84444', fontFamily: 'var(--font-mono)' }}>
                        {s.cantidad}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{s.cliente?.nombre ?? '—'}</p>
                    <p style={{ fontSize: '11px', color: '#52525b', marginTop: '2px' }}>
                      {s.cliente?.ciudad}{s.cliente?.departamento ? `, ${s.cliente.departamento}` : ''}
                    </p>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <p style={{ fontSize: '12px', color: '#71717a' }}>{fmtFecha(s.fecha_salida)}</p>
                    {s.observacion && (
                      <p style={{ fontSize: '11px', color: '#3f3f46', marginTop: '3px', fontStyle: 'italic' }}>
                        "{s.observacion}"
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function PreviewItem({ label, value, bold, valueColor }: { label: string; value: string; bold?: boolean; valueColor?: string }) {
  return (
    <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid #27272a', marginRight: '20px' }}>
      <p style={{ fontSize: '10px', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>{label}</p>
      <p style={{ fontSize: '13px', color: valueColor ?? '#e4e4e7', fontWeight: bold ? '600' : '400' }}>{value}</p>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 22px', textAlign: 'left',
  fontSize: '10px', color: '#3f3f46', fontWeight: '500',
  textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap',
}

const selectStyle: React.CSSProperties = {
  width: '100%', height: '36px',
  backgroundColor: '#18181b', border: '1px solid #27272a',
  borderRadius: '6px', padding: '0 12px',
  fontSize: '13px', color: '#e4e4e7', outline: 'none',
}

const previewBox: React.CSSProperties = {
  backgroundColor: '#0d0d0f', border: '1px solid #27272a',
  borderRadius: '8px', padding: '14px 18px',
  marginBottom: '14px', display: 'flex', flexWrap: 'wrap',
}
