'use client';

import { useMemo } from 'react';
import type { WorkoutProgress, CompletedWorkout, DailyStats, WeeklyStats, MonthlyStats } from '@/types/fitness';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, TrendingUp, Flame, BarChart3 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, isSameDay, parseISO } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ProgressStatsProps {
  progress: WorkoutProgress;
}

export function ProgressStats({ progress }: ProgressStatsProps): JSX.Element {
  const dailyStats = useMemo((): DailyStats[] => {
    const statsMap = new Map<string, DailyStats>();

    progress.workouts.forEach((workout: CompletedWorkout) => {
      const dateKey = format(parseISO(workout.date), 'yyyy-MM-dd');
      
      if (!statsMap.has(dateKey)) {
        statsMap.set(dateKey, {
          date: dateKey,
          workouts: [],
          totalTime: 0,
          totalExercises: 0
        });
      }

      const stats = statsMap.get(dateKey)!;
      stats.workouts.push(workout);
      stats.totalTime += workout.duration;
      stats.totalExercises += workout.exercises.length;
    });

    return Array.from(statsMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [progress.workouts]);

  const weeklyStats = useMemo((): WeeklyStats[] => {
    if (progress.workouts.length === 0) return [];

    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);

    const weeks = eachWeekOfInterval({
      start: fourWeeksAgo,
      end: now
    }, { weekStartsOn: 0 });

    return weeks.map((weekStart) => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
      const weekWorkouts = progress.workouts.filter((workout: CompletedWorkout) => {
        const workoutDate = parseISO(workout.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });

      const dailyBreakdown = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) => {
        const dayWorkouts = weekWorkouts.filter((workout: CompletedWorkout) =>
          isSameDay(parseISO(workout.date), day)
        );
        return {
          date: format(day, 'EEE'),
          workouts: dayWorkouts.length,
          time: dayWorkouts.reduce((sum, w) => sum + w.duration, 0)
        };
      });

      return {
        weekStart: format(weekStart, 'MMM d'),
        weekEnd: format(weekEnd, 'MMM d'),
        totalWorkouts: weekWorkouts.length,
        totalTime: weekWorkouts.reduce((sum, w) => sum + w.duration, 0),
        dailyBreakdown
      };
    });
  }, [progress.workouts]);

  const monthlyStats = useMemo((): MonthlyStats[] => {
    if (progress.workouts.length === 0) return [];

    const now = new Date();
    const months: MonthlyStats[] = [];

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const monthWorkouts = progress.workouts.filter((workout: CompletedWorkout) => {
        const workoutDate = parseISO(workout.date);
        return workoutDate >= monthStart && workoutDate <= monthEnd;
      });

      const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 });
      
      const weeklyBreakdown = weeks.map((weekStart, index) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 0 });
        const weekWorkouts = monthWorkouts.filter((workout: CompletedWorkout) => {
          const workoutDate = parseISO(workout.date);
          return workoutDate >= weekStart && workoutDate <= weekEnd;
        });

        return {
          week: index + 1,
          workouts: weekWorkouts.length,
          time: weekWorkouts.reduce((sum, w) => sum + w.duration, 0)
        };
      });

      const dayOfWeekCounts = new Map<string, number>();
      monthWorkouts.forEach((workout: CompletedWorkout) => {
        const day = format(parseISO(workout.date), 'EEEE');
        dayOfWeekCounts.set(day, (dayOfWeekCounts.get(day) || 0) + 1);
      });

      let mostActiveDay = 'None';
      let maxCount = 0;
      dayOfWeekCounts.forEach((count, day) => {
        if (count > maxCount) {
          maxCount = count;
          mostActiveDay = day;
        }
      });

      months.push({
        month: format(monthDate, 'MMMM'),
        year: monthDate.getFullYear(),
        totalWorkouts: monthWorkouts.length,
        totalTime: monthWorkouts.reduce((sum, w) => sum + w.duration, 0),
        averageWorkoutsPerWeek: monthWorkouts.length / weeks.length,
        mostActiveDay,
        weeklyBreakdown
      });
    }

    return months.reverse();
  }, [progress.workouts]);

  const currentWeekStats = weeklyStats[weeklyStats.length - 1];

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {dailyStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No workouts completed yet. Start your first workout!
                </p>
              ) : (
                <div className="space-y-4">
                  {dailyStats.slice(0, 10).map((day: DailyStats) => (
                    <div key={day.date} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {format(parseISO(day.date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <Badge>{day.workouts.length} workout{day.workouts.length !== 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {day.totalTime} min
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {day.totalExercises} exercises
                        </span>
                      </div>
                      <div className="space-y-1">
                        {day.workouts.map((workout: CompletedWorkout) => (
                          <div key={workout.id} className="text-sm pl-4 border-l-2 border-primary">
                            <span className="font-medium">{workout.programName}</span>
                            <span className="text-muted-foreground"> • {format(parseISO(workout.date), 'h:mm a')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {currentWeekStats && (
            <Card>
              <CardHeader>
                <CardTitle>This Week ({currentWeekStats.weekStart} - {currentWeekStats.weekEnd})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{currentWeekStats.totalWorkouts}</div>
                      <div className="text-sm text-muted-foreground">Workouts</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{currentWeekStats.totalTime}m</div>
                      <div className="text-sm text-muted-foreground">Total Time</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={currentWeekStats.dailyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="workouts" fill="#3b82f6" name="Workouts" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Last 4 Weeks Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyStats.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No workout data available yet.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="weekStart" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalWorkouts" stroke="#3b82f6" name="Workouts" strokeWidth={2} />
                    <Line type="monotone" dataKey="totalTime" stroke="#10b981" name="Time (min)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          {monthlyStats.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
                  No workout data available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            monthlyStats.map((month: MonthlyStats) => (
              <Card key={`${month.month}-${month.year}`}>
                <CardHeader>
                  <CardTitle>{month.month} {month.year}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{month.totalWorkouts}</div>
                      <div className="text-xs text-muted-foreground">Total Workouts</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{month.totalTime}m</div>
                      <div className="text-xs text-muted-foreground">Total Time</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{month.averageWorkoutsPerWeek.toFixed(1)}</div>
                      <div className="text-xs text-muted-foreground">Avg/Week</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-xl font-bold">{month.mostActiveDay}</div>
                      <div className="text-xs text-muted-foreground">Most Active</div>
                    </div>
                  </div>
                  {month.totalWorkouts > 0 && (
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={month.weeklyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" label={{ value: 'Week', position: 'insideBottom', offset: -5 }} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="workouts" fill="#8b5cf6" name="Workouts" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
