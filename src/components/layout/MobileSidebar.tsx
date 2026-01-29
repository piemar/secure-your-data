import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { AppSidebar } from './AppSidebar';
import { useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const { setSection } = useNavigation();

  // Close sidebar when navigating
  const handleNavigation = (section: string) => {
    setSection(section as any);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-3 left-3 z-50 md:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <MobileSidebarContent onNavigate={handleNavigation} />
      </SheetContent>
    </Sheet>
  );
}

interface MobileSidebarContentProps {
  onNavigate: (section: string) => void;
}

function MobileSidebarContent({ onNavigate }: MobileSidebarContentProps) {
  return (
    <div className="h-full">
      <AppSidebar isMobileOverlay onMobileNavigate={onNavigate} />
    </div>
  );
}
