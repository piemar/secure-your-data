import { useState, useEffect } from 'react';
import { useLab } from '@/context/LabContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Rocket } from 'lucide-react';

interface AttendeeRegistrationProps {
  onComplete: () => void;
}

export function AttendeeRegistration({ onComplete }: AttendeeRegistrationProps) {
  const { setUserEmail, userEmail } = useLab();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
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
    
    // Store attendee info - use provided email or generate from name
    const userEmailValue = email.trim() || displayName.trim().toLowerCase().replace(/\s+/g, '.') + '@workshop.local';
    localStorage.setItem('workshop_attendee_name', displayName.trim());
    setUserEmail(userEmailValue);
    
    // Small delay for UX
    await new Promise(r => setTimeout(r, 300));
    setIsSubmitting(false);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="rounded-2xl border border-border bg-card p-8">
          {/* Rocket Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
              <Rocket className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">Join the Workshop</h1>
            <p className="text-muted-foreground text-sm">
              Enter your details to participate in exercises and compete on the leaderboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="h-12 bg-background border-primary/50 focus:border-primary"
                autoFocus
              />
            </div>

            {/* Email (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background border-border"
              />
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!displayName.trim() || isSubmitting}
              className="w-full h-12 text-base font-semibold gap-2 bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isSubmitting ? (
                'Joining...'
              ) : (
                <>
                  Join Workshop
                  <Rocket className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Presenter link - discreet */}
        <div className="mt-6 text-center">
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
