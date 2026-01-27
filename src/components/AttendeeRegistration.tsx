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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !email.includes('@')) return;

    setIsSubmitting(true);
    
    // Store attendee info - combine first and last name for display
    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    localStorage.setItem('workshop_attendee_name', fullName);
    setUserEmail(email.trim());
    
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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Pierre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="h-12 bg-background border-primary/50 focus:border-primary"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Petersson"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="h-12 bg-background border-primary/50 focus:border-primary"
                />
              </div>
            </div>

            {/* Email (Required) */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-background border-primary/50 focus:border-primary"
                required
              />
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !email.includes('@') || isSubmitting}
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
