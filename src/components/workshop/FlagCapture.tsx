import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flag, CheckCircle2, XCircle, Loader2, Sparkles } from 'lucide-react';
import { WorkshopFlag } from '@/types';
import { getVerificationService } from '@/services/verificationService';
import { useLab } from '@/context/LabContext';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { createGamificationService } from '@/services/gamificationService';
import { getMetricsService } from '@/services/metricsService';
import { getWorkshopSession } from '@/utils/workshopUtils';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FlagCaptureProps {
  flag: WorkshopFlag;
  onCapture?: (flagId: string) => void;
  isCaptured?: boolean;
}

export const FlagCapture: React.FC<FlagCaptureProps> = ({
  flag,
  onCapture,
  isCaptured = false
}) => {
  const { mongoUri, userEmail } = useLab();
  const { activeTemplate } = useWorkshopSession();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const gamificationService = React.useMemo(() => {
    const config = activeTemplate?.gamification || { enabled: true, basePointsPerStep: 10 };
    return createGamificationService(config);
  }, [activeTemplate]);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const verificationService = getVerificationService();
      const result = await verificationService.verify(
        flag.verificationId as any,
        { mongoUri }
      );

      setVerificationResult({
        success: result.success,
        message: result.message
      });

      if (result.success) {
        const session = getWorkshopSession();
        
        // Record metrics
        const metricsService = getMetricsService();
        metricsService.recordEvent({
          type: 'flag_captured',
          participantId: userEmail,
          flagId: flag.id,
          metadata: {
            workshopId: session?.id
          }
        });
        
        // Record flag capture event
        if (userEmail && gamificationService.isEnabled()) {
          await gamificationService.recordEvent({
            type: 'flag_captured',
            participantId: userEmail,
            flagId: flag.id,
            timestamp: new Date()
          });
        }

        toast.success(`Flag captured: ${flag.name}!`, {
          description: `+${flag.points || 0} points`,
          icon: <Flag className="w-5 h-5 text-yellow-500" />
        });
        onCapture?.(flag.id);
      } else {
        // Record verification failure
        const session = getWorkshopSession();
        const metricsService = getMetricsService();
        metricsService.recordEvent({
          type: 'verification_failed',
          participantId: userEmail,
          verificationId: flag.verificationId,
          errorMessage: result.message,
          metadata: {
            workshopId: session?.id,
            flagId: flag.id
          }
        });
        
        toast.error('Flag verification failed', {
          description: result.message
        });
      }
    } catch (error: any) {
      setVerificationResult({
        success: false,
        message: error.message || 'Verification failed'
      });
      toast.error('Verification error', {
        description: error.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (isCaptured) {
    return (
      <Card className="border-green-500/50 bg-green-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              {flag.name}
            </CardTitle>
            <Badge variant="default" className="bg-green-500">
              Captured
            </Badge>
          </div>
          {flag.description && (
            <CardDescription>{flag.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Sparkles className="w-4 h-4" />
            <span>You've captured this flag! +{flag.points || 0} points</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "transition-all",
      verificationResult?.success && "border-green-500/50 bg-green-500/5"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Flag className={cn(
              "w-5 h-5",
              flag.visibility === 'hidden' ? "text-muted-foreground" : "text-yellow-500"
            )} />
            {flag.name}
            {flag.visibility === 'hidden' && (
              <Badge variant="outline" className="ml-2 text-xs">
                Hidden
              </Badge>
            )}
          </CardTitle>
          {flag.points && (
            <Badge variant="secondary">
              +{flag.points} pts
            </Badge>
          )}
        </div>
        {flag.description && (
          <CardDescription>{flag.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {verificationResult && (
          <Alert variant={verificationResult.success ? "default" : "destructive"}>
            {verificationResult.success ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {verificationResult.message}
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleVerify}
          disabled={isVerifying || !mongoUri}
          className="w-full"
          variant={verificationResult?.success ? "default" : "outline"}
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : verificationResult?.success ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Flag Captured!
            </>
          ) : (
            <>
              <Flag className="w-4 h-4 mr-2" />
              Capture Flag
            </>
          )}
        </Button>

        {!mongoUri && (
          <p className="text-xs text-muted-foreground text-center">
            Configure MongoDB connection in Lab Setup to verify flags
          </p>
        )}
      </CardContent>
    </Card>
  );
};
