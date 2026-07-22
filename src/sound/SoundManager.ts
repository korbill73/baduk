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

  // 한게임 바둑 착수음 - 진짜 "딱!" 소리 (짧고 날카로운 고음 클릭)
  playStoneClick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const sampleRate = this.ctx.sampleRate;
      const now = this.ctx.currentTime;

      // === 핵심: 순수 고음 임펄스 노이즈 (딱! 소리의 본질) ===
      // 총 길이: 8ms (바둑알 착수음은 매우 짧아야 함)
      const totalLen = Math.floor(sampleRate * 0.008);
      const clickBuf = this.ctx.createBuffer(1, totalLen, sampleRate);
      const data = clickBuf.getChannelData(0);

      for (let i = 0; i < totalLen; i++) {
        const t = i / sampleRate;
        // 매우 빠른 지수 감쇠 (1.5ms에서 절반으로)
        const envelope = Math.exp(-t / 0.0015);
        // 고음 사인파 + 노이즈 조합 (딱! 특성)
        const click = Math.sin(2 * Math.PI * 7200 * t) * 0.6
                    + Math.sin(2 * Math.PI * 4800 * t) * 0.3
                    + (Math.random() * 2 - 1) * 0.1;
        data[i] = click * envelope;
      }

      const clickSrc = this.ctx.createBufferSource();
      clickSrc.buffer = clickBuf;

      // 고음역 강조 필터 (6kHz 이상 부스트)
      const hiShelf = this.ctx.createBiquadFilter();
      hiShelf.type = 'highshelf';
      hiShelf.frequency.setValueAtTime(4000, now);
      hiShelf.gain.setValueAtTime(8, now);

      // 저음 완전 차단 (500Hz 이하 제거 → 둔탁함 없애기)
      const hiPass = this.ctx.createBiquadFilter();
      hiPass.type = 'highpass';
      hiPass.frequency.setValueAtTime(1800, now);
      hiPass.Q.setValueAtTime(0.7, now);

      // 마스터 볼륨
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(1.6, now);

      clickSrc.connect(hiPass);
      hiPass.connect(hiShelf);
      hiShelf.connect(masterGain);
      masterGain.connect(this.ctx.destination);
      clickSrc.start(now);

      // === 보조: 판 울림 (매우 짧고 조용하게, 3ms 지연) ===
      // 판 재질감만 살짝 표현 (저음 아님, 중고음)
      const oscWood = this.ctx.createOscillator();
      const gainWood = this.ctx.createGain();
      oscWood.type = 'sine';
      oscWood.frequency.setValueAtTime(1400, now + 0.003);
      oscWood.frequency.exponentialRampToValueAtTime(900, now + 0.018);
      gainWood.gain.setValueAtTime(0.15, now + 0.003);
      gainWood.gain.exponentialRampToValueAtTime(0.001, now + 0.018);
      oscWood.connect(gainWood);
      gainWood.connect(this.ctx.destination);
      oscWood.start(now + 0.003);
      oscWood.stop(now + 0.018);

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
