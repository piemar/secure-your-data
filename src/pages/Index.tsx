import { MainLayout } from '@/components/layout/MainLayout';
import { NewPresentationView } from '@/components/presentation/NewPresentationView';
import { Lab1CSFLE } from '@/components/labs/Lab1CSFLE';
import { Lab2QueryableEncryption } from '@/components/labs/Lab2QueryableEncryption';
import { Lab3RightToErasure } from '@/components/labs/Lab3RightToErasure';
import { useNavigation } from '@/contexts/NavigationContext';

function ContentRouter() {
  const { currentSection } = useNavigation();

  switch (currentSection) {
    case 'presentation':
      return <NewPresentationView />;
    case 'lab1':
      return <Lab1CSFLE />;
    case 'lab2':
      return <Lab2QueryableEncryption />;
    case 'lab3':
      return <Lab3RightToErasure />;
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
