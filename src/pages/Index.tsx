import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewPresentationView } from '@/components/presentation/NewPresentationView';
import { Lab1CSFLE } from '@/components/labs/Lab1CSFLE';
import { Lab2QueryableEncryption } from '@/components/labs/Lab2QueryableEncryption';
import { Lab3RightToErasure } from '@/components/labs/Lab3RightToErasure';
import { LabSetupWizard } from '@/components/labs/LabSetupWizard';
import { Leaderboard } from '@/components/labs/Leaderboard';
import { AttendeeRegistration } from '@/components/AttendeeRegistration';
import { PresenterLogin } from '@/components/PresenterLogin';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { useLab } from '@/context/LabContext';
import { Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

function ContentRouter() {
  const { currentSection, setSection } = useNavigation();
  const { isLabAccessible, isLabCompleted } = useLab();
  const { isModerator } = useRole();
  const location = useLocation();

  // Sync URL with navigation context
  useEffect(() => {
    if (location.pathname === '/leaderboard') {
      setSection('leaderboard');
    }
  }, [location.pathname, setSection]);

  switch (currentSection) {
    case 'presentation':
      // Only moderators see presentation
      if (!isModerator) {
        return <LabSetupWizard />;
      }
      return <NewPresentationView />;
    case 'setup':
      return <LabSetupWizard />;
    case 'leaderboard':
      // Leaderboard is now open to everyone
      return <Leaderboard />;
    case 'lab1':
      return <Lab1CSFLE />;
    case 'lab2':
      // Moderators have access to all labs, attendees need to complete Lab 1 first
      if (!isModerator && !isLabAccessible(2)) {
        return (
          <div className="flex items-center justify-center h-full p-8">
            <Alert className="max-w-2xl">
              <Lock className="h-4 w-4" />
              <AlertTitle>Lab 2 Locked</AlertTitle>
              <AlertDescription className="mt-2">
                You must complete Lab 1 before accessing Lab 2. Please finish all steps in Lab 1: CSFLE Fundamentals first.
                {isLabCompleted(1) ? (
                  <p className="mt-2 text-sm text-muted-foreground">Note: Make sure you've verified all steps in Lab 1.</p>
                ) : (
                  <Button className="mt-4" onClick={() => setSection('lab1')}>
                    Go to Lab 1
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        );
      }
      return <Lab2QueryableEncryption />;
    case 'lab3':
      // Moderators have access to all labs, attendees need to complete Lab 1 first
      if (!isModerator && !isLabAccessible(3)) {
        return (
          <div className="flex items-center justify-center h-full p-8">
            <Alert className="max-w-2xl">
              <Lock className="h-4 w-4" />
              <AlertTitle>Lab 3 Locked</AlertTitle>
              <AlertDescription className="mt-2">
                You must complete Lab 1 before accessing Lab 3. Please finish all steps in Lab 1: CSFLE Fundamentals first.
                {isLabCompleted(1) ? (
                  <p className="mt-2 text-sm text-muted-foreground">Note: Make sure you've verified all steps in Lab 1.</p>
                ) : (
                  <Button className="mt-4" onClick={() => setSection('lab1')}>
                    Go to Lab 1
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          </div>
        );
      }
      return <Lab3RightToErasure />;
    default:
      // Default to setup for everyone
      return <LabSetupWizard />;
  }
}

const Index = () => {
  const { role, setRole, logout } = useRole();
  const { userEmail, resetProgress } = useLab();
  const [showPresenterLogin, setShowPresenterLogin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Check if user is already registered
  useEffect(() => {
    const savedName = localStorage.getItem('workshop_attendee_name');
    const showPresenter = localStorage.getItem('show_presenter_login');
    
    if (showPresenter) {
      setShowPresenterLogin(true);
    } else if (savedName && userEmail) {
      setIsRegistered(true);
      // Auto-set attendee role if not already set
      if (!role) {
        setRole('attendee');
      }
    }
  }, [userEmail, role, setRole]);

  // Handle logout - clear session and show registration
  const handleLogout = () => {
    logout();
    localStorage.removeItem('workshop_attendee_name');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('completedLabs');
    localStorage.removeItem('labStartTimes');
    setIsRegistered(false);
  };

  // Show presenter login if requested
  if (showPresenterLogin && !role) {
    return (
      <PresenterLogin
        onBack={() => {
          setShowPresenterLogin(false);
          localStorage.removeItem('show_presenter_login');
        }}
        onSuccess={() => setShowPresenterLogin(false)}
      />
    );
  }

  // If moderator is logged in, show full app
  if (role === 'moderator') {
    return (
      <MainLayout>
        <ContentRouter />
      </MainLayout>
    );
  }

  // Show registration if not registered
  if (!isRegistered && !role) {
    return (
      <AttendeeRegistration 
        onComplete={() => {
          setIsRegistered(true);
          setRole('attendee');
        }} 
      />
    );
  }

  // Normal attendee flow
  return (
    <MainLayout>
      <ContentRouter />
    </MainLayout>
  );
};

export default Index;
