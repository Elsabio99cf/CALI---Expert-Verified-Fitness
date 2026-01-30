'use client';

import { useState } from 'react';
import type { WorkoutProgram, WorkoutExercise, SavedRoutine } from '@/types/fitness';
import type { Exercise } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Play, Save } from 'lucide-react';
import { exercises as exerciseData } from '@/data/exercises';
import { toast } from 'sonner';

interface CustomWorkoutBuilderProps {
  onStartCustomWorkout: (workout: WorkoutProgram) => void;
  onSaveRoutine: (routine: SavedRoutine) => void;
}

export function CustomWorkoutBuilder({ onStartCustomWorkout, onSaveRoutine }: CustomWorkoutBuilderProps): JSX.Element {
  const [workoutName, setWorkoutName] = useState<string>('');
  const [workoutDescription, setWorkoutDescription] = useState<string>('');
  const [workoutDifficulty, setWorkoutDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  const [currentExerciseId, setCurrentExerciseId] = useState<string>('');
  const [currentSets, setCurrentSets] = useState<string>('3');
  const [currentReps, setCurrentReps] = useState<string>('10');
  const [currentRest, setCurrentRest] = useState<string>('60');

  const handleAddExercise = (): void => {
    if (!currentExerciseId) return;

    const newExercise: WorkoutExercise = {
      exerciseId: currentExerciseId,
      sets: parseInt(currentSets) || 3,
      reps: parseInt(currentReps) || 10,
      restSeconds: parseInt(currentRest) || 60
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    setCurrentExerciseId('');
    setCurrentSets('3');
    setCurrentReps('10');
    setCurrentRest('60');
  };

  const handleRemoveExercise = (index: number): void => {
    setSelectedExercises(selectedExercises.filter((_: WorkoutExercise, i: number) => i !== index));
  };

  const handleSaveRoutine = (): void => {
    if (selectedExercises.length === 0) {
      toast.error('Add at least one exercise to save the routine');
      return;
    }

    if (!workoutName.trim()) {
      toast.error('Please enter a routine name');
      return;
    }

    const newRoutine: SavedRoutine = {
      id: `routine-${Date.now()}`,
      name: workoutName.trim(),
      description: workoutDescription.trim() || 'Custom workout routine',
      difficulty: workoutDifficulty,
      exercises: selectedExercises,
      createdAt: new Date().toISOString(),
      timesCompleted: 0
    };

    onSaveRoutine(newRoutine);
    
    setWorkoutName('');
    setWorkoutDescription('');
    setWorkoutDifficulty('intermediate');
    setSelectedExercises([]);
    
    toast.success('Routine saved successfully! 🎉');
  };

  const handleStartWorkout = (): void => {
    if (selectedExercises.length === 0) {
      toast.error('Add at least one exercise to start the workout');
      return;
    }

    const customWorkout: WorkoutProgram = {
      id: `custom-${Date.now()}`,
      name: workoutName.trim() || 'Quick Workout',
      description: workoutDescription.trim() || 'Custom workout routine',
      difficulty: workoutDifficulty,
      duration: 'Custom',
      totalTime: 0,
      exercises: selectedExercises
    };

    onStartCustomWorkout(customWorkout);
  };

  const getExerciseName = (exerciseId: string): string => {
    const exercise = exerciseData.find((ex: Exercise) => ex.id === exerciseId);
    return exercise?.name || 'Unknown';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Routine Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workout-name">Routine Name *</Label>
            <Input
              id="workout-name"
              value={workoutName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setWorkoutName(e.target.value)}
              placeholder="e.g., Upper Body Strength"
            />
          </div>
          <div>
            <Label htmlFor="workout-description">Description</Label>
            <Textarea
              id="workout-description"
              value={workoutDescription}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setWorkoutDescription(e.target.value)}
              placeholder="Describe your routine..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="workout-difficulty">Difficulty Level</Label>
            <Select 
              value={workoutDifficulty} 
              onValueChange={(value: string): void => setWorkoutDifficulty(value as 'beginner' | 'intermediate' | 'advanced')}
            >
              <SelectTrigger id="workout-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add Exercises</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="exercise-select">Exercise</Label>
            <Select value={currentExerciseId} onValueChange={setCurrentExerciseId}>
              <SelectTrigger id="exercise-select">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {exerciseData.map((exercise: Exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                value={currentSets}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setCurrentSets(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="reps">Reps</Label>
              <Input
                id="reps"
                type="number"
                value={currentReps}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setCurrentReps(e.target.value)}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="rest">Rest (s)</Label>
              <Input
                id="rest"
                type="number"
                value={currentRest}
                onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setCurrentRest(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <Button onClick={handleAddExercise} className="w-full" disabled={!currentExerciseId}>
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </CardContent>
      </Card>

      {selectedExercises.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Routine Plan ({selectedExercises.length} exercises)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {selectedExercises.map((exercise: WorkoutExercise, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{getExerciseName(exercise.exerciseId)}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{exercise.sets} sets</Badge>
                    <Badge variant="secondary">{exercise.reps} reps</Badge>
                    <Badge variant="secondary">{exercise.restSeconds}s rest</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(): void => handleRemoveExercise(index)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleSaveRoutine}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Routine
            </Button>
            <Button
              className="flex-1"
              onClick={handleStartWorkout}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Now
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
