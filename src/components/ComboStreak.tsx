import { useEffect, useState } from 'react';
import { soundEngine } from '@/lib/sound-engine';

interface ComboStreakProps {
  code: string;
  isActive: boolean;
}

// MongoDB patterns that count as "correct" for combo building
const COMBO_PATTERNS = [
  /db\.\w+\.\w+\(/,
  /\$match/,
  /\$group/,
  /\$sort/,
  /\$project/,
  /\$unwind/,
  /\$lookup/,
  /\$facet/,
  /\$merge/,
  /\$out/,
  /\$geoNear/,
  /\$geoWithin/,
  /\$graphLookup/,
  /\$search/,
  /\$searchMeta/,
  /\.find\s*\(/,
  /\.findOne\s*\(/,
  /\.insertOne\s*\(/,
  /\.insertMany\s*\(/,
  /\.updateOne\s*\(/,
  /\.updateMany\s*\(/,
  /\.deleteOne\s*\(/,
  /\.deleteMany\s*\(/,
  /\.aggregate\s*\(/,
  /\.createIndex\s*\(/,
  /\.explain\s*\(/,
  /\.watch\s*\(/,
  /\$elemMatch/,
  /\$jsonSchema/,
  /autoEncryption/,
  /ClientEncryption/,
  /retryWrites/,
  /readPreference/,
  /sh\.\w+\(/,
  /rs\.\w+\(/,
];

export function ComboStreak({ code, isActive }: ComboStreakProps) {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [lastPatternCount, setLastPatternCount] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const currentCount = COMBO_PATTERNS.filter(p => p.test(code)).length;

    if (currentCount > lastPatternCount) {
      const newCombo = combo + (currentCount - lastPatternCount);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setShowFlash(true);
      if (newCombo >= 3) soundEngine.play('validate');
      setTimeout(() => setShowFlash(false), 600);
    }
    setLastPatternCount(currentCount);
  }, [code, isActive]);

  if (!isActive || combo < 2) return null;

  const comboLabel = combo >= 10 ? 'LEGENDARY' : combo >= 7 ? 'UNSTOPPABLE' : combo >= 5 ? 'ON FIRE' : combo >= 3 ? 'COMBO' : '';
  const comboColor = combo >= 10 ? 'text-yellow-400' : combo >= 7 ? 'text-purple-400' : combo >= 5 ? 'text-orange-400' : 'text-primary';

  return (
    <div className={`absolute top-3 right-3 z-20 pointer-events-none transition-all duration-300 ${showFlash ? 'scale-125' : 'scale-100'}`}>
      <div className={`font-mono text-xs font-bold ${comboColor} ${showFlash ? 'animate-pulse' : ''}`}>
        <span className="text-lg">{combo}x</span>
        <span className="ml-1 text-[10px] opacity-80">{comboLabel}</span>
      </div>
    </div>
  );
}
