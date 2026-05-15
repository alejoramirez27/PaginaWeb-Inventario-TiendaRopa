'use client'
import { useEffect, useState } from 'react'
import { toast }    from 'sonner'
import { Button }   from '@/components/ui/button'
import { Badge }    from '@/components/ui/badge'
import { Input }    from '@/components/ui/input'
import { Label }    from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Zap, Trash2 } from 'lucide-react'

interface Coleccion {
  id_coleccion:      string
  nombre:            string
  temporada:         string
  fecha_lanzamiento: string
  estado:            'activa' | 'inactiva'
}

function fmtFecha(s: string) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ColeccionesPage() {
  const [colecciones, setColecciones] = useState<Coleccion[]>([])
  const [loading, setLoading]         = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]     = useState(false)
  const [form, setForm] = useState({ nombre: '', temporada: '', fecha_lanzamiento: '', estado: 'inactiva' })

  const cargar = () => {
    setLoading(true)
    fetch('/api/colecciones')
      .then(r => r.json())
      .then(d => { setColecciones(d); setLoading(false) })
  }

  useEffect(() => { cargar() }, [])

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    const res  = await fetch('/api/colecciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) {
      toast.error(data.error ?? 'Error al crear la colección')
    } else {
      toast.success('Colección creada correctamente')
      setForm({ nombre: '', temporada: '', fecha_lanzamiento: '', estado: 'inactiva' })
      setMostrarForm(false)
      cargar()
    }
    setGuardando(false)
  }

  const handleActivar = async (col: Coleccion) => {
    if (col.estado === 'activa') return
    const res  = await fetch(`/api/colecciones/${col.id_coleccion}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...col, estado: 'activa' }),
    })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al activar')
    else { toast.success(`"${col.nombre}" activada`); cargar() }
  }

  const handleEliminar = async (col: Coleccion) => {
    if (!confirm(`¿Eliminar "${col.nombre}"?`)) return
    const res  = await fetch(`/api/colecciones/${col.id_coleccion}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) toast.error(data.error ?? 'Error al eliminar')
    else { toast.success('Colección eliminada'); cargar() }
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>Colecciones</h2>
          <p style={{ fontSize: '12px', color: '#52525b', marginTop: '4px' }}>
            Solo puede haber una colección activa a la vez
          </p>
        </div>
        <Button onClick={() => setMostrarForm(!mostrarForm)} size="sm">
          <Plus style={{ width: '14px', height: '14px' }} />
          {mostrarForm ? 'Cancelar' : 'Nueva Colección'}
        </Button>
      </div>

      {/* ── Formulario ── */}
      {mostrarForm && (
        <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Nueva Colección
          </p>
          <form onSubmit={handleCrear}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Nombre *</Label>
                <Input required value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  placeholder="ej: Colección Otoño 2025" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Temporada *</Label>
                <Input required value={form.temporada}
                  onChange={e => setForm({ ...form, temporada: e.target.value })}
                  placeholder="ej: Otoño-Invierno 2025" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Fecha de Lanzamiento</Label>
                <Input type="date" value={form.fecha_lanzamiento}
                  onChange={e => setForm({ ...form, fecha_lanzamiento: e.target.value })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Label>Estado Inicial</Label>
                <select value={form.estado}
                  onChange={e => setForm({ ...form, estado: e.target.value })}
                  style={selectStyle}>
                  <option value="inactiva">Inactiva</option>
                  <option value="activa">Activa</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={guardando} size="sm">
              {guardando ? 'Guardando…' : 'Crear Colección'}
            </Button>
          </form>
        </div>
      )}

      {/* ── Tabla ── */}
      <div style={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #27272a' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
            Todas las colecciones{' '}
            <span style={{ color: '#52525b', fontWeight: '400' }}>({colecciones.length})</span>
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} style={{ height: '44px', borderRadius: '6px' }} />)}
          </div>
        ) : colecciones.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#3f3f46', fontSize: '13px' }}>No hay colecciones registradas</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1c1c1f' }}>
                {['Nombre', 'Temporada', 'Lanzamiento', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {colecciones.map(col => (
                <tr key={col.id_coleccion} style={{ borderBottom: '1px solid #1c1c1f' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#18181b')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '14px 22px', fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>
                    {col.nombre}
                  </td>
                  <td style={{ padding: '14px 22px', fontSize: '13px', color: '#71717a' }}>
                    {col.temporada || '—'}
                  </td>
                  <td style={{ padding: '14px 22px', fontSize: '13px', color: '#71717a' }}>
                    {fmtFecha(col.fecha_lanzamiento)}
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <Badge variant={col.estado === 'activa' ? 'success' : 'secondary'}>
                      {col.estado === 'activa' ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td style={{ padding: '14px 22px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {col.estado === 'inactiva' && (
                        <Button variant="outline" size="icon-sm" onClick={() => handleActivar(col)} title="Activar">
                          <Zap style={{ width: '12px', height: '12px' }} />
                        </Button>
                      )}
                      <Button variant="destructive" size="icon-sm" onClick={() => handleEliminar(col)} title="Eliminar">
                        <Trash2 style={{ width: '12px', height: '12px' }} />
                      </Button>
                    </div>
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
