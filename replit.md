# Wallet Buddhi - Solana Wallet Protection dApp

## Overview
Wallet Buddhi is a tiered Solana wallet protection system designed to detect spam tokens and malicious transactions. It offers Basic (free local classification), Pro (Deep3 Labs AI integration), and Pro+ (arbitrage bots) services. The project aims to provide robust security for Solana users, with a clear monetization strategy based on a one-time app purchase, monthly subscriptions, and a utility token ($CATH) for tier access and fee waivers. The business vision is to become a leading security solution in the Solana ecosystem, empowering users with advanced threat detection and automated trading capabilities.

## User Preferences
- **Visual Style:** Security-first, clean modern interface inspired by Phantom/Solflare
- **Default Theme:** Dark mode
- **Branding:** Wallet Buddhi mascot (blue shield character) prominently featured

## System Architecture

### Frontend (React + TypeScript)
- **Pages:** Landing page/Dashboard, Tier comparison.
- **Key Components:** WalletConnectModal, Dashboard, TierCard, TransactionRow, Deep3Modal, ArbitrageBotPanel, ImportBotDialog, ThreatBadge.
- **UI/UX:** Responsive design, empty/loading states, dark mode by default, security-first visual style.

### Backend (Express + TypeScript)
- **Storage:** In-memory storage for MVP, designed for easy migration to PostgreSQL.
- **Classifier:** CA-first (Contract Analysis) rules-based spam detection. "Local BLOCK wins" rule ensures local blocks override Deep3's analysis.
- **Deep3 Mock:** Simulated AI threat analysis.
- **WebSocket:** Real-time transaction monitoring, bot status, and tier updates.
- **Bot Lifecycle Manager:** Automates payment enforcement and bot cleanup.
- **API Endpoints:** Comprehensive CRUD and utility endpoints for wallets, transactions, arbitrage bots, NFT passes, and payments. Includes specific endpoints for app purchases, base monthly fees, tier subscriptions, and tier resolution based on $CATH holdings.

### Features by Tier
- **Basic:** Local spam classifier, real-time monitoring, basic threat classification (Safe, Suspicious, Danger, Blocked).
- **Pro:** Includes Basic features, Deep3 Labs AI integration (mocked), advanced risk scoring, token metadata analysis, historical data access.
- **Pro+:** Includes Pro features, up to 5 arbitrage bots (2 included, 3 additional paid slots), bot template marketplace, JSON-based template import with validation, automated trading strategies, MEV protection, priority support.

### Monetization System
- **App Purchase & Base Fee:** One-time $0.99 app purchase + $0.99/month base fee. Base fee waived if $CATH holdings ≥ 0.005 SOL.
- **Tier Access:** Prioritizes $CATH holdings (50 for Pro, 100 for Pro+), then paid subscription ($9.99/month Pro, $29.99/month Pro+), otherwise Basic.
- **Bot Fee Structure:** First 2 bots free monthly, 0.5% transaction fee. Additional bots cost 0.0009 SOL/month + 0.5% transaction fee.
- **NFT Pass System:** DAO-issued Solana NFTs for fee waivers, additional bot slots, or temporary tier upgrades. Benefits are extracted from NFT metadata.

### Key Design Decisions
- **Classification Merge Rule:** Local classifier's "BLOCK" status always takes precedence; Deep3 can only elevate threats.
- **Wallet Connection:** Currently mock, with planned integration of real Solana wallet adapters.
- **Data Persistence:** In-memory for MVP, designed for future PostgreSQL migration.
- **WebSocket:** Real-time updates for critical user information.

### Technology Stack
- **Frontend:** React, TypeScript, TailwindCSS, Shadcn UI, Wouter, React Query.
- **Backend:** Express, TypeScript, WebSocket (ws package).
- **Validation:** Zod schemas.
- **Fonts:** Inter, JetBrains Mono.
- **Color Scheme:** Primary Blue, Solana Purple.

## External Dependencies
- **Deep3 Labs AI:** For advanced threat analysis (currently mocked).
- **Solana Blockchain:** For wallet connections, NFT ownership verification, SPL token balance verification, and potential smart contract interactions.
- **Jupiter/Pyth:** Planned integration for trusted price oracles.
- **Solana Name Service (.sol):** Planned integration for personalized addresses.

## Distribution Strategy

### Hybrid Approach
**App Store Lite Version** (Google Play / Apple App Store):
- **Basic tier only** - Real-time transaction monitoring, local spam classifier
- **$0.99 one-time purchase** via app store (30% platform fee accepted for discoverability)
- **Base $0.99/mo fee** via app store subscriptions
- **No arbitrage bots** - Monitoring and threat detection only
- **Target audience:** Mainstream users, crypto newcomers, easy onboarding
- **Benefit:** Professional credibility, automatic updates, wide reach

**Fully Decentralized Version** (Web App + Downloadable Bot):
- **All tiers** (Basic/Pro/Pro+) with full feature set
- **On-chain payments** via SOL/$CATH smart contracts (0% platform fees)
- **Arbitrage bots included** - Full Pro+ functionality
- **Target audience:** Crypto-native users (Phantom/Solflare/Backpack wallet holders)
- **Benefit:** Complete control, token-based tier access, MEV protection features
- **Distribution:** PWA (installable web app) + downloadable Electron app for bot settings

**Rationale:**
- App stores provide discoverability and trust for new users
- Decentralized version captures crypto-savvy users who value full control
- Avoids 30% fees on high-value features (Pro+, arbitrage bots)
- Smart contract enforcement ensures transparent, auditable payments

## Bot Architecture (Future Development)

### Bot-Embedded Settings UI
The arbitrage bot (decentralized version only) will be a downloadable application with embedded settings interface:

**Authentication:**
- QR code-based wallet authentication (scan to access bot settings)
- Pin signature sent to wallet for verification
- No KYC required - purely wallet-based access control

**Bot Settings Interface:**
- **Network Selection:** Choose Solana networks (mainnet/devnet/testnet)
- **Notifications:** Configure alerts for trades, errors, payment reminders
- **Dark Mode:** Toggle theme preference
- **Wallet Activation:** Link wallet to Pro/Pro+ tier features
- **Tier Management:** View current tier, upgrade options, payment status
- **Arbitrage Bot Controls:** 
  - Activate/pause bots
  - Download bot configuration files
  - Approve bot trading permissions
  - View bot performance stats
- **Solana Naming:** Claim personalized xxxx.wbuddhi.cooperanth.sol addresses

### Smart Contract Architecture
**User Agreements as Smart Contracts:**
- Each user agreement (tier subscription, bot activation, etc.) will be a Solana smart contract
- Smart contracts integrated with NFT pass system for benefit verification
- On-chain enforcement of tier access, payment requirements, and NFT pass benefits
- Automatic tier upgrades when NFT passes detected in wallet
- Transparent, auditable payment and access history

## Recent Changes

### 2025-10-21: Distribution Strategy Defined
- **Hybrid approach:** App store lite version (Basic tier only) + fully decentralized version (all tiers)
- App store version targets mainstream users with easy onboarding
- Decentralized version offers full Pro+ features with 0% platform fees
- Bot-embedded settings documented (QR auth, network selection, .sol naming)
- Smart contract architecture for user agreements and NFT pass integration

### 2025-10-21: $CATH Token Monetization Integration
- **Schema Extensions:**
  - Added wallet fields: `cathBalance`, `cathValueInSol`, `holdingsCheckedAt`
  - Added app purchase tracking: `appPurchased`, `appPurchasedAt`, `appPurchaseTxSignature`
  - Added base fee tracking: `baseFeeStatus`, `baseFeeNextDue`, `baseFeeLastPaidAt`, `baseFeeWaivedReason`
  - Added tier subscription tracking: `paidTier`, `paidTierStatus`, `paidTierMethod`, `paidTierNextDue`, `paidTierLastPaidAt`
  - Added payment preference: `paymentPreference` (SOL or CATH)
- **CATH Utilities (server/cath-utils.ts):**
  - `fetchCathPriceInSol()` - Fetch CATH/SOL price with 60s TTL cache
  - `fetchSolPriceInUsd()` - Fetch SOL/USD price with 60s TTL cache
  - `getCathHoldings()` - Get user's CATH balance (mocked, ready for on-chain integration)
  - `isBaseFeeWaived()` - Check if base fee waived by CATH holdings (≥ 0.005 SOL value)
  - `resolveTier()` - Determine tier from: CATH holdings > subscription > default
  - `convertUsdToSol()` / `convertUsdToCath()` - Price conversions
- **New Payment API Endpoints:**
  - `POST /api/payments/app-purchase` - Process $0.99 one-time app purchase
  - `POST /api/payments/base-monthly` - Process $0.99/month base fee (auto-waived with CATH)
  - `POST /api/payments/tier-subscription` - Subscribe to Pro ($9.99) or Pro+ ($29.99)
  - `GET /api/tiers/resolve/:walletId` - Resolve tier with CATH holdings check
  - `PATCH /api/wallets/:id/payment-preference` - Set payment method (SOL/CATH)
- **Enhanced Payment Calculation:**
  - Updated `/api/payments/calculate/:walletId` to include CATH holdings, tier resolution, base fee waiver status
  - Returns app purchase status, tier thresholds, payment preferences
- **Tier Resolution Logic:**
  - Priority: $CATH holdings (50 for Pro, 100 for Pro+) > Paid subscription > Basic
  - NFT passes still override tier resolution for temporary upgrades
  - Base fee ($0.99/mo) waived when CATH worth ≥ 0.005 SOL
- **Security TODOs:**
  - Implement on-chain SPL token balance verification (never trust client)
  - Use trusted price oracles (Jupiter, Pyth) with caching
  - Add transaction signature verification for payments

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
1. **App Store Submission** (Lite Version)
   - Package Basic tier features for Google Play / Apple App Store
   - Implement app store payment integration (IAP)
   - Submit for review and approval
   
2. **Solana Smart Contract Development**
   - User agreement contracts (tier subscriptions, bot activations)
   - NFT pass integration contracts (benefit verification, tier overrides)
   - Payment processing contracts (SOL and $CATH token support)
   - Bot monthly fee enforcement via smart contract

3. **Bot Download & Authentication System**
   - Downloadable bot application (Electron or native)
   - QR code authentication flow with wallet signature verification
   - Embedded settings UI inside bot application
   - Bot configuration file download/import system

4. **Solana Integration**
   - Verify NFT ownership via Solana RPC
   - Parse NFT metadata for pass benefits
   - SPL token balance verification (never trust client)
   - Solana Name Service (.sol) claiming integration

5. **NFT Pass Features**
   - Automatic pass detection in user wallet
   - Pass benefit visualization in UI
   - DAO issuance tooling
   - Smart contract-based pass enforcement

6. **UI Updates**
   - Payment status indicators in Dashboard
   - Next payment due notifications
   - Bot lifecycle status (active/paused/pending deletion)
   - Pass activation modal

### Medium Priority
7. Integrate real Solana wallet adapters (@solana/wallet-adapter-react)
8. Connect to real Deep3 Labs API for Pro tier
9. Implement live arbitrage bot functionality
10. Add Solana Name Service (.sol) integration
11. Build payment/subscription flow for tier upgrades

### Low Priority
12. Add whitelist/blacklist management
13. Implement custom security rules (Pro+ feature)
14. Add detailed analytics dashboard
15. Build notification system (email/push)
16. Optimize performance and add caching layer