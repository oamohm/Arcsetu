import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { giwaSepolia, arcNetwork } from '../wagmi'

const config = createConfig({
  chains: [giwaSepolia, arcNetwork],
  transports: {
    [giwaSepolia.id]: http(),
    [arcNetwork.id]: http(),
  },
})

const queryClient = new QueryClient()

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
