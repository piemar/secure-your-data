import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Code, Database, Zap } from 'lucide-react';
import { WorkshopCompetitorScenario } from '@/types';
import { cn } from '@/lib/utils';
import { CodeBlock } from '@/components/ui/code-block';

interface CompetitorComparisonViewProps {
  scenario: WorkshopCompetitorScenario;
}

export const CompetitorComparisonView: React.FC<CompetitorComparisonViewProps> = ({
  scenario
}) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string | 'mongodb'>('mongodb');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" />
          Implementation Comparison
        </CardTitle>
        <CardDescription>
          Compare MongoDB's approach with alternative implementations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedCompetitor} onValueChange={(v) => setSelectedCompetitor(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mongodb" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              MongoDB
            </TabsTrigger>
            {scenario.competitorImplementations.map((comp, idx) => (
              <TabsTrigger 
                key={comp.competitorId} 
                value={comp.competitorId}
                className="flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {comp.title.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* MongoDB Implementation */}
          <TabsContent value="mongodb" className="mt-4 space-y-4">
            <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="flex items-start gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                    MongoDB Implementation
                  </h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-line">
                    {scenario.mongodbDescription}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Competitor Implementations */}
          {scenario.competitorImplementations.map((competitor) => (
            <TabsContent key={competitor.competitorId} value={competitor.competitorId} className="mt-4 space-y-4">
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-700 dark:text-amber-400 mb-2">
                      {competitor.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {competitor.description}
                    </p>

                    {/* Code Snippets */}
                    {competitor.codeSnippets && competitor.codeSnippets.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {competitor.codeSnippets.map((snippet, idx) => (
                          <div key={idx} className="space-y-1">
                            {snippet.description && (
                              <p className="text-xs text-muted-foreground italic">
                                {snippet.description}
                              </p>
                            )}
                            <CodeBlock
                              code={snippet.code}
                              language={snippet.language}
                              filename={snippet.description || `${competitor.competitorId}.${snippet.language}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Pain Points */}
              {competitor.painPoints && competitor.painPoints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Challenges & Limitations
                  </h4>
                  <ul className="space-y-2">
                    {competitor.painPoints.map((painPoint, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-amber-500 mt-1">•</span>
                        <span>{painPoint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Side-by-Side Comparison Summary */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
          <h4 className="font-semibold text-sm mb-3">Quick Comparison</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="font-medium mb-2 text-green-600">MongoDB</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>✓ Field-level encryption</li>
                <li>✓ Queryable encryption</li>
                <li>✓ Multiple KMS support</li>
                <li>✓ Zero-trust architecture</li>
              </ul>
            </div>
            {scenario.competitorImplementations.map((comp) => (
              <div key={comp.competitorId}>
                <p className="font-medium mb-2 text-amber-600">{comp.title.split(' ')[0]}</p>
                <ul className="space-y-1 text-muted-foreground">
                  {comp.painPoints?.slice(0, 4).map((point, idx) => (
                    <li key={idx}>✗ {point.split('.')[0]}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
