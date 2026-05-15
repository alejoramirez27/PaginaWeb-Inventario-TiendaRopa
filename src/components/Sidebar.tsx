'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Squares2X2Icon,
  RectangleStackIcon,
  SwatchIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ArrowUpTrayIcon,
  UsersIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/24/solid'
import { MagnifyingGlassIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

interface Session {
  id:     string
  nombre: string
  rol:    'administrador' | 'bodeguero'
}

const allLinks = [
  { href: '/',            label: 'Dashboard',   Icon: Squares2X2Icon,             roles: ['administrador', 'bodeguero'] },
  { href: '/colecciones', label: 'Colecciones', Icon: RectangleStackIcon,         roles: ['administrador'] },
  { href: '/prendas',     label: 'Prendas',     Icon: SwatchIcon,                 roles: ['administrador'] },
  { href: '/inventario',  label: 'Inventario',  Icon: ArchiveBoxIcon,             roles: ['administrador', 'bodeguero'] },
  { href: '/solicitudes', label: 'Solicitudes', Icon: ClipboardDocumentListIcon,  roles: ['administrador'] },
  { href: '/salidas',     label: 'Salidas',     Icon: ArrowUpTrayIcon,            roles: ['administrador', 'bodeguero'] },
  { href: '/clientes',    label: 'Aliados',     Icon: UsersIcon,                  roles: ['administrador', 'bodeguero'] },
  { href: '/reportes',    label: 'Reportes',    Icon: PresentationChartBarIcon,   roles: ['administrador', 'bodeguero'] },
]

function parseSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const match = document.cookie.match(/(?:^|;\s*)inv_session=([^;]+)/)
    if (!match) return null
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export default function Sidebar() {
  const pathname  = usePathname()
  const [session, setSession] = useState<Session | null>(null)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    setSession(parseSession())
  }, [])

  const visibleLinks = (session
    ? allLinks.filter(l => l.roles.includes(session.rol))
    : allLinks
  ).filter(l =>
    search === '' ||
    l.label.toLowerCase().includes(search.toLowerCase())
  )

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <aside style={{
      width: '240px', height: '100vh', backgroundColor: '#111113',
      borderRight: '1px solid #27272a', display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, zIndex: 100, overflow: 'hidden',
    }}>

      {/* Marca */}
      <div style={{ padding: '28px 24px', borderBottom: '1px solid #27272a' }}>
        <p style={{ fontSize: '10px', color: '#52525b', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
          Sistema de
        </p>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', letterSpacing: '2px' }}>
          INVENTARIO
        </h1>
        <p style={{ fontSize: '10px', color: '#52525b', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '2px' }}>
          Streetwear
        </p>
      </div>

      {/* Búsqueda */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #27272a' }}>
        <div style={{ position: 'relative' }}>
          <MagnifyingGlassIcon style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            width: '14px', height: '14px', color: '#52525b', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Buscar sección..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', backgroundColor: '#1c1c1f',
              border: '1px solid #27272a', borderRadius: '6px',
              padding: '7px 10px 7px 30px', color: '#ffffff',
              fontSize: '12px', outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e  => (e.target.style.borderColor = '#3f3f46')}
            onBlur={e   => (e.target.style.borderColor = '#27272a')}
          />
        </div>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {visibleLinks.length === 0 && (
          <p style={{ fontSize: '12px', color: '#52525b', textAlign: 'center', marginTop: '20px' }}>
            Sin resultados
          </p>
        )}
        {visibleLinks.map(({ href, label, Icon }) => {
          const isActive = pathname === href
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', marginBottom: '2px', borderRadius: '8px',
              textDecoration: 'none', fontSize: '13.5px',
              fontWeight: isActive ? '600' : '400',
              color: isActive ? '#ffffff' : '#71717a',
              backgroundColor: isActive ? '#27272a' : 'transparent',
              borderLeft: isActive ? '3px solid #ffffff' : '3px solid transparent',
              transition: 'all 0.15s ease',
            }}>
              <Icon style={{ width: '17px', height: '17px', flexShrink: 0 }} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Usuario + Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid #27272a' }}>
        {session && (
          <div style={{
            backgroundColor: '#1c1c1f', borderRadius: '8px',
            padding: '12px', marginBottom: '10px',
          }}>
            <p style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
              {session.nombre}
            </p>
            <span style={{
              fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase',
              letterSpacing: '1px', backgroundColor: '#27272a',
              padding: '2px 8px', borderRadius: '4px',
            }}>
              {session.rol}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            width: '100%', backgroundColor: '#1c1c1f',
            border: '1px solid #27272a', borderRadius: '6px',
            padding: '9px 12px', color: '#71717a', fontSize: '12px',
            fontWeight: '500', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#3f3f46'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#71717a'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a'
          }}
        >
          <ArrowRightStartOnRectangleIcon style={{ width: '15px', height: '15px' }} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
