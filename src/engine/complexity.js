// ── Complexity Analyzer Engine ────────────────────────────────────────────────
// Scans code heuristically and badges the editor with detected complexity
window.LCComplexity = {
    badge: null,

    init: function () {
        const badge = document.createElement('div');
        badge.id = 'lc-complexity-badge';
        badge.style.display = 'none';
        document.body.appendChild(badge);
        this.badge = badge;
    },

    analyze: function (code, language) {
        if (!code || !this.badge) return;

        const lines = code.split('\n').filter(l => {
            const t = l.trim();
            // Ignore blank lines and single-line comments
            return t.length > 0 && !t.startsWith('#') && !t.startsWith('//');
        });

        let maxLoopDepth = 0;
        let currentDepth = 0;
        let hasSorting   = false;
        let hasRecursion = false;
        let hasLogN      = false;
        let hasDPTable   = false;
        let fnName       = '';

        // Extract top-level function name for recursion detection
        const fnMatch = code.match(/def\s+(\w+)|function\s+(\w+)|(\w+)\s*=\s*function/);
        if (fnMatch) fnName = fnMatch[1] || fnMatch[2] || fnMatch[3] || '';

        const loopKeywords   = /^\s*(for|while)\b/;
        const sortKeywords   = /\b(sort|sorted|Arrays\.sort|Collections\.sort|std::sort|sort\.Strings)\b/;
        const binaryKeywords = /\b(bisect|binary_search|lower_bound|upper_bound|mid\s*=)\b/;
        const dpTab          = /\b(dp\[|memo\[|cache\[)\b/;
        const indentSize     = (language === 'python') ? 4 : 2;

        for (const line of lines) {
            if (loopKeywords.test(line)) currentDepth++;
            if (sortKeywords.test(line))   hasSorting   = true;
            if (binaryKeywords.test(line)) hasLogN      = true;
            if (dpTab.test(line))          hasDPTable   = true;
            if (fnName && line.includes(fnName + '(') && !line.includes('def ') && !line.includes('function ')) {
                hasRecursion = true;
            }
            if (currentDepth > maxLoopDepth) maxLoopDepth = currentDepth;

            // Detect loop closing (outdent)
            const closing = /^\s*(return|break|pass|})\s*$/.test(line);
            if (closing && currentDepth > 0) currentDepth--;
        }

        // Determine time complexity label
        let time, space, color;
        if (maxLoopDepth >= 3) {
            time  = 'O(n³)'; color = '#ef4444'; // Red — bad
        } else if (maxLoopDepth === 2) {
            time  = 'O(n²)'; color = '#f97316'; // Orange — warn
        } else if (hasRecursion && hasDPTable) {
            time  = 'O(n·m)'; color = '#f59e0b'; // Amber — DP
        } else if (hasSorting) {
            time  = 'O(n log n)'; color = '#a78bfa'; // Purple — sort
        } else if (hasLogN) {
            time  = 'O(log n)'; color = '#34d399'; // Green — efficient
        } else if (maxLoopDepth === 1) {
            time  = 'O(n)'; color = '#22d3ee'; // Cyan — linear
        } else {
            time  = 'O(1)'; color = '#10b981'; // Emerald — constant
        }

        // Space complexity heuristic
        if (hasDPTable || hasRecursion) {
            space = 'O(n)';
        } else {
            space = 'O(1)';
        }

        this.badge.innerHTML = `
            <div class="lc-cx-row">
                <span class="lc-cx-label">Time</span>
                <span class="lc-cx-value" style="color:${color}">${time}</span>
            </div>
            <div class="lc-cx-divider"></div>
            <div class="lc-cx-row">
                <span class="lc-cx-label">Space</span>
                <span class="lc-cx-value" style="color:#94a3b8">${space}</span>
            </div>`;
        this.badge.style.display = 'flex';
    }
};
