import React from 'react';
import { Lock, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';

export const WorkshopNotStarted: React.FC = () => {
  const { setSection } = useNavigation();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <Card className="max-w-lg text-center border-primary/20 bg-primary/5">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Workshop Not Yet Started</CardTitle>
          <CardDescription className="text-base mt-2">
            The workshop moderator has not enabled the labs yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Please wait for the presentation to begin</span>
          </div>
          
          <div className="p-4 bg-background rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              In the meantime, you can review the <strong>Lab Setup</strong> requirements 
              to ensure your environment is ready.
            </p>
          </div>

          <Button 
            onClick={() => setSection('setup')} 
            className="gap-2"
          >
            Go to Lab Setup
            <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
