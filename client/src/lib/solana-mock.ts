// Mock Solana wallet connection for MVP
// This simulates wallet connection until actual Solana wallet adapter is integrated

export interface WalletInfo {
  address: string;
  name: string;
  icon: string;
}

export const SUPPORTED_WALLETS = {
  phantom: {
    name: "Phantom",
    icon: "👻",
    installUrl: "https://phantom.app/",
  },
  solflare: {
    name: "Solflare",
    icon: "☀️",
    installUrl: "https://solflare.com/",
  },
  backpack: {
    name: "Backpack",
    icon: "🎒",
    installUrl: "https://backpack.app/",
  },
};

export async function connectWallet(walletType: keyof typeof SUPPORTED_WALLETS): Promise<WalletInfo> {
  // Simulate connection delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock wallet address
  const mockAddress = generateMockSolanaAddress();
  
  return {
    address: mockAddress,
    name: SUPPORTED_WALLETS[walletType].name,
    icon: SUPPORTED_WALLETS[walletType].icon,
  };
}

export function generateMockSolanaAddress(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let address = "";
  for (let i = 0; i < 44; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return address;
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function disconnectWallet(): void {
  // Cleanup mock connection
  localStorage.removeItem("wallet_connected");
}
