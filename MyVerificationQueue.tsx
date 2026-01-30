'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, ThumbsUp, ThumbsDown, Loader2, CheckCircle, AlertCircle, Play, Coins, Award } from 'lucide-react';
import { useSocialVerification } from '@/contexts/SocialVerificationContext';
import { useExpertVerification } from '@/contexts/ExpertVerificationContext';
import { BASE_EXPERT_TOKEN_REWARD, EXPERT_REPUTATION_LEVELS } from '@/types/expert-verification';
import type { VideoVerificationRequest } from '@/types/social-verification';
import { toast } from 'sonner';
import { videoStorage } from '@/lib/videoStorage';
import { useWalletAuth } from '@/contexts/WalletAuthContext';

export function MyVerificationQueue(): JSX.Element {
  const { verificationRequests, reviewVideo } = useSocialVerification();
  const { getExpertByWallet } = useExpertVerification();
  const { user } = useWalletAuth();
  const [selectedRequest, setSelectedRequest] = useState<VideoVerificationRequest | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Get current user's wallet address
  const userAddress = user?.walletAddress?.toLowerCase() || null;

  // Get expert info for current user
  const expertInfo = userAddress ? getExpertByWallet(userAddress) : null;
  
  // Calculate expert's token reward based on their level
  const expertReward = expertInfo 
    ? BASE_EXPERT_TOKEN_REWARD * EXPERT_REPUTATION_LEVELS[expertInfo.reputationLevel].tokenMultiplier
    : BASE_EXPERT_TOKEN_REWARD;

  const expertLevelInfo = expertInfo 
    ? EXPERT_REPUTATION_LEVELS[expertInfo.reputationLevel]
    : EXPERT_REPUTATION_LEVELS['Expert'];

  // Filter videos assigned to current user that haven't been reviewed yet
  const myAssignedVideos = verificationRequests.filter(
    (r) =>
      r.status === 'pending' &&
      userAddress &&
      r.assignedVerifiers.includes(userAddress) &&
      !r.verifications.some((v) => v.verifierWallet.toLowerCase() === userAddress)
  );

  // Cleanup video URL when component unmounts or request changes
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleLoadVideo = async (request: VideoVerificationRequest): Promise<void> => {
    setIsLoadingVideo(true);
    setSelectedRequest(request);
    
    try {
      // Load video from IndexedDB
      const blob = await videoStorage.getVideo(request.videoUrl);
      
      if (!blob) {
        toast.error('Video not found', {
          description: 'The workout video could not be loaded',
        });
        setSelectedRequest(null);
        return;
      }

      // Create blob URL for playback
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    } catch (error) {
      console.error('Error loading video:', error);
      toast.error('Failed to load video');
      setSelectedRequest(null);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const handleReview = async (approved: boolean): Promise<void> => {
    if (!selectedRequest) return;

    setIsSubmitting(true);

    try {
      const success = await reviewVideo(
        selectedRequest.id,
        approved,
        reviewComment || undefined
      );

      if (success) {
        // Cleanup
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        setVideoUrl(null);
        setSelectedRequest(null);
        setReviewComment('');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseVideo = (): void => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoUrl(null);
    setSelectedRequest(null);
    setReviewComment('');
  };

  if (myAssignedVideos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            My Verification Queue
          </CardTitle>
          <CardDescription>
            Videos assigned to you for expert verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Expert Status Badge */}
          {expertInfo && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className={`w-8 h-8 ${expertLevelInfo.color}`} />
                  <div>
                    <p className="font-bold text-lg">{expertLevelInfo.icon} {expertInfo.reputationLevel}</p>
                    <p className="text-sm text-muted-foreground">{expertLevelInfo.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {expertReward}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">CALI per verification</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Total Verifications:</span>
                  <span className="ml-2 font-semibold">{expertInfo.totalVerifications}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Accuracy:</span>
                  <span className="ml-2 font-semibold">{expertInfo.accuracyScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
          
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No videos assigned to you at the moment. When users upload workout videos, they will be automatically assigned to fitness experts for verification.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Show video player if a video is selected
  if (selectedRequest && videoUrl) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Review Workout Video
              </CardTitle>
              {expertInfo && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={expertLevelInfo.color}>
                    {expertLevelInfo.icon} {expertInfo.reputationLevel}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Coins className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-bold text-yellow-700 dark:text-yellow-300">+{expertReward} CALI</span>
                  </div>
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleCloseVideo}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          </div>

          {/* Workout Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploader:</span>
              <span className="text-sm text-muted-foreground">{selectedRequest.uploaderName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Exercise:</span>
              <span className="text-sm text-muted-foreground">{selectedRequest.workoutData.exerciseName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sets × Reps:</span>
              <span className="text-sm text-muted-foreground">
                {selectedRequest.workoutData.sets} × {selectedRequest.workoutData.reps}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Duration:</span>
              <span className="text-sm text-muted-foreground">{selectedRequest.videoDuration}s</span>
            </div>
          </div>

          {/* Verification Instructions */}
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Expert Review Criteria:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Verify that a real person is performing the exercise</li>
                <li>Assess form quality and technique accuracy</li>
                <li>Confirm the workout appears genuine and complete</li>
                <li>Check for proper execution and range of motion</li>
                <li>Evaluate safety and adherence to exercise standards</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Comment (Optional) */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Professional Feedback (Optional)
            </label>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-md border bg-background"
              placeholder="Provide expert feedback on form, technique, or suggestions for improvement..."
              value={reviewComment}
              onChange={(e): void => setReviewComment(e.target.value)}
            />
          </div>

          {/* Review Actions */}
          <div className="flex gap-3">
            <Button
              className="flex-1"
              size="lg"
              onClick={(): Promise<void> => handleReview(true)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsUp className="w-4 h-4 mr-2" />
              )}
              Approve Workout
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              size="lg"
              onClick={(): Promise<void> => handleReview(false)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ThumbsDown className="w-4 h-4 mr-2" />
              )}
              Reject Workout
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show list of assigned videos
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          My Verification Queue
        </CardTitle>
        <CardDescription>
          You have {myAssignedVideos.length} workout video{myAssignedVideos.length !== 1 ? 's' : ''} to review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expert Status Summary */}
        {expertInfo && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className={`w-6 h-6 ${expertLevelInfo.color}`} />
                <div>
                  <p className="font-bold">{expertLevelInfo.icon} {expertInfo.reputationLevel}</p>
                  <p className="text-xs text-muted-foreground">
                    {expertInfo.totalVerifications} verifications • {expertInfo.accuracyScore.toFixed(1)}% accuracy
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
                    {expertReward}
                  </span>
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">per verification</p>
              </div>
            </div>
          </div>
        )}

        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            As a certified fitness expert, review each video with professional standards. You'll earn <strong>{expertReward} CALI tokens</strong> for each verification!
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          {myAssignedVideos.map((request) => (
            <Card key={request.id} className="border-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{request.workoutData.exerciseName}</Badge>
                      <Badge variant="secondary">
                        {request.workoutData.sets} × {request.workoutData.reps}
                      </Badge>
                      <div className="flex items-center gap-1 ml-auto">
                        <Coins className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-bold text-yellow-700 dark:text-yellow-300">
                          +{expertReward}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        <strong>Uploader:</strong> {request.uploaderName}
                      </p>
                      <p>
                        <strong>Uploaded:</strong>{' '}
                        {new Date(request.createdAt).toLocaleDateString()} at{' '}
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </p>
                      <p>
                        <strong>Duration:</strong> {request.videoDuration}s
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3" />
                      {request.verifications.length} / {request.assignedVerifiers.length} expert reviews completed
                    </div>
                  </div>
                  <Button
                    onClick={(): Promise<void> => handleLoadVideo(request)}
                    disabled={isLoadingVideo}
                  >
                    {isLoadingVideo ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Review Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
