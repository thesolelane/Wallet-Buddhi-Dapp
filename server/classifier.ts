import { TokenClassification, ThreatLevel } from "@shared/schema";

export interface TokenInfo {
  address: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

export interface ClassificationResult {
  classification: TokenClassification;
  threatLevel: ThreatLevel;
  reason: string;
  confidence: number;
}

// CA-first (Contract Analysis) spam classifier
// This implements local rules-based classification

const SPAM_PATTERNS = {
  // Known scam token patterns
  suspiciousNames: /free|airdrop|claim|bonus|reward|giveaway|double|mystery/i,
  suspiciousSymbols: /xxx|scam|rug|fake/i,
  
  // Suspicious address patterns (for demo purposes)
  knownScamPrefixes: ["1111", "dead", "beef"],
};

const WHITELIST = {
  // Known legitimate tokens (example addresses)
  tokens: new Set([
    "So11111111111111111111111111111111111111112", // Wrapped SOL
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  ]),
};

export class TokenClassifier {
  classify(token: TokenInfo): ClassificationResult {
    // Whitelist check
    if (WHITELIST.tokens.has(token.address)) {
      return {
        classification: TokenClassification.ALLOW,
        threatLevel: ThreatLevel.SAFE,
        reason: "Whitelisted token - verified legitimate",
        confidence: 100,
      };
    }
    
    // Check for suspicious name patterns
    if (token.name && SPAM_PATTERNS.suspiciousNames.test(token.name)) {
      return {
        classification: TokenClassification.BLOCK,
        threatLevel: ThreatLevel.BLOCKED,
        reason: `Spam detected: Token name "${token.name}" matches known scam patterns`,
        confidence: 90,
      };
    }
    
    // Check for suspicious symbol patterns
    if (token.symbol && SPAM_PATTERNS.suspiciousSymbols.test(token.symbol)) {
      return {
        classification: TokenClassification.BLOCK,
        threatLevel: ThreatLevel.BLOCKED,
        reason: `Spam detected: Token symbol "${token.symbol}" matches known scam patterns`,
        confidence: 95,
      };
    }
    
    // Check for suspicious address patterns
    const addressPrefix = token.address.slice(0, 4).toLowerCase();
    if (SPAM_PATTERNS.knownScamPrefixes.some(prefix => addressPrefix.includes(prefix))) {
      return {
        classification: TokenClassification.WARN,
        threatLevel: ThreatLevel.SUSPICIOUS,
        reason: "Address matches known scam pattern prefix",
        confidence: 70,
      };
    }
    
    // Check for very new/unknown tokens (simple heuristic)
    if (!token.name || !token.symbol) {
      return {
        classification: TokenClassification.WARN,
        threatLevel: ThreatLevel.SUSPICIOUS,
        reason: "Incomplete token metadata - exercise caution",
        confidence: 60,
      };
    }
    
    // Default: Allow but monitor
    return {
      classification: TokenClassification.ALLOW,
      threatLevel: ThreatLevel.SAFE,
      reason: "No suspicious patterns detected",
      confidence: 75,
    };
  }
  
  // Merge local classification with Deep3 results
  // Rule: Local BLOCK wins, Deep3 can only raise severity
  mergeWithDeep3(
    local: ClassificationResult,
    deep3RiskScore: number
  ): { classification: TokenClassification; threatLevel: ThreatLevel } {
    // If local blocked, always block
    if (local.classification === TokenClassification.BLOCK) {
      return {
        classification: TokenClassification.BLOCK,
        threatLevel: ThreatLevel.BLOCKED,
      };
    }
    
    // Deep3 can escalate threat level
    let finalThreatLevel = local.threatLevel;
    let finalClassification = local.classification;
    
    if (deep3RiskScore >= 70) {
      finalThreatLevel = ThreatLevel.DANGER;
      finalClassification = TokenClassification.WARN;
    } else if (deep3RiskScore >= 40 && local.threatLevel === ThreatLevel.SAFE) {
      finalThreatLevel = ThreatLevel.SUSPICIOUS;
      finalClassification = TokenClassification.WARN;
    }
    
    return { classification: finalClassification, threatLevel: finalThreatLevel };
  }
}

export const classifier = new TokenClassifier();
