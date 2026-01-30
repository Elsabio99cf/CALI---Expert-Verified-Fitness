'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import { Wallet, HDNodeWallet } from 'ethers';
import { useConnect } from 'wagmi';
import { toast } from 'sonner';

interface WalletRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletRecoveryModal({ isOpen, onClose }: WalletRecoveryModalProps): JSX.Element {
  const { connectors, connect } = useConnect();
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [showSeedPhrase, setShowSeedPhrase] = useState<boolean>(false);
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateSeedPhrase = (phrase: string): boolean => {
    const words = phrase.trim().split(/\s+/);
    return words.length === 12 || words.length === 24;
  };

  const validatePrivateKey = (key: string): boolean => {
    const cleaned = key.trim();
    return /^(0x)?[0-9a-fA-F]{64}$/.test(cleaned);
  };

  const handleSeedPhraseRecover = async (): Promise<void> => {
    if (!validateSeedPhrase(seedPhrase)) {
      toast.error('Invalid seed phrase. Please enter 12 or 24 words.');
      return;
    }

    setIsLoading(true);

    try {
      // Derive wallet from seed phrase
      const wallet: HDNodeWallet = Wallet.fromPhrase(seedPhrase.trim());
      const address = wallet.address;

      toast.success(`Wallet recovered: ${address.slice(0, 6)}...${address.slice(-4)}`);
      
      // Try to connect with the first available connector
      const coinbaseConnector = connectors.find((c) => c.id === 'coinbaseWalletSDK');
      if (coinbaseConnector) {
        await connect({ connector: coinbaseConnector });
      }

      toast.info('Please connect your wallet using the recovered address');
      handleClose();
    } catch (error) {
      console.error('Seed phrase recovery error:', error);
      toast.error('Invalid seed phrase or recovery failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivateKeyRecover = async (): Promise<void> => {
    if (!validatePrivateKey(privateKey)) {
      toast.error('Invalid private key. Must be 64 hex characters (with or without 0x prefix).');
      return;
    }

    setIsLoading(true);

    try {
      const key = privateKey.trim().startsWith('0x') ? privateKey.trim() : `0x${privateKey.trim()}`;
      const wallet = new Wallet(key);
      const address = wallet.address;

      toast.success(`Wallet recovered: ${address.slice(0, 6)}...${address.slice(-4)}`);
      
      // Try to connect with the first available connector
      const coinbaseConnector = connectors.find((c) => c.id === 'coinbaseWalletSDK');
      if (coinbaseConnector) {
        await connect({ connector: coinbaseConnector });
      }

      toast.info('Please connect your wallet using the recovered address');
      handleClose();
    } catch (error) {
      console.error('Private key recovery error:', error);
      toast.error('Invalid private key or recovery failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    setSeedPhrase('');
    setPrivateKey('');
    setShowSeedPhrase(false);
    setShowPrivateKey(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Recover Your Wallet
          </DialogTitle>
          <DialogDescription>
            Import your wallet using your seed phrase or private key
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Security Warning:</strong> Never share your seed phrase or private key with anyone. 
            This app does not store your keys - they are processed locally.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="seed" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seed">Seed Phrase</TabsTrigger>
            <TabsTrigger value="private">Private Key</TabsTrigger>
          </TabsList>

          <TabsContent value="seed" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seed-phrase">
                Seed Phrase (12 or 24 words)
              </Label>
              <div className="relative">
                <Textarea
                  id="seed-phrase"
                  placeholder="word1 word2 word3 ... word12"
                  value={seedPhrase}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setSeedPhrase(e.target.value)}
                  className="min-h-[120px] font-mono text-sm"
                  type={showSeedPhrase ? 'text' : 'password'}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={(): void => setShowSeedPhrase(!showSeedPhrase)}
                >
                  {showSeedPhrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your 12 or 24-word recovery phrase separated by spaces
              </p>
            </div>

            <Button
              onClick={handleSeedPhraseRecover}
              className="w-full"
              disabled={isLoading || !seedPhrase.trim()}
            >
              {isLoading ? 'Recovering...' : 'Recover from Seed Phrase'}
            </Button>
          </TabsContent>

          <TabsContent value="private" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="private-key">
                Private Key (64 hex characters)
              </Label>
              <div className="relative">
                <Textarea
                  id="private-key"
                  placeholder="0x1234567890abcdef..."
                  value={privateKey}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setPrivateKey(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                  type={showPrivateKey ? 'text' : 'password'}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={(): void => setShowPrivateKey(!showPrivateKey)}
                >
                  {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter your private key (with or without 0x prefix)
              </p>
            </div>

            <Button
              onClick={handlePrivateKeyRecover}
              className="w-full"
              disabled={isLoading || !privateKey.trim()}
            >
              {isLoading ? 'Recovering...' : 'Recover from Private Key'}
            </Button>
          </TabsContent>
        </Tabs>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>Tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Keep your seed phrase and private key extremely secure</li>
              <li>Anyone with access can control your funds</li>
              <li>Write it down and store it offline in a safe place</li>
              <li>Never enter it on untrusted websites</li>
            </ul>
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
