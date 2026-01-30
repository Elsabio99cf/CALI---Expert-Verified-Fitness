'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Activity, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';

export function RewardsSecurityInfo(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>Phase 2 Security System</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Advanced anti-cheat with cryptographic verification
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">7+</p>
              <p className="text-sm text-gray-600">Security Layers</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              <p className="text-2xl font-bold text-green-600">100%</p>
              <p className="text-sm text-gray-600">Verified Workouts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Layers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Multi-Layer Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Cryptographic Signatures</p>
                <p className="text-sm text-gray-600">
                  Motion data is cryptographically signed and timestamped to prevent tampering
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Motion Tracking Required</p>
                <p className="text-sm text-gray-600">
                  Workouts cannot complete without active motion sensor tracking
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Device Fingerprinting</p>
                <p className="text-sm text-gray-600">
                  Each device is uniquely identified to detect suspicious device switching
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Replay Attack Prevention</p>
                <p className="text-sm text-gray-600">
                  Motion data can only be used once - duplicates are rejected
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Community Verification</p>
                <p className="text-sm text-gray-600">
                  Real users review workout videos to ensure authenticity
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Progression Tracking</p>
                <p className="text-sm text-gray-600">
                  Monitors intensity changes over time to detect impossible improvements
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Account Flagging</p>
                <p className="text-sm text-gray-600">
                  Accounts with 3+ suspicious activities are automatically blocked
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motion Tracking Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Motion Verification Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm mb-2">Intensity Metrics</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Average intensity: ≥2.0</li>
                <li>• Peak intensity: ≥5.0</li>
                <li>• Consistency score: ≥20%</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm mb-2">Movement Requirements</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Minimum 10+ significant movements</li>
                <li>• At least 2 repetitive patterns</li>
                <li>• Motion duration ≥40% of workout time</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold text-sm mb-2">Anti-Cheat Checks</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• No stationary device detection</li>
                <li>• No uniform pattern detection</li>
                <li>• 10-minute cooldown between workouts</li>
                <li>• Maximum 2.5x intensity increase prevention</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Tips */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <Smartphone className="w-5 h-5" />
            Tips for Successful Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-green-900">
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Keep your device with you during exercises (pocket, armband, or nearby)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Grant motion sensor permissions when prompted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Ensure your device supports accelerometer and gyroscope</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Complete workouts naturally - the system detects fake movements</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">•</span>
              <span>Wait at least 10 minutes between workouts</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Lock className="w-5 h-5" />
            Your Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-purple-900">
          <p className="mb-2">
            <strong>We respect your privacy:</strong>
          </p>
          <ul className="space-y-1">
            <li>• Raw motion data is processed locally on your device</li>
            <li>• Only verification metrics are sent to our servers</li>
            <li>• No personal movement patterns are stored</li>
            <li>• Data is encrypted with cryptographic signatures</li>
            <li>• Your workout data remains private and secure</li>
          </ul>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-900">
              <p className="font-semibold mb-1">Important Notice</p>
              <p>
                Attempting to bypass security measures or submit fraudulent workout data will result in account
                suspension. All activities are logged and monitored for suspicious behavior.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
