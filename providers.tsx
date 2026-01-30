'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { WalletAuthProvider } from '@/contexts/WalletAuthContext';
import { ChallengeProvider } from '@/contexts/ChallengeContext';
import { ReminderProvider } from '@/contexts/ReminderContext';
import { TokenRewardProvider } from '@/contexts/TokenRewardContext';
import { VideoVerificationProvider } from '@/contexts/VideoVerificationContext';
import { SocialVerificationProvider } from '@/contexts/SocialVerificationContext';
import { ExpertVerificationProvider } from '@/contexts/ExpertVerificationContext';
import { ONCHAINKIT_API_KEY, ONCHAINKIT_PROJECT_ID } from './config/onchainkit';
import { config, activeChain } from '@/lib/wagmi';

export function Providers({ children }: { children: ReactNode }): JSX.Element {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5_000,
      },
    },
  }));

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={ONCHAINKIT_API_KEY}
          projectId={ONCHAINKIT_PROJECT_ID}
          chain={activeChain}
          config={{
            appearance: {
              name: 'CaliFit',
              logo: 'https://cdn.builder.io/api/v1/image/assets/TEMP/9756b3248bdd48d596519e7d98958e9df5588654dadf0bb17a71fc435bcb37b3?placeholderIfAbsent=true&apiKey=ad3941e5ec034c87bd50708c966e7b84',
              mode: 'auto',
              theme: 'default',
            },
          }}
        >
          <ThemeProvider>
            <WalletAuthProvider>
              <TokenRewardProvider>
                <ReminderProvider>
                  <ChallengeProvider>
                    <VideoVerificationProvider>
                      <ExpertVerificationProvider>
                        <SocialVerificationProvider>
                          {children}
                        </SocialVerificationProvider>
                      </ExpertVerificationProvider>
                    </VideoVerificationProvider>
                  </ChallengeProvider>
                </ReminderProvider>
              </TokenRewardProvider>
            </WalletAuthProvider>
          </ThemeProvider>
          <Toaster richColors position="top-center" />
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
