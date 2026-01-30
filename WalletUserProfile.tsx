'use client';

import { useWalletAuth } from '@/contexts/WalletAuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, LogOut, Bell, Trophy, Copy, ExternalLink, User } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ReminderSettings } from '@/components/ReminderSettings';
import { ChallengesModal } from '@/components/ChallengesModal';
import { AvatarSettingsModal } from '@/components/AvatarSettingsModal';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useAccount, useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

export function WalletUserProfile(): JSX.Element {
  const { user, signOut } = useWalletAuth();
  const { address } = useAccount();
  const { data: ensName } = useEnsName({ 
    address: address as `0x${string}` | undefined,
    chainId: mainnet.id,
  });
  const [reminderDialogOpen, setReminderDialogOpen] = useState<boolean>(false);
  const [challengesDialogOpen, setChallengesDialogOpen] = useState<boolean>(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState<boolean>(false);

  const handleDisconnect = (): void => {
    signOut();
    toast.success('Wallet disconnected');
  };

  const handleCopyAddress = (): void => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const handleViewOnExplorer = (): void => {
    if (address) {
      window.open(`https://basescan.org/address/${address}`, '_blank', 'noopener,noreferrer');
    }
  };

  if (!user || !address) {
    return <></>;
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  const displayName = ensName || user.name || shortAddress;
  const initials = ensName ? ensName.slice(0, 2).toUpperCase() : address.slice(2, 4).toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={displayName} />}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <Badge variant="secondary" className="text-xs">
                  <Wallet className="w-3 h-3 mr-1" />
                  EVM
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                  {shortAddress}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCopyAddress}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {user.workoutCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {user.workoutCount} workout{user.workoutCount !== 1 ? 's' : ''} completed
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewOnExplorer} className="cursor-pointer">
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on BaseScan</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAvatarDialogOpen(true)} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Avatar Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setReminderDialogOpen(true)} className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>Reminders</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setChallengesDialogOpen(true)} className="cursor-pointer">
            <Trophy className="mr-2 h-4 w-4" />
            <span>Challenges</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            Theme
          </DropdownMenuLabel>
          <ThemeToggle />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect Wallet</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Workout Reminders</DialogTitle>
          </DialogHeader>
          <ReminderSettings />
        </DialogContent>
      </Dialog>

      <ChallengesModal
        isOpen={challengesDialogOpen}
        onClose={() => setChallengesDialogOpen(false)}
      />

      <AvatarSettingsModal
        isOpen={avatarDialogOpen}
        onClose={() => setAvatarDialogOpen(false)}
      />
    </>
  );
}
