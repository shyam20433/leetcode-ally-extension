// ── Fahhhhify Sound Engine ────────────────────────────────────────────────────
// Synthesizes a realistic descending "Fahhhhh!" vocal using Web Audio API.
// No external files. Zero latency. 100% native.
window.LCFahhh = {
    ctx: null,

    _getCtx: function () {
        if (!this.ctx || this.ctx.state === 'closed') {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        // Resume if suspended (browser audio policy after no interaction)
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return this.ctx;
    },

    // ── Main entry point ─────────────────────────────────────────────────────
    play: function () {
        const folders = ['assets/audio', 'assets/sound', 'assets/sounds', 'audio', 'sound', 'sounds'];
        const files   = ['Fahhh.mp3', 'fahhh.mp3', 'fahh.mp3', 'fahhhhh.mp3', 'FAHHHHH.mp3', 'fahhh.wav'];
        
        const potentialPaths = [];
        folders.forEach(f => files.forEach(file => potentialPaths.push(`${f}/${file}`)));

        const tryNext = (idx) => {
            if (idx >= potentialPaths.length) {
                this._playSynthesis();
                return;
            }

            try {
                const url = chrome.runtime.getURL(potentialPaths[idx]);
                const audio = new Audio(url);
                audio.volume = 0.6;
                
                audio.play().then(() => {
                    console.log('[LCFahhh] Playing sound clip:', potentialPaths[idx]);
                }).catch(() => {
                    tryNext(idx + 1);
                });
            } catch (e) {
                tryNext(idx + 1);
            }
        };

        tryNext(0);
    },

    _playSynthesis: function() {
        try {
            const ctx = this._getCtx();
            const now = ctx.currentTime;

            // Master gain — controls overall volume
            const master = ctx.createGain();
            master.gain.setValueAtTime(0, now);
            master.gain.linearRampToValueAtTime(0.0, now);         // silent start
            master.gain.linearRampToValueAtTime(0.55, now + 0.04); // snap open
            master.gain.setValueAtTime(0.55, now + 0.55);
            master.gain.exponentialRampToValueAtTime(0.001, now + 1.6); // fade out
            master.connect(ctx.destination);

            // ── 1. "F" plosive burst — short filtered noise ──────────────────
            this._fBurst(ctx, master, now);

            // ── 2. "Ahhhh" vocal — sawtooth through formant filter chain ─────
            this._ahhhVoice(ctx, master, now + 0.04);

            // ── 3. Subtle overdrive distortion for rawness ───────────────────
            this._overdrive(ctx, master, now);

        } catch (err) {
            console.warn('[LCFahhh] Audio synthesis failed:', err);
        }
    },

    // ── "F" fricative: short broadband noise burst ───────────────────────────
    _fBurst: function (ctx, dest, startTime) {
        const bufSize = ctx.sampleRate * 0.08; // 80ms of noise
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);

        const src = ctx.createBufferSource();
        src.buffer = buf;

        // High-pass filter to make it sound like air / fricative
        const hpf = ctx.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.value = 4500;
        hpf.Q.value = 0.7;

        const g = ctx.createGain();
        g.gain.setValueAtTime(0.4, startTime);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

        src.connect(hpf);
        hpf.connect(g);
        g.connect(dest);
        src.start(startTime);
        src.stop(startTime + 0.08);
    },

    // ── "Ahhhh" vowel: sawtooth oscillator through formant peaks ─────────────
    _ahhhVoice: function (ctx, dest, startTime) {
        const duration = 1.5;

        // Fundamental pitch: descends from 290 Hz → 130 Hz (dramatic drop)
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(290, startTime);
        osc.frequency.exponentialRampToValueAtTime(130, startTime + duration);

        // Second harmonic enricher
        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(580, startTime);
        osc2.frequency.exponentialRampToValueAtTime(260, startTime + duration);

        const g2 = ctx.createGain();
        g2.gain.value = 0.15;
        osc2.connect(g2);

        // Formant filter 1 — "ah" vowel F1 ≈ 700 Hz
        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.value = 700;
        f1.Q.value = 5;

        // Formant filter 2 — "ah" vowel F2 ≈ 1100 Hz
        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.value = 1100;
        f2.Q.value = 8;

        // Formant filter 3 — adds brightness F3 ≈ 2500 Hz
        const f3 = ctx.createBiquadFilter();
        f3.type = 'bandpass';
        f3.frequency.value = 2500;
        f3.Q.value = 12;

        const fGain1 = ctx.createGain(); fGain1.gain.value = 1.2;
        const fGain2 = ctx.createGain(); fGain2.gain.value = 0.8;
        const fGain3 = ctx.createGain(); fGain3.gain.value = 0.4;

        // Chain: osc → formant filters in parallel → dest
        osc.connect(f1); f1.connect(fGain1); fGain1.connect(dest);
        osc.connect(f2); f2.connect(fGain2); fGain2.connect(dest);
        osc.connect(f3); f3.connect(fGain3); fGain3.connect(dest);

        // Second harmonic blends in
        g2.connect(f1);
        g2.connect(f2);

        osc.start(startTime);
        osc.stop(startTime + duration);
        osc2.start(startTime);
        osc2.stop(startTime + duration);
    },

    // ── Soft overdrive/saturation for vocal grit ─────────────────────────────
    _overdrive: function (ctx, dest) {
        // Nothing to patch in — overdrive is implicit in sawtooth harmonics
        // Keeping method for potential future waveshaper use
    }
};
