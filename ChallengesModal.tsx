'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChallenge } from '@/contexts/ChallengeContext';
import { useWalletAuth } from '@/contexts/WalletAuthContext';
import type { Challenge, CreateChallengeData, ChallengeParticipant } from '@/types/challenge';
import { toast } from 'sonner';
import { Trophy, Timer, Target, Users, Trash2, Calendar } from 'lucide-react';
import { exercises } from '@/data/exercises';

interface ChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChallengesModal({ isOpen, onClose }: ChallengesModalProps): JSX.Element {
  const { user } = useWalletAuth();
  const { createChallenge, getActiveChallenges, getCompletedChallenges, deleteChallenge } = useChallenge();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [challengeName, setChallengeName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [challengeType, setChallengeType] = useState<string>('');
  const [duration, setDuration] = useState<string>('7');
  const [targetValue, setTargetValue] = useState<string>('');
  const [exerciseId, setExerciseId] = useState<string>('');
  const [opponentEmail, setOpponentEmail] = useState<string>('');

  const activeChallenges = getActiveChallenges();
  const completedChallenges = getCompletedChallenges();

  const handleCreateChallenge = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!challengeName || !challengeType || !opponentEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (challengeType === 'most-reps' && !exerciseId) {
      toast.error('Please select an exercise');
      return;
    }

    const data: CreateChallengeData = {
      name: challengeName,
      description,
      type: challengeType as CreateChallengeData['type'],
      duration: parseInt(duration),
      targetValue: targetValue ? parseInt(targetValue) : undefined,
      exerciseId: challengeType === 'most-reps' ? exerciseId : undefined,
      opponentEmail
    };

    setIsCreating(true);
    const success = await createChallenge(data);
    setIsCreating(false);

    if (success) {
      setChallengeName('');
      setDescription('');
      setChallengeType('');
      setDuration('7');
      setTargetValue('');
      setExerciseId('');
      setOpponentEmail('');
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string): number => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getChallengeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'most-reps': 'Most Reps',
      'total-time': 'Total Time',
      'workout-completion': 'Workout Completion',
      'total-workouts': 'Total Workouts'
    };
    return labels[type] || type;
  };

  const renderChallengeCard = (challenge: Challenge, isActive: boolean): JSX.Element => {
    const userParticipant = challenge.participants.find((p: ChallengeParticipant) => p.userId === user?.walletAddress);
    const opponentParticipant = challenge.participants.find((p: ChallengeParticipant) => p.userId !== user?.walletAddress);
    const daysRemaining = isActive ? getDaysRemaining(challenge.endDate) : 0;

    return (
      <Card key={challenge.id}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{challenge.name}</CardTitle>
              <CardDescription>{challenge.description}</CardDescription>
            </div>
            {user?.walletAddress === challenge.creatorId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(): void => deleteChallenge(challenge.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">
              <Target className="mr-1 h-3 w-3" />
              {getChallengeTypeLabel(challenge.type)}
            </Badge>
            {challenge.exerciseName && (
              <Badge variant="outline">{challenge.exerciseName}</Badge>
            )}
            {isActive && (
              <Badge variant="secondary">
                <Timer className="mr-1 h-3 w-3" />
                {daysRemaining} days left
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{userParticipant?.userName} (You)</span>
                <span className="text-2xl font-bold">{userParticipant?.progress || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">{opponentParticipant?.userName}</span>
                <span className="text-2xl font-bold">{opponentParticipant?.progress || 0}</span>
              </div>
            </div>

            {!isActive && challenge.winnerId && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">
                    Winner: {challenge.winnerName}
                  </span>
                </div>
              </div>
            )}

            {!isActive && !challenge.winnerId && (
              <div className="pt-4 border-t">
                <div className="text-center text-muted-foreground">
                  Challenge ended in a tie
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Fitness Challenges</DialogTitle>
          <DialogDescription>
            Create and track head-to-head fitness challenges with other users
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No active challenges</p>
                <p className="text-sm">Create one to compete with friends!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeChallenges.map((challenge: Challenge) =>
                  renderChallengeCard(challenge, true)
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedChallenges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="mx-auto h-12 w-12 mb-2 opacity-50" />
                <p>No completed challenges yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedChallenges.map((challenge: Challenge) =>
                  renderChallengeCard(challenge, false)
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="challenge-name">Challenge Name *</Label>
                <Input
                  id="challenge-name"
                  placeholder="e.g., 100 Push-ups Challenge"
                  value={challengeName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setChallengeName(e.target.value)}
                  disabled={isCreating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenge-description">Description</Label>
                <Textarea
                  id="challenge-description"
                  placeholder="What's this challenge about?"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setDescription(e.target.value)}
                  disabled={isCreating}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenge-type">Challenge Type *</Label>
                <Select value={challengeType} onValueChange={setChallengeType}>
                  <SelectTrigger id="challenge-type">
                    <SelectValue placeholder="Select challenge type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-reps">Most Reps (Single Exercise)</SelectItem>
                    <SelectItem value="total-time">Total Workout Time</SelectItem>
                    <SelectItem value="total-workouts">Total Workouts Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {challengeType === 'most-reps' && (
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercise *</Label>
                  <Select value={exerciseId} onValueChange={setExerciseId}>
                    <SelectTrigger id="exercise">
                      <SelectValue placeholder="Select exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises.map((ex) => (
                        <SelectItem key={ex.id} value={ex.id}>
                          {ex.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (days) *</Label>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Target (optional)</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="e.g., 100"
                    value={targetValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setTargetValue(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="opponent-wallet">Opponent Wallet Address *</Label>
                <Input
                  id="opponent-wallet"
                  type="text"
                  placeholder="0x..."
                  value={opponentEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setOpponentEmail(e.target.value)}
                  disabled={isCreating}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the wallet address of the user you want to challenge
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating Challenge...' : 'Create Challenge'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
