// Web Audio API sound engine — no external audio files needed
// All sounds are synthesized programmatically

type SoundName = 'keyclick' | 'click' | 'validate' | 'success' | 'error' | 'chaos' | 'tick' | 'levelup' | 'hover' | 'datatype';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private _muted = false;
  private _volume = 0.3;

  get muted() { return this._muted; }

  private getCtx(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  toggleMute() {
    this._muted = !this._muted;
    return this._muted;
  }

  play(name: SoundName) {
    if (this._muted) return;
    try {
      const ctx = this.getCtx();
      const now = ctx.currentTime;

      switch (name) {
        case 'keyclick': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(800 + Math.random() * 400, now);
          gain.gain.setValueAtTime(this._volume * 0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }
        case 'click': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, now);
          gain.gain.setValueAtTime(this._volume * 0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'hover': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(this._volume * 0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'validate': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523, now);
          osc.frequency.setValueAtTime(659, now + 0.08);
          gain.gain.setValueAtTime(this._volume * 0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'success': {
          // Ascending arpeggio
          [523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(this._volume * 0.12, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.3);
          });
          break;
        }
        case 'error': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.setValueAtTime(150, now + 0.1);
          gain.gain.setValueAtTime(this._volume * 0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }
        case 'chaos': {
          // Alarm klaxon — two alternating tones
          for (let i = 0; i < 4; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(i % 2 === 0 ? 440 : 520, now + i * 0.15);
            gain.gain.setValueAtTime(this._volume * 0.15, now + i * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.12);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.12);
          }
          break;
        }
        case 'tick': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, now);
          gain.gain.setValueAtTime(this._volume * 0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.02);
          break;
        }
        case 'levelup': {
          // Triumphant fanfare
          [392, 523, 659, 784, 1047].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = i === 4 ? 'triangle' : 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.12);
            gain.gain.setValueAtTime(this._volume * 0.15, now + i * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now + i * 0.12);
            osc.stop(now + i * 0.12 + 0.5);
          });
          break;
        }
      }
    } catch {
      // Audio context not available
    }
  }
}

export const soundEngine = new SoundEngine();
