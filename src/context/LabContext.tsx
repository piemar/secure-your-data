import React, { createContext, useContext, useState, useEffect } from 'react';
import { addPoints, completeLab as updateLeaderboardLab, startLab as updateLeaderboardStart } from '@/utils/leaderboardUtils';
import { createGamificationService, GamificationEvent } from '@/services/gamificationService';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useWorkshopConfig } from '@/context/WorkshopConfigContext';
import { getWorkshopSession } from '@/utils/workshopUtils';
import { getMetricsService } from '@/services/metricsService';

interface LabState {
    mongoUri: string;
    awsAccessKeyId: string;
    awsSecretAccessKey: string;
    awsKeyArn: string;
    awsRegion: string;
    currentScore: number;
    completedSteps: string[];
    assistedSteps: string[];
    verifiedTools: Record<string, { verified: boolean; path: string }>;
    userSuffix: string;
    userEmail: string;
    completedLabs: number[]; // Track which labs are completed
    labStartTimes: Record<number, number>; // Track when each lab was started
}

interface LabContextType extends LabState {
    setMongoUri: (uri: string) => void;
    setAwsCredentials: (creds: { accessKeyId: string; secretAccessKey: string; keyArn: string; region: string }) => void;
    setAwsKeyArn: (arn: string) => void;
    completeStep: (stepId: string, assisted: boolean) => void;
    setVerifiedTool: (tool: string, verified: boolean, path: string) => void;
    setUserSuffix: (suffix: string) => void;
    setUserEmail: (email: string) => void;
    completeLab: (labNumber: number) => void;
    startLab: (labNumber: number) => void;
    isLabCompleted: (labNumber: number) => boolean;
    isLabAccessible: (labNumber: number) => boolean;
    resetProgress: () => void;
}

const LabContext = createContext<LabContextType | undefined>(undefined);

export const LabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { activeTemplate } = useWorkshopSession();
    const gamificationService = React.useMemo(() => {
        const config = activeTemplate?.gamification || { enabled: true, basePointsPerStep: 10 };
        return createGamificationService(config);
    }, [activeTemplate]);

    const [mongoUri, setMongoUri] = useState('');
    const [awsCreds, setAwsCreds] = useState({
        awsAccessKeyId: '',
        awsSecretAccessKey: '',
        awsKeyArn: '',
        awsRegion: 'eu-central-1',
    });
    const [currentScore, setCurrentScore] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [assistedSteps, setAssistedSteps] = useState<string[]>([]);
    const [verifiedTools, setVerifiedTools] = useState<Record<string, { verified: boolean; path: string }>>({
        awsCli: { verified: false, path: '' },
        mongosh: { verified: false, path: '' },
        atlas: { verified: false, path: '' },
        node: { verified: false, path: '' },
        npm: { verified: false, path: '' },
        mongodb: { verified: false, path: '' },
        mongodbClientEncryption: { verified: false, path: '' },
        awsSdkCredentialProviders: { verified: false, path: '' },
        libmongocrypt: { verified: false, path: '' },
        mongoCryptShared: { verified: false, path: '' }
    });
    const [userSuffix, setUserSuffixState] = useState('');
    const [userEmail, setUserEmailState] = useState('');
    const [completedLabs, setCompletedLabs] = useState<number[]>(() => {
        const saved = localStorage.getItem('completedLabs');
        return saved ? JSON.parse(saved) : [];
    });
    const [labStartTimes, setLabStartTimes] = useState<Record<number, number>>(() => {
        const saved = localStorage.getItem('labStartTimes');
        return saved ? JSON.parse(saved) : {};
    });

    // Load email and lab suffix (firstname-lastname for KMS alias) from localStorage on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            setUserEmailState(savedEmail);
        }
        const savedSuffix = localStorage.getItem('lab_user_suffix');
        if (savedSuffix) {
            setUserSuffixState(savedSuffix);
            setVerifiedTools(prev => ({ ...prev, suffix: { verified: true, path: savedSuffix } }));
        }
    }, []);

    const { runningInContainer } = useWorkshopConfig();

    // Initialize MongoDB URI from workshop session if available
    useEffect(() => {
        const session = getWorkshopSession();
        if (session && !mongoUri) {
            if (session.mongodbSource === 'local') {
                const localUri = runningInContainer ? 'mongodb://mongo:27017' : 'mongodb://127.0.0.1:27017';
                setMongoUri(localUri);
            } else if (session.mongodbSource === 'atlas' && session.atlasConnectionString) {
                setMongoUri(session.atlasConnectionString);
            }
        }
    }, [mongoUri, runningInContainer]);

    const resetProgress = () => {
        setMongoUri('');
        setAwsCreds({ awsAccessKeyId: '', awsSecretAccessKey: '', awsKeyArn: '', awsRegion: 'eu-central-1' });
        setCurrentScore(0);
        setCompletedSteps([]);
        setAssistedSteps([]);
        setVerifiedTools({
            awsCli: { verified: false, path: '' },
            mongosh: { verified: false, path: '' },
            atlas: { verified: false, path: '' },
            node: { verified: false, path: '' },
            npm: { verified: false, path: '' },
            mongodb: { verified: false, path: '' },
            mongodbClientEncryption: { verified: false, path: '' },
            awsSdkCredentialProviders: { verified: false, path: '' },
            libmongocrypt: { verified: false, path: '' },
            mongoCryptShared: { verified: false, path: '' }
        });
        setUserSuffixState('');
        if (typeof localStorage !== 'undefined') localStorage.removeItem('lab_user_suffix');
        // Don't reset email - keep it persistent
    };

    const setAwsCredentials = (creds: { accessKeyId: string; secretAccessKey: string; keyArn: string; region: string }) => {
        setAwsCreds({
            awsAccessKeyId: creds.accessKeyId,
            awsSecretAccessKey: creds.secretAccessKey,
            awsKeyArn: creds.keyArn,
            awsRegion: creds.region
        });
    };

    const setAwsKeyArn = (arn: string) => {
        setAwsCreds(prev => ({ ...prev, awsKeyArn: arn }));
    };

    const completeStep = async (stepId: string, assisted: boolean) => {
        if (completedSteps.includes(stepId)) return;

        setCompletedSteps(prev => [...prev, stepId]);
        
        const email = userEmail || localStorage.getItem('userEmail') || '';
        const session = getWorkshopSession();
        
        // Record metrics
        const metricsService = getMetricsService();
        metricsService.recordEvent({
            type: 'step_completed',
            participantId: email,
            stepId,
            metadata: {
                workshopId: session?.id,
                assisted
            }
        });
        
        // Use GamificationService if enabled
        if (gamificationService.isEnabled() && email) {
            const labMatch = stepId.match(/lab-?(\d+)/i) || stepId.match(/lab(\d+)/i);
            const labId = labMatch ? `lab-${labMatch[1]}` : 'lab-unknown';
            
            const event: GamificationEvent = {
                type: 'step_completed',
                participantId: email,
                labId,
                stepId,
                assisted,
                timestamp: new Date(),
            };
            
            const points = await gamificationService.recordEvent(event);
            setCurrentScore(prev => prev + points);
            
            if (assisted) {
                setAssistedSteps(prev => [...prev, stepId]);
            }
        } else {
            // Fallback to old system
            const points = assisted ? 5 : 10;
            if (assisted) {
                setAssistedSteps(prev => [...prev, stepId]);
                setCurrentScore(prev => prev + points);
            } else {
                setCurrentScore(prev => prev + points);
            }
            
            if (email) {
                const labMatch = stepId.match(/lab(\d+)/i);
                const labNumber = labMatch ? parseInt(labMatch[1]) : 1;
                addPoints(email, points, labNumber);
            }
        }
    };

    const setVerifiedTool = (tool: string, verified: boolean, path: string) => {
        if (tool === 'suffix' && path) {
            localStorage.setItem('lab_user_suffix', path);
            setUserSuffixState(path);
        }
        setVerifiedTools(prev => ({
            ...prev,
            [tool]: { verified, path }
        }));
    };

    const setUserSuffix = (suffix: string) => {
        setUserSuffixState(suffix);
    };

    const setUserEmail = (email: string) => {
        setUserEmailState(email);
        localStorage.setItem('userEmail', email);
    };

    const completeLab = (labNumber: number) => {
        if (!completedLabs.includes(labNumber)) {
            const updated = [...completedLabs, labNumber];
            setCompletedLabs(updated);
            localStorage.setItem('completedLabs', JSON.stringify(updated));
            
            // Update leaderboard
            const email = userEmail || localStorage.getItem('userEmail') || '';
            if (email) {
                updateLeaderboardLab(email, labNumber, currentScore);
            }
        }
    };

    const startLab = (labNumber: number) => {
        if (!labStartTimes[labNumber]) {
            const updated = { ...labStartTimes, [labNumber]: Date.now() };
            setLabStartTimes(updated);
            localStorage.setItem('labStartTimes', JSON.stringify(updated));
            
            // Update leaderboard
            const email = userEmail || localStorage.getItem('userEmail') || '';
            if (email) {
                updateLeaderboardStart(email, labNumber);
            }
        }
    };

    const isLabCompleted = (labNumber: number) => {
        return completedLabs.includes(labNumber);
    };

    const isLabAccessible = (labNumber: number) => {
        // Lab 1 is always accessible
        if (labNumber === 1) return true;
        // Lab 2 requires Lab 1
        if (labNumber === 2) return isLabCompleted(1);
        // Lab 3 requires Lab 1
        if (labNumber === 3) return isLabCompleted(1);
        return false;
    };

    return (
        <LabContext.Provider value={{
            mongoUri,
            ...awsCreds,
            currentScore,
            completedSteps,
            assistedSteps,
            verifiedTools,
            userSuffix,
            userEmail,
            completedLabs,
            labStartTimes,
            setMongoUri,
            setAwsCredentials,
            setAwsKeyArn,
            completeStep,
            setVerifiedTool,
            setUserSuffix,
            setUserEmail,
            completeLab,
            startLab,
            isLabCompleted,
            isLabAccessible,
            resetProgress
        }}>
            {children}
        </LabContext.Provider>
    );
};

export const useLab = () => {
    const context = useContext(LabContext);
    if (context === undefined) {
        throw new Error('useLab must be used within a LabProvider');
    }
    return context;
};
