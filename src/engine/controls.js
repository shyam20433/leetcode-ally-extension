// ── IDE Controls Engine ───────────────────────────────────────────────────────
// Focus Mode (5), Vim Toggle (6), Theme Picker (7), Font Picker (8)
// Also handles tag-hovercard for difficulty stats (feature 5 - heatmap)
window.LCControls = {
    focusActive: false,
    vimActive:   false,
    currentFont: 'JetBrains Mono',
    currentSize: 14,
    suggestionsActive: (localStorage.getItem('lc-suggestions-enabled') !== 'false'), // default true
    spellcheckActive:  (localStorage.getItem('lc-spellcheck-enabled') !== 'false'),  // default true

    THEMES: {
        'GitHub Dark':   { bg: '#0d1117', fg: '#e6edf3', sel: '#388bfd30', lineHi: '#161b22' },
        'Tokyo Night':   { bg: '#1a1b2e', fg: '#a9b1d6', sel: '#7aa2f730', lineHi: '#24283b' },
        'Catppuccin':    { bg: '#1e1e2e', fg: '#cdd6f4', sel: '#89b4fa30', lineHi: '#313244' },
        'Dracula':       { bg: '#282a36', fg: '#f8f8f2', sel: '#bd93f930', lineHi: '#44475a' },
        'One Dark':      { bg: '#282c34', fg: '#abb2bf', sel: '#61afef30', lineHi: '#2c313c' },
        'Monokai':       { bg: '#272822', fg: '#f8f8f2', sel: '#a6e22e30', lineHi: '#3e3d32' },
    },

    FONTS: [
        'JetBrains Mono',
        'Fira Code',
        'Cascadia Code',
        'Source Code Pro',
        'Inconsolata',
    ],

    init: function () {
        this._buildMainHub();
        this._buildThemeModal();
        this._buildFontModal();
        this._initTagHover();
    },

    _buildMainHub: function() {
        const hub = document.createElement('div');
        hub.id = 'lc-main-hub';
        hub.className = 'lc-collapsed'; // Start minimal
        
        hub.innerHTML = `
            <!-- Collapsed State: The Ally Button -->
            <div id="lc-ally-trigger">
                 <div class="lc-ally-pulse"></div>
                 <span class="lc-ally-text">LeetCode Ally</span>
                 <div class="lc-ally-icon">🚀</div>
            </div>

            <!-- Expanded State: The Dashboard -->
            <div id="lc-hub-content">
                <div id="lc-hub-header">
                    <span id="lc-hub-title">LEETCODE CONTROL SYSTEM</span>
                    <div id="lc-hub-drag-handle">⋮⋮</div>
                </div>
                <div id="lc-hub-card-list">
                    <div class="lc-hub-card info-card" id="lc-card-status">
                        <div class="lc-card-icon" style="background: rgba(148, 163, 184, 0.1); color: #94a3b8;">📡</div>
                        <div class="lc-card-body">
                            <div class="lc-card-title">Suggestions Engine</div>
                            <div class="lc-card-desc">Suggestions: <span id="lc-status-text">Standby</span></div>
                        </div>
                    </div>

                    <div class="lc-hub-card info-card" id="lc-card-complexity">
                        <div class="lc-card-icon" style="background: rgba(34, 211, 238, 0.1); color: #22d3ee;">📊</div>
                        <div class="lc-card-body">
                            <div class="lc-card-title">Real-time Complexity</div>
                            <div class="lc-card-desc" style="font-size: 9px; opacity: 0.6; margin-bottom: 2px;">TIME SPACE</div>
                            <div class="lc-card-desc"><span id="lc-hub-cx-val" style="color: #10b981; font-weight: 800; font-size: 13px;">O(1)</span> <span style="font-size: 13px;">O(1)</span></div>
                        </div>
                    </div>

                    <div class="lc-hub-card action-card toggle-card" id="lc-card-suggestions">
                        <div class="lc-card-icon" id="lc-icon-sug">💡</div>
                        <div class="lc-card-body">
                            <div class="lc-card-title">Suggestions</div>
                            <div class="lc-card-desc">Advanced autocompletion</div>
                        </div>
                    </div>

                    <div class="lc-hub-card action-card toggle-card" id="lc-card-focus">
                        <div class="lc-card-icon">⊡</div>
                        <div class="lc-card-body">
                            <div class="lc-card-title">Focus Mode</div>
                            <div class="lc-card-desc">Minimal workspace</div>
                        </div>
                    </div>

                    <div class="lc-hub-card action-card toggle-card" id="lc-card-spell">
                        <div class="lc-card-icon">✎</div>
                        <div class="lc-card-body">
                            <div class="lc-card-title">Spellcheck</div>
                            <div class="lc-card-desc">Verify code comments</div>
                        </div>
                    </div>

                    <div class="lc-hub-card action-card" id="lc-card-theme">
                        <div class="lc-card-icon" style="background: rgba(251, 146, 60, 0.1); color: #fb923c;">🎨</div>
                        <div class="lc-card-body">
                            <div class="lc-card-title">Customizer</div>
                            <div class="lc-card-desc">Themes & Fonts</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(hub);

        // Toggle Logic
        const toggle = () => {
            const isCollapsed = hub.classList.contains('lc-collapsed');
            if (isCollapsed) {
                hub.classList.remove('lc-collapsed');
                hub.classList.add('lc-expanded');
            } else {
                hub.classList.remove('lc-expanded');
                hub.classList.add('lc-collapsed');
            }
        };

        hub.querySelector('#lc-ally-trigger').addEventListener('click', toggle);
        hub.querySelector('#lc-hub-header').addEventListener('click', toggle);

        // Feature listeners
        hub.querySelector('#lc-card-suggestions').addEventListener('click', () => {
            this.suggestionsActive = !this.suggestionsActive;
            localStorage.setItem('lc-suggestions-enabled', this.suggestionsActive);
            this._updateToggleStates();
        });

        hub.querySelector('#lc-card-focus').addEventListener('click', () => this.toggleFocus());
        
        hub.querySelector('#lc-card-spell').addEventListener('click', () => {
             this.spellcheckActive = !this.spellcheckActive;
             localStorage.setItem('lc-spellcheck-enabled', this.spellcheckActive);
             this._updateToggleStates();
             // Manually trigger a content scan to apply/clear squiggles
             window.postMessage({ source: 'lc-intellisense', type: 'CONTENT_CHANGED', payload: { forceScan: true } }, '*');
        });

        hub.querySelector('#lc-card-theme').addEventListener('click', () => this.openTheme());

        this._updateToggleStates();

        window.LCExtension.statusText = hub.querySelector('#lc-status-text');
        window.LCComplexity.badge = hub.querySelector('#lc-hub-cx-val');

        if (window.LCDraggable) window.LCDraggable.init(hub, 'main-ally-hub');
    },

    _updateToggleStates: function() {
        const sug = document.getElementById('lc-card-suggestions');
        const foc = document.getElementById('lc-card-focus');
        const spl = document.getElementById('lc-card-spell');
 
        if (sug) {
            sug.classList.toggle('lc-on', this.suggestionsActive);
            const icon = sug.querySelector('.lc-card-icon');
            icon.textContent = this.suggestionsActive ? '💡' : '🌑';
        }
        if (foc) foc.classList.toggle('lc-on', this.focusActive);
        if (spl) {
            spl.classList.toggle('lc-on', this.spellcheckActive);
            const icon = spl.querySelector('.lc-card-icon');
            icon.textContent = this.spellcheckActive ? '✎' : '✕';
        }
    },

    // ── Suggestions Toggle ──────────────────────────────────────────────────
    _buildSuggestionsBtn: function() {
        const btn = document.createElement('button');
        btn.id = 'lc-suggestions-toggle-btn';
        btn.innerHTML = this.suggestionsActive ? '💡 Sug: ON' : '💡 Sug: OFF';
        btn.classList.toggle('lc-sug-active', this.suggestionsActive);
        document.body.appendChild(btn);

        btn.addEventListener('click', () => {
            this.suggestionsActive = !this.suggestionsActive;
            localStorage.setItem('lc-suggestions-enabled', this.suggestionsActive);
            btn.innerHTML = this.suggestionsActive ? '💡 Sug: ON' : '💡 Sug: OFF';
            btn.classList.toggle('lc-sug-active', this.suggestionsActive);
            
            // Pulse effect
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => btn.style.transform = '', 100);
        });

        // Initialize draggable for this new button
        if (window.LCDraggable) window.LCDraggable.init(btn, 'suggestions');
    },

    // ── Toolbar ───────────────────────────────────────────────────────────────
    _buildToolbar: function () {
        const bar = document.createElement('div');
        bar.id = 'lc-ide-toolbar';
        bar.innerHTML = `
            <button class="lc-tb-btn" id="lc-focus-btn" title="Focus Mode (Ctrl+Shift+F)">
                <span>⊡</span><span class="lc-tb-label">Focus</span>
            </button>
            <button class="lc-tb-btn" id="lc-vim-btn" title="Toggle Vim Mode">
                <span>⌨</span><span class="lc-tb-label">Vim</span>
            </button>
            <button class="lc-tb-btn" id="lc-theme-btn" title="Theme Picker">
                <span>🎨</span><span class="lc-tb-label">Theme</span>
            </button>
            <button class="lc-tb-btn" id="lc-font-btn" title="Font Settings">
                <span>Aa</span><span class="lc-tb-label">Font</span>
            </button>`;
        document.body.appendChild(bar);

        document.getElementById('lc-focus-btn').addEventListener('click', () => this.toggleFocus());
        document.getElementById('lc-vim-btn').addEventListener('click',   () => this.toggleVim());
        document.getElementById('lc-theme-btn').addEventListener('click', () => this.openTheme());
        document.getElementById('lc-font-btn').addEventListener('click',  () => this.openFont());

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'F') {
                e.preventDefault();
                this.toggleFocus();
            }
        });
    },

    // ── Focus Mode ────────────────────────────────────────────────────────────
    toggleFocus: function () {
        this.focusActive = !this.focusActive;
        if (this.focusActive) {
            document.body.classList.add('lc-focus-mode');
        } else {
            document.body.classList.remove('lc-focus-mode');
        }
        this._updateToggleStates();
    },

    // ── Vim Mode ──────────────────────────────────────────────────────────────
    toggleVim: function () {
        this.vimActive = !this.vimActive;
        this._updateToggleStates();

        window.postMessage({
            source:  'lc-intellisense',
            type:    'TOGGLE_VIM',
            payload: { enabled: this.vimActive }
        }, '*');
    },

    // ── Theme Modal ───────────────────────────────────────────────────────────
    _buildThemeModal: function () {
        const modal = document.createElement('div');
        modal.id = 'lc-theme-modal';
        modal.style.display = 'none';

        const panel = document.createElement('div');
        panel.id = 'lc-theme-panel';
        panel.innerHTML = `
            <div class="lc-modal-header">
                <span>🎨 Editor Themes</span>
                <button class="lc-modal-close" id="lc-theme-close">✕</button>
            </div>
            <div id="lc-theme-grid"></div>`;

        const grid = panel.querySelector('#lc-theme-grid');
        Object.entries(this.THEMES).forEach(([name, t]) => {
            const swatch = document.createElement('div');
            swatch.className = 'lc-theme-swatch';
            swatch.style.background = t.bg;
            swatch.innerHTML = `
                <div class="lc-swatch-preview" style="color:${t.fg}">
                    <span style="color:#ff7b72">def</span> <span style="color:${t.fg}">solve</span>():
                </div>
                <div class="lc-swatch-name" style="color:${t.fg}">${name}</div>`;
            swatch.addEventListener('click', () => this.applyTheme(name, t));
            grid.appendChild(swatch);
        });

        modal.appendChild(panel);
        document.body.appendChild(modal);

        document.getElementById('lc-theme-close').addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    },

    openTheme: function () {
        document.getElementById('lc-theme-modal').style.display = 'flex';
    },

    applyTheme: function (name, t) {
        // Send to monaco-hook via postMessage
        window.postMessage({
            source:  'lc-intellisense',
            type:    'SET_THEME',
            payload: { name, ...t }
        }, '*');

        // Mark active swatch
        document.querySelectorAll('.lc-theme-swatch').forEach(s => {
            s.classList.toggle('lc-swatch-active', s.querySelector('.lc-swatch-name').textContent === name);
        });

        document.getElementById('lc-theme-modal').style.display = 'none';
    },

    // ── Font Modal ────────────────────────────────────────────────────────────
    _buildFontModal: function () {
        const modal = document.createElement('div');
        modal.id = 'lc-font-modal';
        modal.style.display = 'none';

        const panel = document.createElement('div');
        panel.id = 'lc-font-panel';
        panel.innerHTML = `
            <div class="lc-modal-header">
                <span>Aa Font Settings</span>
                <button class="lc-modal-close" id="lc-font-close">✕</button>
            </div>
            <div class="lc-font-section-label">Family</div>
            <div id="lc-font-list"></div>
            <div class="lc-font-section-label">Size</div>
            <div id="lc-font-size-row">
                <button id="lc-font-dec">−</button>
                <span id="lc-font-size-display">14px</span>
                <button id="lc-font-inc">+</button>
            </div>`;

        const fontList = panel.querySelector('#lc-font-list');
        this.FONTS.forEach(font => {
            const item = document.createElement('div');
            item.className = 'lc-font-item';
            item.style.fontFamily = font + ', monospace';
            item.textContent = font;
            item.dataset.font = font;
            if (font === this.currentFont) item.classList.add('lc-font-item-active');
            item.addEventListener('click', () => {
                this.currentFont = font;
                document.querySelectorAll('.lc-font-item').forEach(i => i.classList.remove('lc-font-item-active'));
                item.classList.add('lc-font-item-active');
                this._applyFont();
            });
            fontList.appendChild(item);
        });

        modal.appendChild(panel);
        document.body.appendChild(modal);

        document.getElementById('lc-font-close').addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

        document.getElementById('lc-font-inc').addEventListener('click', () => {
            this.currentSize = Math.min(this.currentSize + 1, 22);
            document.getElementById('lc-font-size-display').textContent = this.currentSize + 'px';
            this._applyFont();
        });
        document.getElementById('lc-font-dec').addEventListener('click', () => {
            this.currentSize = Math.max(this.currentSize - 1, 10);
            document.getElementById('lc-font-size-display').textContent = this.currentSize + 'px';
            this._applyFont();
        });
    },

    openFont: function () {
        document.getElementById('lc-font-modal').style.display = 'flex';
    },

    _applyFont: function () {
        window.postMessage({
            source:  'lc-intellisense',
            type:    'SET_FONT',
            payload: { family: this.currentFont, size: this.currentSize }
        }, '*');
    },

    // ── Tag Hover Stats ───────────────────────────────────────────────────────
    _initTagHover: function () {
        const SOLVED_KEY = 'lc-tag-solved';

        // Build floating hovercard
        const card = document.createElement('div');
        card.id = 'lc-tag-hovercard';
        card.style.display = 'none';
        document.body.appendChild(card);

        const getSolved = () => {
            try { return JSON.parse(localStorage.getItem(SOLVED_KEY) || '{}'); }
            catch (_) { return {}; }
        };

        // Observe the DOM for tag elements being added
        const observer = new MutationObserver(() => {
            // LeetCode tags usually have data-* attributes or a specific class
            document.querySelectorAll('a[href*="/tag/"], a[href*="/problems/tag/"]').forEach(tag => {
                if (tag.dataset.lcHover) return;
                tag.dataset.lcHover = '1';

                tag.addEventListener('mouseenter', (e) => {
                    const tagName = tag.textContent.trim();
                    const solved  = getSolved();
                    const count   = solved[tagName] || 0;
                    const total   = tag.closest('[class]')?.querySelector('span')?.textContent || '?';

                    card.innerHTML = `
                        <div class="lc-hc-title">${tagName}</div>
                        <div class="lc-hc-row">
                            <span class="lc-hc-label">Your solves</span>
                            <span class="lc-hc-val">${count}</span>
                        </div>
                        <div class="lc-hc-bar-wrap">
                            <div class="lc-hc-bar-fill" style="width:${Math.min(count * 5, 100)}%"></div>
                        </div>`;
                    card.style.display = 'block';
                    card.style.top  = (e.clientY + 14) + 'px';
                    card.style.left = (e.clientX + 10) + 'px';
                });

                tag.addEventListener('mouseleave', () => {
                    card.style.display = 'none';
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // When a problem is accepted, record its tags
        window.addEventListener('message', (e) => {
            if (e.data?.type === 'LC_PROBLEM_ACCEPTED') {
                const tags = document.querySelectorAll('a[href*="/tag/"]');
                const solved = getSolved();
                tags.forEach(t => {
                    const name = t.textContent.trim();
                    solved[name] = (solved[name] || 0) + 1;
                });
                localStorage.setItem(SOLVED_KEY, JSON.stringify(solved));
            }
        });
    }
};
