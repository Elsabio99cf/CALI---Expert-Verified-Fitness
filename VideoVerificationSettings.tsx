'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Camera, Shield } from 'lucide-react';
import { useVideoVerification } from '@/contexts/VideoVerificationContext';

export function VideoVerificationSettings(): JSX.Element {
  const { settings, updateSettings } = useVideoVerification();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Video Verification Options
          </CardTitle>
          <CardDescription>
            Configure community-based verification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Option 1: Random Selfies */}
          <div className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <Label htmlFor="selfies" className="font-semibold">
                    Occasional Selfie Checks
                  </Label>
                  <Badge variant="secondary">Option 1</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Random verification prompts during workouts
                </p>
              </div>
              <Switch
                id="selfies"
                checked={settings.enableRandomSelfies}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({ enableRandomSelfies: checked })
                }
              />
            </div>

            {settings.enableRandomSelfies && (
              <div className="space-y-2 pt-2">
                <Label className="text-xs">
                  Selfie Frequency: {settings.selfieFrequency}%
                </Label>
                <Slider
                  value={[settings.selfieFrequency]}
                  onValueChange={([value]: number[]) =>
                    updateSettings({ selfieFrequency: value })
                  }
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Probability of being asked for a selfie during each exercise
                </p>
              </div>
            )}
          </div>



          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy & Security
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• All verification is done by the community</li>
              <li>• Videos are stored securely until verification completes</li>
              <li>• Only verification results are kept permanently</li>
              <li>• You control which methods are enabled</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
