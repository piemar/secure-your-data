import { MainLayout } from '@/components/layout/MainLayout';
import { NewPresentationView } from '@/components/presentation/NewPresentationView';
import { useNavigation } from '@/contexts/NavigationContext';

function ContentRouter() {
  const { currentSection } = useNavigation();

  switch (currentSection) {
    case 'presentation':
      return <NewPresentationView />;
    case 'lab1':
    case 'lab2':
    case 'lab3':
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Lab {currentSection.replace('lab', '')} Coming Soon</h2>
            <p className="text-muted-foreground">Step-by-step hands-on lab guides will be available here.</p>
          </div>
        </div>
      );
    case 'cheatsheet':
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">SA Cheat Sheet Coming Soon</h2>
            <p className="text-muted-foreground">Quick reference guides and flowcharts will be available here.</p>
          </div>
        </div>
      );
    default:
      return <NewPresentationView />;
  }
}

const Index = () => {
  return (
    <MainLayout>
      <ContentRouter />
    </MainLayout>
  );
};

export default Index;
