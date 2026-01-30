'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CALI_TOKEN_ADDRESS } from '@/lib/tokenContract';
import { useTokenPrice } from '@/hooks/useTokenPrice';
import { Skeleton } from '@/components/ui/skeleton';

export function TokenPriceDisplay(): JSX.Element {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const { priceData, isLoading, error, refetch } = useTokenPrice({
    tokenAddress: CALI_TOKEN_ADDRESS,
  });

  const handleRefresh = async (): Promise<void> => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatPrice = (price: number): string => {
    if (price < 0.000001) {
      return `$${price.toExponential(2)}`;
    }
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    }
    if (price < 1) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            CALI Token Price
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error && !priceData) {
    return (
      <Card className="w-full border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            CALI Token Price
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm space-y-1">
              <p className="text-amber-800 dark:text-amber-200 font-medium">Price temporarily unavailable</p>
              <p className="text-xs text-amber-700 dark:text-amber-300">{error}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                This could mean:
              </p>
              <ul className="text-xs list-disc list-inside text-amber-700 dark:text-amber-300 space-y-0.5">
                <li>Token not yet listed on exchanges</li>
                <li>Insufficient liquidity on Base</li>
                <li>API temporarily unavailable</li>
              </ul>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try Again
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="w-full"
            asChild
          >
            <a
              href={`https://basescan.org/token/${CALI_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2"
            >
              View on BaseScan
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!priceData) return <></>;

  const isPositive = priceData.change24h >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="w-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            CALI Token Price
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-6 w-6 p-0"
            title="Refresh price"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">
            {formatPrice(priceData.price)}
          </span>
          <span className="text-xs text-muted-foreground">USD</span>
        </div>

        <div className="flex items-center gap-1">
          <TrendIcon className={`w-3 h-3 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
          <span
            className={`text-xs font-medium ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {formatChange(priceData.change24h)}
          </span>
          <span className="text-xs text-muted-foreground">24h</span>
        </div>

        <div className="pt-2 border-t border-primary/10">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(priceData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>

        <div className="pt-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-auto p-0 text-xs text-primary hover:text-primary/80"
            asChild
          >
            <a
              href={`https://basescan.org/token/${CALI_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              View on BaseScan
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
        </div>

        {error && (
          <div className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
