import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Mission } from '@/lib/types';
import { getMissionSearchTags } from '@/lib/mission-prerequisites';
import { Search, X } from 'lucide-react';

interface MissionSearchProps {
  missions: Mission[];
  onFilterChange: (filteredIds: string[] | null) => void;
}

export function MissionSearch({ missions, onFilterChange }: MissionSearchProps) {
  const [query, setQuery] = useState('');

  useMemo(() => {
    if (!query) {
      onFilterChange(null);
      return;
    }

    const filtered = missions.filter(m => {
      const searchTags = getMissionSearchTags(m);
      return (
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.codename.toLowerCase().includes(query.toLowerCase()) ||
        m.description.toLowerCase().includes(query.toLowerCase()) ||
        searchTags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      );
    });

    onFilterChange(filtered.map(m => m.id));
  }, [query, missions, onFilterChange]);

  const clearAll = () => setQuery('');

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search missions by name, topic, or capability..."
        className="pl-9 font-mono text-xs bg-card border-border h-9"
      />
      {query && (
        <button onClick={clearAll} className="absolute right-3 top-1/2 -translate-y-1/2">
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
}
