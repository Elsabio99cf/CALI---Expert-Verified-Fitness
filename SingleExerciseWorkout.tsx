'use client';

import { useState, useEffect } from 'react';
import type { Exercise, CompletedWorkout } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, Check, X, Video, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { VideoRecorder } from '@/components/VideoRecorder';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { toast } from 'sonner';
import { useSocialVerification } from '@/contexts/SocialVerificationContext';

interface SingleExerciseWorkoutProps {
  exercise: Exercise;
  onComplete: (completedWorkout: CompletedWorkout) => void;
  onCancel: () => void;
}



export function SingleExerciseWorkout({ exercise, onComplete, onCancel }: SingleExerciseWorkoutProps): JSX.Element {
  const {
    isRecording,
    isSupported,
    hasPermission,
    videoRef,
    startRecording,
    stopRecording,
    requestPermission,
  } = useVideoRecorder();
  const { uploadWorkoutVideo } = useSocialVerification();

  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(10);
  const [restSeconds, setRestSeconds] = useState<number>(60);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [workoutStartTime] = useState<number>(Date.now());
  const [isConfiguring, setIsConfiguring] = useState<boolean>(true);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [workoutPhase, setWorkoutPhase] = useState<'configuring' | 'initial' | 'recording' | 'completed' | 'uploading' | 'uploaded'>('configuring');

  const progress: number = ((currentSet - 1) / sets) * 100;

  useEffect(() => {
    if (timeRemaining > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && isResting) {
      setIsResting(false);
      if (currentSet < sets) {
        setCurrentSet(currentSet + 1);
      } else {
        handleCompleteExercise();
      }
    }
  }, [timeRemaining, isPaused, isResting, currentSet, sets]);

  const handleStartWorkout = (): void => {
    if (sets < 1 || reps < 1) {
      toast.error('Invalid configuration', {
        description: 'Sets and reps must be at least 1',
      });
      return;
    }
    setIsConfiguring(false);
    setWorkoutPhase('initial');
  };

  const handleBeginRecording = async (): Promise<void> => {
    if (!isSupported) {
      toast.error('Video recording not supported', {
        description: 'Your device does not support video recording',
      });
      return;
    }

    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Camera permission required', {
          description: 'Please allow camera access to record your workout',
        });
        return;
      }
    }

    const started = await startRecording();
    if (started) {
      setWorkoutPhase('recording');
      toast.success('Recording started!', {
        description: 'Perform your exercise - keep your full body visible',
      });
    } else {
      toast.error('Failed to start recording');
    }
  };

  const handleCompleteSet = (): void => {
    if (currentSet < sets) {
      setIsResting(true);
      setTimeRemaining(restSeconds);
    } else {
      handleCompleteExercise();
    }
  };

  const handleCompleteExercise = async (): Promise<void> => {
    if (!isRecording) {
      toast.error('Recording not active', {
        description: 'Cannot complete exercise without recording',
      });
      return;
    }

    setWorkoutPhase('completed');

    toast.info('Processing video...', {
      description: 'Stopping recording and preparing for community verification',
    });

    const blob = await stopRecording();

    if (!blob) {
      toast.error('Failed to save recording', {
        description: 'Unable to process workout video',
      });
      onCancel();
      return;
    }

    setVideoBlob(blob);
    setWorkoutPhase('uploading');

    await uploadForCommunityVerification(blob);
  };

  const uploadForCommunityVerification = async (blob: Blob): Promise<void> => {
    setIsUploading(true);

    try {
      toast.info('Uploading workout video...', {
        description: 'Submitting for community verification',
        duration: 5000,
      });

      const totalSets = sets;
      const totalReps = sets * reps;
      const workoutId = `single-exercise-${Date.now()}`;

      const success = await uploadWorkoutVideo(workoutId, blob, {
        exerciseName: exercise.name,
        sets: totalSets,
        reps: totalReps,
      });

      setIsUploading(false);

      if (success) {
        setWorkoutPhase('uploaded');

        toast.success('Video submitted for verification!', {
          description: 'Community members will review your workout',
          duration: 5000,
        });

        // Complete the workout
        const workoutDuration: number = Math.floor((Date.now() - workoutStartTime) / 1000 / 60);

        const completedWorkout: CompletedWorkout = {
          id: workoutId,
          programId: `single-${exercise.id}`,
          programName: exercise.name,
          date: new Date().toISOString(),
          duration: workoutDuration,
          exercises: [{
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            sets: sets,
            reps: reps,
          }],
          totalSets: sets,
          totalReps: totalReps,
          videoVerification: undefined,
        };

        onComplete(completedWorkout);
      } else {
        toast.error('Upload failed', {
          description: 'Unable to submit video for verification. Please try again.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);

      toast.error('Upload error', {
        description: 'Failed to upload workout video. Please try again.',
      });
    }
  };

  // Configuration screen
  if (workoutPhase === 'configuring') {
    return (
      <div className="space-y-4 pb-20">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Configure {exercise.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">About this exercise</h3>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
              <div className="mt-2">
                <Badge variant="outline">{exercise.difficulty}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sets">Number of Sets</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  max="20"
                  value={sets}
                  onChange={(e): void => setSets(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="reps">Reps per Set</Label>
                <Input
                  id="reps"
                  type="number"
                  min="1"
                  max="100"
                  value={reps}
                  onChange={(e): void => setReps(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="rest">Rest Between Sets (seconds)</Label>
                <Input
                  id="rest"
                  type="number"
                  min="15"
                  max="300"
                  value={restSeconds}
                  onChange={(e): void => setRestSeconds(parseInt(e.target.value) || 60)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {exercise.instructions.map((instruction: string, index: number) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ol>
            </div>

            <Button onClick={handleStartWorkout} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show camera not supported warning
  if (!isSupported) {
    return (
      <div className="space-y-4 pb-20">
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" />
              Video Recording Not Supported
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Your device does not support video recording, which is required to verify exercises and earn CALI tokens.
            </p>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold mb-2">Requirements:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Modern browser with MediaRecorder API support</li>
                <li>Camera access</li>
                <li>Sufficient storage for video recording</li>
              </ul>
            </div>
            <Button variant="outline" onClick={onCancel} className="w-full">
              Cancel Exercise
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial state - ready to start
  if (workoutPhase === 'initial') {
    return (
      <div className="space-y-4 pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Ready to Start Exercise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video Verification Required
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Your entire exercise will be recorded</li>
                <li>Community members will verify proper form and completion</li>
                <li>Video is stored until community verification is complete</li>
                <li>Keep your full body visible during exercise</li>
                <li>After verification, you can claim CALI tokens</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Exercise: {exercise.name}</h3>
              <div className="text-sm text-muted-foreground">
                {sets} sets × {reps} reps • {restSeconds}s rest
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBeginRecording} className="flex-1" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Start Recording & Exercise
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Uploading state
  if (workoutPhase === 'uploading' || isUploading) {
    return (
      <div className="space-y-4 pb-20">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Loader2 className="w-16 h-16 mx-auto animate-spin text-blue-500" />
            <div>
              <h3 className="text-xl font-semibold mb-2">Submitting Your Workout</h3>
              <p className="text-sm text-muted-foreground">
                Uploading video for community verification...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Uploaded state
  if (workoutPhase === 'uploaded') {
    return (
      <div className="space-y-4 pb-20">
        <Card className="border-green-500 border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Workout Submitted!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-center">
                Your workout video has been submitted for community verification. Random community members will review your exercise and verify proper form.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>3 random community members will review your video</li>
                <li>They will verify proper form and completion</li>
                <li>Once consensus is reached, you'll earn CALI tokens</li>
                <li>Check the Community tab for verification status</li>
              </ul>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              Tokens will be available to claim after community verification
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Recording/exercise in progress
  return (
    <div className="space-y-4 pb-20">
      {/* Video Recorder */}
      <VideoRecorder
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        exerciseName={exercise.name}
        showPreview={true}
        videoRef={videoRef}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{exercise.name}</CardTitle>
            <div className="flex items-center gap-2">
              {isRecording && (
                <Badge variant="destructive" className="animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
                  Recording
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Set {currentSet} of {sets}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{exercise.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">
              Set {currentSet} / {sets}
            </div>
            <div className="text-2xl text-muted-foreground">
              {reps} reps
            </div>
          </div>

          {isResting && (
            <div className="text-center space-y-2">
              <Badge className="text-lg px-4 py-2">Rest Time</Badge>
              <div className="text-6xl font-bold text-blue-500">
                {timeRemaining}s
              </div>
              <Button
                variant="outline"
                onClick={(): void => setIsPaused(!isPaused)}
              >
                {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
            </div>
          )}

          {!isResting && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Instructions</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {exercise.instructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleCompleteSet}
                  disabled={!isRecording}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Complete Set
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
