import React, { useState, useEffect } from 'react';
import { useLab } from '@/context/LabContext';
import { getWorkshopSession, updateWorkshopSession } from '@/utils/workshopUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, ShieldCheck, Database, HelpCircle, Terminal, Cloud, Layers, Fingerprint, Loader2, AlertTriangle, ExternalLink, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { validatorUtils } from '@/utils/validatorUtils';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ArchitectureDiagram } from '@/components/workshop/ArchitectureDiagram';
import { LabEnvironmentDiagram } from './LabEnvironmentDiagram';
import { PrerequisitesChecklist } from './PrerequisitesChecklist';

type SetupPhase = 'onboarding' | 'ready';

interface Prerequisite {
    id: string;
    label: string;
    description: string;
    installCommand?: string;
    downloadUrl?: string;
    required: boolean;
}

const PREREQUISITES: Prerequisite[] = [
    { id: 'awsCli', label: 'AWS CLI v2', description: 'Required for KMS operations', installCommand: 'brew install awscli', downloadUrl: 'https://aws.amazon.com/cli/', required: true },
    { id: 'mongosh', label: 'mongosh', description: 'MongoDB Shell for database operations', installCommand: 'brew install mongodb-community-shell', downloadUrl: 'https://www.mongodb.com/try/download/shell', required: true },
    { id: 'node', label: 'Node.js v18+', description: 'JavaScript runtime', installCommand: 'brew install node', downloadUrl: 'https://nodejs.org/', required: true },
    { id: 'npm', label: 'npm', description: 'Package manager (comes with Node.js)', installCommand: 'Included with Node.js', required: true },
    { id: 'mongoCryptShared', label: 'mongo_crypt_shared', description: 'Required for Lab 2 (Queryable Encryption)', installCommand: 'Download from MongoDB', downloadUrl: 'https://www.mongodb.com/docs/manual/core/queryable-encryption/reference/shared-library/', required: true },
];

export const LabSetupWizard: React.FC = () => {
    const {
        setMongoUri,
        setAwsCredentials,
        mongoUri,
        awsRegion,
        verifiedTools,
        setVerifiedTool,
        setUserEmail,
        userEmail,
        resetProgress
    } = useLab();

    const [phase, setPhase] = useState<SetupPhase>(mongoUri ? 'ready' : 'onboarding');
    const [localUri, setLocalUri] = useState(mongoUri || 'mongodb://mongo:27017');
    const [uriFromWorkshop, setUriFromWorkshop] = useState(false);
    const [isCheckingPrereqs, setIsCheckingPrereqs] = useState(false);
    const [prereqResults, setPrereqResults] = useState<Record<string, { verified: boolean; message: string; path?: string; detectedLocation?: string }>>({});
    const [showPrereqDetails, setShowPrereqDetails] = useState(false);
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
    const [bypassPrereqs, setBypassPrereqs] = useState(false);
    const [cryptSharedManualPath, setCryptSharedManualPath] = useState(
        () => localStorage.getItem('crypt_shared_lib_path') || localStorage.getItem('mongo_crypt_shared_path') || ''
    );
    const [showMongoCryptInput, setShowMongoCryptInput] = useState(false);
    const [isVerifyingCryptPath, setIsVerifyingCryptPath] = useState(false);
    const [mongoshPathInput, setMongoshPathInput] = useState(() => localStorage.getItem('workshop_mongosh_path') || '');
    const [awsProfileInput, setAwsProfileInput] = useState(() => localStorage.getItem('lab_aws_profile') || '');

    // Get attendee name from localStorage (set during registration)
    const attendeeName = localStorage.getItem('workshop_attendee_name') || '';

    // Update suffix from attendee name on mount
    useEffect(() => {
        if (attendeeName) {
            const parts = attendeeName.trim().split(/\s+/);
            if (parts.length >= 2) {
                const fn = parts[0].toLowerCase();
                const ln = parts[parts.length - 1].toLowerCase();
                setVerifiedTool('suffix', true, `${fn}-${ln}`);
            } else if (parts.length === 1) {
                setVerifiedTool('suffix', true, parts[0].toLowerCase());
            }
        }
    }, [attendeeName, setVerifiedTool]);

    // Sync local verify state from context on mount
    useEffect(() => {
        if (mongoUri) setPhase('ready');
    }, [mongoUri]);

    // Initialize URI from workshop session if available; otherwise keep default (mongodb://mongo:27017)
    useEffect(() => {
        const session = getWorkshopSession();
        if (session) {
            if (session.mongodbSource === 'local') {
                setLocalUri('mongodb://mongo:27017');
                setUriFromWorkshop(true);
            } else if (session.mongodbSource === 'atlas' && session.atlasConnectionString) {
                setLocalUri(session.atlasConnectionString);
                setUriFromWorkshop(true);
            }
        }
    }, []);

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedCommand(id);
        setTimeout(() => setCopiedCommand(null), 2000);
    };

    const verifyCryptSharedPath = async () => {
        const pathToCheck = cryptSharedManualPath.trim();
        if (!pathToCheck) {
            toast.error('Enter the path to mongo_crypt_v1.dylib (or .so)');
            return;
        }
        setIsVerifyingCryptPath(true);
        try {
            localStorage.setItem('crypt_shared_lib_path', pathToCheck);
            const result = await validatorUtils.checkFilePath(pathToCheck, 'mongoCryptShared');
            if (result.success) {
                setPrereqResults(prev => ({
                    ...prev,
                    mongoCryptShared: { verified: true, message: result.message || 'File found', path: pathToCheck, detectedLocation: result.detectedLocation },
                }));
                setVerifiedTool('mongoCryptShared', true, pathToCheck, result.detectedLocation);
                toast.success(result.detectedLocation ? `✓ Found in ${result.detectedLocation}` : 'mongo_crypt_shared path verified');
                setShowMongoCryptInput(false);
            } else {
                setPrereqResults(prev => ({ ...prev, mongoCryptShared: { verified: false, message: result.message || 'File not found' } }));
                setVerifiedTool('mongoCryptShared', false, '');
                toast.error(result.message || 'File not found at that path');
            }
        } catch (e) {
            toast.error('Verification failed');
        } finally {
            setIsVerifyingCryptPath(false);
        }
    };

    const checkAllPrerequisites = async () => {
        setIsCheckingPrereqs(true);
        setShowPrereqDetails(true);
        const results: Record<string, { verified: boolean; message: string; path?: string }> = {};

        for (const prereq of PREREQUISITES) {
            try {
                // mongo_crypt_shared: user path first, then auto-detect; use checkMongoCryptShared for detectedLocation
                if (prereq.id === 'mongoCryptShared') {
                    const storedPath = (localStorage.getItem('crypt_shared_lib_path') || localStorage.getItem('mongo_crypt_shared_path') || '').trim();
                    const result = await validatorUtils.checkMongoCryptShared(storedPath || undefined);
                    if (result.success && result.path) {
                        if (!storedPath) localStorage.setItem('crypt_shared_lib_path', result.path);
                        results[prereq.id] = {
                            verified: true,
                            message: result.message || 'File found',
                            path: result.path,
                            detectedLocation: result.detectedLocation,
                        };
                        setVerifiedTool(prereq.id, true, result.path, result.detectedLocation);
                    } else {
                        results[prereq.id] = { verified: false, message: result.message || 'Not found' };
                        setVerifiedTool(prereq.id, false, '');
                    }
                } else {
                    const result = await validatorUtils.checkToolInstalled(prereq.label.replace(' v2', '').replace(' v18+', ''));
                    if (result.success) {
                        const version = result.message?.replace('System Scan: ', '') || result.path || '';
                        results[prereq.id] = { verified: true, message: version, path: result.path, detectedLocation: result.detectedLocation };
                        setVerifiedTool(prereq.id, true, result.path || version, result.detectedLocation);
                        if (prereq.id === 'mongosh' && result.path) {
                            localStorage.setItem('workshop_mongosh_path', result.path);
                            setMongoshPathInput(result.path);
                            toast.success('mongosh path saved for lab Run');
                        }
                    } else {
                        results[prereq.id] = { verified: false, message: result.message || 'Not found' };
                        setVerifiedTool(prereq.id, false, '');
                    }
                }
            } catch (e) {
                results[prereq.id] = { verified: false, message: 'Verification failed' };
                setVerifiedTool(prereq.id, false, '');
            }
            setPrereqResults({ ...results });
        }

        // Check Atlas connection if URI is provided
        if (localUri) {
            const uriVal = validatorUtils.validateMongoUri(localUri);
            if (uriVal.success) {
                try {
                    const atlasResult = await validatorUtils.checkKeyVault(localUri, 'encryption.__keyVault');
                    if (atlasResult.success) {
                        results['atlas'] = { verified: true, message: 'Connected' };
                        setVerifiedTool('atlas', true, 'M10+ Cluster Connected');
                    } else {
                        results['atlas'] = { verified: false, message: atlasResult.message || 'Connection failed' };
                    }
                } catch {
                    results['atlas'] = { verified: false, message: 'Connection failed' };
                }
            }
        }

        setPrereqResults(results);
        setIsCheckingPrereqs(false);

        // Ensure detected mongosh path is always used for lab Run (persist so Run in lab uses it)
        const mongoshPath = results['mongosh']?.path || verifiedTools['mongosh']?.path;
        if (mongoshPath) {
            localStorage.setItem('workshop_mongosh_path', mongoshPath);
            setMongoshPathInput(mongoshPath);
        }

        const requiredPassed = PREREQUISITES.filter(p => p.required).every(p => results[p.id]?.verified);
        if (requiredPassed) {
            toast.success('All required prerequisites verified!');
        } else {
            toast.warning('Some prerequisites are missing. You can install them or continue anyway.');
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure? This will reset your progress and locally verified paths.')) return;

        const suffix = verifiedTools['suffix']?.path;
        if (suffix && window.confirm(`Do you also want to delete the AWS KMS Key & Alias (alias/mongodb-lab-key-${suffix})? \n\nThis will apply a 7-day deletion window.`)) {
            const toastId = toast.loading('Cleaning up AWS resources...');
            const profile = typeof localStorage !== 'undefined' ? (localStorage.getItem('lab_aws_profile') ?? '') : '';
            const result = await validatorUtils.cleanupAwsResources(`alias/mongodb-lab-key-${suffix}`, profile || undefined);
            toast.dismiss(toastId);
            if (result.success) {
                toast.success('AWS Resources cleaned up.');
            } else {
                toast.error(`Cleanup failed: ${result.message}`);
            }
        }

        resetProgress();
        setPhase('onboarding');
        toast.info("Progress Reset.");
    };

    const handleFinalize = async () => {
        const savedEmail = userEmail || localStorage.getItem('userEmail') || '';
        if (!savedEmail || !savedEmail.includes('@')) {
            toast.error('Please provide a valid email address during registration');
            return;
        }
        setMongoUri(localUri);
        const isAtlas = /^mongodb\+srv:\/\//i.test(localUri.trim());
        await updateWorkshopSession({
            mongodbSource: isAtlas ? 'atlas' : 'local',
            ...(isAtlas && { atlasConnectionString: localUri.trim() }),
        });
        setAwsCredentials({
            accessKeyId: '',
            secretAccessKey: '',
            keyArn: '',
            region: 'eu-central-1'
        });
        setPhase('ready');
        toast.success("Environment Activated! Ready for Lab 1.");
    };

    const requiredVerified = verifiedTools.awsCli.verified && verifiedTools.mongosh.verified && verifiedTools.node.verified && verifiedTools.npm.verified;
    const allVerified = requiredVerified || bypassPrereqs;
    const hasAtlasConnection = verifiedTools.atlas.verified || prereqResults['atlas']?.verified;
    const hasCheckedPrereqs = Object.keys(prereqResults).length > 0;

    if (phase === 'ready') {
        return (
            <Card className="max-w-2xl mx-auto mt-10 border-primary/20 bg-primary/5 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        <CardTitle>Environment Ready</CardTitle>
                    </div>
                    <CardDescription>All prerequisites verified. Your encryption journey begins now.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-2 text-sm mb-2">
                            <Database className="w-4 h-4 text-primary" />
                            <span className="font-mono text-muted-foreground">{localUri.replace(/:[^@]+@/, ':****@')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>System & Cloud Baseline Verified</span>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border border-dashed">
                        <p className="font-semibold flex items-center gap-1 mb-1"><HelpCircle className="w-3 h-3" /> Get Started:</p>
                        <p>Open <strong>Lab 1: CSFLE Fundamentals</strong> from the sidebar to create your first Customer Master Key (CMK).</p>
                    </div>

                    {/* Architecture Diagram */}
                    <ArchitectureDiagram variant="overview" />
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setPhase('onboarding')}>Update Environment</Button>
                    <Button variant="destructive" className="flex-1" onClick={handleReset}>Reset All Progress</Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto mt-6 shadow-xl overflow-hidden border-none bg-background/50 backdrop-blur-sm">
            <div className="h-1.5 bg-primary w-full" />
            <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Lab Environment Setup</CardTitle>
                        <CardDescription>Verify your tools and connect to MongoDB Atlas</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6">
                {/* Prerequisites Overview Checklist */}
                <PrerequisitesChecklist 
                    prerequisites={PREREQUISITES}
                    verifiedTools={verifiedTools}
                />

                {/* Architecture Overview */}
                <LabEnvironmentDiagram />

                {/* Prerequisites Check */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-primary" />
                            Verify Installation
                        </h3>
                        <Button
                            onClick={checkAllPrerequisites}
                            disabled={isCheckingPrereqs}
                            size="sm"
                            className="gap-2"
                        >
                            {isCheckingPrereqs ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="w-4 h-4" />
                            )}
                            {isCheckingPrereqs ? 'Checking...' : 'Check Prerequisites'}
                        </Button>
                    </div>

                    {/* Compact status row */}
                    <div className="flex flex-wrap gap-2">
                        {PREREQUISITES.map((prereq) => {
                            const result = prereqResults[prereq.id] || verifiedTools[prereq.id];
                            const isVerified = result?.verified;
                            return (
                                <div
                                    key={prereq.id}
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
                                        isVerified
                                            ? "bg-green-500/10 text-green-600 border-green-500/30"
                                            : prereqResults[prereq.id]
                                            ? "bg-red-500/10 text-red-600 border-red-500/30"
                                            : "bg-muted text-muted-foreground border-border"
                                    )}
                                >
                                    {isVerified ? (
                                        <CheckCircle2 className="w-3 h-3" />
                                    ) : prereqResults[prereq.id] ? (
                                        <AlertTriangle className="w-3 h-3" />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full border border-current" />
                                    )}
                                    {prereq.label}
                                </div>
                            );
                        })}
                    </div>

                    {/* Detected tool paths (shown after check) */}
                    {showPrereqDetails && hasCheckedPrereqs && (
                        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
                            <p className="text-xs font-medium text-muted-foreground mb-2">Detected tools</p>
                            {PREREQUISITES.map((prereq) => {
                                const result = prereqResults[prereq.id];
                                const verified = result?.verified ?? verifiedTools[prereq.id]?.verified;
                                const path = result?.path ?? verifiedTools[prereq.id]?.path;
                                const detectedLocation = result?.detectedLocation ?? verifiedTools[prereq.id]?.detectedLocation;
                                const message = result?.message ?? verifiedTools[prereq.id]?.path ?? '';
                                return (
                                    <div key={prereq.id} className="flex items-baseline gap-2 text-xs font-mono">
                                        <span className="text-foreground min-w-[120px]">{prereq.label}</span>
                                        {verified ? (
                                            <>
                                                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                                                <span className="text-muted-foreground truncate" title={path || message}>
                                                    {detectedLocation ? `✓ Found in ${detectedLocation}` : (path || message || 'OK')}
                                                </span>
                                            </>
                                        ) : result ? (
                                            <>
                                                <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                                <span className="text-muted-foreground">{message || 'Not found'}</span>
                                            </>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Expandable details for missing prerequisites */}
                    {showPrereqDetails && hasCheckedPrereqs && (
                        <Collapsible open={!requiredVerified}>
                            <CollapsibleTrigger asChild>
                                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                    {requiredVerified ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    {requiredVerified ? 'Show details' : 'Installation instructions'}
                                </button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <div className="mt-3 space-y-2">
                                    {PREREQUISITES.filter(p => !prereqResults[p.id]?.verified).map((prereq) => (
                                        <div key={prereq.id} className={cn(
                                            "p-3 rounded-lg border",
                                            prereq.required 
                                                ? "bg-red-500/5 border-red-500/20" 
                                                : "bg-amber-500/5 border-amber-500/20"
                                        )}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-sm font-medium",
                                                        prereq.required ? "text-red-600" : "text-amber-600"
                                                    )}>
                                                        {prereq.label}
                                                    </span>
                                                    {!prereq.required && (
                                                        <span className="text-xs px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded">Optional</span>
                                                    )}
                                                </div>
                                                {prereq.downloadUrl && (
                                                    <a
                                                        href={prereq.downloadUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline flex items-center gap-1"
                                                    >
                                                        Download <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">{prereq.description}</p>
                                            {prereq.installCommand && prereq.installCommand !== 'Included with Node.js' && prereq.installCommand !== 'Download from MongoDB' && (
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 text-xs p-2 bg-background rounded border border-border font-mono">
                                                        {prereq.installCommand}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2"
                                                        onClick={() => copyToClipboard(prereq.installCommand!, prereq.id)}
                                                    >
                                                        {copiedCommand === prereq.id ? (
                                                            <Check className="w-3 h-3 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    {/* Continue anyway option */}
                                    {!requiredVerified && (
                                        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-dashed border-border">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Continue without all prerequisites?</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Some labs may not work correctly. You can always return here to check prerequisites later.
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2"
                                                        onClick={() => setBypassPrereqs(true)}
                                                    >
                                                        Continue Anyway
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleContent>
                        </Collapsible>
                    )}
                </div>

                {/* Attendee Info (from registration) */}
                {(attendeeName || userEmail) && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                        <Fingerprint className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attendeeName || 'Attendee'}</p>
                            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            AWS suffix: <span className="font-mono text-primary">{verifiedTools['suffix']?.path || '...'}</span>
                        </div>
                    </div>
                )}

                {/* MongoDB URI (Atlas or local Docker) */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        MongoDB URI
                    </h3>
                    <div className="space-y-2">
                        <Input
                            id="uri"
                            placeholder="mongodb://mongo:27017 (local Docker) or mongodb+srv://user:pass@cluster.mongodb.net/ (Atlas)"
                            value={localUri}
                            onChange={(e) => {
                                setLocalUri(e.target.value);
                                setUriFromWorkshop(false);
                            }}
                            disabled={hasAtlasConnection}
                            className="font-mono text-xs"
                        />
                        {uriFromWorkshop && (
                            <div className="flex flex-col gap-0.5 text-xs text-blue-600">
                                <div className="flex items-center gap-2">
                                    <Database className="w-3 h-3" />
                                    <span>Pre-configured from workshop session ({getWorkshopSession()?.mongodbSource === 'local' ? 'Local Docker' : 'Atlas'})</span>
                                </div>
                                {getWorkshopSession()?.mongodbSource === 'local' && (
                                    <span className="text-muted-foreground text-[11px]">In Docker, lab Run uses the server URI (e.g. mongodb://root:example@mongo:27017). Use <code className="bg-muted px-0.5 rounded">process.env.MONGODB_URI</code> in scripts.</span>
                                )}
                            </div>
                        )}
                        {hasAtlasConnection && (
                            <div className="flex items-center gap-2 text-xs text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Atlas connection verified</span>
                            </div>
                        )}
                    </div>

                    <Collapsible>
                        <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                            Need help getting a connection string?
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border text-xs space-y-2">
                                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                                    <li>Go to <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MongoDB Atlas</a></li>
                                    <li>Click <strong>Connect</strong> on your cluster</li>
                                    <li>Select <strong>Connect your application</strong></li>
                                    <li>Copy the connection string and replace &lt;password&gt;</li>
                                </ol>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </div>

                {/* mongo_crypt_shared Library (below MongoDB URI) - always visible */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Layers className="w-4 h-4 text-primary" />
                        mongo_crypt_shared Library
                    </h3>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                        {(verifiedTools['mongoCryptShared']?.verified || prereqResults['mongoCryptShared']?.verified) ? (
                            <div className="flex flex-col gap-1 text-xs">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium">Library detected</span>
                                </div>
                                {(verifiedTools['mongoCryptShared']?.detectedLocation ?? prereqResults['mongoCryptShared']?.detectedLocation) && (
                                    <span className="text-muted-foreground">
                                        ✓ Found in {verifiedTools['mongoCryptShared']?.detectedLocation ?? prereqResults['mongoCryptShared']?.detectedLocation}
                                    </span>
                                )}
                                <span className="font-mono text-muted-foreground truncate" title={verifiedTools['mongoCryptShared']?.path ?? prereqResults['mongoCryptShared']?.path}>
                                    {verifiedTools['mongoCryptShared']?.path ?? prereqResults['mongoCryptShared']?.path}
                                </span>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 text-xs text-amber-600">
                                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                    <span>Library not found. Required for Lab 2 (Queryable Encryption).</span>
                                </div>
                                {!showMongoCryptInput ? (
                                    <Button variant="outline" size="sm" onClick={() => setShowMongoCryptInput(true)}>
                                        Provide Library Path
                                    </Button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Full path to <code className="bg-background px-1 rounded">mongo_crypt_v1.dylib</code> (macOS) or <code className="bg-background px-1 rounded">mongo_crypt_v1.so</code> (Linux).
                                        </p>
                                        <div className="flex gap-2 flex-wrap">
                                            <Input
                                                placeholder="/path/to/mongo_crypt_v1.dylib"
                                                value={cryptSharedManualPath}
                                                onChange={(e) => setCryptSharedManualPath(e.target.value)}
                                                className="font-mono text-xs flex-1 min-w-[200px]"
                                            />
                                            <Button size="sm" onClick={verifyCryptSharedPath} disabled={isVerifyingCryptPath || !cryptSharedManualPath.trim()}>
                                                {isVerifyingCryptPath ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => setShowMongoCryptInput(false)}>Cancel</Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Path to mongosh: set automatically by Check Prerequisites; override here if needed */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-primary" />
                        Path to mongosh
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Set automatically when you run <strong>Check Prerequisites</strong> (e.g. <code className="bg-muted px-1 rounded">/opt/homebrew/bin/mongosh</code>). Lab Run uses this path. Override below only if Run still fails.
                    </p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="/opt/homebrew/bin/mongosh"
                            value={mongoshPathInput}
                            onChange={(e) => setMongoshPathInput(e.target.value)}
                            className="font-mono text-xs"
                        />
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                const v = mongoshPathInput.trim();
                                if (v) {
                                    localStorage.setItem('workshop_mongosh_path', v);
                                    toast.success('mongosh path saved. Try Run in the lab again.');
                                } else {
                                    localStorage.removeItem('workshop_mongosh_path');
                                    toast.success('Cleared. Using auto-detect.');
                                }
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>

                {/* AWS profile (optional override) */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-primary" />
                        AWS profile (optional)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        Leave empty to use <code className="bg-muted px-1 rounded">AWS_PROFILE</code> from the environment or <code className="bg-muted px-1 rounded">default</code>. Set a profile name to override (e.g. <code className="bg-muted px-0.5 rounded">workshop</code> or your SSO profile).
                    </p>
                    <div className="flex gap-2">
                        <Input
                            placeholder="default (or leave empty for auto)"
                            value={awsProfileInput}
                            onChange={(e) => setAwsProfileInput(e.target.value)}
                            className="font-mono text-xs"
                        />
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                                const v = awsProfileInput.trim();
                                if (v) {
                                    localStorage.setItem('lab_aws_profile', v);
                                    toast.success(`Using AWS profile: ${v}`);
                                } else {
                                    localStorage.removeItem('lab_aws_profile');
                                    toast.success('Cleared. Using server default (AWS_PROFILE or default).');
                                }
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </div>

            </CardContent>

            <CardFooter className="bg-primary/5 p-6 border-t">
                <Button
                    className="w-full h-12 text-base font-semibold rounded-lg"
                    disabled={!allVerified || !localUri}
                    onClick={handleFinalize}
                >
                    {!hasCheckedPrereqs ? (
                        <>Check prerequisites first</>
                    ) : !allVerified ? (
                        <>Missing prerequisites (or continue anyway)</>
                    ) : !localUri ? (
                        <>Enter Atlas connection string</>
                    ) : (
                        <>Activate Lab Environment</>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};
