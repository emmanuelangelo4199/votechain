'use client'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { WalletButton } from '@/components/solana/solana-provider'

export function AppHeader({ links = [] }: { links: { label: string; path: string }[] }) {
  const pathname = usePathname()
  const [showMenu, setShowMenu] = useState(false)

  function isActive(path: string) {
    return path === '/' ? pathname === '/' : pathname.startsWith(path)
  }

  return (
    <header style={{
      background: 'var(--deep-navy)',
      borderBottom: '1px solid var(--imperial-blue)',
      backdropFilter: 'blur(10px)',
      padding: '0.85rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            background: 'linear-gradient(90deg, #a6e1fa, #0e6ba8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em',
          }}>
            🗳️ VoteChain
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', gap: '1.5rem' }} className="desktop-nav">
          {links.map(({ label, path }) => (
            <Link key={path} href={path} style={{
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: isActive(path) ? 700 : 400,
              color: isActive(path) ? 'var(--frosted-blue)' : 'rgba(166,225,250,0.6)',
              borderBottom: isActive(path) ? '2px solid var(--cornflower-ocean)' : '2px solid transparent',
              paddingBottom: '2px',
              transition: 'color 0.2s',
            }}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <WalletButton />

        {/* Mobile menu toggle */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            display: 'none',
            background: 'none',
            border: '1px solid var(--cornflower-ocean)',
            borderRadius: '8px',
            color: 'var(--frosted-blue)',
            padding: '0.4rem 0.6rem',
            cursor: 'pointer',
            fontSize: '1.1rem',
          }}
          className="mobile-menu-btn"
        >
          {showMenu ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {showMenu && (
        <div style={{
          position: 'fixed',
          top: '58px',
          left: 0,
          right: 0,
          background: 'var(--deep-navy)',
          borderBottom: '1px solid var(--imperial-blue)',
          padding: '1.5rem 2rem',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {links.map(({ label, path }) => (
            <Link key={path} href={path}
              onClick={() => setShowMenu(false)}
              style={{
                textDecoration: 'none',
                fontSize: '1.1rem',
                color: isActive(path) ? 'var(--frosted-blue)' : 'rgba(166,225,250,0.7)',
                fontWeight: isActive(path) ? 700 : 400,
              }}>
              {label}
            </Link>
          ))}
          <div style={{ marginTop: '0.5rem' }}>
            <WalletButton />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  )
}
