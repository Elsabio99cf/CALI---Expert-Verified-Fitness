'use client';

import React, { useState, useEffect } from 'react';
import { useReminders } from '@/contexts/ReminderContext';
import type { WorkoutReminder, SavedRoutine } from '@/types/fitness';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Bell, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletAuth } from '@/contexts/WalletAuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ReminderSettings(): JSX.Element {
  const { user } = useWalletAuth();
  const { reminders, addReminder, updateReminder, deleteReminder, notificationPermission, requestNotificationPermission } = useReminders();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>([]);
  
  // Form state
  const [time, setTime] = useState<string>('08:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Weekdays
  const [selectedRoutine, setSelectedRoutine] = useState<string>('none');
  const [notifyBefore, setNotifyBefore] = useState<number>(15);
  const [notifyLate, setNotifyLate] = useState<number>(30);

  // Load saved routines
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`workout-progress-${user.walletAddress}`);
      if (stored) {
        const progress = JSON.parse(stored);
        setSavedRoutines(progress.savedRoutines || []);
      }
    }
  }, [user]);

  const handleRequestPermission = async (): Promise<void> => {
    const permission = await requestNotificationPermission();
    if (permission === 'granted') {
      toast.success('Notifications enabled! You\'ll now receive workout reminders.');
    } else {
      toast.error('Notifications denied. Please enable them in your browser settings.');
    }
  };

  const handleToggleDay = (day: number): void => {
    setSelectedDays((prev: number[]) => 
      prev.includes(day) ? prev.filter((d: number) => d !== day) : [...prev, day]
    );
  };

  const handleAddReminder = (): void => {
    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    const routine = savedRoutines.find((r: SavedRoutine) => r.id === selectedRoutine);
    
    addReminder({
      enabled: true,
      time,
      days: selectedDays,
      routineId: selectedRoutine === 'none' ? undefined : selectedRoutine,
      routineName: routine?.name,
      notifyBefore,
      notifyLate,
    });

    toast.success('Reminder added successfully!');
    setIsOpen(false);
    
    // Reset form
    setTime('08:00');
    setSelectedDays([1, 2, 3, 4, 5]);
    setSelectedRoutine('none');
    setNotifyBefore(15);
    setNotifyLate(30);
  };

  const handleToggleReminder = (id: string, enabled: boolean): void => {
    updateReminder(id, { enabled });
    toast.success(enabled ? 'Reminder enabled' : 'Reminder disabled');
  };

  const handleDeleteReminder = (id: string): void => {
    deleteReminder(id);
    toast.success('Reminder deleted');
  };

  const formatDays = (days: number[]): string => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && days.every((d: number) => d >= 1 && d <= 5)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map((d: number) => DAYS[d].slice(0, 3)).join(', ');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Workout Reminders
          </CardTitle>
          <CardDescription>
            Get notified when it's time to work out
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {notificationPermission !== 'granted' && (
            <div className="flex items-start gap-3 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Notifications Disabled</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Enable browser notifications to receive workout reminders
                </p>
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={handleRequestPermission}
                >
                  Enable Notifications
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {reminders.length === 0 ? 'No reminders set' : `${reminders.length} reminder${reminders.length > 1 ? 's' : ''}`}
            </p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Workout Reminder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTime(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Days</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS.map((day: string, index: number) => (
                        <Button
                          key={index}
                          variant={selectedDays.includes(index) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleToggleDay(index)}
                          className="text-xs"
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="routine">Routine (Optional)</Label>
                    <Select value={selectedRoutine} onValueChange={setSelectedRoutine}>
                      <SelectTrigger id="routine">
                        <SelectValue placeholder="Select a routine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No specific routine</SelectItem>
                        {savedRoutines.map((routine: SavedRoutine) => (
                          <SelectItem key={routine.id} value={routine.id}>
                            {routine.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notifyBefore">Notify before (minutes)</Label>
                    <Select 
                      value={String(notifyBefore)} 
                      onValueChange={(value: string) => setNotifyBefore(Number(value))}
                    >
                      <SelectTrigger id="notifyBefore">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="10">10 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notifyLate">Remind if late (minutes)</Label>
                    <Select 
                      value={String(notifyLate)} 
                      onValueChange={(value: string) => setNotifyLate(Number(value))}
                    >
                      <SelectTrigger id="notifyLate">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddReminder}>
                    Create Reminder
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {reminders.length > 0 && (
            <div className="space-y-2">
              {reminders.map((reminder: WorkoutReminder) => (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(checked: boolean) => handleToggleReminder(reminder.id, checked)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium">{reminder.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {formatDays(reminder.days)}
                        {reminder.routineName && ` • ${reminder.routineName}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How Reminders Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Before:</strong> Get notified before your workout time</p>
          <p>• <strong>Start Time:</strong> Notification when it's time to begin</p>
          <p>• <strong>Late:</strong> Reminder if you haven't started yet</p>
          <p className="pt-2 text-xs">
            Make sure browser notifications are enabled for the best experience!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
