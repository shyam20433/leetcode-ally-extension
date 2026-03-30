// Lightweight internal Python Linter for Monaco Editor

window.LCLinter = {
    lint: function(code, lang) {
        const markers = [];
        
        // Normalize lang
        if (lang === 'python3') lang = 'python';
        if (lang !== 'python') return markers;
        
        const lines = code.split('\n');
        
        // 1. Declarations Gatherer
        const decls = new Set([
            'self', 'List', 'Optional', 'TreeNode', 'ListNode', 'int', 'str', 'float', 'bool', 'dict', 'set', 'tuple',
            'collections', 'math', 'heapq', 'bisect', 'itertools', 'deque', 'Counter', 'defaultdict', 
            'True', 'False', 'None',
            // LeetCode specific Globals/APIs
            'isBadVersion', 'guess', 'master', 'Node', 'mountainArray', 'NodeList'
        ]);
        
        const builtins = [
            'print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sum', 'min', 'max', 'sorted', 
            'abs', 'divmod', 'pow', 'all', 'any', 'dir', 'id', 'type', 'isinstance', 'issubclass', 'Exception', 'ValueError', 'TypeError'
        ];
        builtins.forEach(b => decls.add(b));
        
        const keywords = new Set([
            'if', 'else', 'elif', 'return', 'while', 'for', 'break', 'continue', 'pass', 'def', 'class', 
            'import', 'from', 'as', 'global', 'nonlocal', 'assert', 'yield', 'del', 'try', 
            'except', 'finally', 'raise', 'with', 'lambda', 'and', 'or', 'not', 'is', 'in', 'inf',
            'async', 'await'
        ]);

        // First pass: extract definitions
        lines.forEach(line => {
            let cleanLine = line.replace(/(".*?"|'.*?'|#.*)/g, '');
            
            // function args & name
            const defMatch = cleanLine.match(/def\s+(\w+)\s*\(([^)]*)\)/);
            if (defMatch) {
                decls.add(defMatch[1]); // add function name itself
                const args = defMatch[2].split(',');
                args.forEach(a => {
                    const varName = a.split(':')[0].split('=')[0].trim();
                    if (varName) decls.add(varName);
                });
            }
            
            // classes
            const classMatch = cleanLine.match(/class\s+(\w+)/);
            if (classMatch) decls.add(classMatch[1]);
            
            // for loops
            const iterMatch = cleanLine.match(/for\s+([a-zA-Z0-9_, ]+)\s+in/);
            if (iterMatch) {
                const vars = iterMatch[1].split(',');
                vars.forEach(v => decls.add(v.trim()));
            }
            
            // Assignments at the start of line (e.g. x, y = 0, 1 or res = [])
            const eqMatch = cleanLine.match(/^(\s*)([a-zA-Z0-9_, ]+)\s*(?:=|\+=|-=|\*=|(\/\/)=|%=)/);
            if (eqMatch) {
                const vars = eqMatch[2].split(',');
                vars.forEach(v => {
                    const trimmed = v.trim();
                    if (trimmed && /^[a-zA-Z_]\w*$/.test(trimmed)) decls.add(trimmed);
                });
            }
        });
        
        let expectedIndentStr = '';

        // Second pass: Catch errors
        lines.forEach((line, idx) => {
            const lineNumber = idx + 1;
            const rawLine = line;
            
            // Check Indentation Error
            if (rawLine.trim().length > 0) {
                const leadingSpaces = rawLine.match(/^\s*/)[0].length;
                if (leadingSpaces % 4 !== 0 && !rawLine.includes('\t')) {
                    markers.push({
                        severity: 4, // Warning (Yellow squiggle)
                        message: "Indentation shouldn't have an odd number of spaces (prefer multiples of 4)",
                        startLineNumber: lineNumber,
                        startColumn: 1,
                        endLineNumber: lineNumber,
                        endColumn: leadingSpaces + 1
                    });
                }
            }
            
            let cleanLine = line.replace(/(".*?"|'.*?'|#.*)/g, function(match) {
                return ' '.repeat(match.length); // preserve index positions!
            });
            
            const words = cleanLine.matchAll(/\b([a-zA-Z_]\w*)\b/g);
            for (const match of words) {
                const word = match[1];
                const index = match.index;
                
                // Allow keywords and known declarations
                if (decls.has(word) || keywords.has(word)) continue;
                
                // Ignore if it's an attribute method e.g. `obj.append`  (preceded by dot)
                if (index > 0 && cleanLine[index - 1] === '.') continue;
                
                // Ignore keyword arguments like pop(index=-1)
                const nextCharIndex = index + word.length;
                let isKwarg = false;
                for(let i = nextCharIndex; i < cleanLine.length; i++) {
                    if (cleanLine[i] === ' ') continue;
                    if (cleanLine[i] === '=') isKwarg = true;
                    break;
                }
                if (isKwarg) continue;
                
                // Flag it
                markers.push({
                    severity: 8, // Error (Red squiggle)
                    message: `Variable '${word}' is referenced before assignment or undefined.`,
                    startLineNumber: lineNumber,
                    startColumn: index + 1,
                    endLineNumber: lineNumber,
                    endColumn: index + 1 + word.length
                });
            }
        });
        
        // Third pass: Bracket matching syntax checker
        const stack = [];
        const opening = '([{';
        const closing = ')]}';
        const matchPair = { ')': '(', ']': '[', '}': '{' };
        
        let inStr = false;
        let strChar = '';
        
        for (let r = 0; r < lines.length; r++) {
            let line = lines[r];
            for (let c = 0; c < line.length; c++) {
                let char = line[c];
                
                // toggle string ignore
                if ((char === '"' || char === "'") && (c === 0 || line[c-1] !== '\\')) {
                    if (!inStr) {
                        inStr = true;
                        strChar = char;
                    } else if (char === strChar) {
                        inStr = false;
                    }
                    continue;
                }
                
                if (inStr || char === '#') {
                    if (char === '#') break; // rest of line is comment
                    continue; 
                }
                
                if (opening.includes(char)) {
                    stack.push({ char, line: r + 1, col: c + 1 });
                } else if (closing.includes(char)) {
                    if (stack.length === 0) {
                        // Unmatched closing bracket immediately
                        markers.push({
                            severity: 8,
                            message: `Syntax Error: Unmatched closing bracket '${char}'`,
                            startLineNumber: r + 1,
                            startColumn: c + 1,
                            endLineNumber: r + 1,
                            endColumn: c + 2
                        });
                    } else {
                        let top = stack.pop();
                        if (top.char !== matchPair[char]) {
                            // Mismatched bracket type
                            markers.push({
                                severity: 8,
                                message: `Syntax Error: Closing bracket '${char}' does not match opening bracket '${top.char}' from line ${top.line}`,
                                startLineNumber: r + 1,
                                startColumn: c + 1,
                                endLineNumber: r + 1,
                                endColumn: c + 2
                            });
                        }
                    }
                }
            }
        }
        
        // Anything left in stack at the very end is an unclosed opening bracket
        if (stack.length > 0) {
            for (let unclosed of stack) {
                markers.push({
                    severity: 8,
                    message: `Syntax Error: Unclosed bracket '${unclosed.char}'`,
                    startLineNumber: unclosed.line,
                    startColumn: unclosed.col,
                    endLineNumber: unclosed.line,
                    endColumn: unclosed.col + 1
                });
            }
        }

        return markers;
    }
};
