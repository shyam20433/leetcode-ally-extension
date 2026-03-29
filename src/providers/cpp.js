class CppProvider extends BaseProvider {
    constructor() {
        super();
        this.globals = [
            { label: 'max', kind: 'method', detail: '(a, b)', insertText: 'max(' },
            { label: 'min', kind: 'method', detail: '(a, b)', insertText: 'min(' },
            { label: 'abs', kind: 'method', detail: '(a)', insertText: 'abs(' },
            { label: 'sort', kind: 'method', detail: '(first, last)', insertText: 'sort(' },
            { label: 'reverse', kind: 'method', detail: '(first, last)', insertText: 'reverse(' },
            { label: 'accumulate', kind: 'method', detail: '(first, last, init)', insertText: 'accumulate(' },
            { label: 'lower_bound', kind: 'method', detail: '(first, last, val)', insertText: 'lower_bound(' },
            { label: 'upper_bound', kind: 'method', detail: '(first, last, val)', insertText: 'upper_bound(' },
            { label: 'vector', kind: 'class', detail: '<T>', insertText: 'vector<' },
            { label: 'string', kind: 'class', detail: '', insertText: 'string ' },
            { label: 'unordered_map', kind: 'class', detail: '<K, V>', insertText: 'unordered_map<' },
            { label: 'unordered_set', kind: 'class', detail: '<T>', insertText: 'unordered_set<' }
        ];

        this.listMethods = [
            { label: 'push_back', kind: 'method', detail: '(val)' },
            { label: 'pop_back', kind: 'method', detail: '()' },
            { label: 'size', kind: 'method', detail: '()' },
            { label: 'empty', kind: 'method', detail: '()' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'begin', kind: 'method', detail: '()' },
            { label: 'end', kind: 'method', detail: '()' },
            { label: 'front', kind: 'method', detail: '()' },
            { label: 'back', kind: 'method', detail: '()' }
        ];

        this.dictMethods = [
            { label: 'insert', kind: 'method', detail: '(pair)' },
            { label: 'erase', kind: 'method', detail: '(key)' },
            { label: 'find', kind: 'method', detail: '(key)' },
            { label: 'count', kind: 'method', detail: '(key)' },
            { label: 'size', kind: 'method', detail: '()' },
            { label: 'empty', kind: 'method', detail: '()' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'begin', kind: 'method', detail: '()' },
            { label: 'end', kind: 'method', detail: '()' }
        ];

        this.stringMethods = [
            { label: 'length', kind: 'method', detail: '()' },
            { label: 'size', kind: 'method', detail: '()' },
            { label: 'substr', kind: 'method', detail: '(pos, count)' },
            { label: 'find', kind: 'method', detail: '(str)' },
            { label: 'empty', kind: 'method', detail: '()' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'push_back', kind: 'method', detail: '(ch)' },
            { label: 'pop_back', kind: 'method', detail: '()' },
            { label: 'begin', kind: 'method', detail: '()' },
            { label: 'end', kind: 'method', detail: '()' }
        ];

        this.setMethods = this.dictMethods;
    }
}

if (!window.LCProviders) window.LCProviders = {};
window.LCProviders['cpp'] = new CppProvider();
