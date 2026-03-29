// Core engine to compute suggestions

window.initEngine = function() {
    if (!window.LCProviders) window.LCProviders = {};
};

window.handleCursorChange = function(payload) {
    if (!window.LCExtension.active) return;
    
    // Check if user has disabled suggestions via the new toggle
    if (window.LCControls && window.LCControls.suggestionsActive === false) {
        if (window.hideUI) window.hideUI();
        return;
    }
    
    const { lineContent, coords, position, fullText } = payload;
    
    // Check if we are typing a word or after a dot
    const linePrefix = lineContent.substring(0, position.column - 1);
    
    // Regex for: `varName.` or just `word`
    const match = linePrefix.match(/([a-zA-Z0-9_\[\]]+)\.([a-zA-Z0-9_]*)$/);
    const bareMatch = linePrefix.match(/[a-zA-Z0-9_]+$/);
    
    let isMethodOrProperty = false;
    let objectName = null;
    let token = '';
    
    if (match) {
        isMethodOrProperty = true;
        objectName = match[1];
        token = match[2];
    } else if (bareMatch) {
        token = bareMatch[0];
    } else {
        window.hideUI();
        return;
    }
    
    let langId = payload.language || window.LCExtension.language || 'python';
    
    // Normalize leetcode language ids
    if (langId === 'python3') langId = 'python';
    if (langId === 'c' || langId === 'c++') langId = 'cpp';
    if (langId === 'typescript') langId = 'javascript';
    
    // If Leetcode stripped Monaco workers, it falls back to plaintext. Guess from source code snippet.
    if (langId === 'plaintext') {
        const text = payload.fullText || '';
        if (text.includes('class Solution:') || text.includes('def ')) langId = 'python';
        else if (text.includes('public class Solution')) langId = 'java';
        else if (text.includes('public:') || text.includes('#include')) langId = 'cpp';
        else if (text.includes('function') || text.includes('=>') || text.includes('var ')) langId = 'javascript';
        else langId = 'python'; // absolute fallback
    }
    
    let provider = window.LCProviders[langId] || window.LCProviders['base'];
    if (!provider) {
        console.warn("[LeetCode IntelliSense] No provider for " + langId);
        window.hideUI();
        return;
    }
    
    let suggestions = [];
    
    if (isMethodOrProperty) {
        // Try to infer type
        const type = window.inferType(objectName) || 'unknown';
        suggestions = provider.getMethodSuggestions(type, token);
    } else {
        suggestions = provider.getGlobalSuggestions(token);
        // Also merge with Snippets
        if (window.LCSnippets) {
            suggestions = suggestions.concat(window.LCSnippets.getSnippets(token, langId));
        }

        // --- NEW: Dynamic Local Variable Autocomplete ---
        if (fullText) {
            const localVars = new Set();
            const lines = fullText.split('\n');
            lines.forEach(line => {
                let cleanLine = line.replace(/(".*?"|'.*?'|#.*|\/\/.*)/g, '');
                
                // Function arguments (Python, Java, TS)
                const defMatch = cleanLine.match(/(?:def|function|void|int|ListNode)\s+(\w+)\s*\(([^)]*)\)/);
                if (defMatch) {
                    localVars.add(defMatch[1]);
                    const args = defMatch[2].split(',');
                    args.forEach(a => {
                        const varName = a.split(':')[0].split('=')[0].trim().split(' ').pop();
                        if (varName && /^[a-zA-Z_]\w*$/.test(varName) && varName !== 'self') localVars.add(varName);
                    });
                }
                
                // Python iterators
                const iterMatch = cleanLine.match(/for\s+([a-zA-Z0-9_, ]+)\s+in/);
                if (iterMatch) {
                    const vars = iterMatch[1].split(',');
                    vars.forEach(v => {
                        const t = v.trim();
                        if (/^[a-zA-Z_]\w*$/.test(t)) localVars.add(t);
                    });
                }
                
                // C++ / Java / TS iterators
                const forMatch = cleanLine.match(/for\s*\(\s*(?:let|var|const|int)\s+([a-zA-Z0-9_]+)/);
                if (forMatch) localVars.add(forMatch[1]);
                
                // Standard assignments and declarations
                const eqMatch = cleanLine.match(/^[ \t]*(?:let\s+|const\s+|var\s+|int\s+|float\s+|double\s+)?([a-zA-Z0-9_, ]+)\s*(?:=|\+=|-=|\*=|(\/\/)=|%=|:)/);
                if (eqMatch) {
                    const vars = eqMatch[1].split(',');
                    vars.forEach(v => {
                        const trimmed = v.trim();
                        if (trimmed && /^[a-zA-Z_]\w*$/.test(trimmed)) localVars.add(trimmed);
                    });
                }
            });
            
            // Append local variables to suggestions
            for (let v of localVars) {
                if (!suggestions.find(s => s.label === v)) {
                    suggestions.push({
                        label: v,
                        type: 'property', 
                        insertText: v,
                        detail: 'local variable'
                    });
                }
            }
        }
    }
    
    // Strip trailing parentheses if we are inside an import statement
    const isImportContext = /\b(import|from)\b/.test(linePrefix);
    if (isImportContext) {
        suggestions = suggestions.map(s => {
            if (s.insertText && s.insertText.endsWith('(')) {
                return Object.assign({}, s, { insertText: s.insertText.slice(0, -1) });
            }
            return s;
        });
    }
    
    // Sort and filter suggestions based on token
    if (token) {
        suggestions = suggestions.filter(s => s.label.toLowerCase().startsWith(token.toLowerCase()));
        
        // Secondary sort: exact match, then rest
        suggestions.sort((a, b) => {
            const aMatch = a.label.toLowerCase().startsWith(token.toLowerCase());
            const bMatch = b.label.toLowerCase().startsWith(token.toLowerCase());
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return a.label.localeCompare(b.label);
        });
    }

    if (suggestions.length > 0) {
        window.renderSuggestions(suggestions, coords, token);
    } else {
        window.hideUI();
    }
};

let debounceTimer = null;
window.handleContentChange = function(payload) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        if (window.parseSymbols) {
            window.parseSymbols(payload.fullText);
        }
        
        // Initialize spell checker if not already
        if (window.LCSpellChecker && !window.LCSpellChecker.initialized) {
            window.LCSpellChecker.init();
        }
        
        let allMarkers = [];

        if (window.LCLinter && window.LCExtension.language) {
            allMarkers = allMarkers.concat(window.LCLinter.lint(payload.fullText, window.LCExtension.language));
        }
        
        if (window.LCSpellChecker && window.LCSpellChecker.initialized) {
            allMarkers = allMarkers.concat(window.LCSpellChecker.check(payload.fullText));
        }
        
        window.postMessage({
            source: 'lc-extension',
            type: 'UPDATE_MARKERS',
            payload: { markers: allMarkers }
        }, '*');
        
    }, 500); // 500ms debounce
};
