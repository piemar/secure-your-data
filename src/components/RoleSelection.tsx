import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Presentation, Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RoleSelection() {
  const { setRole, verifyModeratorPin } = useRole();
  const [selectedRole, setSelectedRole] = useState<'moderator' | 'attendee' | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRoleSelect = (role: 'moderator' | 'attendee') => {
    setSelectedRole(role);
    setError('');
    setPin('');
  };

  const handleContinue = async () => {
    if (selectedRole === 'attendee') {
      setRole('attendee');
      return;
    }

    if (selectedRole === 'moderator') {
      setIsVerifying(true);
      setError('');
      
      // Small delay to simulate verification
      await new Promise(r => setTimeout(r, 300));
      
      if (verifyModeratorPin(pin)) {
        setRole('moderator');
      } else {
        setError('Invalid PIN. Please try again.');
      }
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-2xl mx-auto mb-4">
            M
          </div>
          <h1 className="text-3xl font-bold text-gradient-green mb-2">MongoDB SA Enablement</h1>
          <p className="text-muted-foreground">CSFLE & Queryable Encryption Workshop</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Attendee Card */}
          <Card 
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50',
              selectedRole === 'attendee' && 'border-primary bg-primary/5'
            )}
            onClick={() => handleRoleSelect('attendee')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Workshop Attendee
              </CardTitle>
              <CardDescription>
                Join as a participant to complete hands-on labs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Complete Lab 1, 2, and 3
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Track your progress
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Lab setup wizard
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Moderator Card */}
          <Card 
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50',
              selectedRole === 'moderator' && 'border-primary bg-primary/5'
            )}
            onClick={() => handleRoleSelect('moderator')}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Presentation className="w-6 h-6 text-primary" />
                Workshop Moderator
              </CardTitle>
              <CardDescription>
                Lead the workshop with presentation mode
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Full presentation access
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Speaker notes & timer
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  View leaderboard
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* PIN Entry for Moderator */}
        {selectedRole === 'moderator' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lock className="w-5 h-5" />
                Enter Moderator PIN
              </CardTitle>
              <CardDescription>
                Enter the workshop PIN to access moderator features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  className="font-mono text-lg tracking-widest"
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || (selectedRole === 'moderator' && !pin) || isVerifying}
          className="w-full"
          size="lg"
        >
          {isVerifying ? 'Verifying...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
