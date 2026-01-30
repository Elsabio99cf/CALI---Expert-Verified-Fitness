'use client';

import { useState, useEffect } from 'react';
import { Avatar as OnchainAvatar, Name as OnchainName, Identity } from '@coinbase/onchainkit/identity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Award, TrendingUp, Clock } from 'lucide-react';
import type { Address } from 'viem';
import { base } from 'wagmi/chains';

interface OnchainProfileProps {
  walletAddress: Address;
  totalVerifications?: number;
  totalEarnings?: string;
  memberSince?: string;
  reputationLevel?: string;
}

export function OnchainProfile({
  walletAddress,
  totalVerifications = 0,
  totalEarnings = '0',
  memberSince,
  reputationLevel = 'Bronze',
}: OnchainProfileProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading identity data
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [walletAddress]);

  const reputationColors: Record<string, string> = {
    'Bronze': 'bg-orange-100 text-orange-700 border-orange-300',
    'Silver': 'bg-gray-100 text-gray-700 border-gray-300',
    'Gold': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Platinum': 'bg-purple-100 text-purple-700 border-purple-300',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Your Onchain Profile
        </CardTitle>
        <CardDescription>
          Powered by Base blockchain identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Identity Section with OnchainKit Components */}
        <div className="flex items-center gap-4">
          <Identity
            address={walletAddress}
            chain={base}
            schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
          >
            <OnchainAvatar 
              address={walletAddress}
              chain={base}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex flex-col gap-1">
              <OnchainName
                address={walletAddress}
                chain={base}
                className="font-semibold text-lg"
              />
              <p className="text-sm text-muted-foreground font-mono">
                {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
              </p>
            </div>
          </Identity>
        </div>

        {/* Reputation Badge */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Reputation</span>
          </div>
          <Badge className={reputationColors[reputationLevel] || reputationColors['Bronze']}>
            {reputationLevel}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Verifications */}
          <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Verifications</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{totalVerifications}</p>
          </div>

          {/* Total Earnings */}
          <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Total Earned</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{totalEarnings}</p>
            <p className="text-xs text-muted-foreground">CALI</p>
          </div>
        </div>

        {/* Member Since */}
        {memberSince && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Member since {new Date(memberSince).toLocaleDateString()}</span>
          </div>
        )}

        {/* Blockchain Badge */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Verified on Base blockchain</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
