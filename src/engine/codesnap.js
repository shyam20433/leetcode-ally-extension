// Advanced Screenshot & CodeSnap Engine
window.LCSnapEngine = {
    lastMonacoSelection: '',

    init: function() {
        // Listen for Monaco selection events routed from main.js
        window.addEventListener('message', (e) => {
            if (e.data && e.data.source === 'lc-monaco-hook' && e.data.type === 'SELECTION_CHANGED') {
                this.lastMonacoSelection = e.data.payload.text;
            }
        });
        
        this.buildModalDOM();
    },

    buildModalDOM: function() {
        const modal = document.createElement('div');
        modal.id = 'lc-codesnap-modal';
        modal.innerHTML = `
            <div id="lc-codesnap-card-wrapper">
                <div id="lc-codesnap-card">
                    <div class="lc-mac-header">
                        <div class="lc-mac-dot" style="background:#ff5f56"></div>
                        <div class="lc-mac-dot" style="background:#ffbd2e"></div>
                        <div class="lc-mac-dot" style="background:#27c93f"></div>
                        <div class="lc-mac-title">LeetCode</div>
                    </div>
                    <div id="lc-codesnap-content"></div>
                </div>
            </div>
            <div id="lc-codesnap-actions">
                <button id="lc-codesnap-close">Cancel</button>
                <button id="lc-codesnap-download">Download Screenshot 💾</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('lc-codesnap-close').addEventListener('click', () => this.closeModal());
        document.getElementById('lc-codesnap-download').addEventListener('click', () => this.captureAndDownload());
    },

    openModal: function() {
        const modal = document.getElementById('lc-codesnap-modal');
        const content = document.getElementById('lc-codesnap-content');
        
        content.innerHTML = ''; // clear

        const sel = window.getSelection();
        const nativeText = sel.toString().trim();
        
        // Inspect up the DOM tree to see if the user highlighted inside the visual editor
        let isMonacoSource = false;
        let node = sel.anchorNode;
        while (node) {
            if (node.classList && node.classList.contains('monaco-editor')) {
                isMonacoSource = true;
                break;
            }
            node = node.parentNode;
        }
        
        if (nativeText.length > 0 && !isMonacoSource) {
            // They are highlighting the literal problem description HTML, so safely clone it!
            const fragment = sel.getRangeAt(0).cloneContents();
            content.appendChild(fragment);
            
            // Un-invert colors for dark mode context
            content.style.color = '#ffffff';
        } 
        else if (this.lastMonacoSelection && this.lastMonacoSelection.trim().length > 0) {
            // 2. Fall back to the pure string-extracted Monaco Code selection
            const pre = document.createElement('pre');
            pre.style.margin = '0';
            pre.style.padding = '0';
            pre.style.whiteSpace = 'pre-wrap'; // Prevent horizontal stretching on long code
            const code = document.createElement('code');
            
            code.innerHTML = this.simpleSyntaxHighlight(this.lastMonacoSelection);
            pre.appendChild(code);
            content.appendChild(pre);
        } else {
            content.innerHTML = '<div style="color: #a1a1aa; text-align: center; padding: 20px;">Please highlight some code or question text first!</div>';
        }

        modal.style.display = 'flex';
    },

    closeModal: function() {
         document.getElementById('lc-codesnap-modal').style.display = 'none';
    },

    simpleSyntaxHighlight: function(text) {
        // Extremely lightweight heuristic python syntax highlighter just for aesthetics
        let html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Single-pass token execution to gracefully prevent breaking injected HTML attributes
        html = html.replace(
            /("[^"]*"|'[^']*')|\b(def|class|if|else|elif|return|while|for|import|from|in|and|or|not|as|yield|async|await)\b|\b(self|List|Optional|int|str|float|bool|dict|set|print|len|range|deque|min|max|sum)\b|\b(\d+)\b/g,
            function(match, str, kw, bltin, num) {
                if (str) return '<span style="color: #a5d6ff;">' + str + '</span>';
                if (kw) return '<span style="color: #ff7b72;">' + kw + '</span>';
                if (bltin) return '<span style="color: #79c0ff;">' + bltin + '</span>';
                if (num) return '<span style="color: #79c0ff;">' + num + '</span>';
                return match;
            }
        );
        
        return html;
    },

    captureAndDownload: async function() {
        const actions = document.getElementById('lc-codesnap-actions');
        const card    = document.getElementById('lc-codesnap-card');
        const content = document.getElementById('lc-codesnap-content');

        // 1. Prepare for capture
        actions.style.display = 'none';
        
        try {
            const rect = card.getBoundingClientRect();
            const W = Math.round(rect.width);
            const H = Math.round(rect.height);

            // ── The SVG ForeignObject Magic ──────────────────────────────────
            // Sanitize: Strip images to prevent "Tainted Canvas" SecurityError
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content.innerHTML;
            tempDiv.querySelectorAll('img, video, iframe, canvas').forEach(el => {
                const placeholder = document.createElement('div');
                placeholder.style.cssText = 'padding: 10px; border: 1px dashed #475569; color: #475569; font-size: 10px; text-align: center; margin: 10px 0; border-radius: 8px;';
                placeholder.textContent = `[ ${el.tagName} REMOVED FOR EXPORT ]`;
                el.replaceWith(placeholder);
            });
            const sanitizedHTML = tempDiv.innerHTML;

            const cardStyles = `
                display: block; 
                background: #0d1117; 
                color: #e2e8f0; 
                font-family: 'JetBrains Mono', monospace; 
                border-radius: 12px; 
                border: 1px solid rgba(255,255,255,0.1);
                overflow: hidden;
            `;

            const svgSrc = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
                    <foreignObject width="100%" height="100%">
                        <div xmlns="http://www.w3.org/1999/xhtml" style="${cardStyles}">
                            <div style="background: rgba(255,255,255,0.03); padding: 12px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <div style="width:11px; height:11px; border-radius:50%; background:#ff5f56"></div>
                                <div style="width:11px; height:11px; border-radius:50%; background:#ffbd2e"></div>
                                <div style="width:11px; height:11px; border-radius:50%; background:#27c93f"></div>
                                <div style="margin-left:auto; margin-right:auto; color:#475569; font-size:11px; font-weight:700; font-family:sans-serif; letter-spacing:0.5px; text-transform:uppercase;">LEETCODE</div>
                            </div>
                            <div style="padding: 24px; white-space: pre-wrap; word-break: break-all;">
                                ${sanitizedHTML}
                            </div>
                        </div>
                    </foreignObject>
                </svg>`;

            const blob = new Blob([svgSrc], { type: 'image/svg+xml;charset=utf-8' });
            const url  = URL.createObjectURL(blob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const dpr = 2; // High-res export
                canvas.width  = W * dpr;
                canvas.height = H * dpr;
                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);
                ctx.drawImage(img, 0, 0, W, H);
                
                canvas.toBlob((blobPng) => {
                    const pngUrl = URL.createObjectURL(blobPng);
                    const a = document.createElement('a');
                    a.href     = pngUrl;
                    a.download = `LeetCode_CodeSnap_${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    
                    // Cleanup
                    setTimeout(() => {
                        URL.revokeObjectURL(pngUrl);
                        URL.revokeObjectURL(url);
                    }, 100);
                }, 'image/png');
            };
            img.onerror = (e) => {
                console.error("[LC Codesnap] Image render error", e);
                alert("Capture failed. Try highlighting less code or simpler text.");
                URL.revokeObjectURL(url);
            };
            img.src = url;

        } catch (err) {
            console.error("[LC Codesnap] Capture error:", err);
            alert("Error generating screenshot: " + err.message);
        } finally {
            actions.style.display = 'flex';
        }
    }
};

// Initialize on load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.LCSnapEngine.init();
} else {
    document.addEventListener('DOMContentLoaded', () => window.LCSnapEngine.init());
}
