'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Upload, Video, CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { useSocialVerification } from '@/contexts/SocialVerificationContext';
import type { VideoVerificationRequest } from '@/types/social-verification';
import { toast } from 'sonner';
import { uploadWorkoutVideo as fastUpload, type UploadProgress } from '@/lib/videoUpload';
import { formatBytes } from '@/lib/videoCompression';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  workoutData: VideoVerificationRequest['workoutData'];
}

export function VideoUploadModal({
  isOpen,
  onClose,
  workoutId,
  workoutData,
}: VideoUploadModalProps): JSX.Element {
  const { uploadWorkoutVideo } = useSocialVerification();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadPhase, setUploadPhase] = useState<string>('');
  const [compressionSavings, setCompressionSavings] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Video file is too large (max 100MB)');
      return;
    }

    setVideoFile(file);
    
    // Create preview URL
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    const preview = URL.createObjectURL(file);
    setVideoPreview(preview);
  };

  const handleUpload = async (): Promise<void> => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadPhase('Preparing...');
    setCompressionSavings('');

    try {
      // Convert file to blob for storage
      const blob = new Blob([videoFile], { type: videoFile.type });
      
      const success = await uploadWorkoutVideo(workoutId, blob, workoutData);

      if (success) {
        setUploadProgress(100);
        setUploadPhase('Complete!');
        
        setTimeout(() => {
          handleClose();
          toast.success('🎉 Video uploaded successfully!', {
            description: 'Compressed and ready for community verification',
          });
        }, 500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video. Please try again.');
      setUploadProgress(0);
      setUploadPhase('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = (): void => {
    if (!isUploading) {
      setVideoFile(null);
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      setVideoPreview(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Workout Video</DialogTitle>
          <DialogDescription>
            Upload a video of your workout for community verification (2x rewards)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          {!videoFile && (
            <Card
              className="border-2 border-dashed border-muted hover:border-primary transition-colors cursor-pointer"
              onClick={(): void => fileInputRef.current?.click()}
            >
              <div className="p-8 text-center space-y-2">
                <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-semibold">Click to select video</p>
                  <p className="text-sm text-muted-foreground">
                    MP4, WebM, or other video formats (max 100MB)
                  </p>
                </div>
              </div>
            </Card>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Video Preview */}
          {videoPreview && (
            <div className="space-y-2">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support video playback.
                </video>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {videoFile?.name} ({(videoFile?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                </span>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(): void => {
                      setVideoFile(null);
                      if (videoPreview) {
                        URL.revokeObjectURL(videoPreview);
                      }
                      setVideoPreview(null);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{uploadPhase}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="mt-1" />
                </div>
              </div>
              {compressionSavings && (
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {compressionSavings}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Using fast compression for optimal upload speed
              </div>
            </div>
          )}

          {/* Workout Info */}
          <Card className="p-4 bg-muted/30">
            <h4 className="font-semibold mb-2">Workout Details</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Program: {workoutData.programName}</p>
              <p>Duration: {Math.floor(workoutData.duration / 60)}m {workoutData.duration % 60}s</p>
              <p>Exercises: {workoutData.exercises.length}</p>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!videoFile || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Upload for Verification
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>⚡ Fast compression reduces upload time by up to 70%</p>
            <p>✓ 3 random community members will verify your video</p>
            <p>✓ Majority approval (2/3) required for verification</p>
            <p>✓ Earn 2x CALI tokens for verified workouts</p>
            <p>✓ Video stored securely until verification completes</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
