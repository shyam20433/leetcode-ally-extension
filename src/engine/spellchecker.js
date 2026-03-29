// Minimalist cSpell architecture
window.LCSpellChecker = {
    dictionary: new Set([
        // JSDoc / Documentation keywords
        'param', 'return', 'returns', 'throws', 'exception', 'see', 'link', 'example', 'type',
        'typeof', 'yield', 'async', 'await', 'constructor', 'extends', 'super', 'implements',
        'interface', 'enum', 'abstract', 'readonly', 'private', 'public', 'protected',
        'static', 'final', 'override', 'deprecated', 'since', 'author', 'version',

        // Boilerplate / Technical terms
        'nums', 'target', 'arr', 'res', 'ans', 'val', 'node', 'prev', 'curr', 'next', 'idx', 
        'ptr', 'length', 'size', 'hash', 'map', 'dict', 'str', 'int', 'bool', 'float', 'char', 
        'self', 'append', 'pop', 'push', 'shift', 'unshift', 'splice', 'slice', 'concat',
        'return', 'class', 'def', 'function', 'void', 'null', 'undefined', 'true', 'false',
        'array', 'string', 'number', 'boolean', 'object', 'break', 'continue', 'while', 'for',
        'import', 'export', 'default', 'const', 'let', 'var', 'async', 'await', 'node', 'tree',
        'graph', 'vert', 'edge', 'left', 'right', 'root', 'dummy', 'head', 'tail', 'temp', 'tmp',
        'collections', 'math', 'heapq', 'bisect', 'itertools', 'deque', 'popleft', 'appendleft',
        'print', 'len', 'range', 'enumerate', 'zip', 'sum', 'min', 'max', 'sorted'
    ]),
    initialized: false,

    init: function() {
        if (this.initialized) return;

        // Mark ready immediately with the built-in dictionary — no background fetch needed
        this.initialized = true;
        console.log(`[LeetCode IntelliSense] Spellchecker ready with ${this.dictionary.size} words.`);

        // Optionally fetch extra words from background — only if runtime context is still valid
        try {
            if (chrome?.runtime?.id) {
                chrome.runtime.sendMessage({ action: 'FETCH_DICTIONARY' }, (response) => {
                    // Silently ignore if context was invalidated between check and callback
                    if (chrome.runtime.lastError) return;
                    if (response && response.words) {
                        response.words.forEach(w => this.dictionary.add(w.toLowerCase()));
                    }
                });
            }
        } catch (_) {
            // Extension context already invalidated — built-in dictionary is sufficient
        }
    },


    check: function(code) {
        // Toggle Guard: Check if user enabled spellcheck in the dashboard
        if (window.LCControls && window.LCControls.spellcheckActive === false) {
            return [];
        }
        
        let markers = [];
        // Only run if we actually have a reasonable dictionary size
        if (this.dictionary.size < 100) return markers; 

        const lines = code.split('\n');
        const wordRegex = /[a-zA-Z]+/g;
        
        lines.forEach((line, r) => {
            // Ignore cSpell overrides
            if (line.includes('cSpell:disable') || line.includes('spell-checker:disable')) return;
            
            let match;
            while ((match = wordRegex.exec(line)) !== null) {
                const fullWord = match[0];
                
                // Skip JSDoc tags like @param (detect @ before word in line context)
                if (match.index > 0 && line[match.index - 1] === '@') continue;
                
                if (fullWord.length < 4) continue; 
                
                // Split CamelCase and snake_case correctly
                const subWords = fullWord
                    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase -> camel Case
                    .replace(/_/g, ' ')                 // snake_case -> snake case
                    .split(' ');
                
                let isMisspelled = false;
                let badPart = "";
                
                for (let part of subWords) {
                    if (part.length >= 4) {
                        // Special case for ALL CAPS trailing 's', 'ed', 'ing'
                        let checkPart = part.toLowerCase();
                        if (checkPart.endsWith('s') && !this.dictionary.has(checkPart)) checkPart = checkPart.slice(0, -1);
                        else if (checkPart.endsWith('ed') && !this.dictionary.has(checkPart)) checkPart = checkPart.slice(0, -2);
                        
                        if (!this.dictionary.has(checkPart)) {
                            isMisspelled = true;
                            badPart = part;
                            break;
                        }
                    }
                }
                
                if (isMisspelled) {
                    markers.push({
                        severity: 2, // Info / Hint style (usually blue/green squiggle depending on theme)
                        message: `Spell Checker: Unknown word "${badPart}"`,
                        startLineNumber: r + 1,
                        startColumn: match.index + 1,
                        endLineNumber: r + 1,
                        endColumn: match.index + 1 + fullWord.length
                    });
                }
            }
        });

        return markers;
    }
};
