'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useVotingProgram, fetchAllPolls, castVote, checkIfVoted, closePoll } from './voting-data-access';
import { PollCard, ResultsChart, CountdownTimer, Toast, TruncatedAddress, PollData } from './voting-ui';

export function PollsList() {
  const { program } = useVotingProgram();
  const [polls, setPolls] = useState<PollData[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!program) return;
    try { const data = await fetchAllPolls(program); setPolls(data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [program]);

  useEffect(() => { load(); }, [load]);

  const totalVotes = polls.reduce((sum, p) => sum + p.account.voteCounts.reduce((a, b) => a + b, 0), 0);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>Loading polls from chain...</div>;

  return (
    <>
      <div className="stats-row">
        <div className="stat-card"><div className="stat-number">{polls.length}</div><div className="stat-label">Total Polls</div></div>
        <div className="stat-card"><div className="stat-number">{totalVotes}</div><div className="stat-label">Total Votes Cast</div></div>
      </div>
      {polls.length === 0
        ? <div className="empty-state"><p>No polls yet — be the first to create one.</p></div>
        : <div className="poll-grid">{polls.map((poll) => <PollCard key={poll.publicKey} poll={poll} />)}</div>
      }
    </>
  );
}

export function PollDetail({ pollKey }: { pollKey: string }) {
  const { program, wallet } = useVotingProgram();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'loading'; signature?: string } | null>(null);

  const load = useCallback(async () => {
    if (!program) return;
    try {
      const pk = new PublicKey(pollKey);
      const data = await program.account.poll.fetch(pk);
      setPoll({
        publicKey: pollKey,
        account: {
          authority: (data as any).authority.toString(),
          question: (data as any).question,
          options: (data as any).options,
          voteCounts: ((data as any).voteCounts as any[]).map((v: any) => Number(v)),
          isActive: (data as any).isActive,
          createdAt: Number((data as any).createdAt),
          endsAt: Number((data as any).endsAt),
        },
      });
      if (wallet.publicKey) {
        const voted = await checkIfVoted(program, wallet.publicKey, pk);
        setVotedIndex(voted);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [program, pollKey, wallet.publicKey]);

  useEffect(() => { load(); }, [load]);

  const handleVote = async () => {
    if (!program || !wallet.publicKey || selected === null || !poll) return;
    setSubmitting(true);
    setToast({ message: 'Submitting vote...', type: 'loading' });
    try {
      const sig = await castVote(program, wallet.publicKey, new PublicKey(pollKey), selected);
      setToast({ message: 'Vote cast successfully!', type: 'success', signature: sig });
      await load();
    } catch (e: any) {
      setToast({ message: e.message?.slice(0, 80) || 'Vote failed', type: 'error' });
    } finally { setSubmitting(false); }
  };

  const handleClose = async () => {
    if (!program || !wallet.publicKey || !poll) return;
    try {
      const sig = await closePoll(program, wallet.publicKey, new PublicKey(pollKey));
      setToast({ message: 'Poll closed!', type: 'success', signature: sig });
      await load();
    } catch (e: any) { setToast({ message: e.message?.slice(0, 80) || 'Failed', type: 'error' }); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>Loading poll...</div>;
  if (!poll) return <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>Poll not found.</div>;

  const isExpired = Date.now() / 1000 > poll.account.endsAt;
  const isActive = poll.account.isActive && !isExpired;
  const canVote = isActive && wallet.publicKey && votedIndex === null;
  const isAuthority = wallet.publicKey?.toString() === poll.account.authority;

  return (
    <div className="poll-detail">
      <div className="poll-detail-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className={`badge ${isActive ? 'badge-active' : 'badge-ended'}`}>{isActive ? '● Live' : '■ Ended'}</span>
          <CountdownTimer endsAt={poll.account.endsAt} isActive={poll.account.isActive} />
        </div>
        <h2>{poll.account.question}</h2>
        <div style={{ margin: '0.75rem 0', fontSize: '0.85rem', opacity: 0.6 }}>Created by <TruncatedAddress address={poll.account.authority} /></div>

        {votedIndex !== null && (
          <div className="badge badge-voted" style={{ marginBottom: '1rem' }}>✅ You voted for &quot;{poll.account.options[votedIndex]}&quot;</div>
        )}

        {canVote && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', fontWeight: 600 }}>Cast your vote:</div>
            {poll.account.options.map((opt, i) => (
              <button key={i} className={`vote-option${selected === i ? ' selected' : ''}`} onClick={() => setSelected(i)}>{opt}</button>
            ))}
            <button className="btn-primary" onClick={handleVote} disabled={selected === null || submitting} style={{ marginTop: '0.5rem', width: '100%' }}>
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        )}

        {!wallet.publicKey && <div style={{ marginTop: '1rem', opacity: 0.6, fontSize: '0.9rem' }}>Connect your wallet to vote.</div>}

        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Results:</div>
          <ResultsChart options={poll.account.options} voteCounts={poll.account.voteCounts} votedIndex={votedIndex} />
        </div>

        {isAuthority && isActive && (
          <button className="btn-outline" onClick={handleClose} style={{ marginTop: '1.5rem', width: '100%' }}>Close Poll</button>
        )}
      </div>
      {toast && <Toast message={toast.message} type={toast.type} signature={toast.signature} onClose={() => setToast(null)} />}
    </div>
  );
}
