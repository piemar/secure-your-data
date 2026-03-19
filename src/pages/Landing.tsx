import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TypewriterText } from '@/components/TypewriterText';
import { getPlayer, createPlayer } from '@/lib/game-store';
import { generateHandle } from '@/lib/game-data';

const ASCII_LOGO = `
 ███╗   ███╗ ██████╗ ███╗   ██╗ ██████╗  ██████╗ 
 ████╗ ████║██╔═══██╗████╗  ██║██╔════╝ ██╔═══██╗
 ██╔████╔██║██║   ██║██╔██╗ ██║██║  ███╗██║   ██║
 ██║╚██╔╝██║██║   ██║██║╚██╗██║██║   ██║██║   ██║
 ██║ ╚═╝ ██║╚██████╔╝██║ ╚████║╚██████╔╝╚██████╔╝
 ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝  ╚═════╝ 
        D A T A   H E I S T
`;

export default function Landing() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [phase, setPhase] = useState<'intro' | 'ready'>('intro');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGenerate = useCallback(() => {
    setHandle(generateHandle());
  }, []);

  const handleConnect = () => {
    if (!handle.trim()) return;
    createPlayer(handle.trim());
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 circuit-pattern" />
      <div className="absolute inset-0 scanline pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute top-20 left-10 w-1 h-1 bg-primary rounded-full animate-float opacity-40" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-primary rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-accent rounded-full animate-float opacity-20" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-xl w-full space-y-8 text-center">
        {/* ASCII Logo */}
        <pre className="font-mono text-primary text-[6px] sm:text-[8px] md:text-[10px] leading-tight text-glow whitespace-pre select-none" style={{ animationName: 'fade-in-slow', animationDuration: '2s', animationFillMode: 'both' }}>
          {ASCII_LOGO}
        </pre>

        {/* Connection text */}
        <div className="space-y-2">
          <TypewriterText
            text="INITIATING SECURE CONNECTION..."
            speed={50}
            className="text-sm text-primary text-glow block"
            onComplete={() => setTimeout(() => setPhase('ready'), 800)}
          />
          {phase === 'ready' && (
            <TypewriterText
              text="CONNECTION ESTABLISHED. ENTER YOUR HANDLE TO PROCEED."
              speed={30}
              delay={200}
              className="text-xs text-muted-foreground block"
              onComplete={() => setShowInput(true)}
            />
          )}
        </div>

        {/* Handle input */}
        {showInput && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary font-mono text-sm">{'>'}</span>
                <Input
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="agent_handle"
                  className="pl-7 font-mono bg-secondary/50 border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                  maxLength={20}
                  autoFocus
                />
              </div>
              <Button
                variant="outline"
                onClick={handleGenerate}
                className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10"
              >
                🎲 GEN
              </Button>
            </div>

            <Button
              onClick={handleConnect}
              disabled={!handle.trim()}
              className="w-full font-mono font-bold tracking-wider animate-pulse-glow bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30"
            >
              [ CONNECT ]
            </Button>

            <p className="text-[10px] text-muted-foreground font-mono">
              ENCRYPTED TUNNEL READY • MONGODB GAMEDAY v2.0
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
