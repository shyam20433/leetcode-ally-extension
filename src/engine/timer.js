// ── Problem Timer Engine ──────────────────────────────────────────────────────
window.LCTimer = {
    startTime:   null,
    elapsed:     0,
    intervalId:  null,
    paused:      false,
    problemSlug: '',
    el:          null,

    init: function () {
        this.problemSlug = window.location.pathname.replace(/\//g, '') || 'unknown';

        const wrap = document.createElement('div');
        wrap.id = 'lc-timer-widget';

        wrap.innerHTML = `
            <span id="lc-timer-icon">⏱</span>
            <span id="lc-timer-display">00:00</span>
            <div id="lc-timer-controls">
                <button id="lc-timer-pause" title="Pause">⏸</button>
                <button id="lc-timer-reset" title="Reset">↺</button>
            </div>
            <div id="lc-timer-best"></div>`;

        document.body.appendChild(wrap);
        this.el = wrap;

        document.getElementById('lc-timer-pause').addEventListener('click', () => this.togglePause());
        document.getElementById('lc-timer-reset').addEventListener('click', () => this.reset());

        this._loadBest();
        this.start();
    },

    start: function () {
        this.startTime = Date.now() - this.elapsed;
        this.intervalId = setInterval(() => this._tick(), 1000);
    },

    togglePause: function () {
        const btn = document.getElementById('lc-timer-pause');
        if (this.paused) {
            this.paused = false;
            btn.textContent = '⏸';
            this.start();
        } else {
            this.paused = true;
            this.elapsed = Date.now() - this.startTime;
            clearInterval(this.intervalId);
            btn.textContent = '▶';
        }
    },

    reset: function () {
        clearInterval(this.intervalId);
        this.elapsed = 0;
        this.paused  = false;
        document.getElementById('lc-timer-pause').textContent = '⏸';
        document.getElementById('lc-timer-display').textContent = '00:00';
        this.start();
    },

    // Called from confetti engine when accepted
    recordSolve: function () {
        const ms = Date.now() - this.startTime;
        const key = 'lc-timer-best-' + this.problemSlug;
        const prev = parseInt(localStorage.getItem(key) || '0');
        if (!prev || ms < prev) {
            localStorage.setItem(key, ms);
            this._loadBest();
        }
    },

    _tick: function () {
        this.elapsed = Date.now() - this.startTime;
        const secs  = Math.floor(this.elapsed / 1000);
        const m     = Math.floor(secs / 60).toString().padStart(2, '0');
        const s     = (secs % 60).toString().padStart(2, '0');
        const display = document.getElementById('lc-timer-display');
        if (display) display.textContent = `${m}:${s}`;
    },

    _loadBest: function () {
        const key  = 'lc-timer-best-' + this.problemSlug;
        const best = parseInt(localStorage.getItem(key) || '0');
        const bestEl = document.getElementById('lc-timer-best');
        if (!bestEl) return;
        if (best) {
            const secs = Math.floor(best / 1000);
            const m    = Math.floor(secs / 60).toString().padStart(2, '0');
            const s    = (secs % 60).toString().padStart(2, '0');
            bestEl.textContent = `Best: ${m}:${s}`;
            bestEl.style.display = 'block';
        } else {
            bestEl.style.display = 'none';
        }
    }
};
