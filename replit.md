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
  - `ImportBotDialog` - Template import with JSON validation and preview
  - `ThreatBadge` - Color-coded threat level indicators

### Backend (Express + TypeScript)
- **Storage:** In-memory storage (MemStorage) for wallets, transactions, bots, and NFT passes
- **Classifier:** CA-first (Contract Analysis) rules-based spam detection
- **Deep3 Mock:** Simulated AI threat analysis service
- **WebSocket:** Real-time transaction monitoring on `/ws` path
- **Bot Lifecycle Manager:** Automated payment enforcement and cleanup
- **API Endpoints:**
  - `/api/wallets/*` - Wallet CRUD operations (POST endpoint updates tier if changed)
  - `/api/transactions/*` - Transaction history and simulation
  - `/api/arbitrage-bots/*` - Bot management (Pro+ only)
  - `/api/arbitrage-bots/import` - Bot template import with schema validation
  - `/api/passes/*` - NFT pass activation/deactivation
  - `/api/payments/*` - Payment calculation and processing
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
- **2 arbitrage bots included** (free monthly fee, 0.5% transaction fee only)
- **3 additional bot slots** (0.0009 SOL/month each + 0.5% transaction fee)
- Bot template marketplace with curated configurations (Conservative DEX, Stable Liquidity, Aggressive Market Maker)
- JSON-based template import with strict validation
- Automated trading strategies with configurable risk parameters
- Dedicated cooperanth.sol wallets for each bot
- MEV protection via Deep3 risk gating
- Priority support

## Monetization System

### Bot Fee Structure
- **First 2 bots (included):** FREE monthly fee, 0.5% transaction fee only
- **Additional bots (3-5):** 0.0009 SOL/month + 0.5% transaction fee
- Monthly fees charged on the 1st of each month
- Auto-pause on payment failure
- Delete after 30 days inactive (except first 2 included bots)

### NFT Pass System
- **Distribution:** Only DAO can issue passes (distributed as Solana NFTs)
- **Activation:** Users activate passes from their wallet inventory
- **Verification:** NFT ownership verified in user's Solana wallet
- **Pass Types:**
  - **Fee Waiver:** Waives all transaction and monthly fees
  - **Free Bot Slots:** Additional bot slots beyond the 5-bot limit
  - **Tier Upgrade:** Temporary tier upgrades (e.g., Basic → Pro)
  - **Time-Limited:** Passes can expire based on NFT metadata
- **Metadata:** Pass benefits extracted from NFT metadata (rarity, traits, expiration)

### Payment Tracking
- Bot payment status: `current`, `pending`, `failed`, `waived`
- Next payment due date (1st of next month)
- Payment history (lastPaymentDate)
- Wallet balances (SOL and $CATH tokens)

### Solana Integration (Planned)
- Smart contract for payment processing
- Supports SOL and $CATH token payments
- NFT ownership verification via Solana RPC
- Automatic pass detection and activation

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

### 2025-10-21: Complete Monetization System
- **Schema Extensions:**
  - Added payment tracking to arbitrageBots: `paymentStatus`, `lastPaymentDate`, `nextPaymentDue`, `inactiveSince`, `isIncludedBot`
  - Created NFT pass schema with metadata, traits, rarity, and benefits
  - Added wallet balance tracking: `solBalance`, `cathBalance`
- **Payment Utilities:**
  - `calculateBotMonthlyFee()` - Monthly fee calculation with pass exemptions
  - `calculateTransactionFee()` - 0.5% taker fee with pass exemptions
  - `calculateNextPaymentDue()` - Next payment date (1st of next month)
  - `shouldAutoPauseBot()` - Payment failure detection
  - `shouldDeleteBot()` - 30-day inactive cleanup (excludes first 2 bots)
- **API Endpoints:**
  - `POST /api/payments/bot-monthly` - Process monthly bot payment
  - `POST /api/payments/transaction-fee` - Calculate transaction fee
  - `GET /api/payments/calculate/:walletId` - Payment summary
  - `POST /api/passes/activate` - Activate NFT pass from wallet
  - `POST /api/passes/deactivate` - Deactivate transferred pass
- **Bot Lifecycle Manager:**
  - Runs every hour to check payment status
  - Auto-pauses bots with failed payments
  - Deletes non-included bots inactive for 30+ days
- **First 2 Bots Logic:**
  - Automatically marked as `isIncludedBot = true`
  - PaymentStatus set to `waived` (no monthly fee)
  - Only 0.5% transaction fee applies

### 2025-10-21: Bot template import system complete
- Created botTemplateSchema with strict Zod validation (strategy enum, numeric ranges, DEX allowlist)
- Built POST /api/arbitrage-bots/import endpoint with tier checks and 5-bot limit enforcement
- Added ImportBotDialog component with 3 curated example templates and JSON preview
- Fixed critical wallet tier sync bug: POST /api/wallets now updates tier if changed
- Extended arbitrageBots schema with maxRiskScore, slippageTolerance, dexAllowlist, targetPairs, autoPauseConfig
- Updated bot limits: 2 included + 3 additional slots (5 max total)
- Full E2E testing passed: wallet connection → Pro+ upgrade → template import → limit enforcement

### 2025-10-21: Initial MVP implementation
- Full schema definition for wallets, transactions, and arbitrage bots
- Complete UI with responsive design and beautiful empty/loading states
- Mock Deep3 Labs integration with realistic threat analysis
- Local token classifier with CA-first rules
- WebSocket real-time monitoring system

## Next Steps (Post-MVP)

### High Priority
1. **Solana Payment Integration**
   - Implement smart contract for bot monthly fees
   - Add SOL and $CATH token payment processing
   - Verify NFT ownership via Solana RPC
   - Parse NFT metadata for pass benefits

2. **NFT Pass Features**
   - Automatic pass detection in user wallet
   - Pass benefit visualization in UI
   - DAO issuance tooling

3. **UI Updates**
   - Payment status indicators in Dashboard
   - Next payment due notifications
   - Bot lifecycle status (active/paused/pending deletion)
   - Pass activation modal

### Medium Priority
4. Integrate real Solana wallet adapters (@solana/wallet-adapter-react)
5. Connect to real Deep3 Labs API for Pro tier
6. Implement live arbitrage bot functionality
7. Add Solana Name Service (.sol) integration
8. Build payment/subscription flow for tier upgrades

### Low Priority
9. Add whitelist/blacklist management
10. Implement custom security rules (Pro+ feature)
11. Add detailed analytics dashboard
12. Build notification system (email/push)
13. Optimize performance and add caching layer
