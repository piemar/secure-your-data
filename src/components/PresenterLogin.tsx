import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { useLab } from '@/context/LabContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, AlertCircle, ArrowLeft, Presentation } from 'lucide-react';

interface PresenterLoginProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function PresenterLogin({ onBack, onSuccess }: PresenterLoginProps) {
  const { setRole, verifyModeratorPin } = useRole();
  const { setUserEmail } = useLab();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    
    await new Promise(r => setTimeout(r, 300));
    
    if (verifyModeratorPin(pin)) {
      setRole('moderator');
      // Set hardcoded presenter credentials
      localStorage.setItem('workshop_attendee_name', 'Pierre Petersson');
      setUserEmail('pierre.petersson@mongodb.com');
      localStorage.removeItem('show_presenter_login');
      onSuccess();
    } else {
      setError('Invalid PIN. Please try again.');
    }
    setIsVerifying(false);
  };

  const handleBack = () => {
    localStorage.removeItem('show_presenter_login');
    onBack();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-2xl mx-auto mb-4">
            M
          </div>
          <h1 className="text-3xl font-bold text-gradient-green mb-2">Presenter Mode</h1>
          <p className="text-muted-foreground">Access presentation and moderator features</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Presentation className="w-5 h-5 text-primary" />
              Enter Workshop PIN
            </CardTitle>
            <CardDescription>
              The PIN was provided by the workshop organizer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter PIN"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError('');
                  }}
                  className="pl-10 text-lg font-mono tracking-widest"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={!pin || isVerifying}
                  className="flex-1"
                >
                  {isVerifying ? 'Verifying...' : 'Access Presenter Mode'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features for presenters */}
        <div className="mt-6 p-4 rounded-lg bg-card/50 border border-border">
          <h4 className="font-medium mb-2 text-sm">Presenter Features:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Full presentation slides with speaker notes
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Live leaderboard monitoring
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Show All Steps toggle for labs
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Session timer and controls
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
