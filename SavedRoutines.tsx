'use client';

import type { SavedRoutine, WorkoutExercise, WorkoutProgram } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trash2, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { exercises as exerciseData } from '@/data/exercises';
import type { Exercise } from '@/types/fitness';

interface SavedRoutinesProps {
  routines: SavedRoutine[];
  onStartRoutine: (routine: SavedRoutine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export function SavedRoutines({ routines, onStartRoutine, onDeleteRoutine }: SavedRoutinesProps): JSX.Element {
  const getExerciseName = (exerciseId: string): string => {
    const exercise = exerciseData.find((ex: Exercise) => ex.id === exerciseId);
    return exercise?.name || 'Unknown';
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStart = (routine: SavedRoutine): void => {
    onStartRoutine(routine);
  };

  const handleDelete = (routineId: string): void => {
    if (confirm('Are you sure you want to delete this routine?')) {
      onDeleteRoutine(routineId);
    }
  };

  if (routines.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No saved routines yet.</p>
            <p className="text-sm text-muted-foreground">
              Create your first custom routine in the Custom tab!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {routines.map((routine: SavedRoutine) => (
        <Card key={routine.id} className="flex flex-col">
          <CardHeader>
            <div className="space-y-2">
              <CardTitle className="text-lg">{routine.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(routine.difficulty)}>
                  {routine.difficulty}
                </Badge>
                <Badge variant="outline">{routine.exercises.length} exercises</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <p className="text-sm text-muted-foreground">{routine.description}</p>
            <div className="space-y-1">
              {routine.exercises.slice(0, 3).map((exercise: WorkoutExercise, index: number) => (
                <div key={index} className="text-sm flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary"></span>
                  <span className="text-muted-foreground">{getExerciseName(exercise.exerciseId)}</span>
                </div>
              ))}
              {routine.exercises.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  +{routine.exercises.length - 3} more exercises
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Created {format(parseISO(routine.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
            {routine.timesCompleted > 0 && (
              <div className="text-xs text-muted-foreground">
                Completed {routine.timesCompleted} time{routine.timesCompleted !== 1 ? 's' : ''}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="flex-1"
              onClick={(): void => handleStart(routine)}
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={(): void => handleDelete(routine.id)}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
