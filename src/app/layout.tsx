import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/components/app-providers'
import { AppLayout } from '@/components/app-layout'
import React from 'react'

export const metadata: Metadata = {
  title: 'VoteChain',
  description: 'Transparent. Trustless. On-Chain.',
}

const links: { label: string; path: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'Create Poll', path: '/create' },
]

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppLayout links={links}>{children}</AppLayout>
        </AppProviders>
      </body>
    </html>
  )
}

declare global {
  interface BigInt { toJSON(): string }
}
BigInt.prototype.toJSON = function () { return this.toString() }
