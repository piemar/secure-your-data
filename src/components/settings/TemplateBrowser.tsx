import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkshopTemplate } from '@/types';
import { getContentService } from '@/services/contentService';
import { Search, CheckCircle2, Building2, Sparkles } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export interface TemplateBrowserProps {
  onSelectTemplate?: (template: WorkshopTemplate) => void;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * TemplateBrowser - Browse workshop templates with search and pagination.
 */
export const TemplateBrowser: React.FC<TemplateBrowserProps> = ({
  onSelectTemplate,
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
  const [templates, setTemplates] = useState<WorkshopTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const service = getContentService();
      const loaded = await service.getTemplates();
      setTemplates(loaded);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase();
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.industry && t.industry.toLowerCase().includes(q))
    );
  }, [templates, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedTemplates = filteredTemplates.slice(startIdx, startIdx + pageSize);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-8">Loading workshops...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-1">Browse Workshop Templates</h3>
        <p className="text-sm text-muted-foreground">
          Search and select pre-built workshop templates. Click to select.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search workshops by name, description, or industry..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        {paginatedTemplates.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {searchQuery ? 'No workshops match your search' : 'No workshop templates available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {startIdx + 1}–{Math.min(startIdx + pageSize, filteredTemplates.length)} of{' '}
              {filteredTemplates.length} workshop{filteredTemplates.length !== 1 ? 's' : ''}
            </div>
            {paginatedTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => onSelectTemplate?.(template)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {template.labIds.length} Lab{template.labIds.length !== 1 ? 's' : ''}
                        </Badge>
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
                        <Badge variant="outline" className="text-xs">
                          {template.defaultMode}
                        </Badge>
                      </div>
                    </div>
                    {onSelectTemplate && (
                      <Button variant="default" size="sm" className="ml-4">
                        Select
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      className={
                        currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 5) return true;
                      return (
                        p === 1 ||
                        p === totalPages ||
                        (p >= currentPage - 1 && p <= currentPage + 1)
                      );
                    })
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <PaginationItem>
                            <span className="px-2">…</span>
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(p);
                            }}
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
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={
                        currentPage >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
};
