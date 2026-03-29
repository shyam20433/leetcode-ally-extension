// Syntax-light type inference engine

let symbolTable = new Map();

window.parseSymbols = function(code) {
    if(!code) return;
    
    symbolTable.clear();
    const lines = code.split('\n');
    
    const lang = window.LCExtension.language;
    
    for (let line of lines) {
        line = line.trim();
        if(!line) continue;
        
        let type = inferLineType(line, lang);
        if (type) {
            symbolTable.set(type.name, type.type);
        }
    }
    console.log("[LeetCode IntelliSense] Extracted symbols:", Object.fromEntries(symbolTable));
};

function inferLineType(line, lang) {
    // Very rudimentary regex inference
    
    if (lang === 'python') {
        const listMatch = line.match(/([a-zA-Z0-9_]+)\s*=\s*\[.*\]/);
        if (listMatch) return { name: listMatch[1], type: 'list' };
        
        const dictMatch = line.match(/([a-zA-Z0-9_]+)\s*=\s*\{.*\}/);
        if (dictMatch) return { name: dictMatch[1], type: 'dict' };
        
        const stringMatch = line.match(/([a-zA-Z0-9_]+)\s*=\s*(['"].*['"])/);
        if (stringMatch) return { name: stringMatch[1], type: 'string' };
        
        const setMatch = line.match(/([a-zA-Z0-9_]+)\s*=\s*set\(/);
        if (setMatch) return { name: setMatch[1], type: 'set' };
        
        const dequeMatch = line.match(/([a-zA-Z0-9_]+)\s*=\s*(?:collections\.)?deque\(/);
        if (dequeMatch) return { name: dequeMatch[1], type: 'deque' };
        
        const defaultDictMatch = line.match(/([a-zA-Z0-9_]+)\s*=\s*(?:collections\.)?defaultdict\(/);
        if (defaultDictMatch) return { name: defaultDictMatch[1], type: 'dict' };
        
        const counterMatch = line.match(/([a-zA-Z0-9_]+)\s*=\s*(?:collections\.)?Counter\(/);
        if (counterMatch) return { name: counterMatch[1], type: 'dict' };
    }
    
    if (lang === 'java' || lang === 'cpp') {
        const varMatch = line.match(/^([A-Z][a-zA-Z0-9_<>]*)\s+([a-zA-Z0-9_]+)\s*=/);
        if (varMatch) {
            let typeName = varMatch[1].toLowerCase();
            if (typeName.includes('list') || typeName.includes('vector')) return { name: varMatch[2], type: 'list' };
            if (typeName.includes('map')) return { name: varMatch[2], type: 'dict' };
            if (typeName.includes('string')) return { name: varMatch[2], type: 'string' };
            if (typeName.includes('set')) return { name: varMatch[2], type: 'set' };
        }
    }
    
    if (lang === 'javascript' || lang === 'typescript') {
        const arrMatch = line.match(/(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*\[.*\]/);
        if(arrMatch) return { name: arrMatch[2], type: 'list' };
        
        const objMatch = line.match(/(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*\{.*\}/);
        if(objMatch) return { name: objMatch[2], type: 'dict' };
        
        const mapMatch = line.match(/(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*new Map/);
        if(mapMatch) return { name: mapMatch[2], type: 'dict' };
    }
    
    return null;
}

window.inferType = function(varName) {
    if (symbolTable.has(varName)) return symbolTable.get(varName);

    // Hardcode module names
    if (varName === 'collections') return 'collections';
    if (varName === 'math') return 'math';
    if (varName === 'heapq') return 'heapq';
    if (varName === 'bisect') return 'bisect';
    if (varName === 'itertools') return 'itertools';

    // Hardcode some obvious things like array indexing: `dp[i]` -> unknown unless typed
    // Fallback dictionary names
    if (varName.includes('map') || varName.includes('dict') || varName === 'cache' || varName === 'memo') return 'dict';
    if (varName.includes('arr') || varName.includes('list') || varName === 'res' || varName === 'ans') return 'list';
    if (varName.includes('set')) return 'set';
    if (varName.includes('str') || varName === 's') return 'string';

    return 'unknown';
};
