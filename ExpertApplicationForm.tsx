'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Award, UserCheck, Loader2, CheckCircle, X } from 'lucide-react';
import { useExpertVerification } from '@/contexts/ExpertVerificationContext';
import { useWalletAuth } from '@/contexts/WalletAuthContext';
import { toast } from 'sonner';

const COMMON_CERTIFICATIONS = [
  'NASM-CPT', 'ACE', 'ISSA', 'NSCA-CPT', 'ACSM', 'CrossFit Level 1', 'Other'
];

const SPECIALIZATIONS = [
  'Calisthenics', 'Bodyweight Training', 'Strength Training', 'Olympic Weightlifting',
  'Powerlifting', 'CrossFit', 'Gymnastics', 'Mobility', 'Rehabilitation'
];

export function ExpertApplicationForm(): JSX.Element {
  const { applyAsExpert, isExpert, expertApplications } = useExpertVerification();
  const { user } = useWalletAuth();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const normalizedAddress = user?.walletAddress?.toLowerCase();
  const isAlreadyExpert = normalizedAddress ? isExpert(normalizedAddress) : false;
  
  const myApplication = expertApplications.find(
    (app) => app.walletAddress.toLowerCase() === normalizedAddress
  );

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: '',
    bio: '',
    yearsExperience: 0,
    website: '',
    instagram: '',
    youtube: '',
    linkedin: '',
  });

  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const toggleCertification = (cert: string): void => {
    setSelectedCerts((prev) =>
      prev.includes(cert) ? prev.filter((c) => c !== cert) : [...prev, cert]
    );
  };

  const toggleSpecialization = (spec: string): void => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!normalizedAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (selectedCerts.length === 0) {
      toast.error('Please select at least one certification');
      return;
    }

    if (selectedSpecs.length === 0) {
      toast.error('Please select at least one specialization');
      return;
    }

    if (formData.yearsExperience < 1) {
      toast.error('Years of experience must be at least 1');
      return;
    }

    setIsSubmitting(true);

    const success = await applyAsExpert({
      walletAddress: normalizedAddress,
      name: formData.name || user?.name || 'Anonymous',
      email: formData.email,
      bio: formData.bio,
      yearsExperience: formData.yearsExperience,
      specialization: selectedSpecs,
      certifications: selectedCerts,
      socialProof: {
        website: formData.website || undefined,
        instagram: formData.instagram || undefined,
        youtube: formData.youtube || undefined,
        linkedin: formData.linkedin || undefined,
      },
    });

    if (success) {
      // Reset form
      setFormData({
        name: user?.name || '',
        email: '',
        bio: '',
        yearsExperience: 0,
        website: '',
        instagram: '',
        youtube: '',
        linkedin: '',
      });
      setSelectedCerts([]);
      setSelectedSpecs([]);
    }

    setIsSubmitting(false);
  };

  if (isAlreadyExpert) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-green-600" />
            Expert Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">You are an approved fitness expert!</p>
              <p className="text-sm text-green-700">You can now verify workout videos and earn 10x rewards.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (myApplication) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Expert Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Application Status</p>
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(myApplication.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={
                myApplication.status === 'pending' ? 'outline' :
                myApplication.status === 'approved' ? 'default' :
                'destructive'
              }>
                {myApplication.status}
              </Badge>
            </div>

            {myApplication.status === 'rejected' && myApplication.rejectionReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-900">Rejection Reason:</p>
                <p className="text-sm text-red-700 mt-1">{myApplication.rejectionReason}</p>
              </div>
            )}

            {myApplication.status === 'pending' && (
              <p className="text-sm text-muted-foreground">
                Your application is under review. You will be notified once it's processed.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Apply as Fitness Expert
        </CardTitle>
        <CardDescription>
          Become a certified verifier and earn 10x rewards (50 CALI tokens per verification)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e): void => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e): void => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Years of Experience */}
          <div>
            <Label htmlFor="experience">Years of Experience *</Label>
            <Input
              id="experience"
              type="number"
              min="1"
              value={formData.yearsExperience || ''}
              onChange={(e): void => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
              required
            />
          </div>

          {/* Certifications */}
          <div>
            <Label>Certifications * (Select all that apply)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMMON_CERTIFICATIONS.map((cert) => (
                <Badge
                  key={cert}
                  variant={selectedCerts.includes(cert) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={(): void => toggleCertification(cert)}
                >
                  {selectedCerts.includes(cert) && <CheckCircle className="w-3 h-3 mr-1" />}
                  {cert}
                </Badge>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <Label>Specializations * (Select all that apply)</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {SPECIALIZATIONS.map((spec) => (
                <Badge
                  key={spec}
                  variant={selectedSpecs.includes(spec) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={(): void => toggleSpecialization(spec)}
                >
                  {selectedSpecs.includes(spec) && <CheckCircle className="w-3 h-3 mr-1" />}
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Professional Bio *</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e): void => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about your fitness background, experience, and expertise..."
              rows={4}
              required
            />
          </div>

          {/* Social Proof */}
          <div className="space-y-3">
            <Label>Social Proof (Optional)</Label>
            <Input
              placeholder="Website URL"
              value={formData.website}
              onChange={(e): void => setFormData({ ...formData, website: e.target.value })}
            />
            <Input
              placeholder="Instagram handle"
              value={formData.instagram}
              onChange={(e): void => setFormData({ ...formData, instagram: e.target.value })}
            />
            <Input
              placeholder="YouTube channel"
              value={formData.youtube}
              onChange={(e): void => setFormData({ ...formData, youtube: e.target.value })}
            />
            <Input
              placeholder="LinkedIn profile"
              value={formData.linkedin}
              onChange={(e): void => setFormData({ ...formData, linkedin: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              <>
                <Award className="w-4 h-4 mr-2" />
                Submit Expert Application
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
