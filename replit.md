# Wallet Buddhi - Solana Wallet Protection dApp

## Overview
Wallet Buddhi is a tiered wallet protection system for Solana that detects spam tokens and malicious transactions. It provides three tiers of service: Basic (free local classification), Pro (Deep3 Labs AI integration), and Pro+ (arbitrage bots).

## Project Status
**MVP Complete** - All core features implemented and functional

## Architecture

### Frontend (React + TypeScript)
- **Pages:**
  - `/` - Landing page (HomePage) or Dashboard if wallet connected
  - `/tiers` - Tier comparison and upgrade page
- **Key Components:**
  - `WalletConnectModal` - Connect Phantom, Solflare, or Backpack wallets
  - `Dashboard` - Transaction monitoring and bot management
  - `TierCard` - Tier feature comparison cards
  - `TransactionRow` - Individual transaction display with threat analysis
  - `Deep3Modal` - AI threat analysis details
  - `ArbitrageBotPanel` - Bot configuration and stats
  - `ThreatBadge` - Color-coded threat level indicators

### Backend (Express + TypeScript)
- **Storage:** In-memory storage (MemStorage) for wallets, transactions, and bots
- **Classifier:** CA-first (Contract Analysis) rules-based spam detection
- **Deep3 Mock:** Simulated AI threat analysis service
- **WebSocket:** Real-time transaction monitoring on `/ws` path
- **API Endpoints:**
  - `/api/wallets/*` - Wallet CRUD operations
  - `/api/transactions/*` - Transaction history and simulation
  - `/api/arbitrage-bots/*` - Bot management (Pro+ only)
  - `/api/deep3/analyze/:tokenAddress` - Deep3 AI analysis

## Features by Tier

### Basic (Free)
- Local spam classifier with CA-first rules
- Real-time transaction monitoring
- Basic threat classification (Safe, Suspicious, Danger, Blocked)
- WebSocket live updates

### Pro ($9.99/mo)
- Everything in Basic
- Deep3 Labs AI integration (mocked)
- Advanced risk scoring (0-100)
- Token metadata analysis
- Historical data access
- wbuddi.cooperanth.sol naming

### Pro+ ($29.99/mo)
- Everything in Pro
- 2 arbitrage bots with dedicated cooperanth.sol wallets
- Automated trading strategies
- MEV protection via Deep3 risk gating
- Priority support

## Key Design Decisions

### Classification Merge Rule
**Local BLOCK wins** - If local classifier blocks a token, it stays blocked regardless of Deep3 score. Deep3 can only elevate threat levels, never reduce them.

### Wallet Connection
Currently using mock Solana wallet connection (see `lib/solana-mock.ts`). Real Solana wallet adapter integration is ready to be added when needed.

### Data Persistence
Using in-memory storage for MVP. Easy to migrate to PostgreSQL by updating storage interface.

### WebSocket Real-Time Updates
WebSocket server broadcasts:
- New transactions
- Threat detections
- Bot status updates
- Tier changes

## Technology Stack
- **Frontend:** React, TypeScript, TailwindCSS, Shadcn UI, Wouter (routing), React Query
- **Backend:** Express, TypeScript, WebSocket (ws package)
- **Validation:** Zod schemas from Drizzle
- **Fonts:** Inter (UI), JetBrains Mono (monospace for addresses)
- **Colors:** Primary Blue (220 85% 58%), Solana Purple (265 75% 65%)

## User Preferences
- **Visual Style:** Security-first, clean modern interface inspired by Phantom/Solflare
- **Default Theme:** Dark mode
- **Branding:** Wallet Buddhi mascot (blue shield character) prominently featured

## Recent Changes
- 2025-10-21: Initial MVP implementation with all three tiers
- Full schema definition for wallets, transactions, and arbitrage bots
- Complete UI with responsive design and beautiful empty/loading states
- Mock Deep3 Labs integration with realistic threat analysis
- Local token classifier with CA-first rules
- WebSocket real-time monitoring system

## Next Steps (Post-MVP)
1. Integrate real Solana wallet adapters (@solana/wallet-adapter-react)
2. Connect to real Deep3 Labs API for Pro tier
3. Implement live arbitrage bot functionality
4. Add Solana Name Service (.sol) integration
5. Build payment/subscription flow for tier upgrades
6. Add whitelist/blacklist management
7. Implement custom security rules (Pro+ feature)
8. Add detailed analytics dashboard
9. Build notification system (email/push)
10. Optimize performance and add caching layer
