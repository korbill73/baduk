class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isSoundEnabled(): boolean {
    return this.enabled;
  }

  // Realistic stone click / wood thud sound
  playStoneClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // High frequency click (stone meeting stone/wood)
      const oscClick = this.ctx.createOscillator();
      const gainClick = this.ctx.createGain();
      oscClick.type = 'sine';
      oscClick.frequency.setValueAtTime(1400, now);
      oscClick.frequency.exponentialRampToValueAtTime(300, now + 0.03);
      
      gainClick.gain.setValueAtTime(0.7, now);
      gainClick.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

      oscClick.connect(gainClick);
      gainClick.connect(this.ctx.destination);
      oscClick.start(now);
      oscClick.stop(now + 0.03);

      // Low frequency thud (wood resonance)
      const oscWood = this.ctx.createOscillator();
      const gainWood = this.ctx.createGain();
      oscWood.type = 'triangle';
      oscWood.frequency.setValueAtTime(180, now);
      oscWood.frequency.exponentialRampToValueAtTime(60, now + 0.12);

      gainWood.gain.setValueAtTime(0.5, now);
      gainWood.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      oscWood.connect(gainWood);
      gainWood.connect(this.ctx.destination);
      oscWood.start(now);
      oscWood.stop(now + 0.12);
    } catch (e) {
      console.error(e);
    }
  }

  // Capture sound (multiple stones clinking)
  playCapture() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = i * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1600 + (Math.random() * 400), now + delay);
        osc.frequency.exponentialRampToValueAtTime(500, now + delay + 0.05);

        gain.gain.setValueAtTime(0.4, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.05);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Victory / correct puzzle sound
  playVictory() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const start = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(start);
        osc.stop(start + 0.4);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Error / illegal move sound
  playError() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.error(e);
    }
  }
}

export const soundManager = new SoundManager();
