import React, { useState, useEffect } from 'react';
import { useLab } from '@/context/LabContext';
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
    { id: 'mongoCryptShared', label: 'mongo_crypt_shared', description: 'Required for Lab 2 (Queryable Encryption)', installCommand: 'Download from MongoDB', downloadUrl: 'https://www.mongodb.com/docs/manual/core/queryable-encryption/reference/shared-library/', required: false },
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
    const [localUri, setLocalUri] = useState(mongoUri);
    const [isCheckingPrereqs, setIsCheckingPrereqs] = useState(false);
    const [prereqResults, setPrereqResults] = useState<Record<string, { verified: boolean; message: string; path?: string }>>({});
    const [showPrereqDetails, setShowPrereqDetails] = useState(false);
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
    const [bypassPrereqs, setBypassPrereqs] = useState(false);

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

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedCommand(id);
        setTimeout(() => setCopiedCommand(null), 2000);
    };

    const checkAllPrerequisites = async () => {
        setIsCheckingPrereqs(true);
        setShowPrereqDetails(true);
        const results: Record<string, { verified: boolean; message: string; path?: string }> = {};

        for (const prereq of PREREQUISITES) {
            try {
                const result = await validatorUtils.checkToolInstalled(prereq.label.replace(' v2', '').replace(' v18+', ''));
                if (result.success) {
                    const version = result.message?.replace('System Scan: ', '') || result.path || '';
                    results[prereq.id] = { verified: true, message: version, path: result.path };
                    setVerifiedTool(prereq.id, true, result.path || version);
                } else {
                    results[prereq.id] = { verified: false, message: result.message || 'Not found' };
                    setVerifiedTool(prereq.id, false, '');
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
            const result = await validatorUtils.cleanupAwsResources(`alias/mongodb-lab-key-${suffix}`);
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

    const handleFinalize = () => {
        const savedEmail = userEmail || localStorage.getItem('userEmail') || '';
        if (!savedEmail || !savedEmail.includes('@')) {
            toast.error('Please provide a valid email address during registration');
            return;
        }
        setMongoUri(localUri);
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

                {/* Atlas Connection */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-primary" />
                        MongoDB Atlas Cluster
                    </h3>
                    <div className="space-y-2">
                        <Input
                            id="uri"
                            placeholder="mongodb+srv://user:pass@cluster.mongodb.net/"
                            value={localUri}
                            onChange={(e) => setLocalUri(e.target.value)}
                            disabled={hasAtlasConnection}
                            className="font-mono text-xs"
                        />
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
