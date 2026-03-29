// ── Submission History Engine ─────────────────────────────────────────────────
window.LCHistory = {
    KEY: 'lc-submission-history',
    panel: null,

    init: function () {
        // Build slide-out panel (can still be opened via other triggers if added later)
        const panel = document.createElement('div');
        panel.id = 'lc-history-panel';
        panel.innerHTML = `
            <div id="lc-history-header">
                <span>📋 Submission History</span>
                <button id="lc-history-close">✕</button>
            </div>
            <div id="lc-history-list"></div>
            <button id="lc-history-clear">Clear History</button>`;
        document.body.appendChild(panel);
        this.panel = panel;

        document.getElementById('lc-history-close').addEventListener('click', () => this.hidePanel());
        document.getElementById('lc-history-clear').addEventListener('click', () => {
            localStorage.removeItem(this.KEY);
            this._renderEntries();
        });
    },

    // Called by confetti engine when a result is known
    record: function (status, attemptNumber) {
        const slug = window.location.pathname.split('/').filter(Boolean)[1] || 'unknown';
        const history = this._load();
        history.unshift({
            slug,
            status,
            attempt: attemptNumber,
            time: Date.now(),
            elapsed: window.LCTimer ? window.LCTimer.elapsed : 0
        });
        // Keep max 100 entries total
        if (history.length > 100) history.length = 100;
        localStorage.setItem(this.KEY, JSON.stringify(history));
    },

    togglePanel: function () {
        const isOpen = this.panel.classList.contains('open');
        if (isOpen) this.hidePanel();
        else        this.showPanel();
    },

    showPanel: function () {
        this._renderEntries();
        this.panel.classList.add('open');
    },

    hidePanel: function () {
        this.panel.classList.remove('open');
    },

    _renderEntries: function () {
        const list    = document.getElementById('lc-history-list');
        const history = this._load();
        if (history.length === 0) {
            list.innerHTML = '<div class="lc-hist-empty">No submissions yet for this session.</div>';
            return;
        }
        list.innerHTML = history.slice(0, 30).map(e => {
            const d    = new Date(e.time);
            const time = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
            const secs = Math.floor((e.elapsed || 0) / 1000);
            const m    = Math.floor(secs / 60).toString().padStart(2,'0');
            const s    = (secs % 60).toString().padStart(2,'0');
            const isOk = e.status === 'Accepted';
            return `
                <div class="lc-hist-entry ${isOk ? 'ok' : 'fail'}">
                    <span class="lc-hist-status">${isOk ? '✓' : '✗'} ${e.status}</span>
                    <span class="lc-hist-meta">${e.slug} · ${time} · ${m}:${s}</span>
                </div>`;
        }).join('');
    },

    _load: function () {
        try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
        catch (_) { return []; }
    }
};
