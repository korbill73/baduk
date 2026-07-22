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

  // Hangame Baduk (한게임 바둑) Authentic Stone Placement Sound (딱! / 착!)
  // 비자나무 원목 바둑판 & 조개/오석 바둑알의 고품격 실전 착수음 4-Layer 프로파일
  playStoneClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Layer 1: High Shell/Slate Impact Clack (딱! - 0~12ms 고음역 돌 충격음)
      const bufferSize1 = Math.floor(this.ctx.sampleRate * 0.012);
      const noiseBuffer1 = this.ctx.createBuffer(1, bufferSize1, this.ctx.sampleRate);
      const output1 = noiseBuffer1.getChannelData(0);
      for (let i = 0; i < bufferSize1; i++) {
        output1[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.0025));
      }
      const whiteNoise1 = this.ctx.createBufferSource();
      whiteNoise1.buffer = noiseBuffer1;

      const bandpass1 = this.ctx.createBiquadFilter();
      bandpass1.type = 'bandpass';
      bandpass1.frequency.setValueAtTime(5600, now);
      bandpass1.Q.setValueAtTime(2.8, now);

      const noiseGain1 = this.ctx.createGain();
      noiseGain1.gain.setValueAtTime(1.3, now);
      noiseGain1.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      whiteNoise1.connect(bandpass1);
      bandpass1.connect(noiseGain1);
      noiseGain1.connect(this.ctx.destination);
      whiteNoise1.start(now);

      // Layer 2: Hard Stone Tone Transient (탁! - 22ms 돌 표면 경도 피치 드롭)
      const oscHigh = this.ctx.createOscillator();
      const gainHigh = this.ctx.createGain();
      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(2800, now);
      oscHigh.frequency.exponentialRampToValueAtTime(1700, now + 0.022);

      gainHigh.gain.setValueAtTime(0.55, now);
      gainHigh.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

      oscHigh.connect(gainHigh);
      gainHigh.connect(this.ctx.destination);
      oscHigh.start(now);
      oscHigh.stop(now + 0.022);

      // Layer 3: Wood Cavity Resonance (착! - 50ms 비자나무 배꼽 향혈 공명)
      const oscMid = this.ctx.createOscillator();
      const gainMid = this.ctx.createGain();
      oscMid.type = 'triangle';
      oscMid.frequency.setValueAtTime(780, now);
      oscMid.frequency.exponentialRampToValueAtTime(360, now + 0.05);

      gainMid.gain.setValueAtTime(0.75, now);
      gainMid.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      oscMid.connect(gainMid);
      gainMid.connect(this.ctx.destination);
      oscMid.start(now);
      oscMid.stop(now + 0.05);

      // Layer 4: Deep Hardwood Board Bottom Thud (원목 묵직한 울림 바닥음 - 110ms)
      const oscLow = this.ctx.createOscillator();
      const gainLow = this.ctx.createGain();
      oscLow.type = 'sine';
      oscLow.frequency.setValueAtTime(220, now);
      oscLow.frequency.exponentialRampToValueAtTime(75, now + 0.11);

      gainLow.gain.setValueAtTime(0.85, now);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      oscLow.connect(gainLow);
      gainLow.connect(this.ctx.destination);
      oscLow.start(now);
      oscLow.stop(now + 0.11);

      // Layer 5: Micro-Reflection Clink (+2.5ms 미세 반사음으로 실감 극대화)
      const oscReflect = this.ctx.createOscillator();
      const gainReflect = this.ctx.createGain();
      oscReflect.type = 'triangle';
      oscReflect.frequency.setValueAtTime(2400, now + 0.0025);
      oscReflect.frequency.exponentialRampToValueAtTime(1400, now + 0.012);

      gainReflect.gain.setValueAtTime(0.25, now + 0.0025);
      gainReflect.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      oscReflect.connect(gainReflect);
      gainReflect.connect(this.ctx.destination);
      oscReflect.start(now + 0.0025);
      oscReflect.stop(now + 0.012);
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
