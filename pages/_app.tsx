import '@rainbow-me/rainbowkit/styles.css'

import type { AppProps } from 'next/app'

import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'

import { WagmiProvider, http } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { defineChain } from 'viem'

import '../styles/globals.css'

/**
 * Arc Testnet
 * Chain ID: 5042002
 * Native settlement token: USDC
 */
export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',

  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },

  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.arc.network'],
    },
  },

  blockExplorers: {
    default: {
      name: 'ArcScan',
      url: 'https://testnet.arcscan.app',
    },
  },

  testnet: true,
})

/**
 * RainbowKit + Wagmi configuration
 */
const config = getDefaultConfig({
  appName: 'ArcSetu',

  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
    '0000000000000000000000000000000000000000000000000000000000000000',

  chains: [arcTestnet],

  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },

  ssr: true,
})

const queryClient = new QueryClient()

export default function App({
  Component,
  pageProps,
}: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={arcTestnet}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
