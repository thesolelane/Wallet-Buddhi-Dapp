# 🛡️ Wallet Buddhi

**AI-Powered Solana Wallet Protection**

Wallet Buddhi is a tiered security solution for Solana wallets, providing real-time transaction monitoring, spam token detection, and automated trading protection. Built with the goal of becoming a leading security solution in the Solana ecosystem.

---

## ✨ Features

### 🔐 Security Features
- **Real-time Transaction Monitoring** - WebSocket-based live monitoring of wallet activity
- **Spam Token Detection** - CA-first (Contract Analysis) rules-based classifier
- **AI Threat Analysis** - Deep3 Labs integration for advanced risk scoring (Pro tier)
- **Threat Classification** - Safe, Suspicious, Danger, and Blocked status levels
- **Token Metadata Analysis** - Automatic parsing and validation

### 🤖 Arbitrage Protection (Pro+ Only)
- **Up to 5 Arbitrage Bots** - 2 included free, 3 additional paid slots
- **Bot Template Marketplace** - Import pre-configured trading strategies via JSON
- **MEV Protection** - Automated protection against maximum extractable value attacks
- **Customizable Strategies** - Configure risk tolerance, slippage, DEX allowlists
- **Auto-Pause Config** - Automatic safety mechanisms

### 💎 Tier System
- **Basic** - Free local spam classification and real-time monitoring
- **Pro** - $9.99/month or 50 $CATH tokens - Includes Deep3 AI analysis
- **Pro+** - $29.99/month or 100 $CATH tokens - Full arbitrage bot suite

### 💰 Monetization
- **App Purchase** - $0.99 one-time fee
- **Base Monthly Fee** - $0.99/month (waived with ≥0.005 SOL worth of $CATH)
- **Tier Subscriptions** - Pay with SOL or $CATH tokens
- **NFT Pass System** - DAO-issued Solana NFTs for fee waivers and upgrades

---

## 🏗️ Tech Stack

### Frontend
- **React** + **TypeScript** - Modern component-based UI
- **TailwindCSS** + **Shadcn UI** - Beautiful, accessible components
- **Wouter** - Lightweight client-side routing
- **TanStack Query** - Powerful data fetching and caching
- **Framer Motion** - Smooth animations

### Backend
- **Express** - Fast, unopinionated web framework
- **TypeScript** - Type-safe server code
- **WebSocket (ws)** - Real-time bidirectional communication
- **Drizzle ORM** - Type-safe database queries
- **Zod** - Runtime type validation

### Infrastructure
- **In-Memory Storage** - Fast MVP implementation, PostgreSQL-ready architecture
- **Neon PostgreSQL** - Production database (when migrated)
- **Solana Web3.js** - Blockchain integration (planned)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wallet-buddhi.git
   cd wallet-buddhi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "SESSION_SECRET=your-secret-key-here" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

---

## 📖 Usage

### Connect Your Wallet
1. Click "Connect Wallet" in the header
2. Select your wallet type (Phantom, Solflare, or Backpack)
3. Authorize the connection

### Monitor Transactions
- View real-time transaction feed on the Dashboard
- Check threat levels with color-coded badges
- Filter by Safe, Suspicious, Danger, or Blocked

### Upgrade Tiers
1. Navigate to the Tiers page
2. Choose Pro or Pro+ tier
3. Pay via SOL or hold $CATH tokens for automatic access

### Activate Arbitrage Bots (Pro+ Only)
1. Go to Dashboard → Arbitrage Bots panel
2. Click "Import Bot Template"
3. Select a strategy or paste JSON configuration
4. Configure risk settings and activate

---

## 🎯 Distribution Strategy

### Hybrid Approach

**App Store Lite Version** (Google Play / Apple App Store)
- Basic tier only - Transaction monitoring and local spam detection
- $0.99 one-time purchase + $0.99/month base fee
- No arbitrage bots - Security monitoring only
- Target: Mainstream users, crypto newcomers

**Fully Decentralized Version** (Web App + Downloadable Bot)
- All tiers (Basic/Pro/Pro+) with full features
- On-chain payments via SOL/$CATH smart contracts (0% platform fees)
- Arbitrage bots included - Full Pro+ functionality
- Target: Crypto-native users (Phantom/Solflare/Backpack holders)

---

## 🏛️ Architecture

### Classification Logic
**"Local BLOCK Wins" Rule** - Local classifier's "BLOCK" status always takes precedence; Deep3 AI can only elevate threats, never downgrade blocks.

### Payment Enforcement
**Bot Lifecycle Manager** - Runs hourly to check payment status, auto-pause unpaid bots, and delete bots inactive for 30+ days (excludes first 2 free bots).

### Tier Resolution Priority
1. **$CATH Holdings** - 50 tokens for Pro, 100 for Pro+
2. **Paid Subscription** - $9.99/month Pro, $29.99/month Pro+
3. **Default** - Basic tier

### NFT Pass System
- DAO-issued Solana NFTs grant fee waivers, additional bot slots, or temporary tier upgrades
- Benefits extracted from NFT metadata
- Automatic detection when passes are in user wallet

---

## 🛣️ Roadmap

### Phase 1: MVP ✅
- [x] Basic UI/UX with wallet connection
- [x] Local spam classifier
- [x] Real-time WebSocket monitoring
- [x] Tier system implementation
- [x] Bot template import system

### Phase 2: Blockchain Integration 🔄
- [ ] Real Solana wallet adapters (@solana/wallet-adapter-react)
- [ ] SPL token balance verification (never trust client)
- [ ] NFT ownership verification via Solana RPC
- [ ] Smart contract development for user agreements

### Phase 3: AI & Security 🔜
- [ ] Deep3 Labs API integration
- [ ] Live arbitrage bot functionality
- [ ] MEV protection implementation
- [ ] Advanced threat detection

### Phase 4: Distribution 📱
- [ ] App Store submission (Lite version)
- [ ] Downloadable bot application (Electron/native)
- [ ] QR code authentication flow
- [ ] Solana Name Service (.sol) integration

---

## 📂 Project Structure

```
wallet-buddhi/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Home, Dashboard, Tiers)
│   │   ├── lib/            # Utilities and helpers
│   │   └── App.tsx         # Main app component
├── server/                  # Backend Express application
│   ├── routes.ts           # API endpoints
│   ├── storage.ts          # Storage interface (in-memory)
│   ├── classifier.ts       # Token spam detection
│   ├── cath-utils.ts       # $CATH token utilities
│   └── websocket.ts        # Real-time communication
├── shared/                  # Shared types and schemas
│   └── schema.ts           # Drizzle schemas and Zod validation
└── attached_assets/         # Images and media files
```

---

## 🔒 Security

### Best Practices
- Never expose API keys or secrets in client code
- All payments verified server-side
- SPL token balances checked on-chain (never trust client)
- NFT ownership verified via Solana RPC
- Trusted price oracles (Jupiter, Pyth) with caching

### Security Checklist
- [x] Environment secrets managed securely
- [x] Server-side validation with Zod schemas
- [ ] On-chain balance verification (planned)
- [ ] Smart contract audits (planned)
- [ ] Rate limiting on API endpoints (planned)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Deep3 Labs** - AI threat analysis partner
- **Solana Foundation** - Blockchain infrastructure
- **Phantom, Solflare, Backpack** - Wallet integration support
- **Shadcn UI** - Beautiful component library

---

## 📞 Contact

- **Twitter/X**: [@WalletBuddhi](#)
- **Discord**: [Join our community](#)
- **Email**: support@walletbuddhi.com

---

<div align="center">
  <strong>Built with 💙 for the Solana ecosystem</strong>
</div>
