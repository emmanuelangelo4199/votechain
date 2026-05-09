export function AppFooter() {
  return (
    <footer
      style={{
        background: 'var(--deep-navy)',
        borderTop: '1px solid var(--imperial-blue)',
        padding: '1.5rem 2rem',
        textAlign: 'center' as const,
        fontSize: '0.85rem',
        color: 'rgba(166,225,250,0.5)',
      }}
    >
      VoteChain - Built on Solana Devnet
    </footer>
  )
}
