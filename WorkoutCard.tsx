'use client';

import type { WorkoutProgram } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Dumbbell, Coins } from 'lucide-react';
import { exercises } from '@/data/exercises';

interface WorkoutCardProps {
  workout: WorkoutProgram;
  onStart: (workoutId: string) => void;
}

export function WorkoutCard({ workout, onStart }: WorkoutCardProps): JSX.Element {
  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500'
  };

  // Calculate total token rewards for this workout
  const calculateTotalTokens = (): number => {
    let total = 0;
    workout.exercises.forEach((workoutExercise) => {
      const exercise = exercises.find((ex) => ex.id === workoutExercise.exerciseId);
      if (exercise) {
        total += exercise.tokenReward;
      }
    });
    return total;
  };

  const totalTokens = calculateTotalTokens();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{workout.name}</CardTitle>
          <Badge className={`${difficultyColors[workout.difficulty]} text-white`}>
            {workout.difficulty}
          </Badge>
        </div>
        <CardDescription>{workout.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{workout.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Dumbbell className="w-4 h-4" />
            <span>{workout.exercises.length} exercises</span>
          </div>
          
          {/* Total Token Reward Display */}
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-lg border border-yellow-200 dark:border-yellow-800 mt-2">
            <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                {totalTokens} CALI Total
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">
                Upon expert verification
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={(): void => onStart(workout.id)}
        >
          Start Workout
        </Button>
      </CardFooter>
    </Card>
  );
}
