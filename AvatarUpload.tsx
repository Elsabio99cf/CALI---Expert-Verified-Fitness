'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Link as LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';

export interface AvatarUploadProps {
  currentAvatar?: string;
  fallbackInitials: string;
  onAvatarChange: (avatarUrl: string | null) => void;
}

export function AvatarUpload({ currentAvatar, fallbackInitials, onAvatarChange }: AvatarUploadProps): JSX.Element {
  const [avatarUrl, setAvatarUrl] = useState<string>(currentAvatar || '');
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUrlSubmit = (): void => {
    if (!imageUrlInput.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    // Validate URL format
    try {
      new URL(imageUrlInput);
    } catch {
      toast.error('Invalid URL format');
      return;
    }

    setAvatarUrl(imageUrlInput);
    onAvatarChange(imageUrlInput);
    toast.success('Avatar updated!');
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const base64String = e.target?.result as string;
        setAvatarUrl(base64String);
        onAvatarChange(base64String);
        toast.success('Avatar uploaded!');
        setIsUploading(false);
      };
      reader.onerror = (): void => {
        toast.error('Failed to upload image');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = (): void => {
    setAvatarUrl('');
    setImageUrlInput('');
    onAvatarChange(null);
    toast.success('Avatar removed');
  };

  const handleFileButtonClick = (): void => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Avatar className="h-24 w-24">
          {avatarUrl && <AvatarImage src={avatarUrl} alt="Avatar preview" />}
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
            {fallbackInitials}
          </AvatarFallback>
        </Avatar>

        {avatarUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            className="text-destructive"
          >
            <X className="w-4 h-4 mr-2" />
            Remove Avatar
          </Button>
        )}
      </div>

      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url">Image URL</TabsTrigger>
          <TabsTrigger value="upload">Upload File</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={imageUrlInput}
                onChange={(e: ChangeEvent<HTMLInputElement>): void => setImageUrlInput(e.target.value)}
                onKeyPress={(e): void => {
                  if (e.key === 'Enter') {
                    handleImageUrlSubmit();
                  }
                }}
              />
              <Button onClick={handleImageUrlSubmit}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Set
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste a direct link to an image (JPG, PNG, GIF)
            </p>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fileUpload">Upload Image</Label>
            <input
              ref={fileInputRef}
              id="fileUpload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={handleFileButtonClick}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
            <p className="text-xs text-muted-foreground">
              Upload an image file (max 2MB, JPG, PNG, or GIF)
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
