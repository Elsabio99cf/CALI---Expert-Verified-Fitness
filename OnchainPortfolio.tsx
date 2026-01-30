'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPortfolios, unwrapOnchainKitResponse, type GetPortfoliosParams } from '@/app/types/api';
import type { Address } from 'viem';
import { toast } from 'sonner';

interface OnchainPortfolioProps {
  walletAddress: Address;
}

interface TokenBalance {
  tokenAddress: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  decimals: number;
}

interface PortfolioData {
  address: string;
  portfolioBalanceInUsd: string;
  tokenBalances: TokenBalance[];
}

export function OnchainPortfolio({ walletAddress }: OnchainPortfolioProps): JSX.Element {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchPortfolio = async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const params: GetPortfoliosParams = {
        addresses: [walletAddress],
      };

      const response = await getPortfolios(params);
      const data = unwrapOnchainKitResponse(response);

      if (data.portfolios && data.portfolios.length > 0) {
        setPortfolio(data.portfolios[0] as PortfolioData);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [walletAddress]);

  const handleRefresh = (): void => {
    fetchPortfolio();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading portfolio...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Portfolio Overview
            </CardTitle>
            <CardDescription>
              On-chain assets tracked via OnchainKit
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Balance */}
        {portfolio && (
          <>
            <div className="p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Total Portfolio Value</span>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-3xl font-bold">${parseFloat(portfolio.portfolioBalanceInUsd).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">USD</p>
            </div>

            {/* Token Balances */}
            {portfolio.tokenBalances && portfolio.tokenBalances.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Token Holdings</h3>
                {portfolio.tokenBalances.map((token, index) => (
                  <div
                    key={`${token.tokenAddress}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {token.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold">{token.symbol}</p>
                        <p className="text-xs text-muted-foreground">{token.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{parseFloat(token.balance).toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground">${parseFloat(token.balanceUSD).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No token balances found</p>
              </div>
            )}

            {/* Chain Badge */}
            <div className="pt-4 border-t">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                Base Blockchain
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
