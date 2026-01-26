import React, { useState, useEffect } from 'react';
import { useLab } from '@/context/LabContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, ShieldCheck, Database, HelpCircle, Terminal, Cloud, Layers, Fingerprint, ShieldEllipsis, Loader2, AlertTriangle, ExternalLink } from 'lucide-react';
import { validatorUtils } from '@/utils/validatorUtils';
import { toast } from 'sonner';

type SetupPhase = 'onboarding' | 'ready';

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
    const [localEmail, setLocalEmail] = useState(userEmail);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [errorMap, setErrorMap] = useState<Record<string, string>>({});
    const [showAtlasHelp, setShowAtlasHelp] = useState(false);
    const [showSSOConfig, setShowSSOConfig] = useState(false);

    // Auto-fill name from email when email changes
    useEffect(() => {
        if (localEmail && localEmail.includes('@')) {
            const emailPrefix = localEmail.split('@')[0];
            // Try to parse name from email (e.g., "pierre.petersson" or "pierre-petersson")
            const parts = emailPrefix.split(/[.\-_]/);
            if (parts.length >= 2 && !firstName && !lastName) {
                setFirstName(parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
                setLastName(parts[1].charAt(0).toUpperCase() + parts[1].slice(1));
            } else if (parts.length === 1 && !firstName) {
                setFirstName(parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
            }
        }
    }, [localEmail]);

    // Update suffix when names change
    useEffect(() => {
        if (firstName && lastName) {
            const fn = firstName.toLowerCase();
            const ln = lastName.toLowerCase();
            setVerifiedTool('suffix', true, `${fn}-${ln}`);
        }
    }, [firstName, lastName]); // Removed setVerifiedTool from dependencies to prevent infinite loop

    // Sync local verify state from context on mount
    useEffect(() => {
        if (mongoUri) setPhase('ready');
    }, [mongoUri]);

    const verifyTool = async (id: string, label: string) => {
        // Clear previous error
        setErrorMap(prev => ({ ...prev, [id]: '' }));

        if (id === 'atlas') {
            const uriVal = validatorUtils.validateMongoUri(localUri);
            if (!uriVal.success) {
                setErrorMap(prev => ({ ...prev, [id]: uriVal.message }));
                toast.error(uriVal.message);
                return;
            }
            setLoadingMap(prev => ({ ...prev, [id]: true }));
            const result = await validatorUtils.checkKeyVault(localUri, 'encryption.__keyVault');
            if (result.success) {
                // Also check Atlas version
                try {
                    const versionResult = await fetch(`/api/check-versions?type=atlas&uri=${encodeURIComponent(localUri)}`);
                    const versionData = await versionResult.json();
                    if (versionData.success && versionData.results?.atlasVersion) {
                        const version = versionData.results.atlasVersion.version;
                        setVerifiedTool('atlas', true, `M10+ Cluster Connected (MongoDB ${version})`);
                    } else {
                        setVerifiedTool('atlas', true, 'M10+ Cluster Connected');
                    }
                } catch {
                    setVerifiedTool('atlas', true, 'M10+ Cluster Connected');
                }
                toast.success("Atlas Connectivity Verified!");
                setErrorMap(prev => ({ ...prev, [id]: '' }));
            } else {
                const errorMsg = result.message || 'Connection failed. Check your connection string and network access.';
                setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
                toast.error(errorMsg);
                setVerifiedTool('atlas', false, '');
            }
            setLoadingMap(prev => ({ ...prev, [id]: false }));
            return;
        }

        // Check versions for Node.js, npm, and libraries
        if (id === 'node' || id === 'npm' || id === 'mongodb' || id === 'mongodbClientEncryption' || id === 'awsSdkCredentialProviders' || id === 'libmongocrypt') {
            setLoadingMap(prev => ({ ...prev, [id]: true }));
            try {
                if (id === 'node' || id === 'npm') {
                    const result = await validatorUtils.checkToolInstalled(label);
                    if (result.success) {
                        const version = result.path || '';
                        const isNodeOk = id === 'node' ? version.includes('v') && parseInt(version.replace('v', '').split('.')[0]) >= 18 : true;
                        const isNpmOk = id === 'npm' ? true : true; // npm version check can be added if needed
                        if (isNodeOk || isNpmOk) {
                            toast.success(`${label} Verified!`);
                            setVerifiedTool(id, true, version);
                            setErrorMap(prev => ({ ...prev, [id]: '' }));
                        } else {
                            const errorMsg = id === 'node' ? 'Node.js version 18+ required' : `${label} version check failed`;
                            setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
                            toast.error(errorMsg);
                            setVerifiedTool(id, false, '');
                        }
                    } else {
                        const errorMsg = result.message || `${label} not found. Please install it first.`;
                        setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
                        toast.error(errorMsg);
                        setVerifiedTool(id, false, '');
                    }
                } else {
                    // Check library versions
                    const checkType = id === 'libmongocrypt' ? 'libmongocrypt' : 'packages';
                    const versionResult = await fetch(`/api/check-versions?type=${checkType}`);
                    const versionData = await versionResult.json();
                    if (versionData.success && versionData.results) {
                        const libKey = id === 'mongodbClientEncryption' ? 'mongodbClientEncryption' : 
                                      id === 'awsSdkCredentialProviders' ? 'awsSdkCredentialProviders' : id;
                        const libInfo = versionData.results[libKey];
                        if (libInfo && libInfo.verified) {
                            const displayText = libInfo.message || libInfo.installed || 'Available';
                            toast.success(`${label} Verified!`);
                            setVerifiedTool(id, true, displayText);
                            setErrorMap(prev => ({ ...prev, [id]: '' }));
                        } else {
                            const errorMsg = libInfo?.message || `${label} version check failed`;
                            setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
                            toast.error(errorMsg);
                            setVerifiedTool(id, false, '');
                        }
                    } else {
                        const errorMsg = `Failed to check ${label} version`;
                        setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
                        toast.error(errorMsg);
                        setVerifiedTool(id, false, '');
                    }
                }
            } catch (e) {
                const errorMsg = `Verification failed for ${label}. Please ensure it is installed.`;
                setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
                toast.error(errorMsg);
                setVerifiedTool(id, false, '');
            }
            setLoadingMap(prev => ({ ...prev, [id]: false }));
            return;
        }

        setLoadingMap(prev => ({ ...prev, [id]: true }));
        try {
            const result = await validatorUtils.checkToolInstalled(label);
            if (result.success) {
                toast.success(`${label} Verified!`);
                // Store version and path separately
                const version = result.message?.replace('System Scan: ', '') || result.path || '';
                const path = result.path || '';
                // Store as "version|path" format, or just version if path is same
                const displayValue = path && path !== version ? `${version}|${path}` : version;
                setVerifiedTool(id, true, displayValue);
                setErrorMap(prev => ({ ...prev, [id]: '' }));
            } else {
                const errorMsg = result.message || `${label} not found. Please install it first.`;
                setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
                toast.error(errorMsg);
                setVerifiedTool(id, false, '');
            }
        } catch (e) {
            const errorMsg = `Verification failed for ${label}. Please ensure the tool is installed.`;
            setErrorMap(prev => ({ ...prev, [id]: errorMsg }));
            toast.error(errorMsg);
            setVerifiedTool(id, false, '');
        }
        setLoadingMap(prev => ({ ...prev, [id]: false }));
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
        if (!localEmail || !localEmail.includes('@')) {
            toast.error('Please provide a valid email address');
            return;
        }
        setMongoUri(localUri);
        setUserEmail(localEmail);
        // SSO credentials are handled automatically via fromSSO() in scripts
        setAwsCredentials({
            accessKeyId: '',
            secretAccessKey: '',
            keyArn: '',
            region: 'eu-north-1'
        });
        setPhase('ready');
        toast.success("Environment Activated! Ready for Lab 1.");
    };

    const allVerified = verifiedTools.awsCli.verified && verifiedTools.mongosh.verified && verifiedTools.atlas.verified && verifiedTools.node.verified && verifiedTools.npm.verified;

    if (phase === 'ready') {
        return (
            <Card className="max-w-2xl mx-auto mt-10 border-primary/20 bg-primary/5 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        <CardTitle>Environment Ready</CardTitle>
                    </div>
                    <CardDescription>All prerequisites met and connectivity verified. Your encryption journey begins now.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-background rounded-lg border border-border">
                        <div className="flex items-center gap-2 text-sm mb-2">
                            <Database className="w-4 h-4 text-primary" />
                            <span className="font-mono text-muted-foreground">{localUri.replace(/:[^@]+@/, ':****@')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>System & Cloud Baseline Verified.</span>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border border-dashed">
                        <p className="font-semibold flex items-center gap-1 mb-1"><HelpCircle className="w-3 h-3" /> Get Started:</p>
                        <p>Open <strong>Lab 1: CSFLE Fundamentals</strong> from the sidebar. You will use your verified AWS CLI to create your first root Customer Master Key (CMK).</p>
                    </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setPhase('onboarding')}>Update Environment</Button>
                    <Button variant="destructive" className="flex-1" onClick={handleReset}>Reset All Progress</Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="max-w-4xl mx-auto mt-10 shadow-2xl overflow-hidden border-none bg-background/50 backdrop-blur-sm">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Layers className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-extrabold tracking-tight">Interactive Environment Setup</CardTitle>
                        <CardDescription className="text-lg">Solutions Architect Onboarding: Tools, Cloud & Persistence.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
                {/* 1. CLI Tools Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                        <Terminal className="w-5 h-5 text-primary" /> 1. Developer Tooling
                    </h3>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border border-dashed">
                        <strong>⚠️ Important:</strong> Install the tools below <strong>BEFORE</strong> clicking "Check Tool". The verification will fail if the tool is not installed.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* AWS CLI */}
                        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold">AWS CLI (v2)</Label>
                                    {verifiedTools.awsCli.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {errorMap['awsCli'] && !verifiedTools.awsCli.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Installation:</p>
                                    <code className="text-[10px] block p-2 bg-muted rounded">brew install awscli</code>
                                    <p className="text-[10px] text-muted-foreground">Or download from: <a href="https://aws.amazon.com/cli/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">aws.amazon.com/cli <ExternalLink className="w-3 h-3" /></a></p>
                                </div>
                                {verifiedTools.awsCli.path && (
                                    <p className="text-[10px] text-green-600 font-mono mt-1">Installed at: {verifiedTools.awsCli.path}</p>
                                )}
                                {errorMap['awsCli'] && !verifiedTools.awsCli.verified && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                        <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                            <AlertCircle className="w-3 h-3" /> Error
                                        </p>
                                        <p className="text-red-600 dark:text-red-300 mb-2">{errorMap['awsCli']}</p>
                                        <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Resolution Steps:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-red-600 dark:text-red-300">
                                            <li>Install AWS CLI: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">brew install awscli</code></li>
                                            <li>Verify installation: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">aws --version</code></li>
                                            <li>Click "Check Tool" again after installation</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant={verifiedTools.awsCli.verified ? "outline" : "secondary"}
                                size="sm"
                                className="mt-4 w-full"
                                disabled={loadingMap['awsCli'] || verifiedTools.awsCli.verified}
                                onClick={() => verifyTool('awsCli', 'aws')}
                            >
                                {loadingMap['awsCli'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                {verifiedTools.awsCli.verified ? "Verified" : "Check Tool"}
                            </Button>
                        </div>

                        {/* mongosh */}
                        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold">mongosh</Label>
                                    {verifiedTools.mongosh.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {errorMap['mongosh'] && !verifiedTools.mongosh.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Installation:</p>
                                    <code className="text-[10px] block p-2 bg-muted rounded">brew install mongodb-community-shell</code>
                                    <p className="text-[10px] text-muted-foreground">Or download from: <a href="https://www.mongodb.com/try/download/shell" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">mongodb.com/try/download/shell <ExternalLink className="w-3 h-3" /></a></p>
                                </div>
                                {verifiedTools.mongosh.path && (
                                    <p className="text-[10px] text-green-600 font-mono mt-1">Installed at: {verifiedTools.mongosh.path}</p>
                                )}
                                {errorMap['mongosh'] && !verifiedTools.mongosh.verified && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                        <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                            <AlertCircle className="w-3 h-3" /> Error
                                        </p>
                                        <p className="text-red-600 dark:text-red-300 mb-2">{errorMap['mongosh']}</p>
                                        <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Resolution Steps:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-red-600 dark:text-red-300">
                                            <li>Install mongosh: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">brew install mongodb-community-shell</code></li>
                                            <li>Verify installation: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">mongosh --version</code></li>
                                            <li>Click "Check Tool" again after installation</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant={verifiedTools.mongosh.verified ? "outline" : "secondary"}
                                size="sm"
                                className="mt-4 w-full"
                                disabled={loadingMap['mongosh'] || verifiedTools.mongosh.verified}
                                onClick={() => verifyTool('mongosh', 'mongosh')}
                            >
                                {loadingMap['mongosh'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                {verifiedTools.mongosh.verified ? "Verified" : "Check Tool"}
                            </Button>
                        </div>

                        {/* Node.js */}
                        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold">Node.js (v18+)</Label>
                                    {verifiedTools.node.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {errorMap['node'] && !verifiedTools.node.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Installation:</p>
                                    <code className="text-[10px] block p-2 bg-muted rounded">brew install node</code>
                                    <p className="text-[10px] text-muted-foreground">Or download from: <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">nodejs.org <ExternalLink className="w-3 h-3" /></a></p>
                                </div>
                                {verifiedTools.node.path && (
                                    <div className="mt-1 space-y-1">
                                        {(() => {
                                            const parts = verifiedTools.node.path.split('|');
                                            const version = parts[0];
                                            const path = parts[1] || parts[0];
                                            return (
                                                <>
                                                    <p className="text-[10px] text-green-600 font-mono">Version: {version}</p>
                                                    {path.includes('/') && (
                                                        <p className="text-[10px] text-green-600 font-mono">Installed at: {path}</p>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                                {errorMap['node'] && !verifiedTools.node.verified && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                        <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                            <AlertCircle className="w-3 h-3" /> Error
                                        </p>
                                        <p className="text-red-600 dark:text-red-300 mb-2">{errorMap['node']}</p>
                                        <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Resolution Steps:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-red-600 dark:text-red-300">
                                            <li>Install Node.js v18+: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">brew install node</code></li>
                                            <li>Verify installation: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">node --version</code></li>
                                            <li>Click "Check Tool" again after installation</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant={verifiedTools.node.verified ? "outline" : "secondary"}
                                size="sm"
                                className="mt-4 w-full"
                                disabled={loadingMap['node'] || verifiedTools.node.verified}
                                onClick={() => verifyTool('node', 'node')}
                            >
                                {loadingMap['node'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                {verifiedTools.node.verified ? "Verified" : "Check Tool"}
                            </Button>
                        </div>

                        {/* npm */}
                        <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-bold">npm</Label>
                                    {verifiedTools.npm.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                    {errorMap['npm'] && !verifiedTools.npm.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-muted-foreground">Installation:</p>
                                    <code className="text-[10px] block p-2 bg-muted rounded">Comes with Node.js</code>
                                    <p className="text-[10px] text-muted-foreground">Or install separately: <code className="bg-muted px-1 rounded">npm install -g npm</code></p>
                                </div>
                                {verifiedTools.npm.path && (
                                    <div className="mt-1 space-y-1">
                                        {(() => {
                                            const parts = verifiedTools.npm.path.split('|');
                                            const version = parts[0];
                                            const path = parts[1] || parts[0];
                                            return (
                                                <>
                                                    <p className="text-[10px] text-green-600 font-mono">Version: {version}</p>
                                                    {path.includes('/') && (
                                                        <p className="text-[10px] text-green-600 font-mono">Installed at: {path}</p>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                                {errorMap['npm'] && !verifiedTools.npm.verified && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                        <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                            <AlertCircle className="w-3 h-3" /> Error
                                        </p>
                                        <p className="text-red-600 dark:text-red-300 mb-2">{errorMap['npm']}</p>
                                        <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Resolution Steps:</p>
                                        <ol className="list-decimal list-inside space-y-1 text-red-600 dark:text-red-300">
                                            <li>npm comes with Node.js. Install Node.js first.</li>
                                            <li>Verify installation: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">npm --version</code></li>
                                            <li>Click "Check Tool" again after installation</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                            <Button
                                variant={verifiedTools.npm.verified ? "outline" : "secondary"}
                                size="sm"
                                className="mt-4 w-full"
                                disabled={loadingMap['npm'] || verifiedTools.npm.verified}
                                onClick={() => verifyTool('npm', 'npm')}
                            >
                                {loadingMap['npm'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                {verifiedTools.npm.verified ? "Verified" : "Check Tool"}
                            </Button>
                        </div>
                    </div>

                    {/* MongoDB Libraries & Encryption */}
                    <div className="mt-6 space-y-4">
                        <h4 className="text-md font-semibold flex items-center gap-2 border-b pb-2">
                            <Database className="w-4 h-4 text-primary" /> MongoDB Libraries & Encryption
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* MongoDB Driver */}
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold">mongodb (v7.0.0)</Label>
                                        {verifiedTools.mongodb.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        {errorMap['mongodb'] && !verifiedTools.mongodb.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground">Installation:</p>
                                        <code className="text-[10px] block p-2 bg-muted rounded">npm install mongodb@7.0.0</code>
                                    </div>
                                    {verifiedTools.mongodb.path && (
                                        <p className="text-[10px] text-green-600 font-mono mt-1">Installed: {verifiedTools.mongodb.path}</p>
                                    )}
                                    {errorMap['mongodb'] && !verifiedTools.mongodb.verified && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                            <p className="text-red-600 dark:text-red-300">{errorMap['mongodb']}</p>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant={verifiedTools.mongodb.verified ? "outline" : "secondary"}
                                    size="sm"
                                    className="mt-4 w-full"
                                    disabled={loadingMap['mongodb'] || verifiedTools.mongodb.verified}
                                    onClick={() => verifyTool('mongodb', 'mongodb')}
                                >
                                    {loadingMap['mongodb'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                    {verifiedTools.mongodb.verified ? "Verified" : "Check Version"}
                                </Button>
                            </div>

                            {/* mongodb-client-encryption */}
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold">mongodb-client-encryption (v7.0.0)</Label>
                                        {verifiedTools.mongodbClientEncryption.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        {errorMap['mongodbClientEncryption'] && !verifiedTools.mongodbClientEncryption.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground">Installation:</p>
                                        <code className="text-[10px] block p-2 bg-muted rounded">npm install mongodb-client-encryption@7.0.0</code>
                                    </div>
                                    {verifiedTools.mongodbClientEncryption.path && (
                                        <p className="text-[10px] text-green-600 font-mono mt-1">Installed: {verifiedTools.mongodbClientEncryption.path}</p>
                                    )}
                                    {errorMap['mongodbClientEncryption'] && !verifiedTools.mongodbClientEncryption.verified && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                            <p className="text-red-600 dark:text-red-300">{errorMap['mongodbClientEncryption']}</p>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant={verifiedTools.mongodbClientEncryption.verified ? "outline" : "secondary"}
                                    size="sm"
                                    className="mt-4 w-full"
                                    disabled={loadingMap['mongodbClientEncryption'] || verifiedTools.mongodbClientEncryption.verified}
                                    onClick={() => verifyTool('mongodbClientEncryption', 'mongodb-client-encryption')}
                                >
                                    {loadingMap['mongodbClientEncryption'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                    {verifiedTools.mongodbClientEncryption.verified ? "Verified" : "Check Version"}
                                </Button>
                            </div>

                            {/* @aws-sdk/credential-providers */}
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold">@aws-sdk/credential-providers</Label>
                                        {verifiedTools.awsSdkCredentialProviders.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        {errorMap['awsSdkCredentialProviders'] && !verifiedTools.awsSdkCredentialProviders.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground">Installation:</p>
                                        <code className="text-[10px] block p-2 bg-muted rounded">npm install @aws-sdk/credential-providers</code>
                                    </div>
                                    {verifiedTools.awsSdkCredentialProviders.path && (
                                        <p className="text-[10px] text-green-600 font-mono mt-1">Installed: {verifiedTools.awsSdkCredentialProviders.path}</p>
                                    )}
                                    {errorMap['awsSdkCredentialProviders'] && !verifiedTools.awsSdkCredentialProviders.verified && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                            <p className="text-red-600 dark:text-red-300">{errorMap['awsSdkCredentialProviders']}</p>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant={verifiedTools.awsSdkCredentialProviders.verified ? "outline" : "secondary"}
                                    size="sm"
                                    className="mt-4 w-full"
                                    disabled={loadingMap['awsSdkCredentialProviders'] || verifiedTools.awsSdkCredentialProviders.verified}
                                    onClick={() => verifyTool('awsSdkCredentialProviders', '@aws-sdk/credential-providers')}
                                >
                                    {loadingMap['awsSdkCredentialProviders'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                    {verifiedTools.awsSdkCredentialProviders.verified ? "Verified" : "Check Version"}
                                </Button>
                            </div>

                            {/* libmongocrypt - Automatic Encryption Shared Library */}
                            <div className="p-4 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold">libmongocrypt</Label>
                                        {verifiedTools.libmongocrypt.verified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                        {errorMap['libmongocrypt'] && !verifiedTools.libmongocrypt.verified && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground">Automatic Encryption Shared Library</p>
                                        <p className="text-[10px] text-muted-foreground">Required for automatic encryption. Installed automatically with mongodb-client-encryption.</p>
                                    </div>
                                    {verifiedTools.libmongocrypt.path && (
                                        <div className="mt-1 space-y-1">
                                            <p className="text-[10px] text-green-600 font-mono">{verifiedTools.libmongocrypt.path}</p>
                                        </div>
                                    )}
                                    {verifiedTools.libmongocrypt.verified && !verifiedTools.libmongocrypt.path && (
                                        <p className="text-[10px] text-green-600 font-semibold mt-1">✓ Automatic encryption is enabled</p>
                                    )}
                                    {errorMap['libmongocrypt'] && !verifiedTools.libmongocrypt.verified && (
                                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                            <p className="text-red-600 dark:text-red-300">{errorMap['libmongocrypt']}</p>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant={verifiedTools.libmongocrypt.verified ? "outline" : "secondary"}
                                    size="sm"
                                    className="mt-4 w-full"
                                    disabled={loadingMap['libmongocrypt'] || verifiedTools.libmongocrypt.verified}
                                    onClick={() => verifyTool('libmongocrypt', 'libmongocrypt')}
                                >
                                    {loadingMap['libmongocrypt'] ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <ShieldEllipsis className="w-3 h-3 mr-2" />}
                                    {verifiedTools.libmongocrypt.verified ? "Available" : "Check Availability"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                        <Fingerprint className="w-5 h-5 text-primary" /> 2. Personalize Your Lab
                    </h3>
                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your.email@mongodb.com"
                                value={localEmail}
                                onChange={(e) => setLocalEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Your email is used to track your progress and display your score on the leaderboard.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fname">First Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="fname"
                                    name="fname"
                                    autoComplete="given-name"
                                    placeholder="Pierre"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lname">Last Name <span className="text-red-500">*</span></Label>
                                <Input
                                    id="lname"
                                    name="lname"
                                    autoComplete="family-name"
                                    placeholder="Petersson"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            We use this to suffix your AWS resources (e.g., keys, buckets) so you can easily identify and clean them up later.
                            <br />
                            <strong>Resulting Suffix: </strong> <span className="font-mono text-primary">{verifiedTools['suffix']?.path || '...'}</span>
                        </p>
                    </div>
                </div>

                {/* 3. Atlas Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                        <Cloud className="w-5 h-5 text-primary" /> 3. MongoDB Atlas Cluster (M10+)
                    </h3>
                    
                    <details 
                        className="group"
                        open={showAtlasHelp}
                        onToggle={(e) => setShowAtlasHelp(e.currentTarget.open)}
                    >
                        <summary className="cursor-pointer space-y-1 hover:opacity-80 transition-opacity">
                            <p className="text-sm font-bold">Don't have an Atlas cluster yet?</p>
                            <p className="text-xs text-muted-foreground">Create a free M0 cluster or use an existing M10+ cluster</p>
                        </summary>
                        <div className="mt-4 space-y-4">
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1 mb-2">
                                    <HelpCircle className="w-3 h-3" /> Create a free M0 cluster (or M10+ for production)
                                </p>
                                <ol className="list-decimal list-inside space-y-1 text-[10px] text-blue-800 dark:text-blue-300 ml-2">
                                    <li>Go to <a href="https://cloud.mongodb.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">MongoDB Atlas <ExternalLink className="w-3 h-3" /></a></li>
                                    <li>Sign up or log in to your account</li>
                                    <li>Click <strong>"Create"</strong> → <strong>"Cluster"</strong></li>
                                    <li>Select <strong>M0 (Free)</strong> or <strong>M10+</strong> tier</li>
                                    <li>Choose your cloud provider and region</li>
                                    <li>Click <strong>"Create Cluster"</strong></li>
                                    <li>Wait 3-5 minutes for cluster creation</li>
                                    <li>Click <strong>"Connect"</strong> → <strong>"Connect your application"</strong></li>
                                    <li>Copy the connection string (starts with <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">mongodb+srv://</code>)</li>
                                    <li>Replace <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">&lt;password&gt;</code> with your database user password</li>
                                    <li>Paste the complete connection string below</li>
                                </ol>
                                <p className="mt-2 text-[10px] text-blue-800 dark:text-blue-300">
                                    <strong>Note:</strong> Make sure to whitelist your IP address in Atlas Network Access settings, or use <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">0.0.0.0/0</code> for development (not recommended for production).
                                </p>
                            </div>
                        </div>
                    </details>

                    <div className="p-4 rounded-xl bg-card border border-border shadow-sm space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="uri">Cluster Connection String</Label>
                            <Input
                                id="uri"
                                placeholder="mongodb+srv://user:pass@cluster.mongodb.net/"
                                value={localUri}
                                onChange={(e) => {
                                    setLocalUri(e.target.value);
                                    // Clear error when user types
                                    if (errorMap['atlas']) {
                                        setErrorMap(prev => ({ ...prev, atlas: '' }));
                                    }
                                }}
                                disabled={verifiedTools.atlas.verified}
                            />
                            {errorMap['atlas'] && !verifiedTools.atlas.verified && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded text-[10px]">
                                    <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-1">
                                        <AlertCircle className="w-3 h-3" /> Connection Error
                                    </p>
                                    <p className="text-red-600 dark:text-red-300 mb-2">{errorMap['atlas']}</p>
                                    <p className="font-semibold text-red-700 dark:text-red-400 mb-1">Resolution Steps:</p>
                                    <ol className="list-decimal list-inside space-y-1 text-red-600 dark:text-red-300">
                                        <li>Verify your connection string format: <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">mongodb+srv://username:password@cluster.mongodb.net/</code></li>
                                        <li>Check that you replaced <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">&lt;password&gt;</code> with your actual password</li>
                                        <li>Ensure your IP address is whitelisted in Atlas Network Access</li>
                                        <li>Verify your cluster is running (not paused) in Atlas dashboard</li>
                                        <li>Check that your cluster tier is M0 (Free) or higher</li>
                                        <li>Try clicking "Check Connectivity" again</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <p className="text-[11px] text-muted-foreground max-w-md">
                                Provide your SRV string. We will perform a metadata ping to ensure the cluster is responsive and reachable.
                            </p>
                            <Button
                                variant={verifiedTools.atlas.verified ? "outline" : "secondary"}
                                size="sm"
                                disabled={loadingMap['atlas'] || verifiedTools.atlas.verified || !localUri}
                                onClick={() => verifyTool('atlas', 'Atlas')}
                                className="gap-2 shrink-0 min-w-[140px]"
                            >
                                {loadingMap['atlas'] ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldEllipsis className="w-3 h-3" />}
                                {verifiedTools.atlas.verified ? "Cluster Connected" : "Check Connectivity"}
                            </Button>
                        </div>
                        {verifiedTools.atlas.path && (
                            <div className="mt-2 space-y-1">
                                <p className="text-[10px] text-green-600 font-mono font-bold">Status: {verifiedTools.atlas.path}</p>
                                {verifiedTools.atlas.path.includes('MongoDB') && (
                                    <p className="text-[10px] text-muted-foreground">MongoDB Atlas version detected from connection</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. AWS Auth Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b pb-2">
                        <Fingerprint className="w-5 h-5 text-primary" /> 3. Cloud Provider Authentication
                    </h3>

                    <Tabs defaultValue="sso" className="w-full">
                        <TabsList className="w-full mb-4">
                            <TabsTrigger value="sso" className="gap-2"><Fingerprint className="w-4 h-4" /> Identity Center (SSO)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="sso" className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                            <details 
                                className="group"
                                open={showSSOConfig}
                                onToggle={(e) => setShowSSOConfig(e.currentTarget.open)}
                            >
                                <summary className="cursor-pointer space-y-1 hover:opacity-80 transition-opacity">
                                    <p className="text-sm font-bold">Configuring for SSO Profile</p>
                                    <p className="text-xs text-muted-foreground">Fetch session keys from your SA Identity Center account</p>
                                </summary>
                                <div className="mt-4 space-y-4">
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1 mb-2">
                                            <HelpCircle className="w-3 h-3" /> AWS SSO Authentication
                                        </p>
                                        <p className="text-[10px] text-blue-800 dark:text-blue-300 mb-2">
                                            With AWS SSO, credentials are automatically retrieved from your SSO session. Ensure you've logged in:
                                        </p>
                                        <ol className="list-decimal list-inside space-y-1 text-[10px] text-blue-800 dark:text-blue-300">
                                            <li>Ensure AWS CLI is installed and verified above</li>
                                            <li>Run: <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">aws sso login</code> (or <code className="bg-blue-100 dark:bg-blue-900/30 px-1 rounded">aws sso login --profile [your-profile]</code>)</li>
                                            <li>Complete the browser authentication</li>
                                            <li>Credentials will be automatically used by the lab scripts</li>
                                        </ol>
                                    </div>

                                    <div className="bg-background/80 p-3 rounded font-mono text-[11px] border border-border">
                                        <p className="text-primary opacity-70"># A. If you use 'default' profile:</p>
                                        <p>aws sso login</p>
                                        <p className="mt-2 text-primary opacity-70"># B. If you use a named profile:</p>
                                        <p>aws sso login --profile [my-profile]</p>
                                    </div>
                                </div>
                            </details>

                            <div className="mt-2">
                                <details className="group">
                                    <summary className="cursor-pointer text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                                        <HelpCircle className="w-3 h-3" /> Why do I need to specify Identity Center config?
                                    </summary>
                                    <div className="mt-2 p-3 bg-muted/50 rounded-lg text-[10px] text-muted-foreground border border-border">
                                        <p>
                                            Unlike static IAM users (Access Key/Secret), <strong>AWS Identity Center</strong> uses temporary, short-lived credentials.
                                        </p>
                                        <ul className="list-disc pl-4 mt-1 space-y-1">
                                            <li><strong>SSO Session</strong>: Tells the CLI <em>where</em> to authenticate (Start URL & Region).</li>
                                            <li><strong>Profile</strong>: Links that authentication to a specific AWS Account ID and Role (e.g., Administrator).</li>
                                        </ul>
                                        <p className="mt-2">
                                            When you run <code>aws sso login</code>, the CLI opens a browser to verify your identity, then retrieves a temporary token authorized for that specific role.
                                        </p>
                                    </div>
                                </details>
                            </div>


                            {/* AWS SSO Configuration Education */}
                            <div className="mt-4 border-t pt-4">
                                <details className="group">
                                    <summary className="cursor-pointer text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                                        <HelpCircle className="w-3 h-3" /> Don't have SSO configured? See an example `~/.aws/config`
                                    </summary>
                                    <div className="mt-2 p-3 bg-muted/50 rounded-lg text-[10px] space-y-2 border border-border">
                                        <p className="text-muted-foreground">To use AWS SSO, your <code>~/.aws/config</code> file should look like this:</p>
                                        <div className="bg-background p-2 rounded border border-input overflow-x-auto">
                                            <pre className="font-mono text-[9px] text-muted-foreground">
                                                {`[default]
sso_session = my-session
sso_account_id = 979559056307
sso_role_name = Solution-Architects.User
region = eu-central-1
output = json

[sso-session my-session]
sso_start_url = https://d-9067613a84.awsapps.com/start/#
sso_region = us-east-1
sso_registration_scopes = sso:account:access

[profile my-profile]
sso_session = my-session
sso_account_id = 211125542926
sso_role_name = Solution-Architects.User
region = eu-central-1
output = json`}
                                            </pre>
                                        </div>
                                        <p className="text-muted-foreground">
                                            <strong>Key Components:</strong><br />
                                            1. <code>[sso-session]</code>: Defines where to login (Start URL & Region).<br />
                                            2. <code>[profile name]</code>: Links a specific account & role to that session.
                                        </p>
                                    </div>
                                </details>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </CardContent>
            <CardFooter className="bg-primary/5 p-8 border-t">
                <Button
                    className="w-full h-14 text-xl font-bold rounded-xl shadow-lg shadow-primary/20"
                    disabled={!allVerified || !localUri || !localEmail || !localEmail.includes('@') || !firstName || !lastName}
                    onClick={handleFinalize}
                >
                    Finalize & Activate Lab Environment
                </Button>
            </CardFooter>
        </Card >
    );
};
