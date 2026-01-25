import React, { createContext, useContext, useState, useEffect } from 'react';

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
        libmongocrypt: { verified: false, path: '' }
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

    // Load email from localStorage on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('userEmail');
        if (savedEmail) {
            setUserEmailState(savedEmail);
        }
    }, []);

    const resetProgress = () => {
        setMongoUri('');
        setAwsCreds({ awsAccessKeyId: '', awsSecretAccessKey: '', awsKeyArn: '', awsRegion: 'eu-north-1' });
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
            libmongocrypt: { verified: false, path: '' }
        });
        setUserSuffix('');
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

    const completeStep = (stepId: string, assisted: boolean) => {
        if (completedSteps.includes(stepId)) return;

        setCompletedSteps(prev => [...prev, stepId]);
        const points = assisted ? 5 : 10;
        if (assisted) {
            setAssistedSteps(prev => [...prev, stepId]);
            setCurrentScore(prev => prev + points);
        } else {
            setCurrentScore(prev => prev + points);
        }
        
        // Log points to MongoDB Atlas
        const email = userEmail || localStorage.getItem('userEmail') || '';
        if (email) {
            // Determine lab number from stepId (e.g., "lab1-step1" -> 1)
            const labMatch = stepId.match(/lab(\d+)/i);
            const labNumber = labMatch ? parseInt(labMatch[1]) : 1;
            
            fetch('/api/leaderboard/add-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    stepId,
                    labNumber,
                    points,
                    assisted
                })
            }).catch(console.error);
        }
    };

    const setVerifiedTool = (tool: string, verified: boolean, path: string) => {
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
            
            // Report to leaderboard API
            const email = userEmail || localStorage.getItem('userEmail') || '';
            if (email) {
                fetch('/api/leaderboard/complete-lab', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        labNumber,
                        score: currentScore,
                        timestamp: Date.now()
                    })
                }).catch(console.error);
            }
        }
    };

    const startLab = (labNumber: number) => {
        if (!labStartTimes[labNumber]) {
            const updated = { ...labStartTimes, [labNumber]: Date.now() };
            setLabStartTimes(updated);
            localStorage.setItem('labStartTimes', JSON.stringify(updated));
            
            // Report to leaderboard API
            const email = userEmail || localStorage.getItem('userEmail') || '';
            if (email) {
                fetch('/api/leaderboard/start-lab', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email,
                        labNumber,
                        timestamp: Date.now()
                    })
                }).catch(console.error);
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
