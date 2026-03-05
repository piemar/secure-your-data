import React, { useState, useEffect, useMemo } from 'react';
import { useLab } from '@/context/LabContext';
import { useWorkshopConfig } from '@/context/WorkshopConfigContext';
import { useWorkshopSession } from '@/contexts/WorkshopSessionContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { getWorkshopSession, updateWorkshopSession } from '@/utils/workshopUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, ShieldCheck, Database, HelpCircle, Terminal, Cloud, Layers, Fingerprint, Loader2, AlertTriangle, ExternalLink, ChevronDown, ChevronRight, Copy, Check, PlayCircle } from 'lucide-react';
import { validatorUtils } from '@/utils/validatorUtils';
import { getKeyVaultNamespace } from '@/labs/stepEnhancementRegistry';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { ArchitectureDiagram } from '@/components/workshop/ArchitectureDiagram';
import { LabEnvironmentDiagram } from './LabEnvironmentDiagram';
import { PrerequisitesChecklist } from './PrerequisitesChecklist';
import { runResetCleanup, finishResetProgress } from '@/services/resetCleanup';
import type { CleanupResult } from '@/services/resetCleanup';
import { ResetCleanupStatusDialog, type ResetCleanupDialogPhase } from './ResetCleanupStatusDialog';

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
    { id: 'mongoCryptShared', label: 'mongo_crypt_shared', description: 'Required for automatic encryption (Lab 1 CSFLE and Lab 2 QE). Not needed for explicit-only (e.g. Lab 3 migration).', installCommand: 'Download from MongoDB', downloadUrl: 'https://www.mongodb.com/try/download/enterprise', required: true },
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
    const { activeTemplate, setCurrentLabId } = useWorkshopSession();
    const { setSection } = useNavigation();
    const { runningInContainer } = useWorkshopConfig();

    const defaultMongoUri = runningInContainer ? 'mongodb://mongo:27017' : 'mongodb://127.0.0.1:27017';
    const [phase, setPhase] = useState<SetupPhase>(mongoUri ? 'ready' : 'onboarding');
    const [localUri, setLocalUri] = useState(mongoUri || defaultMongoUri);
    const [uriFromWorkshop, setUriFromWorkshop] = useState(false);
    const [isCheckingPrereqs, setIsCheckingPrereqs] = useState(false);
    const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
    const [cleanupPhase, setCleanupPhase] = useState<ResetCleanupDialogPhase>('confirm');
    const [cleanupResults, setCleanupResults] = useState<CleanupResult[]>([]);
    const [cleanupLoading, setCleanupLoading] = useState(false);
    const [prereqResults, setPrereqResults] = useState<Record<string, { verified: boolean; message: string; path?: string; detectedLocation?: string }>>({});
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
    const [bypassPrereqs, setBypassPrereqs] = useState(false);
    const [cryptSharedManualPath, setCryptSharedManualPath] = useState(
        () => localStorage.getItem('crypt_shared_lib_path') || localStorage.getItem('mongo_crypt_shared_path') || ''
    );
    const [isVerifyingCryptPath, setIsVerifyingCryptPath] = useState(false);
    const [mongoshPathInput, setMongoshPathInput] = useState(() => localStorage.getItem('workshop_mongosh_path') || '');
    const [awsProfileInput, setAwsProfileInput] = useState(() => localStorage.getItem('lab_aws_profile') || '');
    const [awsRegionInput, setAwsRegionInput] = useState(() => localStorage.getItem('lab_aws_region') || '');
    const [awsProfilesList, setAwsProfilesList] = useState<string[]>([]);
    const [awsProfilesLoading, setAwsProfilesLoading] = useState(false);
    const [awsTestLoading, setAwsTestLoading] = useState(false);

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

    // Sync localUri from context when per-user URI loads (e.g. after userEmail is set).
    // Do not set phase to 'ready' here — that happens only when user clicks "Activate Lab Environment".
    useEffect(() => {
        if (mongoUri) setLocalUri(mongoUri);
    }, [mongoUri]);

    // When Docker: default URI to mongo:27017. When local dev with local session: default to 127.0.0.1:27017.
    useEffect(() => {
        const session = getWorkshopSession();
        if (mongoUri) return;
        const useDockerUri = runningInContainer || session?.mongodbSource === 'local';
        if (useDockerUri) {
            const uri = runningInContainer ? 'mongodb://mongo:27017' : 'mongodb://127.0.0.1:27017';
            setLocalUri(uri);
            setUriFromWorkshop(true);
        }
    }, [mongoUri, runningInContainer]);

    // Auto-detect AWS profile and region when field is empty (so "default" is filled without running full Check Prerequisites)
    useEffect(() => {
        const currentProfile = localStorage.getItem('lab_aws_profile') || '';
        const currentRegion = localStorage.getItem('lab_aws_region') || '';
        if (currentProfile.trim() && currentRegion.trim()) return;
        let cancelled = false;
        (async () => {
            try {
                const result = await validatorUtils.checkToolInstalled('AWS CLI');
                if (cancelled || !result.success) return;
                if (result.detectedProfile && !currentProfile.trim()) {
                    localStorage.setItem('lab_aws_profile', result.detectedProfile);
                    setAwsProfileInput(result.detectedProfile);
                }
                if (result.detectedRegion && !currentRegion.trim()) {
                    localStorage.setItem('lab_aws_region', result.detectedRegion);
                    setAwsRegionInput(result.detectedRegion);
                }
            } catch {
                // ignore
            }
        })();
        return () => { cancelled = true; };
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
        if (!localUri?.trim()) {
            toast.error('Enter MongoDB URI first (in the MongoDB connection section above).');
            return;
        }
        setIsCheckingPrereqs(true);
        const results: Record<string, { verified: boolean; message: string; path?: string; detectedLocation?: string }> = {};

        for (const prereq of PREREQUISITES) {
            try {
                // mongo_crypt_shared: user path first, then auto-detect; use checkMongoCryptShared for detectedLocation
                if (prereq.id === 'mongoCryptShared') {
                    const storedPath = (localStorage.getItem('crypt_shared_lib_path') || localStorage.getItem('mongo_crypt_shared_path') || '').trim();
                    const result = await validatorUtils.checkMongoCryptShared(storedPath || undefined);
                    if (result.success && result.path) {
                        if (!storedPath) localStorage.setItem('crypt_shared_lib_path', result.path);
                        setCryptSharedManualPath(result.path);
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
                        if (prereq.id === 'awsCli') {
                            const currentProfile = localStorage.getItem('lab_aws_profile') || '';
                            const currentRegion = localStorage.getItem('lab_aws_region') || '';
                            if (result.detectedProfile && !currentProfile.trim()) {
                                localStorage.setItem('lab_aws_profile', result.detectedProfile);
                                setAwsProfileInput(result.detectedProfile);
                                toast.success(`AWS profile set to: ${result.detectedProfile}`);
                            }
                            if (result.detectedRegion && !currentRegion.trim()) {
                                localStorage.setItem('lab_aws_region', result.detectedRegion);
                                setAwsRegionInput(result.detectedRegion);
                                toast.success(`AWS region set to: ${result.detectedRegion}`);
                            }
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
                    const atlasResult = await validatorUtils.checkKeyVault(localUri, getKeyVaultNamespace());
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
        // Sync detected mongo_crypt_shared path into the input field (like mongosh / AWS)
        const cryptSharedPath = results['mongoCryptShared']?.path || verifiedTools['mongoCryptShared']?.path;
        if (cryptSharedPath) {
            setCryptSharedManualPath(cryptSharedPath);
        }

        const requiredPassed = PREREQUISITES.filter(p => p.required).every(p => results[p.id]?.verified);
        if (requiredPassed) {
            toast.success('All required prerequisites verified!');
        } else {
            toast.warning('Some prerequisites are missing. You can install them or continue anyway.');
        }
    };

    const handleReset = () => {
        setCleanupResults([]);
        setCleanupPhase('confirm');
        setCleanupDialogOpen(true);
    };

    const handleConfirmReset = () => {
        setCleanupPhase('loading');
        setCleanupLoading(true);
        setCleanupResults([]);
        runResetCleanup()
            .then((results) => {
                setCleanupResults(results);
                setCleanupPhase('done');
                setCleanupLoading(false);
            })
            .catch(() => {
                setCleanupResults([{ item: 'Cleanup', status: 'error', message: 'Unexpected error' }]);
                setCleanupPhase('done');
                setCleanupLoading(false);
            });
    };

    const handleCleanupDialogClose = () => {
        setCleanupDialogOpen(false);
        void finishResetProgress(userEmail ?? undefined, resetProgress);
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
            // Do not write atlasConnectionString to shared session; URI is per-user only
        });
        setAwsCredentials({
            accessKeyId: '',
            secretAccessKey: '',
            keyArn: '',
            region: awsRegionInput.trim() || localStorage.getItem('lab_aws_region') || 'eu-central-1'
        });
        setPhase('ready');
        toast.success("Environment Activated! Ready for Lab 1.");
    };

    const requiredVerified = verifiedTools.awsCli.verified && verifiedTools.mongosh.verified && verifiedTools.node.verified && verifiedTools.npm.verified;
    const allVerified = requiredVerified || bypassPrereqs;
    const hasAtlasConnection = verifiedTools.atlas.verified || prereqResults['atlas']?.verified;

    const overrideByPrereqId = useMemo(() => ({
      atlas: (
        <div className="space-y-2">
          <Input
            id="uri"
            placeholder={getWorkshopSession()?.mongodbSource === 'local' ? 'mongodb://mongo:27017' : 'mongodb+srv://user:pass@cluster.mongodb.net/'}
            value={localUri}
            onChange={(e) => { setLocalUri(e.target.value); setUriFromWorkshop(false); }}
            onBlur={() => { const v = localUri.trim(); if (v) setMongoUri(v); }}
            className="font-mono text-xs"
          />
          {uriFromWorkshop && (
            <div className="flex flex-col gap-0.5 text-xs text-blue-600">
              <div className="flex items-center gap-2">
                <Database className="w-3 h-3" />
                <span>Pre-configured from workshop session ({getWorkshopSession()?.mongodbSource === 'local' ? 'Local Docker' : 'Atlas'})</span>
              </div>
              {getWorkshopSession()?.mongodbSource === 'local' && (
                <span className="text-muted-foreground text-[11px]">Lab Run uses this URI. In scripts use <code className="bg-muted px-0.5 rounded">process.env.MONGODB_URI</code>. From your host: <code className="bg-muted px-0.5 rounded">mongosh &quot;mongodb://root:example@localhost:27017/?replicaSet=rs0&quot;</code></span>
              )}
            </div>
          )}
          {hasAtlasConnection && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 className="w-3 h-3" />
              <span>Atlas connection verified.</span>
            </div>
          )}
          <Collapsible>
            <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              {getWorkshopSession()?.mongodbSource === 'local' ? 'Using Atlas instead?' : 'Need help getting a connection string?'}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border text-xs space-y-2">
                <p className="text-muted-foreground">Use an Atlas M10+ cluster for encryption support. Paste your connection string above.</p>
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
      ),
      mongoCryptShared: (
        <div className="space-y-2 mt-1">
          <p className="text-xs text-muted-foreground">
            Set automatically when you run <strong>Check Prerequisites</strong>. Override below if the library is in a custom location (e.g. <code className="bg-muted px-1 rounded">mongo_crypt_v1.dylib</code> or <code className="bg-muted px-1 rounded">mongo_crypt_v1.so</code>).
          </p>
          {(verifiedTools['mongoCryptShared']?.verified || prereqResults['mongoCryptShared']?.verified) && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
              <span>
                {(verifiedTools['mongoCryptShared']?.detectedLocation ?? prereqResults['mongoCryptShared']?.detectedLocation)
                  ? `✓ Found in ${verifiedTools['mongoCryptShared']?.detectedLocation ?? prereqResults['mongoCryptShared']?.detectedLocation}`
                  : 'Library detected.'}
              </span>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="/path/to/mongo_crypt_v1.dylib"
              value={cryptSharedManualPath}
              onChange={(e) => setCryptSharedManualPath(e.target.value)}
              onBlur={() => { if (cryptSharedManualPath.trim()) localStorage.setItem('crypt_shared_lib_path', cryptSharedManualPath.trim()); }}
              className="font-mono text-xs"
            />
            <Button size="sm" variant="secondary" onClick={verifyCryptSharedPath} disabled={isVerifyingCryptPath || !cryptSharedManualPath.trim()}>
              {isVerifyingCryptPath ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Verify'}
            </Button>
          </div>
        </div>
      ),
      mongosh: (
        <div className="space-y-2 mt-1">
          <p className="text-xs text-muted-foreground">
            Set automatically when you run <strong>Check Prerequisites</strong> (e.g. <code className="bg-muted px-1 rounded">/opt/homebrew/bin/mongosh</code>). Override below only if Run still fails.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="/opt/homebrew/bin/mongosh"
              value={mongoshPathInput}
              onChange={(e) => setMongoshPathInput(e.target.value)}
              onBlur={() => { const v = mongoshPathInput.trim(); v ? localStorage.setItem('workshop_mongosh_path', v) : localStorage.removeItem('workshop_mongosh_path'); }}
              className="font-mono text-xs"
            />
            <Button size="sm" variant="secondary" onClick={() => { const v = mongoshPathInput.trim(); if (v) { localStorage.setItem('workshop_mongosh_path', v); toast.success('mongosh path saved.'); } else { localStorage.removeItem('workshop_mongosh_path'); toast.success('Cleared.'); } }}>
              Save
            </Button>
          </div>
        </div>
      ),
      awsCli: (
        <div className="space-y-3 mt-1">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-foreground">
              Required: set your profile and region below, then <strong>Test AWS</strong> or run <strong>Check Prerequisites</strong> above to validate. Labs will fail without a working AWS connection.
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Choose a profile from your config, or type any profile name.
            </p>
            {runningInContainer && (
              <Collapsible className="group mb-2">
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <ChevronRight className="w-3 h-3 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                    Windows: set path for Docker
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 pl-4 border-l-2 border-muted space-y-3">
                  <p className="text-xs text-muted-foreground">
                    On Windows, you must set <code className="bg-muted px-0.5 rounded">AWS_CONFIG_PATH</code> before starting <code className="bg-muted px-0.5 rounded">docker compose</code> so the container can mount your .aws folder. Use one of the options below.
                  </p>
                  <p className="text-xs font-medium text-foreground">PowerShell:</p>
                  <pre className="text-xs font-mono bg-muted p-2 rounded border overflow-x-auto whitespace-pre-wrap">
{`$env:AWS_CONFIG_PATH = "$env:USERPROFILE\\.aws"
docker compose build --no-cache app
docker compose up app --force-recreate`}
                  </pre>
                  <p className="text-xs font-medium text-foreground">Command Prompt (CMD):</p>
                  <pre className="text-xs font-mono bg-muted p-2 rounded border overflow-x-auto whitespace-pre-wrap">
{`set AWS_CONFIG_PATH=%USERPROFILE%\\.aws
docker compose build --no-cache app
docker compose up app --force-recreate`}
                  </pre>
                  <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                    If setting <code className="bg-muted px-0.5 rounded">AWS_CONFIG_PATH</code> in the environment does not work, you can set the path directly in <code className="bg-muted px-0.5 rounded">docker-compose.yml</code> at the volume line (around line 27), e.g. <code className="bg-muted px-0.5 rounded">C:\\Users\\YourName\\.aws:/root/.aws</code>, as a workaround.
                  </p>
                </CollapsibleContent>
              </Collapsible>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <Input placeholder="Leave empty for default, or enter profile name" value={awsProfileInput} onChange={(e) => setAwsProfileInput(e.target.value)} onBlur={() => { const v = awsProfileInput.trim(); v ? localStorage.setItem('lab_aws_profile', v) : localStorage.removeItem('lab_aws_profile'); }} className="font-mono text-xs w-[200px] min-w-0" />
              <Popover onOpenChange={(open) => { if (open && awsProfilesList.length === 0) { setAwsProfilesLoading(true); validatorUtils.listAwsProfiles().then((r) => { setAwsProfilesList(r.profiles || []); setAwsProfilesLoading(false); if (!r.success && r.message) toast.error(r.message); }); } }}>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" disabled={awsProfilesLoading} className="gap-1">
                    {awsProfilesLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronDown className="w-3 h-3" />}
                    Choose from config
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0" align="start">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No profiles found. Run aws configure list-profiles locally to verify.</CommandEmpty>
                      <CommandGroup>
                        {awsProfilesList.map((p) => (
                          <CommandItem key={p} value={p} onSelect={() => { setAwsProfileInput(p); localStorage.setItem('lab_aws_profile', p); toast.success(`Using profile: ${p}`); }}>
                            {p}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button size="sm" variant="secondary" onClick={() => { const v = awsProfileInput.trim(); if (v) { localStorage.setItem('lab_aws_profile', v); toast.success(`Using AWS profile: ${v}`); } else { localStorage.removeItem('lab_aws_profile'); toast.success('Cleared.'); } }}>Save</Button>
              <Button size="sm" variant="secondary" disabled={awsTestLoading} onClick={async () => { setAwsTestLoading(true); const profile = awsProfileInput.trim() || undefined; const result = await validatorUtils.testAwsAuth(profile); setAwsTestLoading(false); if (result.success) toast.success(result.message); else toast.error(result.message); }} className="gap-1">
                {awsTestLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Test AWS
              </Button>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Set the region for KMS and lab code (e.g. eu-west-2, us-east-1). Run Check Prerequisites to auto-detect.
            </p>
            <div className="flex gap-2">
              <Input placeholder="e.g. eu-central-1 (or leave empty for auto)" value={awsRegionInput} onChange={(e) => setAwsRegionInput(e.target.value)} onBlur={() => { const v = awsRegionInput.trim(); v ? localStorage.setItem('lab_aws_region', v) : localStorage.removeItem('lab_aws_region'); }} className="font-mono text-xs" />
              <Button size="sm" variant="secondary" onClick={() => { const v = awsRegionInput.trim(); if (v) { localStorage.setItem('lab_aws_region', v); toast.success(`AWS region set to: ${v}`); } else { localStorage.removeItem('lab_aws_region'); toast.success('Cleared.'); } }}>Save</Button>
            </div>
          </div>
        </div>
      ),
    }), [localUri, uriFromWorkshop, hasAtlasConnection, cryptSharedManualPath, isVerifyingCryptPath, mongoshPathInput, awsProfileInput, awsRegionInput, awsProfilesList, awsProfilesLoading, awsTestLoading, verifiedTools, prereqResults, getWorkshopSession()?.mongodbSource, runningInContainer]);

    if (phase === 'ready') {
        return (
            <>
            <Card className="max-w-2xl mx-auto mt-10 border-primary/20 bg-primary/5 shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                        <CardTitle>Environment Ready</CardTitle>
                    </div>
                    <CardDescription>All prerequisites verified. Your encryption journey begins now.</CardDescription>
                    <div className="flex gap-2 pt-3">
                        <Button variant="outline" className="flex-1" onClick={() => setPhase('onboarding')}>Update Environment</Button>
                        <Button variant="destructive" className="flex-1" onClick={handleReset}>Reset All Progress</Button>
                    </div>
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

                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded border border-dashed space-y-3">
                        <p className="font-semibold flex items-center gap-1 mb-1"><HelpCircle className="w-3 h-3" /> Get Started:</p>
                        <p>Open <strong>Lab 1: CSFLE Fundamentals</strong> from the sidebar to create your first Customer Master Key (CMK).</p>
                        <Button
                            className="w-full gap-2"
                            onClick={() => {
                                const firstLabId = activeTemplate?.labIds?.[0] ?? 'lab-csfle-fundamentals';
                                setCurrentLabId(firstLabId);
                                setSection('lab');
                            }}
                        >
                            <PlayCircle className="w-4 h-4" />
                            Start Lab 1: CSFLE Fundamentals
                        </Button>
                    </div>

                    {/* MongoDB Encryption Architecture – optional, default collapsed */}
                    <Collapsible defaultOpen={false}>
                        <CollapsibleTrigger asChild>
                            <button type="button" className="group flex items-center gap-2 text-sm text-primary hover:text-primary/90 transition-colors">
                                <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                                MongoDB Encryption Architecture
                            </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <div className="pt-3">
                                <ArchitectureDiagram variant="overview" />
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                </CardContent>
            </Card>
            <ResetCleanupStatusDialog
                open={cleanupDialogOpen}
                onOpenChange={setCleanupDialogOpen}
                phase={cleanupPhase}
                results={cleanupResults}
                loading={cleanupLoading}
                onConfirm={handleConfirmReset}
                onClose={handleCleanupDialogClose}
            />
            </>
        );
    }

    return (
        <>
        <Card className="max-w-3xl mx-auto mt-6 shadow-xl overflow-hidden border-none bg-background/50 backdrop-blur-sm">
            <div className="h-1.5 bg-primary w-full" />
            <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Lab Environment Setup</CardTitle>
                        <CardDescription>Verify your tools and connect to MongoDB (Atlas or Local Docker)</CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4 px-6">
                {/* User / AWS context at top (screenshot 4) */}
                {(attendeeName || userEmail) && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                        <Fingerprint className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attendeeName || 'Attendee'}</p>
                            <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            AWS suffix: <span className="font-mono text-primary">{verifiedTools['suffix']?.path || '...'}</span>
                            <span className="block mt-0.5 text-[11px] opacity-90">Dots and special characters are replaced with a dash for AWS KMS compatibility.</span>
                        </div>
                    </div>
                )}

                {/* Single action: Check Prerequisites until ready, then Activate Lab Environment – same width as What You'll Need below */}
                <Button
                    size="default"
                    variant="default"
                    className="w-full gap-2 font-semibold rounded-lg min-w-0"
                    disabled={!localUri?.trim() || isCheckingPrereqs}
                    onClick={allVerified && localUri ? handleFinalize : checkAllPrerequisites}
                    title={!localUri?.trim() ? 'Enter MongoDB URI in What You\'ll Need first (MongoDB connection)' : undefined}
                >
                    {isCheckingPrereqs ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Checking...</>
                    ) : allVerified && localUri ? (
                        <><PlayCircle className="w-4 h-4" />Activate Lab Environment</>
                    ) : !localUri?.trim() ? (
                        <><ShieldCheck className="w-4 h-4" />Enter MongoDB connection string</>
                    ) : (
                        <><ShieldCheck className="w-4 h-4" />Check Prerequisites</>
                    )}
                </Button>

                {/* What You'll Need: checklist with overrides + single "Show details" for installation instructions (same width as button above) */}
                <PrerequisitesChecklist
                    prerequisites={PREREQUISITES}
                    verifiedTools={verifiedTools}
                    overrideByPrereqId={overrideByPrereqId}
                    mongodbSource={getWorkshopSession()?.mongodbSource}
                    runningInContainer={runningInContainer}
                />

                {/* Architecture Overview – default collapsed, light green toggle like other links */}
                <Collapsible defaultOpen={false}>
                    <CollapsibleTrigger asChild>
                        <button type="button" className="group flex items-center gap-2 text-sm text-primary hover:text-primary/90 transition-colors">
                            <ChevronRight className="w-4 h-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                            How it works (architecture diagram)
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="pt-3">
                            <LabEnvironmentDiagram />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

            </CardContent>

            <CardFooter className="px-6 pt-4 pb-6 border-0 bg-transparent">
                <Button
                    variant="default"
                    className="w-full h-12 text-base font-semibold rounded-lg gap-2"
                    disabled={!localUri?.trim() || isCheckingPrereqs}
                    onClick={allVerified && localUri ? handleFinalize : checkAllPrerequisites}
                    title={!localUri?.trim() ? 'Enter MongoDB URI in What You\'ll Need first (MongoDB connection)' : undefined}
                >
                    {isCheckingPrereqs ? (
                        <><Loader2 className="w-5 h-5 animate-spin" />Checking...</>
                    ) : allVerified && localUri ? (
                        <><PlayCircle className="w-5 h-5" />Activate Lab Environment</>
                    ) : !localUri?.trim() ? (
                        <><ShieldCheck className="w-5 h-5" />Enter MongoDB connection string</>
                    ) : (
                        <><ShieldCheck className="w-5 h-5" />Check Prerequisites</>
                    )}
                </Button>
            </CardFooter>
        </Card>
        <ResetCleanupStatusDialog
            open={cleanupDialogOpen}
            onOpenChange={setCleanupDialogOpen}
            phase={cleanupPhase}
            results={cleanupResults}
            loading={cleanupLoading}
            onConfirm={handleConfirmReset}
            onClose={handleCleanupDialogClose}
        />
        </>
    );
};
