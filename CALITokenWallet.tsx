'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, Send, TrendingUp, Wallet as WalletIcon } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useBlockchainTransactions } from '@/hooks/useBlockchainTransactions';
import { getCALITokenDetails, isValidCALIAmount } from '@/lib/caliToken';
import { CALI_TOKEN_ADDRESS } from '@/lib/tokenContract';
import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { toast } from 'sonner';

export function CALITokenWallet(): JSX.Element {
  const { address } = useAccount();
  const { data: tokenBalance } = useBalance({
    address: address as Address | undefined,
    token: CALI_TOKEN_ADDRESS,
  });

  const { sendCALITokens, isProcessing } = useBlockchainTransactions();
  
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [tokenPrice, setTokenPrice] = useState<string | null>(null);

  // Fetch token details and price
  useEffect(() => {
    const fetchTokenDetails = async (): Promise<void> => {
      const details = await getCALITokenDetails();
      if (details?.price) {
        setTokenPrice(details.price);
      }
    };

    fetchTokenDetails();
  }, []);

  const handleSendTokens = async (): Promise<void> => {
    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    if (!recipientAddress || !sendAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidCALIAmount(sendAmount)) {
      toast.error('Invalid amount');
      return;
    }

    // Validate recipient address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
      toast.error('Invalid recipient address');
      return;
    }

    const result = await sendCALITokens({
      recipientAddress: recipientAddress as Address,
      amount: sendAmount,
      senderAddress: address,
    });

    if (result.success) {
      setRecipientAddress('');
      setSendAmount('');
    }
  };

  const formattedBalance = tokenBalance
    ? formatUnits(tokenBalance.value, tokenBalance.decimals)
    : '0';

  const balanceUSD = tokenPrice && tokenBalance
    ? (parseFloat(formattedBalance) * parseFloat(tokenPrice)).toFixed(2)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          CALI Token Wallet
        </CardTitle>
        <CardDescription>
          Manage your CALI tokens on Base blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Balance Display */}
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Your Balance</span>
            <WalletIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{parseFloat(formattedBalance).toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">CALI</p>
          {balanceUSD && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs text-green-600">${balanceUSD} USD</span>
            </div>
          )}
        </div>

        {/* Token Price */}
        {tokenPrice && (
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <span className="text-sm text-muted-foreground">Token Price</span>
            <span className="font-semibold">${parseFloat(tokenPrice).toFixed(4)}</span>
          </div>
        )}

        {/* Send Tokens Section */}
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send CALI Tokens
          </h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                type="text"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (CALI)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Available: {parseFloat(formattedBalance).toFixed(2)} CALI
              </p>
            </div>

            <Button
              onClick={handleSendTokens}
              disabled={isProcessing || !recipientAddress || !sendAmount}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              {isProcessing ? 'Sending...' : 'Send Tokens'}
            </Button>
          </div>
        </div>

        {/* Contract Info */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Contract: {CALI_TOKEN_ADDRESS.slice(0, 10)}...{CALI_TOKEN_ADDRESS.slice(-8)}</p>
            <p className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Deployed on Base
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
