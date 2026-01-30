'use client';

import type { WorkoutProgress, CompletedWorkout } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Flame, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface WorkoutHistoryProps {
  progress: WorkoutProgress;
}

export function WorkoutHistory({ progress }: WorkoutHistoryProps): JSX.Element {
  const sortedWorkouts: CompletedWorkout[] = [...progress.workouts].sort(
    (a: CompletedWorkout, b: CompletedWorkout) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <TrendingUp className="w-8 h-8 mx-auto text-blue-500" />
              <div className="text-2xl font-bold">{progress.totalWorkouts}</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Clock className="w-8 h-8 mx-auto text-green-500" />
              <div className="text-2xl font-bold">{progress.totalTime}m</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Flame className="w-8 h-8 mx-auto text-orange-500" />
              <div className="text-2xl font-bold">{progress.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-purple-500" />
              <div className="text-2xl font-bold">{progress.longestStreak}</div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedWorkouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No workouts completed yet. Start your first workout!
            </p>
          ) : (
            <div className="space-y-4">
              {sortedWorkouts.map((workout: CompletedWorkout) => (
                <div
                  key={workout.id}
                  className="flex items-start justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold">{workout.programName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workout.date), 'MMM d, yyyy • h:mm a')}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">
                        {workout.exercises.length} exercises
                      </Badge>
                      <Badge variant="secondary">
                        {workout.duration} min
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
