'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAccount, useConnect } from 'wagmi';
import { Wallet, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WalletRecoveryModal } from './WalletRecoveryModal';
import { toast } from 'sonner';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps): JSX.Element {
  const { isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const [showRecovery, setShowRecovery] = useState<boolean>(false);
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);

  const handleConnect = async (connectorId: string): Promise<void> => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (!connector) return;

    setSelectedConnector(connectorId);
    
    try {
      await connect({ connector });
      toast.success('Wallet connected successfully! 🎉');
      onClose();
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect';
      
      if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        toast.error('Connection rejected by user');
      } else if (errorMessage.includes('not found') || errorMessage.includes('not installed')) {
        toast.error(`${connector.name} wallet not found. Please install it first.`);
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setSelectedConnector(null);
    }
  };

  const getConnectorIcon = (connectorName: string): string => {
    const name = connectorName.toLowerCase();
    if (name.includes('coinbase')) return '🔵';
    if (name.includes('metamask')) return '🦊';
    if (name.includes('phantom')) return '👻';
    if (name.includes('rabby')) return '🐰';
    if (name.includes('trust')) return '🛡️';
    return '🔌';
  };

  const getConnectorDescription = (connectorName: string): string => {
    const name = connectorName.toLowerCase();
    if (name.includes('coinbase')) return 'Recommended • Smart Wallet & EOA';
    if (name.includes('metamask')) return 'Most popular browser wallet';
    if (name.includes('phantom')) return 'Multi-chain wallet';
    if (name.includes('rabby')) return 'Security-focused wallet';
    if (name.includes('trust')) return 'Mobile-first wallet';
    return 'EVM compatible wallet';
  };

  if (isConnected) {
    onClose();
    return <></>;
  }

  return (
    <>
      <Dialog open={isOpen && !showRecovery} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Connect Your Wallet
            </DialogTitle>
            <DialogDescription>
              Choose your preferred EVM wallet to sign in to Calisthenics Fitness
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Web3 Authentication:</strong> Your wallet address is your account. No passwords needed!
            </AlertDescription>
          </Alert>

          <div className="space-y-3 py-4">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                variant="outline"
                className="w-full h-auto py-4 justify-start hover:border-primary"
                onClick={(): Promise<void> => handleConnect(connector.id)}
                disabled={isPending}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-2xl">{getConnectorIcon(connector.name)}</span>
                  <div className="flex flex-col items-start flex-1">
                    <span className="font-medium">{connector.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {getConnectorDescription(connector.name)}
                    </span>
                  </div>
                  {selectedConnector === connector.id && isPending && (
                    <span className="text-xs text-muted-foreground">Connecting...</span>
                  )}
                </div>
              </Button>
            ))}
          </div>

          <div className="border-t pt-4 space-y-3">
            <Button
              variant="ghost"
              className="w-full"
              onClick={(): void => {
                setShowRecovery(true);
              }}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Recover Wallet (Seed Phrase / Private Key)
            </Button>
          </div>

          <Alert variant="default" className="bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Blockchain:</strong> Base (EVM)<br />
              <strong>Security:</strong> Your keys, your crypto. We never store your private keys.
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>

      <WalletRecoveryModal
        isOpen={showRecovery}
        onClose={(): void => {
          setShowRecovery(false);
        }}
      />
    </>
  );
}
