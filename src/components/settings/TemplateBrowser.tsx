import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { WorkshopTemplate } from '@/types';
import { getContentService } from '@/services/contentService';
import { getCustomTemplates, deleteCustomTemplate } from '@/services/customTemplatesService';
import { Search, Building2, Sparkles, LayoutTemplate, FolderOpen, Trash2, Upload } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

export interface TemplateBrowserProps {
  onSelectTemplate?: (template: WorkshopTemplate) => void;
  /** When provided, enables multi-select: checkboxes and "Use selected" */
  onSelectTemplates?: (templates: WorkshopTemplate[]) => void;
  pageSize?: number;
  /** When provided, show Build Custom Template and Import in the Custom tab */
  onBuildCustom?: () => void;
  onImport?: () => void;
}

const DEFAULT_PAGE_SIZE = 10;

function filterTemplates(templates: WorkshopTemplate[], searchQuery: string): WorkshopTemplate[] {
  if (!searchQuery.trim()) return templates;
  const q = searchQuery.toLowerCase();
  return templates.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.industry && t.industry.toLowerCase().includes(q))
  );
}

/**
 * TemplateBrowser - Browse Predefined (repo) and Custom workshop templates.
 * When creating a session, SA can filter by Predefined vs Custom workshop templates.
 */
export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  onSelectTemplate,
  onSelectTemplates,
  pageSize = DEFAULT_PAGE_SIZE,
  onBuildCustom,
  onImport,
}) => {
  const [predefined, setPredefined] = useState<WorkshopTemplate[]>([]);
  const [custom, setCustom] = useState<WorkshopTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'predefined' | 'custom'>('predefined');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isMultiSelectMode = !!onSelectTemplates;

  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const loadPredefined = useCallback(async () => {
    try {
      const loaded = await getContentService().getTemplates();
      setPredefined(loaded);
    } catch (e) {
      console.error('Failed to load predefined templates:', e);
    }
  }, []);

  const loadCustom = useCallback(() => {
    setCustom(getCustomTemplates());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadPredefined();
      if (!cancelled) loadCustom();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [loadPredefined, loadCustom]);

  const predefinedFiltered = useMemo(() => filterTemplates(predefined, searchQuery), [predefined, searchQuery]);
  const customFiltered = useMemo(() => filterTemplates(custom, searchQuery), [custom, searchQuery]);

  const templatesForTab = activeTab === 'predefined' ? predefinedFiltered : customFiltered;
  const totalPages = Math.max(1, Math.ceil(templatesForTab.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedTemplates = templatesForTab.slice(startIdx, startIdx + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const handleDeleteCustom = (e: React.MouseEvent, templateId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this custom template? This cannot be undone.')) {
      deleteCustomTemplate(templateId);
      loadCustom();
    }
  };

  const toggleTemplateSelection = useCallback((template: WorkshopTemplate) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(template.id)) next.delete(template.id);
      else next.add(template.id);
      return next;
    });
  }, []);

  const selectedTemplates = useMemo(
    () => templatesForTab.filter((t) => selectedIds.has(t.id)),
    [templatesForTab, selectedIds]
  );

  const handleUseSelected = useCallback(() => {
    if (selectedTemplates.length > 0) onSelectTemplates?.(selectedTemplates);
  }, [selectedTemplates, onSelectTemplates]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">Loading templates…</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Browse and Select workshop template</h3>
        <p className="text-sm text-muted-foreground">
          Predefined templates are maintained in the repo. Custom templates are ones you built and saved.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'predefined' | 'custom')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="predefined" className="gap-1.5">
            <LayoutTemplate className="w-4 h-4" />
            Predefined templates
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-1.5">
            <FolderOpen className="w-4 h-4" />
            Custom workshop templates
          </TabsTrigger>
        </TabsList>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, description, or industry…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isMultiSelectMode && selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Button variant="default" size="sm" onClick={handleUseSelected}>
              Use selected ({selectedIds.size})
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-muted-foreground">
              Clear selection
            </Button>
          </div>
        )}

        <TabsContent value="predefined" className="mt-4 space-y-3">
          {predefinedFiltered.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {searchQuery ? 'No predefined templates match your search' : 'No predefined templates available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <TemplateList
              templates={paginatedTemplates}
              total={predefinedFiltered.length}
              startIdx={startIdx}
              pageSize={pageSize}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSelectTemplate={onSelectTemplate}
              onSelectTemplates={onSelectTemplates}
              selectedIds={selectedIds}
              onToggleTemplate={toggleTemplateSelection}
              isCustom={false}
            />
          )}
        </TabsContent>

        <TabsContent value="custom" className="mt-4 space-y-3">
          {(onBuildCustom ?? onImport) && (
            <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-border">
              {onBuildCustom && (
                <Button variant="outline" onClick={onBuildCustom}>
                  Build Custom Template
                </Button>
              )}
              {onImport && (
                <Button variant="outline" size="sm" onClick={onImport}>
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </Button>
              )}
            </div>
          )}
          {customFiltered.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  {searchQuery
                    ? 'No custom templates match your search'
                    : 'No custom templates yet. Use "Build custom template" to create one, then it will appear here.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <TemplateList
              templates={paginatedTemplates}
              total={customFiltered.length}
              startIdx={startIdx}
              pageSize={pageSize}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSelectTemplate={onSelectTemplate}
              onSelectTemplates={onSelectTemplates}
              selectedIds={selectedIds}
              onToggleTemplate={toggleTemplateSelection}
              isCustom={true}
              onDeleteCustom={handleDeleteCustom}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function TemplateList({
  templates,
  total,
  startIdx,
  pageSize,
  totalPages,
  currentPage,
  onPageChange,
  onSelectTemplate,
  onSelectTemplates,
  selectedIds,
  onToggleTemplate,
  isCustom,
  onDeleteCustom,
}: {
  templates: WorkshopTemplate[];
  total: number;
  startIdx: number;
  pageSize: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (p: number) => void;
  onSelectTemplate?: (t: WorkshopTemplate) => void;
  onSelectTemplates?: (t: WorkshopTemplate[]) => void;
  selectedIds?: Set<string>;
  onToggleTemplate?: (t: WorkshopTemplate) => void;
  isCustom: boolean;
  onDeleteCustom?: (e: React.MouseEvent, id: string) => void;
}) {
  const multiSelect = !!(onSelectTemplates && selectedIds && onToggleTemplate);

  return (
    <>
      <div className="text-sm text-muted-foreground">
        Showing {startIdx + 1}–{Math.min(startIdx + pageSize, total)} of {total} template{total !== 1 ? 's' : ''}
        {multiSelect && (
          <span className="ml-2 text-muted-foreground">
            — Select multiple, then use “Use selected” above.
          </span>
        )}
      </div>
      <div className="space-y-3">
        {templates.map((template) => {
          const isSelected = multiSelect && selectedIds!.has(template.id);
          return (
            <Card
              key={template.id}
              className={cn(
                (onSelectTemplate || multiSelect) && 'transition-colors cursor-pointer',
                !multiSelect && onSelectTemplate && 'hover:border-primary/50',
                multiSelect && isSelected && 'border-primary bg-primary/5'
              )}
              onClick={() => {
                if (multiSelect) onToggleTemplate?.(template);
                else onSelectTemplate?.(template);
              }}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-2">
                  {multiSelect && (
                    <div className="flex-shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleTemplate?.(template)}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.labIds.length} Lab{template.labIds.length !== 1 ? 's' : ''}
                      </Badge>
                      {isCustom && (
                        <Badge variant="secondary" className="text-xs">Custom</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.industry && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Building2 className="w-3 h-3" />
                          {template.industry}
                        </Badge>
                      )}
                      {template.gamification?.enabled && (
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Sparkles className="w-3 h-3" />
                          Gamification
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">{template.defaultMode}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isCustom && onDeleteCustom && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => onDeleteCustom(e, template.id)}
                        title="Delete custom template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                    {!multiSelect && onSelectTemplate && (
                      <Button variant="default" size="sm">Select</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); onPageChange(Math.max(1, currentPage - 1)); }}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => totalPages <= 5 || p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <PaginationItem><span className="px-2">…</span></PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                      isActive={currentPage === p}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                </React.Fragment>
              ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); onPageChange(Math.min(totalPages, currentPage + 1)); }}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
}
