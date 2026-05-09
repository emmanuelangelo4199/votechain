'use client'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import React from 'react'

export function AppLayout({
  children,
  links,
}: {
  children: React.ReactNode
  links: { label: string; path: string }[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader links={links} />
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
