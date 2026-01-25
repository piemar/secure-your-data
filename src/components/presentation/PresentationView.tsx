import { useState } from 'react';
import { SlideViewer } from './SlideViewer';
import { slides } from './slidesData';

export function PresentationView() {
  const [currentSlide, setCurrentSlide] = useState(1);

  const slide = slides.find(s => s.id === currentSlide) || slides[0];

  const handleNext = () => {
    if (currentSlide < slides.length) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleGoToSlide = (slideId: number) => {
    setCurrentSlide(slideId);
  };

  return (
    <SlideViewer
      currentSlide={currentSlide}
      totalSlides={slides.length}
      slideContent={slide.content}
      speakerNotes={slide.speakerNotes}
      slideTitle={slide.title}
      section={slide.section}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onGoToSlide={handleGoToSlide}
    />
  );
}
