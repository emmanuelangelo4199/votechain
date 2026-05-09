'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useVotingProgram, createPoll, explorerUrl } from '@/components/voting/voting-data-access';
import { Toast } from '@/components/voting/voting-ui';

export default function CreatePollPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { program } = useVotingProgram();

  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [durationValue, setDurationValue] = useState(1);
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days'>('days');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'loading'; signature?: string } | null>(null);

  const durationSeconds = durationUnit === 'days' ? durationValue * 86400 : durationValue * 3600;

  const addOption = () => { if (options.length < 4) setOptions([...options, '']); };
  const removeOption = (i: number) => { if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i)); };
  const updateOption = (i: number, val: string) => setOptions(options.map((o, idx) => idx === i ? val : o));

  const handleSubmit = async () => {
    if (!program || !publicKey) return;
    const cleanOptions = options.filter(o => o.trim().length > 0);
    setSubmitting(true);
    setToast({ message: 'Creating poll on-chain...', type: 'loading' });
    try {
      const sig = await createPoll(program, publicKey, question.trim(), cleanOptions, durationSeconds);
      setToast({ message: 'Poll created successfully!', type: 'success', signature: sig });
      setTimeout(() => router.push('/'), 3000);
    } catch (e: any) {
      setToast({ message: e.message?.slice(0, 80) || 'Failed to create poll', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="empty-state">
        <p>Please connect your wallet to create a poll.</p>
      </div>
    );
  }

  return (
    <main>
      <div className="form-container">
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>
          Create a Poll
        </h2>

        {/* Step indicator */}
        <div className="step-indicator">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`} />
          ))}
        </div>

        {/* Step 1 — Question */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Step 1 — Your question</div>
            <div className="form-group">
              <label>What would you like to ask?</label>
              <textarea
                rows={3}
                placeholder="e.g. What is the best programming language?"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                maxLength={200}
              />
              <div style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'right', marginTop: '0.25rem' }}>
                {question.length}/200
              </div>
            </div>
            <button className="btn-primary" style={{ width: '100%' }}
              onClick={() => setStep(2)} disabled={question.trim().length < 3}>
              Next →
            </button>
          </div>
        )}

        {/* Step 2 — Options */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Step 2 — Add options (2–4)</div>
            {options.map((opt, i) => (
              <div key={i} className="form-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  maxLength={50}
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} style={{ background: 'none', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', padding: '0.4rem 0.6rem', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            ))}
            {options.length < 4 && (
              <button className="btn-outline" style={{ width: '100%', marginBottom: '1rem' }} onClick={addOption}>
                + Add Option
              </button>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" style={{ flex: 1 }}
                onClick={() => setStep(3)}
                disabled={options.filter(o => o.trim()).length < 2}>
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Duration */}
        {step === 3 && (
          <div>
            <div style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Step 3 — Set duration</div>
            <div className="form-group">
              <label>How long should this poll run?</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="number"
                  min={1}
                  max={durationUnit === 'days' ? 30 : 168}
                  value={durationValue}
                  onChange={e => setDurationValue(Number(e.target.value))}
                />
                <select value={durationUnit} onChange={e => setDurationUnit(e.target.value as 'hours' | 'days')}>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => setStep(4)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div>
            <div style={{ marginBottom: '1rem', fontWeight: 600 }}>Step 4 — Review & submit</div>
            <div style={{ background: 'rgba(0,7,45,0.5)', border: '1px solid var(--cornflower-ocean)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.75rem', fontSize: '1.05rem' }}>{question}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {options.filter(o => o.trim()).map((opt, i) => (
                  <div key={i} style={{ fontSize: '0.9rem', opacity: 0.8 }}>• {opt}</div>
                ))}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                Duration: {durationValue} {durationUnit}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-outline" onClick={() => setStep(3)}>← Back</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Creating...' : '🗳️ Create Poll'}
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} signature={toast.signature} onClose={() => setToast(null)} />}
    </main>
  );
}
