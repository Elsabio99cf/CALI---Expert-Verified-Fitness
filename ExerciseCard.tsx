'use client';

import type { Exercise } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Coins } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onStart?: (exerciseId: string) => void;
}

export function ExerciseCard({ exercise, onStart }: ExerciseCardProps): JSX.Element {
  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-500',
    intermediate: 'bg-yellow-500',
    advanced: 'bg-red-500'
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{exercise.name}</CardTitle>
              <Badge className={`${difficultyColors[exercise.difficulty]} text-white`}>
                {exercise.difficulty}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">{exercise.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {exercise.muscleGroups.slice(0, 3).map((muscle: string) => (
                <Badge key={muscle} variant="outline" className="text-xs">
                  {muscle}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{exercise.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
            
            {/* Token Reward Display */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                Earn {exercise.tokenReward} CALI upon verification
              </span>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            <div>
              <Badge className={`${difficultyColors[exercise.difficulty]} text-white mb-2`}>
                {exercise.difficulty}
              </Badge>
              <p className="text-sm">{exercise.description}</p>
            </div>

            {/* Token Reward - Prominent Display in Modal */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
              <Coins className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                  {exercise.tokenReward} CALI Tokens
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Earned after expert verification
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Muscle Groups</h3>
              <div className="flex flex-wrap gap-2">
                {exercise.muscleGroups.map((muscle: string) => (
                  <Badge key={muscle} variant="secondary">
                    {muscle}
                  </Badge>
                ))}
              </div>
            </div>

            {exercise.equipment.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {exercise.equipment.map((item: string) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {exercise.instructions.map((instruction: string, index: number) => (
                  <li key={index} className="text-sm">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Tips</h3>
              <ul className="list-disc list-inside space-y-1">
                {exercise.tips.map((tip: string, index: number) => (
                  <li key={index} className="text-sm text-muted-foreground">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {onStart && (
              <Button 
                onClick={() => {
                  onStart(exercise.id);
                }}
                className="w-full"
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Exercise
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
