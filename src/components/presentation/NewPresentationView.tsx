import { useState, useCallback } from 'react';
import { pptxSlides, sections } from './slidesPPTXData';
import { SlideViewer } from './SlideViewer';
import { Button } from '@/components/ui/button';
import { Download, List, ChevronDown, FileDown } from 'lucide-react';
import { exportToPPTX } from '@/utils/exportToPPTX';
import { generateBrandedTemplate } from '@/utils/generateTemplate';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function NewPresentationView() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  const totalSlides = pptxSlides.length;
  const slide = pptxSlides[currentSlide - 1];

  const handleNext = useCallback(() => {
    if (currentSlide < totalSlides) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, totalSlides]);

  const handlePrevious = useCallback(() => {
    if (currentSlide > 1) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

  const handleGoToSlide = useCallback((slideNumber: number) => {
    setCurrentSlide(slideNumber);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPPTX(pptxSlides, 'MongoDB-CSFLE-QE-SA-Enablement');
      toast.success('Presentation exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export presentation');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateTemplate = async () => {
    setIsGeneratingTemplate(true);
    try {
      await generateBrandedTemplate('MongoDB-Branded-Template');
      toast.success('Branded template generated successfully!');
    } catch (error) {
      console.error('Template generation failed:', error);
      toast.error('Failed to generate template');
    } finally {
      setIsGeneratingTemplate(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-gradient-green">SA Enablement: CSFLE & QE</h1>
          
          {/* Slide navigation dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <List className="w-4 h-4" />
                Slide {currentSlide} of {totalSlides}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-[400px] overflow-y-auto w-72">
              {sections.map((section) => (
                <div key={section.number}>
                  <DropdownMenuLabel className="text-primary text-xs">
                    {String(section.number).padStart(2, '0')} {section.title}
                  </DropdownMenuLabel>
                  {pptxSlides
                    .filter((s) => section.slides.includes(s.id))
                    .map((s) => (
                      <DropdownMenuItem
                        key={s.id}
                        onClick={() => handleGoToSlide(s.id)}
                        className={cn(
                          'cursor-pointer',
                          currentSlide === s.id && 'bg-primary/10 text-primary'
                        )}
                      >
                        <span className="w-6 text-muted-foreground text-xs">{s.id}</span>
                        <span className="truncate">{s.title}</span>
                      </DropdownMenuItem>
                    ))}
                  <DropdownMenuSeparator />
                </div>
              ))}
              {/* Title and Agenda slides */}
              <DropdownMenuLabel className="text-primary text-xs">Intro</DropdownMenuLabel>
              {pptxSlides
                .filter((s) => s.sectionNumber === 0)
                .map((s) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => handleGoToSlide(s.id)}
                    className={cn(
                      'cursor-pointer',
                      currentSlide === s.id && 'bg-primary/10 text-primary'
                    )}
                  >
                    <span className="w-6 text-muted-foreground text-xs">{s.id}</span>
                    <span className="truncate">{s.title}</span>
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          {/* Generate Template Button */}
          <Button
            onClick={handleGenerateTemplate}
            disabled={isGeneratingTemplate}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <FileDown className="w-4 h-4" />
            {isGeneratingTemplate ? 'Generating...' : 'Download Template'}
          </Button>

          {/* Export Presentation Button */}
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
            variant="outline"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export to PowerPoint'}
          </Button>
        </div>
      </div>

      {/* Slide viewer */}
      <div className="flex-1">
        <SlideViewer
          currentSlide={currentSlide}
          totalSlides={totalSlides}
          slideContent={slide.content}
          speakerNotes={slide.speakerNotes}
          slideTitle={slide.title}
          section={slide.section}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onGoToSlide={handleGoToSlide}
        />
      </div>
    </div>
  );
}
