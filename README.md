# 🗳️ VoteChain — Decentralized Voting on Solana

> **Transparent. Trustless. On-Chain.**

A full-stack decentralized voting DApp built on Solana Devnet. Users can create polls, cast votes, and view live results — all secured on-chain with wallet authentication and double-vote prevention.

**Live Demo:** https://votechain-yhoz-nhgjum2gh-angelos-projects-ac88254f.vercel.app/

---

## ✨ Features

- 🗳️ **Create polls** with up to 4 options and a custom duration
- ✅ **One vote per wallet** — enforced by on-chain PDA constraints
- 📊 **Live results** with animated progress bars
- ⏱️ **Countdown timer** — polls auto-expire at the set time
- 🔐 **Wallet authentication** via Solflare / Phantom
- 🔗 **Transaction transparency** — every action links to Solana Explorer
- 📱 **Responsive** — works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Rust + Anchor Framework |
| Blockchain | Solana Devnet |
| Frontend | Next.js 16 + TypeScript |
| Styling | Tailwind CSS + Custom CSS |
| Wallet | Solana Wallet Adapter (Solflare) |
| Client | @coral-xyz/anchor + @solana/web3.js |
| Deployment | Vercel (frontend) + Solana Devnet (program) |

---

## 🏗️ Architecture

```
votechain/
├── anchor/                          # Solana smart contract
│   ├── programs/voting/src/lib.rs   # Anchor program (Rust)
│   └── Anchor.toml                  # Devnet config
└── src/
    ├── app/
    │   ├── page.tsx                 # Home — polls list + hero
    │   ├── create/page.tsx          # Create poll (4-step form)
    │   └── poll/[pollId]/page.tsx   # Poll detail + voting UI
    ├── components/
    │   └── voting/
    │       ├── voting-data-access.tsx  # Anchor client helpers
    │       ├── voting-ui.tsx           # Shared UI components
    │       └── voting-feature.tsx      # Page-level logic
    └── lib/
        └── voting-idl.json          # Generated Anchor IDL
```

---

## 📋 Smart Contract

**Program ID:** `Ax4euTS9vx3TFxgj7o2JSLmNeRQhG4Rm9JS53wZcWHKT`

[View on Solana Explorer](https://explorer.solana.com/address/Ax4euTS9vx3TFxgj7o2JSLmNeRQhG4Rm9JS53wZcWHKT?cluster=devnet)

### Instructions

| Instruction | Description |
|---|---|
| `create_poll` | Creates a new poll with question, options, and duration |
| `cast_vote` | Casts a vote — double-vote prevented by VoteRecord PDA |
| `close_poll` | Closes a poll — authority only |

### Account PDAs

```rust
// Poll PDA
seeds = [b"poll", authority.key(), question.as_bytes()]

// VoteRecord PDA (prevents double voting)
seeds = [b"vote", poll.key(), voter.key()]
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Rust + Cargo
- Solana CLI
- Anchor CLI

### Installation

```bash
# Clone the repo
git clone https://github.com/emmanuelangelo4199/votechain.git
cd votechain

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy the Anchor Program

```bash
# Configure for Devnet
solana config set --url devnet
solana airdrop 2

# Build and deploy
cd anchor
anchor build
anchor deploy
```

---

## 🧪 Testing the DApp

1. Install [Solflare](https://solflare.com) browser extension
2. Switch Solflare to **Devnet**
3. Fund your wallet at [faucet.solana.com](https://faucet.solana.com)
4. Connect wallet on the app
5. Create a poll and cast a vote
6. View your transaction on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

---

## 🎨 Design

Custom blue palette inspired by deep ocean tones:

| Variable | Hex | Usage |
|---|---|---|
| `--prussian-blue` | `#00072d` | Page background |
| `--deep-navy` | `#001c55` | Navbar, cards |
| `--imperial-blue` | `#0a2472` | Borders, inputs |
| `--cornflower-ocean` | `#0e6ba8` | Accents, buttons |
| `--frosted-blue` | `#a6e1fa` | Text, highlights |

---

## 🔮 Roadmap

- [ ] NFT-gated polls (token holders only)
- [ ] Multi-signature poll creation
- [ ] Poll categories and search
- [ ] Email/push notifications on poll results
- [ ] Mainnet deployment

---

## 👨‍💻 Built By

**Emmanuel Kwame Angelo **
- GitHub: [@emmanuelangelo4199](https://github.com/emmanuelangelo4199)
- Twitter/X: [@mrangelo4199](https://twitter.com/mrangelo4199)


---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

*Built with ❤️ on Solana*
