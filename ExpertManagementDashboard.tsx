'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldCheck, Users, CheckCircle, XCircle, AlertCircle, Award } from 'lucide-react';
import { useExpertVerification } from '@/contexts/ExpertVerificationContext';
import type { ExpertApplication, FitnessExpert } from '@/types/expert-verification';
import { EXPERT_REPUTATION_LEVELS } from '@/types/expert-verification';

export function ExpertManagementDashboard(): JSX.Element {
  const { 
    experts, 
    expertApplications, 
    approveExpertApplication, 
    rejectExpertApplication,
    removeExpert,
    isAdmin 
  } = useExpertVerification();
  
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const pendingApplications = expertApplications.filter((app) => app.status === 'pending');
  const activeExperts = experts.filter((expert) => expert.isActive);

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Expert Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Only the admin can access expert management features.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleApprove = async (appId: string): Promise<void> => {
    await approveExpertApplication(appId);
    setSelectedApp(null);
  };

  const handleReject = async (appId: string): Promise<void> => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    await rejectExpertApplication(appId, rejectionReason);
    setSelectedApp(null);
    setRejectionReason('');
  };

  const handleRemoveExpert = async (walletAddress: string): Promise<void> => {
    if (confirm('Are you sure you want to remove this expert?')) {
      await removeExpert(walletAddress);
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Experts</p>
                <p className="text-2xl font-bold">{activeExperts.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
                <p className="text-2xl font-bold">{pendingApplications.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Verifications</p>
                <p className="text-2xl font-bold">
                  {activeExperts.reduce((sum, e) => sum + e.totalVerifications, 0)}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Pending Expert Applications ({pendingApplications.length})
          </CardTitle>
          <CardDescription>
            Review and approve fitness professionals to become expert verifiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending applications
            </p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{app.name}</h4>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {app.yearsExperience} years experience
                      </p>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Certifications:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.certifications.map((cert) => (
                          <Badge key={cert} variant="secondary" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Specializations:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {app.specialization.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Bio:</p>
                      <p className="text-sm text-muted-foreground mt-1">{app.bio}</p>
                    </div>
                    {Object.values(app.socialProof).some((v) => v) && (
                      <div>
                        <p className="text-sm font-medium">Social Proof:</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {app.socialProof.website && (
                            <p>Website: {app.socialProof.website}</p>
                          )}
                          {app.socialProof.instagram && (
                            <p>Instagram: {app.socialProof.instagram}</p>
                          )}
                          {app.socialProof.youtube && (
                            <p>YouTube: {app.socialProof.youtube}</p>
                          )}
                          {app.socialProof.linkedin && (
                            <p>LinkedIn: {app.socialProof.linkedin}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedApp === app.id && (
                    <div className="space-y-2 pt-2 border-t">
                      <label className="text-sm font-medium">Rejection Reason:</label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e): void => setRejectionReason(e.target.value)}
                        placeholder="Provide a reason for rejection..."
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={(): Promise<void> => handleApprove(app.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    {selectedApp === app.id ? (
                      <>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(): Promise<void> => handleReject(app.id)}
                          className="flex-1"
                        >
                          Confirm Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(): void => {
                            setSelectedApp(null);
                            setRejectionReason('');
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(): void => setSelectedApp(app.id)}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Experts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Fitness Experts ({activeExperts.length})
          </CardTitle>
          <CardDescription>
            Manage your approved fitness experts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeExperts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No active experts yet. Approve applications to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {activeExperts.map((expert) => {
                const levelInfo = EXPERT_REPUTATION_LEVELS[expert.reputationLevel];
                return (
                  <div key={expert.walletAddress} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{expert.name}</h4>
                          <Badge variant="outline" className={levelInfo.color}>
                            {levelInfo.icon} {expert.reputationLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{expert.email}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {expert.specialization.map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>✓ {expert.totalVerifications} verifications</span>
                          <span>🎯 {expert.accuracyScore.toFixed(1)}% accuracy</span>
                          <span>💰 {expert.tokensEarned} tokens</span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(): Promise<void> => handleRemoveExpert(expert.walletAddress)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
