'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, StopCircle, Play, Camera, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VideoRecorderProps {
  isRecording: boolean;
  onStartRecording: () => Promise<boolean>;
  onStopRecording: () => Promise<Blob | null>;
  exerciseName: string;
  showPreview?: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function VideoRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  exerciseName,
  showPreview = true,
  videoRef,
}: VideoRecorderProps): JSX.Element {
  // videoRef is now passed from parent via useVideoRecorder hook
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev: number) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = async (): Promise<void> => {
    setIsInitializing(true);
    const started = await onStartRecording();
    setIsInitializing(false);
    
    if (!started) {
      toast.error('Failed to start recording', {
        description: 'Please check camera permissions and try again',
      });
    }
  };

  if (!showPreview) {
    return <></>;
  }

  return (
    <Card className="border-2 border-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5" />
            Workout Recording
          </CardTitle>
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
              REC {formatDuration(recordingDuration)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <Loader2 className="w-12 h-12 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Starting camera...</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
                Recording Instructions:
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5 list-disc list-inside">
                <li>Record yourself performing the entire workout</li>
                <li>Keep your full body visible in frame</li>
                <li>Community members will verify proper form and completion</li>
                <li>Video is stored until community verification is complete</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          <strong>Exercise:</strong> {exerciseName}
        </div>
      </CardContent>
    </Card>
  );
}
