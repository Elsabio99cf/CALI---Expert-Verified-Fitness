'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AvatarUpload } from '@/components/AvatarUpload';
import { useWalletAuth } from '@/contexts/WalletAuthContext';
import { getAddress } from 'viem';
import { toast } from 'sonner';

export interface AvatarSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarSettingsModal({ isOpen, onClose }: AvatarSettingsModalProps): JSX.Element {
  const { user, walletAddress } = useWalletAuth();

  const handleAvatarChange = (avatarUrl: string | null): void => {
    if (!walletAddress || !user) {
      toast.error('User not connected');
      return;
    }

    try {
      // Normalize address to lowercase for consistent storage
      const checksummedAddress = getAddress(walletAddress);
      const normalizedAddress = checksummedAddress.toLowerCase();
      
      const usersData = localStorage.getItem('wallet-users');
      const users: Record<string, any> = usersData ? JSON.parse(usersData) : {};

      if (users[normalizedAddress]) {
        users[normalizedAddress].avatarUrl = avatarUrl || undefined;
        localStorage.setItem('wallet-users', JSON.stringify(users));
        
        // Update current user session
        const updatedUser = { ...users[normalizedAddress] };
        localStorage.setItem('currentWalletUser', JSON.stringify(updatedUser));

        // Force a page refresh to update the avatar everywhere
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    }
  };

  if (!user || !walletAddress) {
    return <></>;
  }

  const checksummedAddress = getAddress(walletAddress);
  const initials = user.ensName 
    ? user.ensName.slice(0, 2).toUpperCase() 
    : checksummedAddress.slice(2, 4).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Avatar Settings</DialogTitle>
          <DialogDescription>
            Upload a custom avatar or use an image URL to personalize your profile
          </DialogDescription>
        </DialogHeader>
        <AvatarUpload
          currentAvatar={user.avatarUrl}
          fallbackInitials={initials}
          onAvatarChange={handleAvatarChange}
        />
      </DialogContent>
    </Dialog>
  );
}
