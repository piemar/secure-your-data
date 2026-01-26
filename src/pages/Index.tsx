import { MainLayout } from '@/components/layout/MainLayout';
import { NewPresentationView } from '@/components/presentation/NewPresentationView';
import { Lab1CSFLE } from '@/components/labs/Lab1CSFLE';
import { Lab2QueryableEncryption } from '@/components/labs/Lab2QueryableEncryption';
import { Lab3RightToErasure } from '@/components/labs/Lab3RightToErasure';
import { LabSetupWizard } from '@/components/labs/LabSetupWizard';
import { Leaderboard } from '@/components/labs/Leaderboard';
import { RoleSelection } from '@/components/RoleSelection';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { useLab } from '@/context/LabContext';
import { Lock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
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
      // Only moderators see leaderboard
      if (!isModerator) {
        return <LabSetupWizard />;
      }
      return <Leaderboard />;
    case 'lab1':
      return <Lab1CSFLE />;
    case 'lab2':
      if (!isLabAccessible(2)) {
        return (
          <MainLayout>
            <div className="flex items-center justify-center h-full p-8">
              <Alert className="max-w-2xl">
                <Lock className="h-4 w-4" />
                <AlertTitle>Lab 2 Locked</AlertTitle>
                <AlertDescription className="mt-2">
                  You must complete Lab 1 before accessing Lab 2. Please finish all steps in Lab 1: CSFLE Fundamentals first.
                  {isLabCompleted(1) ? (
                    <p className="mt-2 text-sm text-muted-foreground">Note: Make sure you've verified all steps in Lab 1.</p>
                  ) : (
                    <Button className="mt-4" onClick={() => window.location.hash = '#lab1'}>
                      Go to Lab 1
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </MainLayout>
        );
      }
      return <Lab2QueryableEncryption />;
    case 'lab3':
      if (!isLabAccessible(3)) {
        return (
          <MainLayout>
            <div className="flex items-center justify-center h-full p-8">
              <Alert className="max-w-2xl">
                <Lock className="h-4 w-4" />
                <AlertTitle>Lab 3 Locked</AlertTitle>
                <AlertDescription className="mt-2">
                  You must complete Lab 1 before accessing Lab 3. Please finish all steps in Lab 1: CSFLE Fundamentals first.
                  {isLabCompleted(1) ? (
                    <p className="mt-2 text-sm text-muted-foreground">Note: Make sure you've verified all steps in Lab 1.</p>
                  ) : (
                    <Button className="mt-4" onClick={() => window.location.hash = '#lab1'}>
                      Go to Lab 1
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </MainLayout>
        );
      }
      return <Lab3RightToErasure />;
    default:
      // Default to setup for attendees, presentation for moderators
      if (!isModerator) {
        return <LabSetupWizard />;
      }
      return <NewPresentationView />;
  }
}

const Index = () => {
  const { role } = useRole();

  // Show role selection if no role is selected
  if (!role) {
    return <RoleSelection />;
  }

  return (
    <MainLayout>
      <ContentRouter />
    </MainLayout>
  );
};

export default Index;
