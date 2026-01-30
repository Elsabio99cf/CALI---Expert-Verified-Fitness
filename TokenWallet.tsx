'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet as WalletIcon, Coins, ArrowUpRight, ExternalLink, CheckCircle2, Loader2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { useTokenReward } from '@/contexts/TokenRewardContext';
import { useWalletAuth } from '@/contexts/WalletAuthContext';
import { useAccount, useSignMessage } from 'wagmi';
import { 
  Wallet, 
  ConnectWallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
  WalletDropdownBasename
} from '@coinbase/onchainkit/wallet';
import { Identity } from '@coinbase/onchainkit/identity';
import { toast } from 'sonner';
import { buildSendTransaction } from '@/app/types/api';
import { CALI_TOKEN_ADDRESS, parseTokenAmount, formatTokenAmount } from '@/lib/tokenContract';
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';

export function TokenWallet(): JSX.Element {
  const { balance, rewards, claimRewards, withdrawToWallet, verifyDailyLogin, canClaimDailyLogin, pendingVerificationCount, isWithdrawalDay, nextWithdrawalDate, daysUntilWithdrawal, dailyLoginStreak, nextDailyLoginReward } = useTokenReward();
  const { user } = useWalletAuth();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isClaiming, setIsClaiming] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [isVerifyingLogin, setIsVerifyingLogin] = useState<boolean>(false);
  
  const { 
    data: txHash, 
    sendTransaction,
    isPending: isSending,
    error: sendError 
  } = useSendTransaction();
  
  const { 
    isLoading: isConfirming,
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const verifiedRewards = rewards.filter((r) => !r.claimed && r.verificationStatus === 'verified');
  const pendingVerificationRewards = rewards.filter((r) => !r.claimed && r.verificationStatus === 'pending');
  const recentRewards = rewards
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const getVerificationBadge = (reward: typeof rewards[0]): JSX.Element => {
    if (reward.claimed) {
      return <Badge variant="default" className="text-xs">Claimed</Badge>;
    }

    switch (reward.verificationStatus) {
      case 'verified':
        return <Badge variant="default" className="text-xs bg-green-500">✓ Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
          <Clock className="w-3 h-3 mr-1" />
          Verifying
        </Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  const handleWithdrawToWallet = async (): Promise<void> => {
    if (!address || !isConnected) {
      toast.error('Connect your wallet first', {
        description: 'Please connect your Base wallet to withdraw tokens',
      });
      return;
    }

    if (!isWithdrawalDay) {
      toast.error('Withdrawal not available', {
        description: 'Tokens can only be withdrawn on the 30th of each month',
        duration: 6000,
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      const success = await withdrawToWallet(address);
      
      if (success) {
        toast.success('Withdrawal successful!', {
          description: 'CALI tokens have been sent to your wallet',
        });
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to withdraw tokens', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleVerifyDailyLogin = async (): Promise<void> => {
    if (!address || !isConnected) {
      toast.error('Connect your wallet first', {
        description: 'Please connect your wallet to verify daily login',
      });
      return;
    }

    if (!canClaimDailyLogin) {
      toast.error('Daily login already claimed', {
        description: 'Come back tomorrow for your next reward!',
      });
      return;
    }

    setIsVerifyingLogin(true);

    try {
      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substring(7);
      
      // Create verification message
      const message = `Verify Daily Login for CALI Rewards\n\nWallet: ${address}\nDate: ${new Date().toDateString()}\nTimestamp: ${timestamp}\nNonce: ${nonce}`;

      // Request signature
      const signature = await signMessageAsync({ message });

      if (!signature) {
        toast.error('Signature rejected');
        setIsVerifyingLogin(false);
        return;
      }

      // Verify daily login with signature
      const success = await verifyDailyLogin(signature);
      
      if (success) {
        // Success toast is shown by verifyDailyLogin function
      }
    } catch (error) {
      console.error('Daily login verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Verification failed';
      
      if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        toast.error('Signature rejected by user');
      } else {
        toast.error('Daily login verification failed', {
          description: 'Please try again',
        });
      }
    } finally {
      setIsVerifyingLogin(false);
    }
  };

  const handleClaimRewards = async (): Promise<void> => {
    if (!address || !isConnected) {
      toast.error('Connect your wallet first', {
        description: 'Please connect your Base wallet to claim rewards',
      });
      return;
    }

    if (verifiedRewards.length === 0) {
      if (pendingVerificationRewards.length > 0) {
        toast.error('No verified rewards to claim', {
          description: `${pendingVerificationRewards.length} reward(s) pending verification`,
        });
      } else {
        toast.error('No rewards to claim');
      }
      return;
    }

    setIsClaiming(true);

    try {
      // IMPORTANT: In production, this should:
      // 1. Call your backend to verify and prepare the claim
      // 2. Backend should transfer tokens from a treasury/rewards wallet
      // 3. For MVP, we show the transaction flow
      
      toast.info('Preparing claim...', {
        description: 'Verifying your rewards',
      });

      // Call backend to validate claim
      const verifyResponse = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.walletAddress,
          rewardIds: verifiedRewards.map(r => r.id),
          walletAddress: address,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Claim verification failed');
      }

      const { success, needsWalletConnection } = await verifyResponse.json();

      if (!success) {
        throw new Error('Claim not allowed');
      }

      // For production: Build transaction to transfer tokens
      // This requires a backend service to sign and send from treasury wallet
      if (needsWalletConnection) {
        toast.info('Token distribution system', {
          description: 'Connect with your team to set up automated token distribution from treasury wallet',
          duration: 10000,
        });
        
        // Mark as claimed in local storage for demo
        const claimed = await claimRewards(address);
        if (claimed) {
          toast.success('Rewards marked for distribution!', {
            description: `${balance.pending} CALI tokens will be sent to your wallet`,
          });
        }
      }
    } catch (error) {
      console.error('Claim error:', error);
      toast.error('Failed to claim rewards', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5" />
              CALI Token Wallet
            </CardTitle>
            <Wallet>
              <ConnectWallet className="min-w-[90px]" />
              <WalletDropdown>
                <Identity className="px-4 py-2 hover:bg-slate-100" hasCopyAddressOnClick />
                <WalletDropdownBasename />
                <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
                  Go to Wallet Dashboard
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </CardHeader>
        <CardContent>
          {isConnected && address ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">Your CALI Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-600">{balance.total}</span>
                  <span className="text-lg text-gray-600">CALI</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Pending</p>
                    <p className="font-semibold text-orange-600">{balance.pending} CALI</p>
                  </div>
                  <div>
                    <p className="text-gray-600">In-App</p>
                    <p className="font-semibold text-blue-600">{balance.inApp} CALI</p>
                  </div>
                  <div>
                    <p className="text-gray-600">In Wallet</p>
                    <p className="font-semibold text-green-600">{balance.withdrawn} CALI</p>
                  </div>
                </div>
              </div>

              {/* Pending Verification Notice */}
              {pendingVerificationCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-orange-900 mb-1">
                        {pendingVerificationCount} Workout{pendingVerificationCount > 1 ? 's' : ''} Pending Verification
                      </p>
                      <p className="text-orange-700">
                        Your workout data is being verified. Verified tokens will be available to claim shortly (usually within a few seconds).
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {parseFloat(balance.pending) > 0 && (
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleClaimRewards}
                    disabled={isClaiming || isSending || isConfirming}
                  >
                    {isClaiming || isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isSending ? 'Sending Transaction...' : 'Claiming...'}
                      </>
                    ) : isConfirming ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : isConfirmed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Claimed!
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Claim {balance.pending} CALI to In-App
                      </>
                    )}
                  </Button>
                )}

                {/* Withdrawal Section */}
                {parseFloat(balance.inApp) > 0 && (
                  <div className="space-y-3">
                    <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <WalletIcon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm flex-1">
                          <p className="font-semibold text-purple-900 mb-1">
                            {isWithdrawalDay ? '🎉 Withdrawal Available Today!' : `Next Withdrawal: ${nextWithdrawalDate}`}
                          </p>
                          <p className="text-purple-700">
                            {isWithdrawalDay 
                              ? 'You can withdraw your in-app CALI tokens to your wallet today!' 
                              : `You can withdraw tokens to your wallet in ${daysUntilWithdrawal} day${daysUntilWithdrawal !== 1 ? 's' : ''} (on the 30th of each month)`
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      variant={isWithdrawalDay ? 'default' : 'secondary'}
                      onClick={handleWithdrawToWallet}
                      disabled={!isWithdrawalDay || isWithdrawing}
                    >
                      {isWithdrawing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Withdrawing...
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-4 h-4 mr-2" />
                          {isWithdrawalDay 
                            ? `Withdraw ${balance.inApp} CALI to Wallet` 
                            : `Withdraw ${balance.inApp} CALI (Available ${nextWithdrawalDate})`
                          }
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {sendError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-600">
                    Transaction failed: {sendError.message}
                  </p>
                </div>
              )}

              {txHash && (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Transaction submitted!
                    <a
                      href={`https://basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline flex items-center gap-1"
                    >
                      View on BaseScan
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <WalletIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Connect your Base wallet to view and claim your CALI tokens</p>
              <Wallet>
                <ConnectWallet className="mx-auto" />
              </Wallet>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Login Streak Card */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔥 Daily Login Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-green-600">
                  Day {dailyLoginStreak === 0 ? '1' : dailyLoginStreak}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Next Login Reward</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {nextDailyLoginReward} CALI
                </p>
              </div>
            </div>

            {/* Streak Progress Bar */}
            <div className="space-y-2">
              <p className="text-xs text-gray-600 font-medium">Streak Progress (7 days for bonus)</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div
                    key={day}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      day <= dailyLoginStreak
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                    title={`Day ${day}`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Day 1</span>
                <span>Day 7 (+10 CALI bonus)</span>
              </div>
            </div>

            {/* Reward Breakdown */}
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Daily Rewards:</p>
              <div className="grid grid-cols-7 gap-1 text-xs text-center">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                  const reward = 0.1 * day;
                  const isCurrentDay = day === dailyLoginStreak;
                  const isPastDay = day < dailyLoginStreak;
                  const bonus = day === 7 ? ' +10' : '';
                  
                  return (
                    <div
                      key={day}
                      className={`p-2 rounded ${
                        isCurrentDay
                          ? 'bg-green-100 border-2 border-green-500 font-bold'
                          : isPastDay
                          ? 'bg-gray-100 opacity-60'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-700">D{day}</div>
                      <div className={`${isCurrentDay ? 'text-green-700' : 'text-gray-600'}`}>
                        {reward.toFixed(1)}{bonus}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Verify Daily Login Button */}
            {isConnected && address ? (
              <Button
                className="w-full"
                size="lg"
                onClick={handleVerifyDailyLogin}
                disabled={!canClaimDailyLogin || isVerifyingLogin}
                variant={canClaimDailyLogin ? "default" : "secondary"}
              >
                {isVerifyingLogin ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying Signature...
                  </>
                ) : canClaimDailyLogin ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Verify Daily Login with Wallet
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Already Claimed Today
                  </>
                )}
              </Button>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                <p className="text-sm text-blue-800">
                  Connect your wallet to verify daily login and earn CALI tokens
                </p>
              </div>
            )}

            {/* Info Message */}
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>💡 How it works:</strong> Click "Verify Daily Login with Wallet" button to sign a message with your wallet. After successful verification, your daily login tokens will be credited to your pending balance and ready to claim on the 30th of the month!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Rewards Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Recent Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentRewards.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Complete workouts to earn CALI tokens!
            </p>
          ) : (
            <div className="space-y-3">
              {recentRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium capitalize">
                      {reward.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(reward.timestamp).toLocaleDateString()}
                    </p>
                    {reward.verificationReason && reward.verificationStatus === 'rejected' && (
                      <p className="text-xs text-red-600 mt-1">
                        {reward.verificationReason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">+{reward.amount} CALI</p>
                    {getVerificationBadge(reward)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Secure & Verified</p>
              <p>
                All workouts are verified with motion tracking and cryptographic signatures to ensure fair token distribution.
                Your rewards are secured on the Base blockchain.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
