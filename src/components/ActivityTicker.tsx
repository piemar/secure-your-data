import { useState, useEffect, useRef } from 'react';
import { generateHandle } from '@/content/missions/mission';

const EVENTS = [
  (h: string) => `${h} completed PHANTOM QUERY +500XP`,
  (h: string) => `${h} survived CHAOS EVENT: NODE FAILURE`,
  (h: string) => `${h} ranked up to SHARD COMMANDER`,
  (h: string) => `${h} completed AGGREGATION GAMEDAY +750XP`,
  (h: string) => `${h} unlocked achievement: SPEED DEMON`,
  (h: string) => `${h} completed ENCRYPTION VAULT +600XP`,
  (h: string) => `${h} survived CHAOS EVENT: NETWORK PARTITION`,
  (h: string) => `${h} completed CRUD BOOT CAMP +300XP`,
  (h: string) => `${h} ranked up to REPLICA RANGER`,
  (h: string) => `${h} completed GEOSPATIAL PURSUIT +650XP`,
];

function generateEvent(): string {
  const handle = generateHandle();
  const fn = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  return fn(handle);
}

export function ActivityTicker() {
  const [items, setItems] = useState<string[]>(() =>
    Array.from({ length: 3 }, generateEvent)
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => {
        const next = [...prev, generateEvent()];
        if (next.length > 20) next.shift();
        return next;
      });
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-1.5">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] text-primary font-bold">LIVE</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div
            ref={containerRef}
            className="flex gap-8 animate-ticker whitespace-nowrap"
            style={{
              animation: `ticker ${items.length * 4}s linear infinite`,
            }}
          >
            {items.map((item, i) => (
              <span key={`${i}-${item}`} className="font-mono text-[10px] text-muted-foreground">
                {item}
                <span className="text-primary/30 ml-8">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
