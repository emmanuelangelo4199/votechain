'use client';

import { use } from 'react';
import Link from 'next/link';
import { PollDetail } from '@/components/voting/voting-feature';

export default function PollPage({ params }: { params: Promise<{ pollId: string }> }) {
  const { pollId } = use(params);

  return (
    <main>
      <div style={{ maxWidth: '680px', margin: '1.5rem auto', padding: '0 1rem' }}>
        <Link href="/" style={{ color: 'var(--cornflower-ocean)', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Back to polls
        </Link>
      </div>
      <PollDetail pollKey={pollId} />
    </main>
  );
}
