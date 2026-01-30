'use client'
import { useState, useEffect } from 'react';
import type { WorkoutProgress, WorkoutProgram, CompletedWorkout, SavedRoutine } from '@/types/fitness';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExerciseCard } from '@/components/ExerciseCard';
import { WorkoutCard } from '@/components/WorkoutCard';
import { ActiveWorkout } from '@/components/ActiveWorkout';
import { SingleExerciseWorkout } from '@/components/SingleExerciseWorkout';
import { CustomWorkoutBuilder } from '@/components/CustomWorkoutBuilder';
import { SavedRoutines } from '@/components/SavedRoutines';
import { ProgressStats } from '@/components/ProgressStats';
import { exercises } from '@/data/exercises';
import { workoutPrograms } from '@/data/workouts';
import type { Exercise } from '@/types/fitness';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Dumbbell, Search, LogIn } from 'lucide-react';
import { useWalletAuth } from '@/contexts/WalletAuthContext';
import { useTokenReward } from '@/contexts/TokenRewardContext';
import { WalletConnectModal } from '@/components/WalletConnectModal';
import { WalletUserProfile } from '@/components/WalletUserProfile';
import { TokenWallet } from '@/components/TokenWallet';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RewardsSecurityInfo } from '@/components/RewardsSecurityInfo';
import { VideoVerificationSettings } from '@/components/VideoVerificationSettings';
import { MyVerificationQueue } from '@/components/MyVerificationQueue';
import { ExpertApplicationForm } from '@/components/ExpertApplicationForm';
import { ExpertManagementDashboard } from '@/components/ExpertManagementDashboard';

import { useExpertVerification } from '@/contexts/ExpertVerificationContext';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";
import { OnchainProfile } from '@/components/OnchainProfile';
import { CALITokenWallet } from '@/components/CALITokenWallet';
import { OnchainPortfolio } from '@/components/OnchainPortfolio';
import type { Address } from 'viem';

export default function FitnessApp(): JSX.Element {
    const { user, isLoading: authLoading, isConnected } = useWalletAuth();
    const { addReward } = useTokenReward();
    const { expertApplications, isAdmin, experts } = useExpertVerification();
    const pendingExpertApplications = expertApplications.filter((app) => app.status === 'pending').length;
    const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (document.readyState !== 'complete') {
            await new Promise<void>(resolve => {
              if (document.readyState === 'complete') {
                resolve()
              } else {
                window.addEventListener('load', () => resolve(), { once: true })
              }

            })
          }

    

          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully - app fully loaded')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
          
          setTimeout(async () => {
            try {
              await sdk.actions.ready()
              console.log('Farcaster SDK initialized on retry')
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError)
            }

          }, 1000)
        }

      }

    

      initializeFarcaster()
    }, [])
  const [activeWorkout, setActiveWorkout] = useState<WorkoutProgram | null>(null);
  const [activeSingleExercise, setActiveSingleExercise] = useState<Exercise | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const progressKey = user ? `workout-progress-${user.walletAddress}` : 'workout-progress-guest';
  const [progress, setProgress] = useLocalStorage<WorkoutProgress>(progressKey, {
    totalWorkouts: 0,
    totalTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    workouts: [],
    savedRoutines: []
  });

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscleGroups.some((mg) => mg.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  const filteredWorkouts = workoutPrograms.filter((workout) => {
    const matchesSearch = workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = difficultyFilter === 'all' || workout.difficulty === difficultyFilter;
    
    return matchesSearch && matchesDifficulty;
  });

  const handleStartWorkout = (workoutId: string): void => {
    const workout = workoutPrograms.find((w) => w.id === workoutId);
    if (workout) {
      setActiveWorkout(workout);
      toast.success(`Starting ${workout.name}`);
    }
  };

  const handleStartSingleExercise = (exerciseId: string): void => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (exercise) {
      setActiveSingleExercise(exercise);
      toast.success(`Starting ${exercise.name}`);
    }
  };

  const handleStartCustomWorkout = (workout: WorkoutProgram): void => {
    setActiveWorkout(workout);
    toast.success('Starting workout');
  };

  const handleStartSavedRoutine = (routine: SavedRoutine): void => {
    const workout: WorkoutProgram = {
      id: routine.id,
      name: routine.name,
      description: routine.description,
      difficulty: routine.difficulty,
      duration: 'Custom',
      totalTime: 0,
      exercises: routine.exercises
    };
    setActiveWorkout(workout);
    toast.success(`Starting ${routine.name}`);
  };

  const handleSaveRoutine = async (routine: SavedRoutine): Promise<void> => {
    const updatedRoutines = [...progress.savedRoutines, routine];
    setProgress({
      ...progress,
      savedRoutines: updatedRoutines
    });

    // Award token reward for creating routine
    await addReward('routine_created', {
      routineId: routine.id,
      routineName: routine.name,
    });
  };

  const handleDeleteRoutine = (routineId: string): void => {
    const updatedRoutines = progress.savedRoutines.filter((r) => r.id !== routineId);
    setProgress({
      ...progress,
      savedRoutines: updatedRoutines
    });
    toast.success('Routine deleted');
  };

  const calculateStreak = (workouts: CompletedWorkout[]): { current: number; longest: number } => {
    if (workouts.length === 0) return { current: 0, longest: 0 };

    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    let lastDate = new Date(sortedWorkouts[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 1) {
      currentStreak = 1;
    }

    for (let i = 1; i < sortedWorkouts.length; i++) {
      const currentDate = new Date(sortedWorkouts[i].date);
      const diffTime = lastDate.getTime() - currentDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
        if (i === 1 && daysDiff <= 1) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }

      lastDate = currentDate;
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { current: currentStreak, longest: longestStreak };
  };

  const handleCompleteWorkout = async (completedWorkout: CompletedWorkout): Promise<void> => {
    const updatedWorkouts = [...progress.workouts, completedWorkout];
    const streaks = calculateStreak(updatedWorkouts);

    const updatedRoutines = progress.savedRoutines.map((routine) => {
      if (routine.id === completedWorkout.programId) {
        return {
          ...routine,
          timesCompleted: routine.timesCompleted + 1,
          lastUsed: completedWorkout.date
        };
      }
      return routine;
    });

    setProgress({
      totalWorkouts: progress.totalWorkouts + 1,
      totalTime: progress.totalTime + completedWorkout.duration,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      lastWorkoutDate: completedWorkout.date,
      workouts: updatedWorkouts,
      savedRoutines: updatedRoutines
    });

    // Award token rewards with verification data
    await addReward('workout_completed', {
      duration: completedWorkout.duration,
      exercises: completedWorkout.exercises.map((e) => e.exerciseId),
      programId: completedWorkout.programId,
      sets: completedWorkout.totalSets,
      reps: completedWorkout.totalReps,
      videoVerification: completedWorkout.videoVerification,
    });

    // Award streak reward if applicable
    if (streaks.current > progress.currentStreak) {
      await addReward('daily_streak', {
        streakLength: streaks.current,
      });
    }

    // Check for weekly bonus (4+ workouts this week)
    const thisWeek = updatedWorkouts.filter((w) => {
      const workoutDate = new Date(w.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return workoutDate >= weekAgo;
    });

    if (thisWeek.length === 4) {
      await addReward('weekly_bonus', {
        weeklyWorkouts: thisWeek.length,
      });
    }

    setActiveWorkout(null);
    toast.success('Workout completed! 🎉');
  };

  const handleCompleteSingleExercise = async (completedWorkout: CompletedWorkout): Promise<void> => {
    const updatedWorkouts = [...progress.workouts, completedWorkout];
    const streaks = calculateStreak(updatedWorkouts);

    setProgress({
      totalWorkouts: progress.totalWorkouts + 1,
      totalTime: progress.totalTime + completedWorkout.duration,
      currentStreak: streaks.current,
      longestStreak: streaks.longest,
      lastWorkoutDate: completedWorkout.date,
      workouts: updatedWorkouts,
      savedRoutines: progress.savedRoutines
    });

    // Award token rewards for individual exercise (same as full workout)
    await addReward('workout_completed', {
      duration: completedWorkout.duration,
      exercises: completedWorkout.exercises.map((e) => e.exerciseId),
      programId: completedWorkout.programId,
      sets: completedWorkout.totalSets,
      reps: completedWorkout.totalReps,
      videoVerification: completedWorkout.videoVerification,
    });

    // Award streak reward if applicable
    if (streaks.current > progress.currentStreak) {
      await addReward('daily_streak', {
        streakLength: streaks.current,
      });
    }

    setActiveSingleExercise(null);
    toast.success('Exercise completed! 🎉');
  };

  const handleCancelWorkout = (): void => {
    setActiveWorkout(null);
    toast.info('Workout cancelled');
  };

  const handleCancelSingleExercise = (): void => {
    setActiveSingleExercise(null);
    toast.info('Exercise cancelled');
  };

  if (activeWorkout) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-4xl mx-auto">
          <ActiveWorkout
            workout={activeWorkout}
            onComplete={handleCompleteWorkout}
            onCancel={handleCancelWorkout}
          />
        </div>
      </div>
    );
  }

  if (activeSingleExercise) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-4xl mx-auto">
          <SingleExerciseWorkout
            exercise={activeSingleExercise}
            onComplete={handleCompleteSingleExercise}
            onCancel={handleCancelSingleExercise}
          />
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <Dumbbell className="w-12 h-12 mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <Dumbbell className="w-16 h-16 mx-auto text-primary" />
            <h1 className="text-4xl font-bold">Calisthenics Fitness</h1>
            <p className="text-muted-foreground">
              Track your workouts, monitor progress, and earn CALI tokens on Base
            </p>
            <Button size="lg" onClick={(): void => setShowAuthModal(true)} className="w-full">
              <LogIn className="mr-2 h-5 w-5" />
              Connect Wallet to Get Started
            </Button>
            <p className="text-xs text-muted-foreground">
              Web3 Authentication • No passwords needed
            </p>
          </div>
        </div>
        <WalletConnectModal isOpen={showAuthModal} onClose={(): void => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pt-16 md:pt-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Calisthenics Fitness</h1>
          </div>
          <div className="w-full sm:w-auto">
            <WalletUserProfile />
          </div>
        </div>

        <Tabs defaultValue="workouts" className="space-y-6">
          <div className="w-full overflow-x-auto scrollbar-hide">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-9 h-auto p-1">
              <TabsTrigger value="workouts" className="whitespace-nowrap px-3 md:px-4">
                Workouts
              </TabsTrigger>
              <TabsTrigger value="exercises" className="whitespace-nowrap px-3 md:px-4">
                Exercises
              </TabsTrigger>
              <TabsTrigger value="custom" className="whitespace-nowrap px-3 md:px-4">
                Create
              </TabsTrigger>
              <TabsTrigger value="routines" className="whitespace-nowrap px-3 md:px-4">
                Routines
              </TabsTrigger>
              <TabsTrigger value="progress" className="whitespace-nowrap px-3 md:px-4">
                Progress
              </TabsTrigger>
              <TabsTrigger value="expert" className="whitespace-nowrap px-3 md:px-4 relative">
                Expert
                {isAdmin && pendingExpertApplications > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {pendingExpertApplications}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="profile" className="whitespace-nowrap px-3 md:px-4">
                Profile
              </TabsTrigger>
              <TabsTrigger value="tokens" className="whitespace-nowrap px-3 md:px-4">
                Tokens
              </TabsTrigger>
              <TabsTrigger value="security" className="whitespace-nowrap px-3 md:px-4">
                Security
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workout Programs</CardTitle>
                <CardDescription>
                  Choose from pre-built workout routines designed for different skill levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workouts..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredWorkouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      onStart={handleStartWorkout}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exercises" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exercise Library</CardTitle>
                <CardDescription>
                  Browse our collection of calisthenics exercises with detailed instructions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search exercises..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredExercises.map((exercise) => (
                    <ExerciseCard 
                      key={exercise.id} 
                      exercise={exercise}
                      onStart={handleStartSingleExercise}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <CustomWorkoutBuilder 
              onStartCustomWorkout={handleStartCustomWorkout}
              onSaveRoutine={handleSaveRoutine}
            />
          </TabsContent>

          <TabsContent value="routines" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>My Saved Routines</CardTitle>
                <CardDescription>
                  Your personal collection of custom workout routines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SavedRoutines
                  routines={progress.savedRoutines}
                  onStartRoutine={handleStartSavedRoutine}
                  onDeleteRoutine={handleDeleteRoutine}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            <ProgressStats progress={progress} />
          </TabsContent>

          <TabsContent value="expert" className="space-y-4">
            {isAdmin ? (
              <>
                <ExpertManagementDashboard />
                <Card>
                  <CardHeader>
                    <CardTitle>Expert Verification Queue</CardTitle>
                    <CardDescription>
                      Review workout videos assigned to fitness experts
                    </CardDescription>
                  </CardHeader>
                </Card>
                <MyVerificationQueue />
              </>
            ) : experts.some((e) => e.walletAddress.toLowerCase() === user?.walletAddress?.toLowerCase() && e.isActive) ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Expert Verification</CardTitle>
                    <CardDescription>
                      Review workout videos and earn 10x CALI token rewards
                    </CardDescription>
                  </CardHeader>
                </Card>
                <MyVerificationQueue />
              </>
            ) : (
              <ExpertApplicationForm />
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <OnchainProfile
                walletAddress={user?.walletAddress as Address}
                totalVerifications={progress.totalWorkouts}
                totalEarnings={progress.totalWorkouts.toString()}
                memberSince={user?.createdAt}
                reputationLevel="Gold"
              />
              <div className="space-y-4">
                <CALITokenWallet />
                <OnchainPortfolio walletAddress={user?.walletAddress as Address} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tokens" className="space-y-4">
            <TokenWallet />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <RewardsSecurityInfo />
            <VideoVerificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
