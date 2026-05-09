'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { useMemo } from 'react';
import idl from '@/lib/voting-idl.json';

const PROGRAM_ID = new PublicKey('Ax4euTS9vx3TFxgj7o2JSLmNeRQhG4Rm9JS53wZcWHKT');
const DEVNET_EXPLORER = 'https://explorer.solana.com/tx/';

export function useVotingProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' });
  }, [connection, wallet]);
  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(idl as any, provider);
  }, [provider]);
  return { program, provider, wallet, connection };
}

export async function fetchAllPolls(program: Program) {
  const polls = await program.account.poll.all();
  return polls.map((p) => ({
    publicKey: p.publicKey.toString(),
    account: {
      authority: (p.account as any).authority.toString(),
      question: (p.account as any).question,
      options: (p.account as any).options,
      voteCounts: ((p.account as any).voteCounts as any[]).map((v: any) => Number(v)),
      isActive: (p.account as any).isActive,
      createdAt: Number((p.account as any).createdAt),
      endsAt: Number((p.account as any).endsAt),
    },
  }));
}

export async function createPoll(
  program: Program, authority: PublicKey,
  question: string, options: string[], durationSeconds: number
): Promise<string> {
  const [pollPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('poll'), authority.toBuffer(), Buffer.from(question.slice(0, 32))],
    PROGRAM_ID
  );
  return await (program.methods as any)
    .createPoll(question, options, new BN(durationSeconds))
    .accounts({ poll: pollPda, authority, systemProgram: SystemProgram.programId })
    .rpc();
}

export async function castVote(
  program: Program, voter: PublicKey, pollPubkey: PublicKey, optionIndex: number
): Promise<string> {
  const [voteRecordPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vote'), pollPubkey.toBuffer(), voter.toBuffer()],
    PROGRAM_ID
  );
  return await (program.methods as any)
    .castVote(optionIndex)
    .accounts({ poll: pollPubkey, voteRecord: voteRecordPda, voter, systemProgram: SystemProgram.programId })
    .rpc();
}

export async function checkIfVoted(
  program: Program, voter: PublicKey, pollPubkey: PublicKey
): Promise<number | null> {
  try {
    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vote'), pollPubkey.toBuffer(), voter.toBuffer()],
      PROGRAM_ID
    );
    const record = await program.account.voteRecord.fetch(voteRecordPda);
    return (record as any).optionIndex;
  } catch { return null; }
}

export async function closePoll(
  program: Program, authority: PublicKey, pollPubkey: PublicKey
): Promise<string> {
  return await (program.methods as any)
    .closePoll()
    .accounts({ poll: pollPubkey, authority })
    .rpc();
}

export function explorerUrl(signature: string) {
  return `${DEVNET_EXPLORER}${signature}?cluster=devnet`;
}
