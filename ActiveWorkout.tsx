'use client';

import { useState, useEffect } from 'react';
import type { WorkoutProgram, WorkoutExercise, CompletedWorkout } from '@/types/fitness';
import type { Exercise } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, Check, X, Video, AlertTriangle, Loader2 } from 'lucide-react';
import { exercises as exerciseData } from '@/data/exercises';
import { useChallenge } from '@/contexts/ChallengeContext';
import { VideoRecorder } from '@/components/VideoRecorder';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { useSocialVerification } from '@/contexts/SocialVerificationContext';
import { toast } from 'sonner';

interface ActiveWorkoutProps {
  workout: WorkoutProgram;
  onComplete: (completedWorkout: CompletedWorkout) => void;
  onCancel: () => void;
}

export function ActiveWorkout({ workout, onComplete, onCancel }: ActiveWorkoutProps): JSX.Element {
  const { getActiveChallenges, updateChallengeProgress } = useChallenge();
  const { uploadWorkoutVideo } = useSocialVerification();
  const {
    isRecording,
    isSupported,
    hasPermission,
    videoRef,
    startRecording,
    stopRecording,
    requestPermission,
  } = useVideoRecorder();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [workoutStartTime] = useState<number>(Date.now());
  const [totalRepsCompleted, setTotalRepsCompleted] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [workoutPhase, setWorkoutPhase] = useState<'initial' | 'recording' | 'uploading' | 'completed'>('initial');

  const currentWorkoutExercise: WorkoutExercise = workout.exercises[currentExerciseIndex];
  const currentExercise: Exercise | undefined = exerciseData.find(
    (ex: Exercise) => ex.id === currentWorkoutExercise.exerciseId
  );

  const totalExercises: number = workout.exercises.length;
  const progress: number = ((currentExerciseIndex / totalExercises) * 100);

  useEffect(() => {
    if (timeRemaining > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && isResting) {
      setIsResting(false);
      if (currentSet < currentWorkoutExercise.sets) {
        setCurrentSet(currentSet + 1);
      } else {
        handleNextExercise();
      }
    }
  }, [timeRemaining, isPaused, isResting, currentSet, currentWorkoutExercise.sets]);

  const handleStartWorkout = async (): Promise<void> => {
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
        description: 'Perform your workout - keep your full body visible',
      });
    } else {
      toast.error('Failed to start recording');
    }
  };

  const handleCompleteSet = (): void => {
    const exerciseId = currentWorkoutExercise.exerciseId;
    const repsCompleted = currentWorkoutExercise.reps;
    setTotalRepsCompleted((prev: Record<string, number>) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] || 0) + repsCompleted
    }));

    const activeChallenges = getActiveChallenges();
    activeChallenges.forEach((challenge) => {
      if (challenge.type === 'most-reps' && challenge.exerciseId === exerciseId) {
        const newTotal = (totalRepsCompleted[exerciseId] || 0) + repsCompleted;
        updateChallengeProgress(challenge.id, newTotal);
      }
    });

    if (currentSet < currentWorkoutExercise.sets) {
      setIsResting(true);
      setTimeRemaining(currentWorkoutExercise.restSeconds);
    } else {
      handleNextExercise();
    }
  };

  const handleNextExercise = (): void => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setIsResting(false);
      setTimeRemaining(0);
    } else {
      handleCompleteWorkout();
    }
  };

  const handleCompleteWorkout = async (): Promise<void> => {
    if (!isRecording) {
      toast.error('Recording not active', {
        description: 'Cannot complete workout without recording',
      });
      return;
    }

    setWorkoutPhase('uploading');
    
    toast.info('Processing video...', {
      description: 'Stopping recording and uploading for community verification',
    });

    const blob = await stopRecording();
    
    if (!blob) {
      toast.error('Failed to save recording', {
        description: 'Unable to process workout video',
      });
      onCancel();
      return;
    }

    setIsUploading(true);

    const workoutDuration: number = Math.floor((Date.now() - workoutStartTime) / 1000);
    const totalSets = workout.exercises.reduce((sum, we) => sum + we.sets, 0);
    const totalReps = workout.exercises.reduce((sum, we) => sum + (we.sets * we.reps), 0);

    // Upload to community verification
    const workoutData = {
      programName: workout.name,
      duration: workoutDuration,
      exercises: workout.exercises.map((we: WorkoutExercise) => {
        const ex = exerciseData.find((e: Exercise) => e.id === we.exerciseId);
        return {
          exerciseId: we.exerciseId,
          exerciseName: ex?.name || 'Unknown',
          sets: we.sets,
          reps: we.reps
        };
      }),
      totalSets,
      totalReps,
    };

    const success = await uploadWorkoutVideo(
      `workout-${Date.now()}`,
      blob,
      workoutData
    );

    setIsUploading(false);

    if (success) {
      setWorkoutPhase('completed');
      
      toast.success('✅ Video uploaded for community verification!', {
        description: 'Random community members will verify your workout for 2x rewards',
        duration: 5000,
      });

      // Complete the workout without verification (pending community review)
      const completedWorkout: CompletedWorkout = {
        id: `workout-${Date.now()}`,
        programId: workout.id,
        programName: workout.name,
        date: new Date().toISOString(),
        duration: Math.floor(workoutDuration / 60),
        exercises: workout.exercises.map((we: WorkoutExercise) => {
          const ex = exerciseData.find((e: Exercise) => e.id === we.exerciseId);
          return {
            exerciseId: we.exerciseId,
            exerciseName: ex?.name || 'Unknown',
            sets: we.sets,
            reps: we.reps
          };
        }),
        totalSets,
        totalReps,
        socialVerification: {
          uploaded: true,
          status: 'pending',
          uploadedAt: new Date().toISOString(),
        },
      };

      // Update challenge progress
      const activeChallenges = getActiveChallenges();
      activeChallenges.forEach((challenge) => {
        if (challenge.type === 'total-time') {
          updateChallengeProgress(challenge.id, Math.floor(workoutDuration / 60));
        } else if (challenge.type === 'total-workouts') {
          updateChallengeProgress(challenge.id, 1);
        }
      });

      onComplete(completedWorkout);
    } else {
      toast.error('Failed to upload video', {
        description: 'Please try again or check your connection',
      });
      setWorkoutPhase('recording');
    }
  };

  if (!currentExercise) {
    return <div>Exercise not found</div>;
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
              Your device does not support video recording, which is required to verify workouts and earn CALI tokens.
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
              Cancel Workout
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
              Ready to Start Workout
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Video className="w-4 h-4" />
                Community Video Verification
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Your entire workout will be recorded</li>
                <li>Video uploaded for community verification</li>
                <li>3 random community members will review your form</li>
                <li>Keep your full body visible during exercises</li>
                <li>Earn 2x CALI tokens when verified by community</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">Workout: {workout.name}</h3>
              <div className="space-y-1 text-sm">
                {workout.exercises.map((we, idx) => {
                  const ex = exerciseData.find((e: Exercise) => e.id === we.exerciseId);
                  return (
                    <div key={idx} className="flex justify-between">
                      <span>{ex?.name}</span>
                      <span className="text-muted-foreground">
                        {we.sets} sets × {we.reps} reps
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleStartWorkout} className="flex-1" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Start Recording & Workout
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
              <h3 className="text-xl font-semibold mb-2">Uploading Your Workout</h3>
              <p className="text-sm text-muted-foreground">
                Uploading video to community for verification...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Recording/workout in progress
  return (
    <div className="space-y-4 pb-20">
      {/* Video Recorder */}
      <VideoRecorder
        isRecording={isRecording}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        exerciseName={currentExercise?.name || 'Exercise'}
        showPreview={true}
        videoRef={videoRef}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{workout.name}</CardTitle>
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
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{currentExercise.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold">
              Set {currentSet} / {currentWorkoutExercise.sets}
            </div>
            <div className="text-2xl text-muted-foreground">
              {currentWorkoutExercise.reps} reps
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
                  {currentExercise.instructions.map((instruction: string, index: number) => (
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
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleNextExercise}
                  disabled={!isRecording}
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
