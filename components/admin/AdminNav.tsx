'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/gestores', label: 'Gestores' },
  { href: '/admin/modulos', label: 'Módulos' },
  { href: '/admin/aulas', label: 'Aulas' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1">
      {links.map((link) => {
        const active =
          link.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              active
                ? 'bg-accent text-white'
                : 'text-muted hover:text-white hover:bg-surface'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
