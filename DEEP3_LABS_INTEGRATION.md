# Deep3 Labs API Integration Guide

## 🔍 What is Deep3 Labs?

**Deep3 Labs** provides AI/ML models for Web3 applications, focusing on predictive analytics and user behavior analysis on blockchain networks.

**Website:** https://www.deep3.ai  
**Developer Portal:** https://developer.deep3.ai  
**Documentation:** https://docs.deep3.ai  
**API Endpoint:** https://api.deep3.ai/v0/

---

## 🤖 Available AI Models

Deep3 Labs offers several models, some of which can be useful for Wallet Buddhi:

### Security-Related Models

**DeepShield-FR** (Front-Running Detection)
- Predicts probability of malicious front-running ("sandwich") attacks
- Helps identify risky addresses
- **Use case for Wallet Buddhi:** Warn users about addresses known for MEV attacks

**DeepShield-HFT** (High-Frequency Trading Detection)
- Predicts probability of high-frequency token trading
- Identifies bot-like behavior
- **Use case for Wallet Buddhi:** Flag suspicious automated trading patterns

### Trading Prediction Models (Optional)

**HODL-C1**
- Predicts if an address will hold a token long-term
- **Use case:** Assess wallet behavior patterns

**StakeSage-C, StakeSage-L, StakeSage-H**
- Staking behavior predictions
- **Use case:** Understand user investment patterns

**CLUSTR-1**
- Token recommendation engine based on trading patterns
- **Use case:** Could help identify spam vs. legitimate tokens

---

## 🚀 How to Get API Access

### Step 1: Connect Your Wallet

Deep3 Labs uses **"Sign in with Ethereum"** authentication:

1. **Visit Developer Portal**
   ```
   https://developer.deep3.ai/go
   ```

2. **Click "Sign in with Ethereum"**
   - Connect your Phantom, Solflare, or MetaMask wallet
   - Sign a message to authenticate

3. **Automatic API Key Generation**
   - Your API key is automatically created when you connect
   - Stored in the Deep3 Labs system
   - Associated with your wallet address

### Step 2: Access Your API Key

After connecting your wallet:
- Navigate to your dashboard/profile
- Find "API Keys" section
- Copy your API key
- **Store it securely** (use Replit Secrets, never commit to Git)

**Important:** There may be a small delay (few minutes) after first connection while your API key is added to their systems.

---

## 📦 Installation

### Option 1: Official Node.js Client (Recommended)

```bash
npm install @deep3labs/node-client
```

**GitHub:** https://github.com/deep3labs/node-client

### Option 2: Direct HTTP Requests

Use any HTTP client (fetch, axios) to call the REST API directly.

---

## 💻 Integration Code

### Basic Setup (Node.js Client)

```typescript
// server/deep3-client.ts
import { Configuration, Deep3Api } from '@deep3labs/node-client';

// Initialize Deep3 API client
const config = new Configuration({
  apiKey: process.env.DEEP3_API_KEY // Store in Replit Secrets
});

export const deep3 = new Deep3Api(config);
```

### Example: Check Address for Front-Running Risk

```typescript
// server/deep3-threat-analysis.ts
import { deep3 } from './deep3-client';

export async function checkFrontRunningRisk(address: string, chainId: number = 1) {
  try {
    const prediction = await deep3.getPrediction({
      model: 'DeepShield-FR',
      chainId: chainId, // 1 = Ethereum, check supported chains
      publicAddress: address
    });
    
    return {
      address,
      frontRunningRisk: prediction.prediction, // Probability score
      confidence: prediction.confidence,
      threat: prediction.prediction > 0.7 ? 'HIGH' : prediction.prediction > 0.4 ? 'MEDIUM' : 'LOW'
    };
  } catch (error) {
    console.error('Deep3 API error:', error);
    throw error;
  }
}
```

### Example: Check High-Frequency Trading (Bot Detection)

```typescript
export async function checkHFTBehavior(address: string, chainId: number = 1) {
  try {
    const prediction = await deep3.getPrediction({
      model: 'DeepShield-HFT',
      chainId: chainId,
      publicAddress: address
    });
    
    return {
      address,
      hftProbability: prediction.prediction,
      isLikelyBot: prediction.prediction > 0.8,
      riskLevel: prediction.prediction > 0.8 ? 'DANGER' : prediction.prediction > 0.5 ? 'SUSPICIOUS' : 'SAFE'
    };
  } catch (error) {
    console.error('Deep3 API error:', error);
    throw error;
  }
}
```

### Direct HTTP API Call (Without Client)

```typescript
// Alternative: Direct fetch call
export async function getDeepShieldPrediction(
  model: string,
  chainId: number,
  address: string
) {
  const response = await fetch(
    `https://api.deep3.ai/v0/prediction/${model}/${chainId}/${address}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.DEEP3_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`Deep3 API error: ${response.statusText}`);
  }
  
  return await response.json();
}
```

---

## 🔗 Integration with Wallet Buddhi

### Update Threat Analysis Flow

Currently, Wallet Buddhi uses a mock Deep3 integration. Here's how to replace it with real API calls:

**File:** `server/routes.ts`

```typescript
// Replace mock Deep3 with real API
import { checkFrontRunningRisk, checkHFTBehavior } from './deep3-threat-analysis';

app.post('/api/transactions/:walletId/analyze', async (req, res) => {
  const { walletId } = req.params;
  const { transactionId } = req.body;
  
  try {
    // Get transaction details
    const transaction = await storage.getTransactionById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Run Deep3 analysis on sender address
    const [frRisk, hftRisk] = await Promise.all([
      checkFrontRunningRisk(transaction.fromAddress, 1), // Ethereum chainId
      checkHFTBehavior(transaction.fromAddress, 1)
    ]);
    
    // Combine with local classifier results
    const deep3Analysis = {
      frontRunningRisk: frRisk.frontRunningRisk,
      highFrequencyTrading: hftRisk.hftProbability,
      isLikelyMalicious: frRisk.threat === 'HIGH' || hftRisk.isLikelyBot,
      riskScore: Math.max(frRisk.frontRunningRisk, hftRisk.hftProbability)
    };
    
    // Merge with local classification
    const finalStatus = mergeThreatLevels(
      transaction.status,
      deep3Analysis.isLikelyMalicious ? 'DANGER' : 'SAFE'
    );
    
    // Update transaction
    await storage.updateTransaction(transactionId, {
      status: finalStatus,
      deep3Analysis
    });
    
    res.json({ success: true, analysis: deep3Analysis, status: finalStatus });
  } catch (error) {
    console.error('Deep3 analysis failed:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
```

---

## 🌐 Supported Blockchains

Deep3 Labs currently supports:
- **Ethereum** (chainId: 1)
- **Base** (chainId: 8453)
- **BNB Smart Chain** (chainId: 56)
- **Arbitrum** - Coming soon
- **Solana** - Coming soon (roadmap)

**Note:** Solana support is in development. For now, you may need to use the Ethereum version or wait for Solana integration.

To check currently supported chains:

```typescript
const chains = await deep3.getChains();
console.log('Supported chains:', chains);
```

---

## 🔐 Storing API Key Securely

### Using Replit Secrets

1. **Add to Secrets**
   - Open your Replit
   - Go to Tools → Secrets
   - Add: `DEEP3_API_KEY` = `your-api-key-here`

2. **Access in Code**
   ```typescript
   const apiKey = process.env.DEEP3_API_KEY;
   ```

3. **Never Commit**
   - API key is already excluded via `.env` in `.gitignore`
   - Add to `.env.example` as placeholder

---

## 💰 Pricing & Limits

**Pricing Model:**
- Deep3 Labs uses **D3L tokens** for transactions
- You purchase models/predictions using D3L tokens
- Receive authentication token for API access

**Rate Limits:** (Check documentation for current limits)
- Typical: 100 requests/minute for free tier
- Enterprise: Custom limits available

**Free Tier:**
- May have limited predictions per month
- Contact Deep3 Labs for details

---

## ⚠️ Important Considerations

### 1. Solana Support Status

**Current Status:** Not yet live (as of Jan 2025)  
**Roadmap:** Solana integration planned

**Options for Wallet Buddhi:**
1. **Wait for Solana support** - Keep mock implementation until ready
2. **Use Ethereum models as proxy** - If wallet has Ethereum activity, analyze that
3. **Hybrid approach** - Use Deep3 for Ethereum, local classifier for Solana

### 2. Model Limitations

Deep3's models focus on **predictive trading behavior**, not spam token detection:
- ✅ Good for: Identifying malicious traders, bot behavior, MEV attacks
- ❌ Not designed for: Spam token metadata analysis, rug pull detection

**Recommendation:** 
- Use Deep3 for **address reputation** (is this sender trustworthy?)
- Keep **local classifier** for **token analysis** (is this token spam?)

### 3. Cost Management

Each API call costs D3L tokens. To minimize costs:
- **Cache results** - Store Deep3 predictions in database
- **Rate limiting** - Limit Pro users to X analyses per day
- **Selective analysis** - Only analyze suspicious transactions
- **Batch requests** - Use bulk endpoints where available

---

## 🛠️ Implementation Checklist

- [ ] Sign up at https://developer.deep3.ai/go
- [ ] Connect wallet to get API key
- [ ] Add `DEEP3_API_KEY` to Replit Secrets
- [ ] Install `@deep3labs/node-client`
- [ ] Create `server/deep3-client.ts` with configuration
- [ ] Implement `checkFrontRunningRisk()` function
- [ ] Implement `checkHFTBehavior()` function
- [ ] Update `server/routes.ts` to use real Deep3 API
- [ ] Add Deep3 analysis results to transaction schema
- [ ] Test with real Ethereum addresses
- [ ] Monitor API usage and costs
- [ ] Wait for Solana support announcement

---

## 📚 Additional Resources

- **Developer Portal:** https://developer.deep3.ai
- **Documentation:** https://docs.deep3.ai
- **Node.js Client:** https://github.com/deep3labs/node-client
- **API Reference:** https://developer.deep3.ai/api
- **Hōkū App (Demo):** https://hoku.deep3.ai

---

## 🤔 Alternative: Build Custom Threat Detection

Since Deep3 Labs focuses on trading predictions rather than spam/threat detection, you might also consider:

### Option A: Use Deep3 for Address Reputation Only
- Check if sender is malicious trader
- Combine with local spam classifier for tokens

### Option B: Alternative Security APIs
- **Blowfish API** - Transaction simulation & security
- **GoPlus Security** - Token security analysis
- **Blockaid** - Wallet security & threat detection
- **Forta Network** - Real-time threat detection

### Option C: Build Your Own ML Model
- Train on historical spam transactions
- Use Solana transaction data
- More control, but requires ML expertise

---

## 📝 Next Steps for Wallet Buddhi

**Immediate (MVP):**
1. Keep mock Deep3 implementation
2. Focus on local spam classifier
3. Document Deep3 as "Coming Soon" feature

**Phase 2 (When Solana Support Launches):**
1. Sign up for Deep3 API
2. Integrate DeepShield models
3. Offer advanced threat detection to Pro users

**Alternative Path:**
1. Evaluate Blowfish or GoPlus for immediate Solana support
2. Compare pricing and features
3. Choose best fit for Wallet Buddhi's needs

Would you like me to research alternative security APIs that already support Solana?
