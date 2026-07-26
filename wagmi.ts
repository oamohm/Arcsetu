import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const giwaSepolia = defineChain({
  id: 91342,
  name: 'GIWA Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rpc.giwa.io'] },
  },
  blockExplorers: {
    default: { name: 'GIWA Explorer', url: 'https://sepolia-explorer.giwa.io' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'GiwaSetu',
  projectId: 'a3d6f1c249a0fbc28e5a7e1234567890', // Default WalletConnect Cloud Project ID
  chains: [giwaSepolia],
  ssr: true,
});

