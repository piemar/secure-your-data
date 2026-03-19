import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mission } from '@/lib/types';
import { POV_LABELS, TOPIC_LABELS, getMissionSearchTags } from '@/lib/mission-prerequisites';
import { Search, X } from 'lucide-react';

interface MissionSearchProps {
  missions: Mission[];
  onFilterChange: (filteredIds: string[] | null) => void;
}

export function MissionSearch({ missions, onFilterChange }: MissionSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Get all unique POVs and topics from missions
  const allTags = useMemo(() => {
    const tags = new Map<string, { label: string; count: number }>();
    for (const m of missions) {
      if (m.topic && TOPIC_LABELS[m.topic]) {
        const key = `topic:${m.topic}`;
        const existing = tags.get(key);
        tags.set(key, { label: TOPIC_LABELS[m.topic], count: (existing?.count || 0) + 1 });
      }
      for (const pov of m.povCapabilities || []) {
        if (POV_LABELS[pov]) {
          const key = `pov:${pov}`;
          const existing = tags.get(key);
          tags.set(key, { label: POV_LABELS[pov], count: (existing?.count || 0) + 1 });
        }
      }
    }
    return tags;
  }, [missions]);

  // Apply filters
  useMemo(() => {
    if (!query && selectedTags.size === 0) {
      onFilterChange(null);
      return;
    }

    const filtered = missions.filter(m => {
      const searchTags = getMissionSearchTags(m);
      const matchesQuery = !query || 
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.codename.toLowerCase().includes(query.toLowerCase()) ||
        m.description.toLowerCase().includes(query.toLowerCase()) ||
        searchTags.some(t => t.toLowerCase().includes(query.toLowerCase()));
      
      const matchesTags = selectedTags.size === 0 || Array.from(selectedTags).every(tag => {
        const [type, value] = tag.split(':');
        if (type === 'topic') return m.topic === value;
        if (type === 'pov') return m.povCapabilities?.includes(value);
        return false;
      });

      return matchesQuery && matchesTags;
    });

    onFilterChange(filtered.map(m => m.id));
  }, [query, selectedTags, missions, onFilterChange]);

  const toggleTag = (key: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearAll = () => {
    setQuery('');
    setSelectedTags(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search missions by name, topic, or capability..."
          className="pl-9 font-mono text-xs bg-card border-border h-9"
        />
        {(query || selectedTags.size > 0) && (
          <button onClick={clearAll} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {Array.from(allTags.entries()).map(([key, { label, count }]) => (
          <button key={key} onClick={() => toggleTag(key)}>
            <Badge
              variant={selectedTags.has(key) ? 'default' : 'outline'}
              className={`font-mono text-[10px] cursor-pointer transition-colors ${
                selectedTags.has(key)
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:border-primary/50'
              }`}
            >
              {label} ({count})
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
