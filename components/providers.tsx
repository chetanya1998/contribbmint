'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

// Fallback config if projectId is missing to prevent build crashes
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '3a8170812b534d0ff9d794f19a901d64'; // Public demo ID

const config = getDefaultConfig({
  appName: 'ContribMint',
  projectId,
  chains: [localhost, sepolia, mainnet],
  ssr: true, // If true, client will hydrate. If false, might mismatch.
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
