'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { explorerUrl } from './voting-data-access';

export interface PollData {
  publicKey: string;
  account: {
    authority: string;
    question: string;
    options: string[];
    voteCounts: number[];
    isActive: boolean;
    createdAt: number;
    endsAt: number;
  };
}

export function PollCard({ poll }: { poll: PollData }) {
  const totalVotes = poll.account.voteCounts.reduce((a, b) => a + b, 0);
  const isExpired = Date.now() / 1000 > poll.account.endsAt;
  const isActive = poll.account.isActive && !isExpired;
  return (
    <Link href={`/poll/${poll.publicKey}`} className="poll-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span className={`badge ${isActive ? 'badge-active' : 'badge-ended'}`}>
          {isActive ? '● Live' : '■ Ended'}
        </span>
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
      </div>
      <h3>{poll.account.question}</h3>
      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {poll.account.options.map((opt, i) => (
          <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(14,107,168,0.2)', border: '1px solid rgba(14,107,168,0.4)', borderRadius: '6px', padding: '0.2rem 0.5rem', color: 'var(--frosted-blue)' }}>{opt}</span>
        ))}
      </div>
      <div className="poll-card-meta">
        <CountdownTimer endsAt={poll.account.endsAt} isActive={poll.account.isActive} />
      </div>
    </Link>
  );
}

export function ResultsChart({ options, voteCounts, votedIndex }: {
  options: string[]; voteCounts: number[]; votedIndex?: number | null;
}) {
  const total = voteCounts.reduce((a, b) => a + b, 0);
  const maxVotes = Math.max(...voteCounts, 1);
  return (
    <div style={{ marginTop: '1rem' }}>
      {options.map((opt, i) => {
        const pct = total > 0 ? Math.round((voteCounts[i] / total) * 100) : 0;
        const isWinner = voteCounts[i] === maxVotes && total > 0;
        const isVoted = votedIndex === i;
        return (
          <div key={i} className="result-bar-wrapper">
            <div className="result-bar-label">
              <span style={{ fontWeight: isVoted ? 700 : 400 }}>{isVoted ? '✓ ' : ''}{opt}{isWinner && total > 0 ? ' 🏆' : ''}</span>
              <span>{pct}% <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>({voteCounts[i]})</span></span>
            </div>
            <div className="result-bar-bg">
              <div className={`result-bar-fill${isWinner && total > 0 ? ' winner' : ''}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '0.5rem', textAlign: 'right' }}>
        {total} total vote{total !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

export function CountdownTimer({ endsAt, isActive }: { endsAt: number; isActive: boolean }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = endsAt - now;
      if (!isActive || diff <= 0) { setTimeLeft('Ended'); return; }
      const d = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setUrgent(diff < 3600);
      if (d > 0) setTimeLeft(`${d}d ${h}h remaining`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m remaining`);
      else setTimeLeft(`${m}m ${s}s remaining`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endsAt, isActive]);
  return <span className={`countdown${urgent ? ' urgent' : ''}`}>{timeLeft}</span>;
}

export function Toast({ message, type, signature, onClose }: {
  message: string; type: 'success' | 'error' | 'loading'; signature?: string; onClose: () => void;
}) {
  useEffect(() => {
    if (type !== 'loading') { const t = setTimeout(onClose, 5000); return () => clearTimeout(t); }
  }, [type, onClose]);
  return (
    <div className={`toast ${type}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <div>{type === 'loading' ? '⏳' : type === 'success' ? '✅' : '❌'} {message}</div>
          {signature && <a href={explorerUrl(signature)} target="_blank" rel="noopener noreferrer" className="explorer-link">View on Explorer →</a>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--frosted-blue)', cursor: 'pointer' }}>✕</button>
      </div>
    </div>
  );
}

export function TruncatedAddress({ address }: { address: string }) {
  return <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', opacity: 0.6 }}>{address.slice(0, 4)}...{address.slice(-4)}</span>;
}
