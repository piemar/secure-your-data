import React, { useState, useEffect } from 'react';
import { Package, CheckCircle2, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface Prerequisite {
  id: string;
  label: string;
  description: string;
  required: boolean;
  downloadUrl?: string;
  setupInstructions?: string[];
}

interface PrerequisitesChecklistProps {
  prerequisites: Prerequisite[];
  verifiedTools: Record<string, { verified: boolean; path: string }>;
}

const STORAGE_KEY = 'workshop_prereq_checklist';

// Extended prerequisites with setup instructions
const EXTENDED_PREREQUISITES: Prerequisite[] = [
  {
    id: 'atlas',
    label: 'MongoDB Atlas Cluster (M10+)',
    description: 'A running MongoDB Atlas cluster with M10 tier or higher for encryption support',
    required: true,
    downloadUrl: 'https://cloud.mongodb.com/',
    setupInstructions: [
      '1. Go to cloud.mongodb.com and sign in or create an account',
      '2. Create a new project or select an existing one',
      '3. Click "Build a Database" and select M10 or higher tier',
      '4. Choose your cloud provider and region',
      '5. Set up database user credentials',
      '6. Add your IP address to the network access list',
      '7. Copy your connection string from "Connect" → "Drivers"'
    ]
  },
  {
    id: 'node',
    label: 'Node.js v18+',
    description: 'JavaScript runtime for running lab scripts',
    required: true,
    downloadUrl: 'https://nodejs.org/',
    setupInstructions: [
      'macOS: brew install node',
      'Windows: Download installer from nodejs.org',
      'Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs',
      'Verify: node --version'
    ]
  },
  {
    id: 'npm',
    label: 'npm',
    description: 'Package manager (included with Node.js)',
    required: true,
    setupInstructions: [
      'npm is automatically installed with Node.js',
      'Verify: npm --version'
    ]
  },
  {
    id: 'awsCli',
    label: 'AWS CLI v2 + SSO',
    description: 'AWS Command Line Interface with SSO configured for KMS operations',
    required: true,
    downloadUrl: 'https://aws.amazon.com/cli/',
    setupInstructions: [
      '── Install AWS CLI ──',
      'macOS: brew install awscli',
      'Windows: Download MSI from aws.amazon.com/cli',
      'Linux: curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install',
      '',
      '── Configure SSO ──',
      '1. Run: aws configure sso',
      '2. Enter your SSO start URL (e.g., https://your-org.awsapps.com/start)',
      '3. Enter your SSO region (e.g., eu-central-1)',
      '4. Select your AWS account and role when prompted',
      '5. Choose a profile name (e.g., "workshop" or "default")',
      '',
      '── Login to SSO ──',
      'aws sso login --profile workshop',
      '# Or if using default profile:',
      'aws sso login',
      '',
      '── Verify SSO Session ──',
      'aws sts get-caller-identity --profile workshop',
      '# Should show your account ID and role'
    ]
  },
  {
    id: 'mongosh',
    label: 'mongosh',
    description: 'MongoDB Shell for database operations',
    required: true,
    downloadUrl: 'https://www.mongodb.com/try/download/shell',
    setupInstructions: [
      'macOS: brew install mongosh',
      'Windows: Download from mongodb.com/try/download/shell',
      'Linux: See mongodb.com for package instructions',
      'Verify: mongosh --version',
      '',
      '── Multiline Tip ──',
      'Use the ".editor" command to paste multiline scripts without syntax errors. Press Ctrl+D to execute.'
    ]
  },
  {
    id: 'mongoCryptShared',
    label: 'mongo_crypt_shared',
    description: 'Shared library for Queryable Encryption (Lab 2)',
    required: false,
    downloadUrl: 'https://www.mongodb.com/docs/manual/core/queryable-encryption/reference/shared-library/',
    setupInstructions: [
      '1. Go to MongoDB Download Center',
      '2. Select "Crypt Shared Library" for your OS',
      '3. Download and extract the archive',
      '4. Note the path to mongo_crypt_v1.so (or .dylib on macOS)',
      '5. Set in your scripts: cryptSharedLibPath: "/path/to/mongo_crypt_v1.so"'
    ]
  }
];

export const PrerequisitesChecklist: React.FC<PrerequisitesChecklistProps> = ({
  prerequisites,
  verifiedTools
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Load checked state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCheckedItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse prereq checklist', e);
      }
    }
  }, []);

  // Save checked state to localStorage
  const handleCheck = (id: string, checked: boolean) => {
    const updated = { ...checkedItems, [id]: checked };
    setCheckedItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Use passed prerequisites (cloud-specific from LabSetupWizard)
  const allPrereqs = prerequisites;
  const requiredPrereqs = allPrereqs.filter(p => p.required);
  const optionalPrereqs = allPrereqs.filter(p => !p.required);

  const renderPrereq = (prereq: Prerequisite) => {
    const isVerified = verifiedTools[prereq.id]?.verified;
    const isChecked = checkedItems[prereq.id] || isVerified;
    const isExpanded = expandedItems[prereq.id];
    const hasInstructions = prereq.setupInstructions && prereq.setupInstructions.length > 0;

    return (
      <div key={prereq.id} className="py-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id={prereq.id}
            checked={isChecked}
            onCheckedChange={(checked) => handleCheck(prereq.id, !!checked)}
            className="mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <label
                htmlFor={prereq.id}
                className={cn(
                  "font-medium text-sm cursor-pointer",
                  isChecked && "text-green-600 line-through opacity-70"
                )}
              >
                {prereq.label}
              </label>
              {isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              )}
              {prereq.downloadUrl && (
                <a
                  href={prereq.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{prereq.description}</p>

            {/* Setup Instructions Collapsible */}
            {hasInstructions && (
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(prereq.id)}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-primary hover:underline mt-1">
                    {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {isExpanded ? 'Hide setup instructions' : 'Show setup instructions'}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="space-y-1">
                      {prereq.setupInstructions!.map((instruction, idx) => (
                        <div key={idx} className={cn(
                          "text-xs font-mono",
                          instruction.startsWith('──')
                            ? "font-semibold text-foreground mt-2 first:mt-0"
                            : instruction === ''
                              ? "h-1"
                              : instruction.startsWith('#')
                                ? "text-muted-foreground italic"
                                : "text-muted-foreground"
                        )}>
                          {instruction.startsWith('──') ? (
                            <span className="font-semibold">{instruction}</span>
                          ) : instruction.startsWith('#') ? (
                            <span>{instruction}</span>
                          ) : instruction !== '' ? (
                            <code className="block p-1 bg-background rounded">{instruction}</code>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </div>
    );
  };

  const completedRequired = requiredPrereqs.filter(p => checkedItems[p.id] || verifiedTools[p.id]?.verified).length;
  const totalRequired = requiredPrereqs.length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            What You'll Need
          </span>
          <span className={cn(
            "text-xs font-normal px-2 py-1 rounded-full",
            completedRequired === totalRequired
              ? "bg-green-500/10 text-green-600"
              : "bg-muted text-muted-foreground"
          )}>
            {completedRequired}/{totalRequired} required
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4">
          Check off each item as you complete the setup. Click "Show setup instructions" for detailed guidance.
        </p>

        {/* Required */}
        <div className="mb-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Required
          </h4>
          <div className="divide-y divide-border/50">
            {requiredPrereqs.map(renderPrereq)}
          </div>
        </div>

        {/* Optional */}
        {optionalPrereqs.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Optional (for Lab 2)
            </h4>
            <div className="divide-y divide-border/50">
              {optionalPrereqs.map(renderPrereq)}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 p-2 bg-muted/30 rounded border border-border/50">
          💡 Use the checkboxes to track your progress. Click "Check Prerequisites" below to auto-verify installed tools.
        </p>
      </CardContent>
    </Card>
  );
};
