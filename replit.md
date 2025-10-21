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