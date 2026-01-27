import { useState, useEffect } from 'react';
import { useLab } from '@/context/LabContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, ArrowRight, Sparkles } from 'lucide-react';

interface AttendeeRegistrationProps {
  onComplete: () => void;
}

export function AttendeeRegistration({ onComplete }: AttendeeRegistrationProps) {
  const { setUserEmail, userEmail } = useLab();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if already registered
  useEffect(() => {
    const savedName = localStorage.getItem('workshop_attendee_name');
    if (savedName && userEmail) {
      onComplete();
    }
  }, [userEmail, onComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsSubmitting(true);
    
    // Store attendee info
    const email = displayName.trim().toLowerCase().replace(/\s+/g, '.') + '@workshop.local';
    localStorage.setItem('workshop_attendee_name', displayName.trim());
    setUserEmail(email);
    
    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-2xl mx-auto mb-4">
            M
          </div>
          <h1 className="text-3xl font-bold text-gradient-green mb-2">MongoDB Encryption Workshop</h1>
          <p className="text-muted-foreground">CSFLE & Queryable Encryption Hands-On Labs</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Join Workshop
            </CardTitle>
            <CardDescription>
              Enter your name to start the hands-on labs and track your progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Your name (e.g., John Smith)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="text-lg"
                  autoFocus
                />
              </div>
              
              <Button
                type="submit"
                disabled={!displayName.trim() || isSubmitting}
                className="w-full gap-2"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Start Learning
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-lg bg-card/50 border border-border">
            <div className="text-2xl mb-1">🔐</div>
            <p className="text-xs text-muted-foreground">Client-Side Field-Level Encryption</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-border">
            <div className="text-2xl mb-1">🔍</div>
            <p className="text-xs text-muted-foreground">Queryable Encryption</p>
          </div>
          <div className="p-3 rounded-lg bg-card/50 border border-border">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-xs text-muted-foreground">Live Leaderboard</p>
          </div>
        </div>

        {/* Presenter link - discreet */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              localStorage.setItem('show_presenter_login', 'true');
              window.location.reload();
            }}
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Workshop Presenter? Click here
          </button>
        </div>
      </div>
    </div>
  );
}
