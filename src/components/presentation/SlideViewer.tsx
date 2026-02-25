import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SessionTimer } from '@/components/ui/session-timer';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { RevealStepContext } from './RevealStep';

interface SlideViewerProps {
  currentSlide: number;
  totalSlides: number;
  slideContent: ReactNode;
  speakerNotes: string;
  slideTitle: string;
  section: string;
  stepIndex?: number;
  stepCount?: number;
  onNext: () => void;
  onPrevious: () => void;
  onGoToSlide: (slide: number) => void;
}

export function SlideViewer({
  currentSlide,
  totalSlides,
  slideContent,
  speakerNotes,
  slideTitle,
  section,
  stepIndex = 0,
  stepCount = 0,
  onNext,
  onPrevious,
}: SlideViewerProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useKeyboardNavigation({
    onNext,
    onPrevious,
    onToggleNotes: () => setShowNotes(prev => !prev),
    onToggleFullscreen: toggleFullscreen,
    onEscape: () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    },
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/50">
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {section}
          </span>
          <span className="text-sm font-medium">{slideTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <SessionTimer targetMinutes={45} compact />
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {stepCount > 0 && (
              <span className="font-mono text-primary">
                Step {stepIndex + 1}/{stepCount}
              </span>
            )}
            <span className="font-mono">{currentSlide}</span>
            <span>/</span>
            <span className="font-mono">{totalSlides}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowNotes(prev => !prev)}
            className={cn('h-8 w-8', showNotes && 'bg-primary/10 text-primary')}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Content */}
        <div className={cn(
          'flex-1 flex flex-col slide-container transition-all duration-300',
          showNotes ? 'w-2/3' : 'w-full'
        )}>
          <div className="flex-1 overflow-y-auto p-8">
            {stepCount > 0 ? (
              <RevealStepContext.Provider value={{ stepIndex }}>
                {slideContent}
              </RevealStepContext.Provider>
            ) : (
              slideContent
            )}
          </div>

          {/* Navigation Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-card/30">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={currentSlide === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {/* Slide Progress Dots */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalSlides, 25) }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-200',
                    i + 1 === currentSlide
                      ? 'bg-primary w-4'
                      : i + 1 < currentSlide
                        ? 'bg-primary/40'
                        : 'bg-muted'
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              onClick={onNext}
              disabled={currentSlide === totalSlides}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Speaker Notes Panel */}
        {showNotes && (
          <div className="w-1/3 border-l border-border bg-card/50 flex flex-col">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Speaker Notes</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {speakerNotes}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
