import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { NewPresentationView } from '@/components/presentation/NewPresentationView';
import { Lab1CSFLE } from '@/components/labs/Lab1CSFLE';
import { Lab2QueryableEncryption } from '@/components/labs/Lab2QueryableEncryption';
import { LabSetupWizard } from '@/components/labs/LabSetupWizard';
import { Leaderboard } from '@/components/labs/Leaderboard';
import { WorkshopNotStarted } from '@/components/labs/WorkshopNotStarted';
import { WorkshopSettings } from '@/components/settings/WorkshopSettings';
import { AttendeeRegistration } from '@/components/AttendeeRegistration';
import { PresenterLogin } from '@/components/PresenterLogin';
import { ChallengeModeView } from '@/components/workshop/ChallengeModeView';
import { QuestMapView } from '@/components/workshop/QuestMapView';
import { DemoScriptView } from '@/components/workshop/DemoScriptView';
import { MetricsDashboard } from '@/components/workshop/MetricsDashboard';
import { LabHubView } from '@/components/labs/LabHubView';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { LabRunner } from '@/labs/LabRunner';
import { useNavigation } from '@/contexts/NavigationContext';
import { useRole } from '@/contexts/RoleContext';
import { useLab } from '@/context/LabContext';
import { areLabsEnabled } from '@/utils/workshopUtils';
import { Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { getContentService } from '@/services/contentService';
import type { WorkshopLabDefinition } from '@/types';

function ContentRouter() {
  const { currentSection, setSection } = useNavigation();
  const { isLabAccessible, isLabCompleted } = useLab();
  const { isModerator } = useRole();
  const { currentMode, activeTemplate, currentLabId, setCurrentLabId } = useWorkshopSession();
  const location = useLocation();
  const labsEnabled = areLabsEnabled();
  const [templateLabs, setTemplateLabs] = useState<WorkshopLabDefinition[] | null>(null);
  const [templateLabsLoading, setTemplateLabsLoading] = useState(false);

  // Sync URL with navigation context
  useEffect(() => {
    if (location.pathname === '/leaderboard') {
      setSection('leaderboard');
    }
  }, [location.pathname, setSection]);

  // Load lab metadata for the active template to power the playlist view.
  useEffect(() => {
    let cancelled = false;

    const loadTemplateLabs = async () => {
      if (!activeTemplate || !activeTemplate.labIds || activeTemplate.labIds.length === 0) {
        if (!cancelled) {
          setTemplateLabs(null);
        }
        return;
      }

      setTemplateLabsLoading(true);
      try {
        const service = getContentService();
        const allLabs = await service.getLabs();
        const byId = new Map(allLabs.map((lab) => [lab.id, lab]));
        const ordered: WorkshopLabDefinition[] = activeTemplate.labIds
          .map((id) => byId.get(id))
          .filter((lab): lab is WorkshopLabDefinition => !!lab);

        if (!cancelled) {
          setTemplateLabs(ordered);
        }
      } catch (err) {
        if (!cancelled) {
          // Leave templateLabs null; the playlist will simply not render.
          setTemplateLabs(null);
        }
      } finally {
        if (!cancelled) {
          setTemplateLabsLoading(false);
        }
      }
    };

    loadTemplateLabs();

    return () => {
      cancelled = true;
    };
  }, [activeTemplate]);

  // Check if labs are enabled for attendees
  const canAccessLabs = isModerator || labsEnabled;

  switch (currentSection) {
    case 'presentation':
      // Only moderators see presentation
      if (!isModerator) {
        return <LabSetupWizard />;
      }
      return <NewPresentationView />;
    case 'setup':
      return <LabSetupWizard />;
    case 'settings':
      // Only moderators can access settings
      if (!isModerator) {
        return <LabSetupWizard />;
      }
      return <WorkshopSettings />;
    case 'metrics':
      // Only moderators can access metrics
      if (!isModerator) {
        return <LabSetupWizard />;
      }
      return <MetricsDashboard />;
    case 'leaderboard':
      // Leaderboard is now open to everyone
      return <Leaderboard />;
    case 'lab': {
      // Show Demo Script View when in Demo Mode
      if (currentMode === 'demo') {
        return <DemoScriptView />;
      }
      
      // Show Lab Hub when no lab is selected (Lab Mode navigation)
      if (!currentLabId) {
        // In Lab Mode, show the Lab Hub for topic-based navigation
        if (currentMode === 'lab') {
          return <LabHubView />;
        }
        // In other modes, show alert
        return (
          <div className="flex items-center justify-center h-full p-8">
            <Alert className="max-w-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Lab Selected</AlertTitle>
              <AlertDescription className="mt-2">
                Select a lab from the Labs menu or choose a workshop template in the settings.
              </AlertDescription>
            </Alert>
          </div>
        );
      }
      
      // Template-driven, content-based labs rendered via LabRunner / rich wrappers
      // Allow moderators to test labs individually without a template
      if (!activeTemplate || !activeTemplate.labIds) {
        // If moderator and has a currentLabId, allow testing individual labs
        if (isModerator && currentLabId) {
          let labContent: JSX.Element;
          if (currentLabId === 'lab-csfle-fundamentals') {
            labContent = <Lab1CSFLE />;
          } else if (currentLabId === 'lab-queryable-encryption') {
            labContent = <Lab2QueryableEncryption />;
          } else if (currentLabId === 'lab-right-to-erasure') {
            labContent = <LabRunner labNumber={3} labId="lab-right-to-erasure" />;
          } else {
            labContent = <LabRunner labNumber={1} labId={currentLabId} />;
          }
          return labContent;
        }
        
        return (
          <div className="flex items-center justify-center h-full p-8">
            <Alert className="max-w-2xl">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Template Selected</AlertTitle>
              <AlertDescription className="mt-2">
                {isModerator 
                  ? 'Select a workshop template in the settings, or use the lab browser to test individual labs.'
                  : 'Please select a workshop template in the settings.'}
              </AlertDescription>
            </Alert>
          </div>
        );
      }
      // Check if workshop is started for attendees
      if (!canAccessLabs) {
        return <WorkshopNotStarted />;
      }

      // Decide which component renders the current lab.
      let labContent: JSX.Element;
      if (currentLabId === 'lab-csfle-fundamentals') {
        labContent = <Lab1CSFLE />;
      } else if (currentLabId === 'lab-queryable-encryption') {
        labContent = <Lab2QueryableEncryption />;
      } else if (currentLabId === 'lab-right-to-erasure') {
        const r2eIndex = templateLabs?.findIndex(l => l.id === 'lab-right-to-erasure');
        labContent = <LabRunner labNumber={r2eIndex >= 0 ? r2eIndex + 1 : 3} labId="lab-right-to-erasure" />;
      } else {
        const index = activeTemplate.labIds.indexOf(currentLabId);
        const labNumber = index >= 0 ? index + 1 : 1;
        labContent = <LabRunner labNumber={labNumber} labId={currentLabId} />;
      }

      // Check if currentLabId is part of the active template
      // If not, we're testing an individual lab and shouldn't show template navigation
      const isCurrentLabInTemplate = activeTemplate?.labIds?.includes(currentLabId) ?? false;
      const shouldShowTemplateNav = templateLabs && templateLabs.length > 1 && isCurrentLabInTemplate;

      return (
        <div className="flex flex-col h-full">
          {/* Playlist header for labs in the active template */}
          {/* Only show if current lab is part of the template (not testing individual labs) */}
          {shouldShowTemplateNav ? (
            <div className="border-b border-border bg-card/20 px-2 py-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/80 flex-shrink-0">Labs</span>
              {templateLabs.map((lab, index) => {
                const isActiveLab = lab.id === currentLabId;
                return (
                  <button
                    key={lab.id}
                    type="button"
                    onClick={() => setCurrentLabId(lab.id)}
                    className={
                      'text-[9px] rounded-full px-1.5 py-0.5 border transition max-w-[120px] sm:max-w-[180px] truncate ' +
                      (isActiveLab
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background/40 text-muted-foreground hover:bg-muted hover:text-foreground')
                    }
                  >
                    <span className="font-mono mr-0.5">{index + 1}.</span>
                    <span className="align-middle truncate">{lab.title}</span>
                  </button>
                );
              })}
            </div>
          ) : currentLabId && !isCurrentLabInTemplate ? (
            // Show indicator when testing individual lab outside template
            <div className="border-b border-border bg-muted/30 px-6 py-2">
              <div className="text-xs font-medium text-muted-foreground">
                Testing individual lab (not part of active template)
              </div>
            </div>
          ) : null}
          <div className="flex-1 min-h-0">{labContent}</div>
        </div>
      );
    }
    case 'lab1':
      // Check if workshop is started for attendees
      if (!canAccessLabs) {
        return <WorkshopNotStarted />;
      }
      return <Lab1CSFLE />;
    case 'lab2':
      // Check if workshop is started for attendees
      if (!canAccessLabs) {
        return <WorkshopNotStarted />;
      }
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
      // Check if workshop is started for attendees
      if (!canAccessLabs) {
        return <WorkshopNotStarted />;
      }
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
      return <LabRunner labNumber={3} labId="lab-right-to-erasure" />;
    case 'challenge':
      // Challenge mode - show Quest Map view if template supports it
      if (currentMode === 'challenge' && activeTemplate?.questIds && activeTemplate.questIds.length > 0) {
        // Check if a quest is selected (from QuestMapView click or direct navigation)
        const selectedQuestId = localStorage.getItem('selected_quest_id');
        if (selectedQuestId) {
          // Show ChallengeModeView with selected quest
          return <ChallengeModeView templateId={activeTemplate.id} />;
        }
        // Show Quest Map as the main Challenge Mode view
        return <QuestMapView />;
      }
      // Fallback: show message if challenge mode not available
      return (
        <div className="flex items-center justify-center h-full p-8">
          <Alert className="max-w-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Challenge Mode Not Available</AlertTitle>
            <AlertDescription className="mt-2">
              {activeTemplate 
                ? 'The selected template does not include quests. Please select a challenge template in Workshop Settings.'
                : 'No template selected. Please select a challenge template in Workshop Settings.'}
            </AlertDescription>
          </Alert>
        </div>
      );
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
