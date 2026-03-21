import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Mission } from '@/lib/types';
import { getMissionSearchTags } from '@/lib/mission-prerequisites';
import { Search, X } from 'lucide-react';

interface MissionSearchProps {
  missions: Mission[];
  onFilterChange: (filteredIds: string[] | null) => void;
  onMissionClick?: (missionId: string) => void;
}

export function MissionSearch({ missions, onFilterChange, onMissionClick }: MissionSearchProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return [];

    return missions.filter(m => {
      const searchTags = getMissionSearchTags(m);
      const q = query.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.codename.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        searchTags.some(t => t.toLowerCase().includes(q))
      );
    });

  }, [query, missions]);

  useEffect(() => {
    if (!query) {
      onFilterChange(null);
      return;
    }
    onFilterChange(filtered.map(m => m.id));
  }, [query, filtered, onFilterChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        value={query}
        onChange={e => { setQuery(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="Search missions by name, topic, or capability..."
        className="pl-9 font-mono text-xs bg-card border-border h-9"
      />
      {query && (
        <button onClick={() => { setQuery(''); setShowDropdown(false); }} className="absolute right-3 top-1/2 -translate-y-1/2">
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      )}

      {/* Dropdown results for graph scroll-to-node */}
      {showDropdown && query && onMissionClick && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-auto">
          {filtered.map(m => (
            <button
              key={m.id}
              onMouseDown={() => {
                onMissionClick(m.id);
                setShowDropdown(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors flex items-center gap-2"
            >
              <span className="font-mono text-[10px] text-primary/60 w-20 shrink-0">{m.codename}</span>
              <span className="font-mono text-xs text-foreground truncate">{m.title}</span>
              <span className="font-mono text-[10px] text-muted-foreground ml-auto">+{m.xpReward} XP</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
