// Generate mock transaction data for demonstration

export async function generateMockTransaction(walletAddress: string) {
  const mockTokens = [
    { name: "Bonk Token", symbol: "BONK", safe: true },
    { name: "Free Airdrop SOL", symbol: "SCAM", safe: false },
    { name: "Jupiter", symbol: "JUP", safe: true },
    { name: "Double Your Money", symbol: "XXX", safe: false },
    { name: "Raydium", symbol: "RAY", safe: true },
    { name: "Mystery Box Reward", symbol: "FAKE", safe: false },
  ];
  
  const token = mockTokens[Math.floor(Math.random() * mockTokens.length)];
  
  // Generate random token address
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let tokenAddress = "";
  
  // Make some addresses suspicious
  if (!token.safe) {
    tokenAddress = "1111" + Array(40).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
  } else {
    tokenAddress = Array(44).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
  }
  
  return {
    walletAddress,
    tokenAddress,
    tokenName: token.name,
    tokenSymbol: token.symbol,
    amount: (Math.random() * 1000000).toFixed(2),
  };
}
