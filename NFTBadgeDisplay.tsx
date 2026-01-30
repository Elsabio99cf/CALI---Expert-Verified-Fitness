'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Sparkles, ExternalLink, Lock } from 'lucide-react';
import { useNFTBadges } from '@/hooks/useNFTBadges';
import { useBlockchainTransactions } from '@/hooks/useBlockchainTransactions';
import { BADGE_REQUIREMENTS, getNextBadge } from '@/types/nft-badges';
import type { BadgeTier, NFTBadge } from '@/types/nft-badges';
import { Progress } from '@/components/ui/progress';
import type { Address } from 'viem';

interface NFTBadgeDisplayProps {
  walletAddress: string | null;
  totalVerifications: number;
  accuracyScore: number;
}

export function NFTBadgeDisplay({
  walletAddress,
  totalVerifications,
  accuracyScore,
}: NFTBadgeDisplayProps): JSX.Element {
  const { badges, isMinting, mintBadgeNFT, getUnmintedBadges } = useNFTBadges(walletAddress);
  const { mintBadgeNFT: mintOnChain, isProcessing } = useBlockchainTransactions();

  const earnedBadges = badges;
  const unmintedBadges = getUnmintedBadges();
  const earnedTiers = earnedBadges.map((b) => b.tier);
  
  const nextBadge = getNextBadge(earnedTiers, totalVerifications, accuracyScore);

  const getBadgeIcon = (tier: BadgeTier): JSX.Element => {
    const requirement = BADGE_REQUIREMENTS[tier];
    return (
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${requirement.gradientFrom}, ${requirement.gradientTo})`,
        }}
      >
        <Award className="w-8 h-8 text-white" />
      </div>
    );
  };

  const handleMintBadge = async (badgeId: string): Promise<void> => {
    if (!walletAddress) return;

    const badge = badges.find((b) => b.id === badgeId);
    if (!badge) return;

    // Mint NFT on blockchain using OnchainKit
    const result = await mintOnChain({
      badgeTier: badge.tier,
      walletAddress: walletAddress as Address,
      verificationsCount: badge.verificationsAtEarn,
      accuracyScore: badge.accuracyAtEarn,
    });

    if (result.success && result.txHash) {
      // Update local badge state with transaction details
      await mintBadgeNFT(badgeId, result.txHash, result.txHash.slice(0, 10));
    }
  };

  const getViewOnBaseScanUrl = (txHash: string): string => {
    return `https://basescan.org/tx/${txHash}`;
  };

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Your NFT Badges ({earnedBadges.length})
          </CardTitle>
          <CardDescription>
            Collectible NFT badges earned through verified workout reviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {earnedBadges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No badges earned yet</p>
              <p className="text-sm">Complete verifications to earn your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="p-4 border rounded-lg space-y-3 bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getBadgeIcon(badge.tier)}
                    <div className="flex-1 space-y-1">
                      <h4 className="font-semibold text-lg">{badge.tier} Verifier</h4>
                      <p className="text-xs text-muted-foreground">
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {badge.verificationsAtEarn} verifications • {badge.accuracyAtEarn}% accuracy
                      </Badge>
                    </div>
                  </div>

                  {badge.minted ? (
                    <div className="space-y-2">
                      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Minted as NFT
                      </Badge>
                      {badge.transactionHash && (
                        <a
                          href={getViewOnBaseScanUrl(badge.transactionHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View on BaseScan
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {badge.tokenId && (
                        <p className="text-xs text-muted-foreground">Token ID: #{badge.tokenId}</p>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleMintBadge(badge.id)}
                      disabled={isMinting || isProcessing}
                      className="w-full"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {(isMinting || isProcessing) ? 'Minting...' : 'Mint as NFT'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Badge Progress */}
      {nextBadge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Next Badge: {nextBadge.tier}
            </CardTitle>
            <CardDescription>{nextBadge.requirement.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Verifications</span>
                <span className="text-muted-foreground">
                  {totalVerifications} / {nextBadge.requirement.minVerifications}
                </span>
              </div>
              <Progress
                value={(totalVerifications / nextBadge.requirement.minVerifications) * 100}
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy</span>
                <span className="text-muted-foreground">
                  {accuracyScore}% / {nextBadge.requirement.minAccuracy}%
                </span>
              </div>
              <Progress
                value={(accuracyScore / nextBadge.requirement.minAccuracy) * 100}
                className="h-2"
              />
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                Reward: <span className="font-semibold text-foreground">{nextBadge.requirement.tokenReward} CALI</span> tokens + NFT badge
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Badge Tiers Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Badge Tier Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.keys(BADGE_REQUIREMENTS) as BadgeTier[]).map((tier) => {
              const requirement = BADGE_REQUIREMENTS[tier];
              const earned = earnedTiers.includes(tier);

              return (
                <div
                  key={tier}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    earned ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{
                      background: earned
                        ? `linear-gradient(135deg, ${requirement.gradientFrom}, ${requirement.gradientTo})`
                        : '#e5e7eb',
                    }}
                  >
                    <Award className={`w-5 h-5 ${earned ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{tier}</h4>
                      {earned && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                          Earned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {requirement.minVerifications} verifications • {requirement.minAccuracy}% accuracy
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{requirement.tokenReward}</p>
                    <p className="text-xs text-muted-foreground">CALI</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Unminted Badges Notice */}
      {unmintedBadges.length > 0 && (
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-600" />
              Unminted Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {unmintedBadges.length} badge{unmintedBadges.length > 1 ? 's' : ''} waiting to be minted as NFT
              {unmintedBadges.length > 1 ? 's' : ''}. Mint them to make them permanent collectibles on the Base blockchain!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
