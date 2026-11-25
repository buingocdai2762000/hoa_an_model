// Procedural Web Audio API sound synthesizer for crisp modern retro tactical SFX

class TacticalSoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private userUnlocked = false;
  private suspendTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.userUnlocked = true;
      };
      window.addEventListener('pointerdown', unlock, { passive: true });
      window.addEventListener('keydown', unlock, { passive: true });
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private getCtx(): AudioContext | null {
    if (this.muted || !this.userUnlocked || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.scheduleIdleSuspend();
    return this.ctx;
  }

  private scheduleIdleSuspend() {
    if (typeof window === 'undefined') return;
    if (this.suspendTimer !== null) {
      window.clearTimeout(this.suspendTimer);
    }
    this.suspendTimer = window.setTimeout(() => {
      this.suspendTimer = null;
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend().catch(() => {});
      }
    }, 600);
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainPeak = 0.08,
    delay = 0,
    endFreq?: number
  ) {
    const ctx = this.getCtx();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public cursor() {
    const pitch = 520 + (Math.random() - 0.5) * 40;
    this.playTone(pitch, 0.045, 'square', 0.03);
  }

  public select() {
    this.playTone(587.33, 0.07, 'triangle', 0.08, 0);
    this.playTone(880, 0.09, 'triangle', 0.07, 0.055);
  }

  public cancel() {
    this.playTone(440, 0.06, 'triangle', 0.06, 0, 290);
  }

  public step() {
    const pitch = 190 + (Math.random() - 0.5) * 28;
    this.playTone(pitch, 0.05, 'triangle', 0.045, 0, 120);
  }

  public slash(isCrit = false) {
    if (isCrit) {
      this.playTone(220, 0.14, 'sawtooth', 0.12, 0, 65);
      this.playTone(660, 0.12, 'square', 0.09, 0.02, 1100);
      this.playTone(140, 0.24, 'sawtooth', 0.13, 0.05, 45);
    } else {
      this.playTone(480, 0.09, 'sawtooth', 0.08, 0, 160);
      this.playTone(180, 0.12, 'triangle', 0.08, 0.02, 85);
    }
  }

  public miss() {
    this.playTone(420, 0.11, 'sine', 0.05, 0, 260);
  }

  public magic() {
    this.playTone(520, 0.16, 'sine', 0.08, 0, 980);
    this.playTone(780, 0.18, 'triangle', 0.07, 0.06, 320);
  }

  public heal() {
    this.playTone(523.25, 0.12, 'sine', 0.08, 0);
    this.playTone(659.25, 0.12, 'sine', 0.08, 0.08);
    this.playTone(783.99, 0.18, 'sine', 0.09, 0.16);
    this.playTone(1046.5, 0.24, 'triangle', 0.07, 0.24);
  }

  public phaseBanner(isPlayer: boolean) {
    if (isPlayer) {
      this.playTone(392, 0.12, 'triangle', 0.08, 0);
      this.playTone(523.25, 0.14, 'triangle', 0.09, 0.09);
      this.playTone(659.25, 0.26, 'triangle', 0.09, 0.18);
    } else {
      this.playTone(293.66, 0.15, 'sawtooth', 0.07, 0);
      this.playTone(233.08, 0.25, 'sawtooth', 0.08, 0.12);
    }
  }

  public levelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.15, 'triangle', 0.09, i * 0.075);
    });
  }

  public victory() {
    const fanfare = [392, 523.25, 659.25, 783.99, 659.25, 1046.5];
    const times = [0, 0.12, 0.24, 0.36, 0.5, 0.62];
    fanfare.forEach((n, i) => {
      this.playTone(n, i === fanfare.length - 1 ? 0.5 : 0.14, 'triangle', 0.09, times[i]);
    });
  }

  public defeat() {
    this.playTone(311.13, 0.22, 'sawtooth', 0.07, 0);
    this.playTone(277.18, 0.22, 'sawtooth', 0.07, 0.2);
    this.playTone(233.08, 0.45, 'sawtooth', 0.08, 0.42, 175);
  }
}

export const soundEngine = new TacticalSoundEngine();
