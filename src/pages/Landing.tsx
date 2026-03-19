import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TypewriterText } from '@/components/TypewriterText';
import { MatrixRain } from '@/components/MatrixRain';
import { BootSequence } from '@/components/BootSequence';
import { getPlayer, createPlayer } from '@/lib/game-store';
import { generateHandle } from '@/lib/game-data';
import { soundEngine } from '@/lib/sound-engine';
import heistMascot from '@/assets/heist-mascot.png';

const ASCII_SUBTITLE = `
  ██████╗  █████╗ ███╗   ███╗███████╗  ██████╗  █████╗ ██╗   ██╗
 ██╔════╝ ██╔══██╗████╗ ████║██╔════╝  ██╔══██╗██╔══██╗╚██╗ ██╔╝
 ██║  ███╗███████║██╔████╔██║█████╗    ██║  ██║███████║ ╚████╔╝
 ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝    ██║  ██║██╔══██║  ╚██╔╝
 ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗  ██████╔╝██║  ██║   ██║
  ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝`;

export default function Landing() {
  const navigate = useNavigate();
  const [handle, setHandle] = useState('');
  const [phase, setPhase] = useState<'boot' | 'intro' | 'ready'>('boot');
  const [showInput, setShowInput] = useState(false);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const player = getPlayer();
    if (player) {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (sessionStorage.getItem('heist-booted')) {
      setBooted(true);
      setPhase('intro');
    }
  }, []);

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem('heist-booted', '1');
    setBooted(true);
    setPhase('intro');
  }, []);

  const handleGenerate = useCallback(() => {
    soundEngine.play('validate');
    setHandle(generateHandle());
  }, []);

  const handleConnect = () => {
    if (!handle.trim()) return;
    soundEngine.play('success');
    createPlayer(handle.trim());
    navigate('/dashboard');
  };

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <MatrixRain />

      <div className="absolute inset-0 circuit-pattern" />
      <div className="absolute inset-0 scanline pointer-events-none" />

      <div className="absolute top-20 left-10 w-1 h-1 bg-primary rounded-full animate-float opacity-40" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-primary rounded-full animate-float opacity-30" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-accent rounded-full animate-float opacity-20" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 max-w-xl w-full space-y-8 text-center">
        <div className="relative">
          {/* Mascot walking across */}
          <div className="relative h-16 sm:h-20 overflow-visible mb-1">
            <img
              src={heistMascot}
              alt="MDB Turtle Mascot"
              className="absolute w-12 h-12 sm:w-16 sm:h-16 bottom-0 drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)] pointer-events-none"
              style={{
                animation: 'mascot-patrol 8s ease-in-out infinite, mascot-waddle 0.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* MongoDB styled text with CRT scanline overlay */}
          <div className="relative inline-block">
            <h1
              className="font-mono font-bold text-primary select-none cursor-pointer transition-all duration-300 hover:animate-glitch text-5xl sm:text-6xl md:text-7xl tracking-tight"
              style={{
                animationName: 'fade-in-slow',
                animationDuration: '2s',
                animationFillMode: 'both',
                textShadow: '0 0 20px hsl(145 95% 46% / 0.6), 0 0 60px hsl(145 95% 46% / 0.3), 0 0 100px hsl(145 95% 46% / 0.1)',
              }}
            >
              MongoDB
            </h1>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                mixBlendMode: 'multiply',
              }}
            />
          </div>

          {/* GAME DAY in ASCII art */}
          <pre
            className="font-mono text-primary/50 text-[3px] sm:text-[5px] md:text-[7px] leading-tight whitespace-pre select-none mt-2 animate-pulse-glow"
            style={{ animationName: 'fade-in-slow', animationDuration: '3s', animationDelay: '0.5s', animationFillMode: 'both' }}
          >
            {ASCII_SUBTITLE}
          </pre>
        </div>

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
