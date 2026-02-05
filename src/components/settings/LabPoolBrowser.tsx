import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { WorkshopLabDefinition, WorkshopMode, WorkshopTopic } from '@/types';
import { PovCapability } from '@/types/pov-capabilities';
import { getContentService } from '@/services/contentService';
import { Plus, Search, Clock, Filter, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

const DEFAULT_PAGE_SIZE = 10;

interface LabPoolBrowserProps {
  selectedTopicIds?: string[];
  selectedMode?: WorkshopMode;
  selectedLabIds?: string[];
  onAddLab?: (labId: string) => void;
  /** When provided, enables multi-select mode: checkboxes, Select All, Test Selected */
  onTestLabs?: (labIds: string[]) => void;
  filterByCapabilities?: string[]; // POV capability IDs to filter by
  pageSize?: number;
}

/**
 * LabPoolBrowser - Browse all available labs by topic/capability.
 *
 * Allows moderators to browse the full pool of available labs,
 * filter by topic, mode, or POV capabilities, and add labs to their selection.
 */
export const LabPoolBrowser: React.FC<LabPoolBrowserProps> = ({
  selectedTopicIds = [],
  selectedMode,
  selectedLabIds = [],
  onAddLab,
  onTestLabs,
  filterByCapabilities = [],
  pageSize = DEFAULT_PAGE_SIZE,
}) => {
  const [allLabs, setAllLabs] = useState<WorkshopLabDefinition[]>([]);
  const [allTopics, setAllTopics] = useState<WorkshopTopic[]>([]);
  const [allCapabilities, setAllCapabilities] = useState<PovCapability[]>([]);
  const [filteredLabs, setFilteredLabs] = useState<WorkshopLabDefinition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [capabilityFilter, setCapabilityFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedForTest, setSelectedForTest] = useState<Set<string>>(new Set());

  const isMultiSelectMode = !!onTestLabs;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    allLabs,
    searchQuery,
    topicFilter,
    capabilityFilter,
    selectedMode,
    selectedTopicIds,
    filterByCapabilities,
    selectedLabIds,
    isMultiSelectMode,
  ]);

  const loadData = async () => {
    try {
      const contentService = getContentService();
      const [labs, topics, capabilities] = await Promise.all([
        contentService.getLabs(),
        contentService.getTopics(),
        contentService.getPovCapabilities(),
      ]);
      setAllLabs(labs);
      setAllTopics(topics);
      setAllCapabilities(capabilities);
    } catch (error) {
      console.error('Failed to load lab pool data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allLabs];

    // Filter by selected topics (if provided)
    if (selectedTopicIds.length > 0) {
      filtered = filtered.filter((lab) => selectedTopicIds.includes(lab.topicId));
    }

    // Filter by topic filter dropdown
    if (topicFilter !== 'all') {
      filtered = filtered.filter((lab) => lab.topicId === topicFilter);
    }

    // Filter by mode
    if (selectedMode) {
      filtered = filtered.filter((lab) => !lab.modes || lab.modes.includes(selectedMode));
    }

    // Filter by POV capabilities (from props)
    if (filterByCapabilities.length > 0) {
      filtered = filtered.filter(
        (lab) =>
          lab.povCapabilities &&
          lab.povCapabilities.some((cap) => filterByCapabilities.includes(cap)),
      );
    }

    // Filter by capability filter dropdown
    if (capabilityFilter !== 'all') {
      filtered = filtered.filter(
        (lab) => lab.povCapabilities && lab.povCapabilities.includes(capabilityFilter),
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lab) =>
          lab.title.toLowerCase().includes(query) ||
          lab.description.toLowerCase().includes(query) ||
          lab.tags?.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // Exclude already selected labs (only when adding to template, not in multi-select test mode)
    if (!isMultiSelectMode && selectedLabIds.length > 0) {
      filtered = filtered.filter((lab) => !selectedLabIds.includes(lab.id));
    }

    setFilteredLabs(filtered);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, topicFilter, capabilityFilter, selectedTopicIds, filterByCapabilities]);

  const totalPages = Math.max(1, Math.ceil(filteredLabs.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedLabs = filteredLabs.slice(startIdx, startIdx + pageSize);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-700 dark:text-green-400';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400';
      case 'advanced':
        return 'bg-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/20';
    }
  };

  const getTopicName = (topicId: string): string => {
    return allTopics.find((t) => t.id === topicId)?.name || topicId;
  };

  if (loading) {
    return <div className="text-center text-muted-foreground py-4">Loading lab pool...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Browse All Labs
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Search and filter the complete lab library by topic, capability, or keywords.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search labs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Select value={topicFilter} onValueChange={setTopicFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {allTopics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">POV Capability</label>
              <Select value={capabilityFilter} onValueChange={setCapabilityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Capabilities</SelectItem>
                  {allCapabilities.map((cap) => (
                    <SelectItem key={cap.id} value={cap.id}>
                      {cap.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Multi-select actions */}
      {isMultiSelectMode && filteredLabs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const all = new Set(filteredLabs.map((l) => l.id));
              setSelectedForTest(all);
            }}
          >
            <CheckSquare className="w-4 h-4 mr-1" />
            Select All ({filteredLabs.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedForTest(new Set())}
          >
            <Square className="w-4 h-4 mr-1" />
            Clear Selection
          </Button>
          {selectedForTest.size > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                onTestLabs?.(Array.from(selectedForTest));
              }}
            >
              Test Selected ({selectedForTest.size})
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {filteredLabs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {searchQuery || topicFilter !== 'all' || capabilityFilter !== 'all'
                  ? 'No labs match your filters'
                  : 'No labs available'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              Showing {startIdx + 1}–{Math.min(startIdx + pageSize, filteredLabs.length)} of{' '}
              {filteredLabs.length} lab{filteredLabs.length !== 1 ? 's' : ''}
            </div>
            {paginatedLabs.map((lab) => (
              <Card key={lab.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    {isMultiSelectMode && (
                      <Checkbox
                        checked={selectedForTest.has(lab.id)}
                        onCheckedChange={(checked) => {
                          setSelectedForTest((prev) => {
                            const next = new Set(prev);
                            if (checked) next.add(lab.id);
                            else next.delete(lab.id);
                            return next;
                          });
                        }}
                        className="mt-1"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{lab.title}</CardTitle>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', getDifficultyColor(lab.difficulty))}
                        >
                          {lab.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getTopicName(lab.topicId)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{lab.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {lab.modes &&
                          lab.modes.map((mode) => (
                            <Badge key={mode} variant="outline" className="text-xs">
                              {mode}
                            </Badge>
                          ))}
                        {lab.estimatedTotalTimeMinutes && (
                          <Badge variant="outline" className="text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lab.estimatedTotalTimeMinutes} min
                          </Badge>
                        )}
                        {lab.povCapabilities && lab.povCapabilities.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {lab.povCapabilities.length} POV capability
                            {lab.povCapabilities.length !== 1 ? 'ies' : ''}
                          </Badge>
                        )}
                      </div>
                      {lab.prerequisites && lab.prerequisites.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <span className="font-medium">Prerequisites:</span>{' '}
                          {lab.prerequisites.join(', ')}
                        </div>
                      )}
                    </div>
                    {!isMultiSelectMode && onAddLab && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onAddLab(lab.id)}
                        className="ml-4 shrink-0"
                      >
                        Test Lab
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
