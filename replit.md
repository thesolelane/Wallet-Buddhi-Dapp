# Wallet Buddhi - Solana Wallet Protection dApp

## Overview
Wallet Buddhi is a tiered Solana wallet protection system designed to detect spam tokens and malicious transactions, offering Basic (free local classification), Pro (Deep3 Labs AI), and Pro+ (arbitrage bots) services. Its purpose is to provide robust security and automated trading capabilities for Solana users. The business vision aims to establish Wallet Buddhi as a leading security solution in the Solana ecosystem, with monetization through app purchases, subscriptions, and a utility token ($CATH) for tier access and fee waivers.

## User Preferences
- **Visual Style:** Security-first, clean modern interface inspired by Phantom/Solflare
- **Default Theme:** Dark mode
- **Branding:** Wallet Buddhi mascot (blue shield character) prominently featured

## System Architecture

### UI/UX Decisions
The frontend uses React and TypeScript, with a responsive design, empty/loading states, and dark mode by default, adhering to a security-first visual style. Key UI components include WalletConnectModal, Dashboard, TierCard, TransactionRow, Deep3Modal, ArbitrageBotPanel, ImportBotDialog, and ThreatBadge. The application is built with TailwindCSS, Shadcn UI, Wouter, and React Query, using Inter and JetBrains Mono fonts, and a color scheme of Primary Blue and Solana Purple.

### Technical Implementations
The backend is built with Express and TypeScript, initially using in-memory storage, designed for future migration to PostgreSQL. It features a CA-first rules-based spam classifier where local blocks override Deep3 Labs' analysis. A WebSocket provides real-time transaction monitoring, bot status, and tier updates. A Bot Lifecycle Manager automates payment enforcement and bot cleanup. API endpoints handle CRUD operations and utilities for wallets, transactions, arbitrage bots, NFT passes, and payments, including specific flows for app purchases, base monthly fees, tier subscriptions, and tier resolution based on $CATH holdings. Validation is enforced using Zod schemas.

### Feature Specifications
- **Basic Tier:** Local spam classifier, real-time monitoring, basic threat classification (Safe, Suspicious, Danger, Blocked).
- **Pro Tier:** Includes Basic features, Deep3 Labs AI integration (mocked), advanced risk scoring, token metadata analysis, historical data access.
- **Pro+ Tier:** Includes Pro features, up to 5 arbitrage bots (2 included, 3 additional paid slots), bot template marketplace, JSON-based template import with validation, automated trading strategies, MEV protection, priority support.
- **Monetization:** One-time $0.99 app purchase + $0.99/month base fee (waived if $CATH holdings ≥ 0.005 SOL). Tier access is prioritized by $CATH holdings (50 for Pro, 100 for Pro+), then paid subscription ($9.99/month Pro, $29.99/month Pro+), otherwise Basic. Bot fees include a 0.5% transaction fee and monthly costs for additional bots. NFT Passes, issued as Solana NFTs, offer fee waivers, additional bot slots, or temporary tier upgrades.
- **Multi-Tenancy:** A shared database with wallet-level isolation ensures each Solana wallet address acts as a unique tenant. Row-Level Security (RLS) policies enforce tenant boundaries.
- **Domain Strategy:** `walletbuddhi.io` serves as the primary web entry point, `walletbuddhi.com` is an alternative, and `wbuddhi.sol` is a Web3 native portal for crypto-native users with on-chain payments.
- **Distribution Strategy:** A hybrid approach includes an App Store Lite Version (Basic tier only) for mainstream users and a Fully Decentralized Version (all tiers) for crypto-native users via `walletbuddhi.io` and `wbuddhi.sol`.
- **Bot Architecture:** Downloadable bot application with embedded settings interface (QR code-based wallet authentication, network selection, notifications, tier management, bot controls).
- **Smart Contract Architecture:** User agreements (tier subscriptions, bot activation) are managed as Solana smart contracts, integrated with the NFT pass system for benefit verification and on-chain enforcement.

## External Dependencies
- **Deep3 Labs AI:** For advanced threat analysis (currently mocked).
- **Solana Blockchain:** Used for wallet connections, NFT ownership verification, SPL token balance verification, and potential smart contract interactions.
- **Jupiter/Pyth:** Planned integration for trusted price oracles.
- **Solana Name Service (.sol):** Planned integration for personalized addresses.