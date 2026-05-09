'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { PollsList } from '@/components/voting/voting-feature';

export default function HomePage() {
  const { publicKey } = useWallet();

  return (
    <main>
      <div className="hero">
        <h1>VoteChain</h1>
        <p>Transparent. Trustless. On-Chain.</p>
        {publicKey ? (
          <Link href="/create" className="btn-primary">+ Create Poll</Link>
        ) : (
          <p style={{ fontSize: '0.9rem', opacity: 0.6, marginTop: '0.5rem' }}>
            Connect your wallet to create a poll
          </p>
        )}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="section-title">Active Polls</div>
        <PollsList />
      </div>
    </main>
  );
}
