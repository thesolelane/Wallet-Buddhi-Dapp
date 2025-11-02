# 🌐 Setting Up wbuddhi.sol Domain on Solana

This guide covers registering your Solana Name Service (.sol) domain and deploying your Web3 portal.

---

## 📋 Prerequisites

- Solana wallet with SOL (Phantom, Solflare, or Backpack)
- ~5-10 SOL for domain registration (varies by name length and demand)
- Portal app built and ready to deploy

---

## Step 1: Register wbuddhi.sol Domain

### Option A: Using Bonfida SNS (Recommended)

**Bonfida** is the official Solana Name Service marketplace.

1. **Visit Bonfida SNS**
   ```
   https://naming.bonfida.org
   ```

2. **Connect Your Wallet**
   - Click "Connect Wallet"
   - Select Phantom/Solflare/Backpack
   - Approve connection

3. **Search for Domain**
   - Search: `wbuddhi`
   - Check availability
   - View pricing (depends on length and demand)

4. **Purchase Domain**
   - Click "Register"
   - Choose registration period (1 year recommended to start)
   - Approve transaction in wallet
   - Pay registration fee in SOL

5. **Domain Ownership**
   - Domain NFT minted to your wallet
   - You now own `wbuddhi.sol`
   - Can transfer, sell, or renew later

**Pricing Guide:**
- 1-character: ~750 SOL
- 2-character: ~100 SOL
- 3-character: ~10 SOL
- 4-character: ~5 SOL
- 5+ characters: ~1-5 SOL (most affordable)

**wbuddhi** (7 characters) should cost approximately **0.5-2 SOL** depending on market.

---

### Option B: Using SNS SDK (Programmatic)

If you prefer to register via code:

```bash
# Install SNS SDK
npm install @bonfida/spl-name-service
```

```typescript
import { registerDomainName } from '@bonfida/spl-name-service';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const buyer = Keypair.fromSecretKey(/* your wallet */);

// Register domain
const tx = await registerDomainName(
  connection,
  'wbuddhi', // domain name (without .sol)
  1_000,     // space allocated (1KB)
  buyer.publicKey,
  buyer.publicKey
);

await connection.sendTransaction(tx, [buyer]);
```

---

## Step 2: Deploy Portal to Decentralized Storage

You have **two main options** for hosting:

### Option A: IPFS (InterPlanetary File System) ⭐ Recommended

**IPFS** is the most popular decentralized storage for Web3 apps.

#### 2A.1: Build Your Portal

```bash
# In your portal Replit
npm run build

# Output: dist/ folder with static files
```

#### 2A.2: Deploy to IPFS via Fleek

**Fleek** makes IPFS deployment easy:

1. **Sign up at Fleek**
   ```
   https://fleek.co
   ```

2. **Connect Git Repository**
   - Link your GitHub repo (portal version)
   - Or upload `dist/` folder directly

3. **Configure Build**
   - Framework: Vite
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Deploy**
   - Fleek builds and deploys to IPFS
   - You get an IPFS hash (CID)
   - Example: `QmXxxx...yyyy`

5. **Access via IPFS Gateway**
   ```
   https://ipfs.io/ipfs/QmXxxx...yyyy
   https://gateway.pinata.cloud/ipfs/QmXxxx...yyyy
   ```

#### 2A.3: Alternative IPFS Services

- **Pinata** (https://pinata.cloud) - Simple IPFS pinning
- **NFT.Storage** (https://nft.storage) - Free IPFS storage
- **Web3.Storage** (https://web3.storage) - Free decentralized storage

**Using Pinata:**
```bash
# Install Pinata SDK
npm install @pinata/sdk

# Upload to IPFS
const pinata = new pinataSDK('API_KEY', 'API_SECRET');
const result = await pinata.pinFromFS('./dist');
console.log(result.IpfsHash); // QmXxxx...yyyy
```

---

### Option B: Arweave (Permanent Storage)

**Arweave** offers permanent, one-time-payment storage.

#### 2B.1: Deploy via Bundlr

```bash
# Install Bundlr CLI
npm install -g @bundlr-network/client

# Upload to Arweave
bundlr upload ./dist --wallet /path/to/wallet.json

# Returns Arweave transaction ID
# Access: https://arweave.net/TX_ID
```

#### 2B.2: Using ArDrive

1. Visit https://ardrive.io
2. Connect wallet
3. Upload `dist/` folder
4. Get permanent Arweave link

**Cost:** ~0.01 AR per MB (one-time payment for permanent storage)

---

## Step 3: Link .sol Domain to IPFS/Arweave

Now connect your `wbuddhi.sol` domain to your deployed app.

### 3.1: Using Bonfida Dashboard

1. **Go to Bonfida**
   ```
   https://naming.bonfida.org
   ```

2. **View Your Domains**
   - Connect wallet
   - Click "My Domains"
   - Select `wbuddhi.sol`

3. **Add IPFS Record**
   - Click "Edit Records"
   - Add new record:
     - **Type:** IPFS
     - **Value:** `QmXxxx...yyyy` (your IPFS hash)
   - Or for Arweave:
     - **Type:** URL
     - **Value:** `https://arweave.net/TX_ID`

4. **Save Changes**
   - Approve transaction in wallet
   - Records updated on-chain

### 3.2: Using SNS SDK (Programmatic)

```typescript
import { updateRecordV2 } from '@bonfida/spl-name-service';
import { Connection, PublicKey } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');

// Update IPFS record
const tx = await updateRecordV2(
  connection,
  'wbuddhi',
  { IPFS: 'QmXxxx...yyyy' }, // Your IPFS hash
  ownerWallet.publicKey,
  ownerWallet.publicKey
);

await connection.sendTransaction(tx, [ownerWallet]);
```

---

## Step 4: Access Your .sol Domain

### Via SNS Gateways

**Bonfida Gateway:**
```
https://wbuddhi.sol/ (via Bonfida gateway)
```

**IPFS Gateway with SNS:**
```
https://wbuddhi.sol.ipfsgateway.com
```

### Via Browser Extensions

Install **Phantom** or **Solflare** browser extension:
- Type `wbuddhi.sol` in address bar
- Extension resolves to IPFS content
- Loads your portal!

### Custom Gateway (Advanced)

You can run your own SNS gateway:
```bash
# Clone SNS gateway
git clone https://github.com/Bonfida/sns-gateway

# Configure and run
npm install
npm start
```

---

## 🔄 What To Do With Your Portal Replit

Since you have a **separate Replit for the portal**, here are your options:

### ⭐ Recommended: Share Code via Git

**Best approach for maintainability:**

1. **Use This Replit as Main Source**
   - This one has all the complete code
   - Push to GitHub (already set up)

2. **Portal Replit = Deployment Environment**
   - Clone same repo in portal Replit
   - Add environment variable: `DISTRIBUTION=portal`
   - Build and deploy to IPFS from there

**Setup:**
```bash
# In your portal Replit
git clone https://github.com/your-username/wallet-buddhi.git
cd wallet-buddhi

# Install dependencies
npm install

# Build portal version
DISTRIBUTION=portal npm run build

# Deploy to IPFS (using Fleek/Pinata)
```

### Alternative: Separate Portal Codebase

If you want **completely independent** portal:

1. **Copy Core Files**
   - Copy `shared/schema.ts` to portal Replit
   - Copy components you need
   - Portal has its own UI/features

2. **Share Backend API**
   - Portal calls same API endpoints
   - Both apps use same PostgreSQL database
   - Shared business logic

**Pros:** Independent development  
**Cons:** Duplicate code, harder to maintain

---

## 📊 Recommended Architecture

```
┌─────────────────────────────────────────────────┐
│  THIS REPLIT (Main Codebase)                    │
│  - Complete Wallet Buddhi app                   │
│  - Push to GitHub                               │
│  - Single source of truth                       │
└───────────────┬─────────────────────────────────┘
                │
                ├──> Deploy to walletbuddhi.io
                │    (Traditional web hosting)
                │
                └──> Portal Replit pulls same code
                     │
                     └──> Build with DISTRIBUTION=portal
                          │
                          └──> Deploy to IPFS
                               │
                               └──> Link to wbuddhi.sol

Both apps share:
✅ Same codebase
✅ Same database
✅ Same API
✅ Feature flags control differences
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Register `wbuddhi.sol` domain on Bonfida
- [ ] Build portal (`npm run build`)
- [ ] Test locally that build works
- [ ] Prepare wallet with ~2-3 SOL for transactions

### IPFS Deployment
- [ ] Sign up for Fleek/Pinata
- [ ] Upload `dist/` folder to IPFS
- [ ] Get IPFS hash (CID)
- [ ] Test access via IPFS gateway

### Domain Linking
- [ ] Connect wallet to Bonfida
- [ ] Update `wbuddhi.sol` IPFS record
- [ ] Approve transaction
- [ ] Wait for propagation (~5 minutes)
- [ ] Test: Visit `wbuddhi.sol` via Phantom

### Post-Deployment
- [ ] Verify all features work on .sol domain
- [ ] Test wallet connections
- [ ] Check WebSocket connections
- [ ] Monitor for errors

---

## 💰 Estimated Costs

| Item | Cost (SOL) | Cost (USD @ $100/SOL) |
|------|------------|------------------------|
| `wbuddhi.sol` registration (1 year) | 0.5-2 | $50-$200 |
| IPFS via Fleek | Free | Free |
| IPFS via Pinata (100GB) | Free tier | Free |
| Arweave (1GB permanent) | ~0.01 AR | ~$0.50 |
| SNS record updates | ~0.00005 | ~$0.01 |
| **Total (first year)** | **0.5-2 SOL** | **$50-$200** |

**Renewals:** ~0.02-0.1 SOL/year after initial registration

---

## 🔧 Troubleshooting

### Domain Not Resolving
- Wait 5-10 minutes after updating records
- Clear browser cache
- Try different IPFS gateway
- Check transaction confirmed on Solana Explorer

### IPFS Content Not Loading
- Verify IPFS hash is correct
- Try multiple gateways (ipfs.io, pinata, fleek)
- Check if content is pinned (use Pinata/Fleek dashboard)
- Ensure CID in Bonfida matches deployed hash

### Portal Not Working
- Check browser console for errors
- Verify API endpoints are correct
- Test IPFS content directly (bypass .sol domain)
- Ensure feature flags are set correctly

---

## 📚 Additional Resources

- **Bonfida SNS Docs:** https://docs.bonfida.org/collection/an-introduction-to-the-solana-name-service
- **IPFS Docs:** https://docs.ipfs.tech/
- **Fleek Docs:** https://docs.fleek.co/
- **Arweave Docs:** https://docs.arweave.org/
- **Solana Name Service SDK:** https://github.com/Bonfida/spl-name-service

---

## ✅ Next Steps

1. **Register `wbuddhi.sol`** on Bonfida
2. **Clone this repo** to your portal Replit
3. **Build portal version** with feature flags
4. **Deploy to IPFS** via Fleek
5. **Link domain** to IPFS hash
6. **Test and launch!** 🚀

---

**Questions?** The Solana and Bonfida communities are very helpful on Discord!
