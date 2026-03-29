class JSProvider extends BaseProvider {
    constructor() {
        super();
        this.globals = [
            { label: 'Math.max', kind: 'method', detail: '(...values)', insertText: 'Math.max(' },
            { label: 'Math.min', kind: 'method', detail: '(...values)', insertText: 'Math.min(' },
            { label: 'Math.abs', kind: 'method', detail: '(x)', insertText: 'Math.abs(' },
            { label: 'Math.floor', kind: 'method', detail: '(x)', insertText: 'Math.floor(' },
            { label: 'Math.ceil', kind: 'method', detail: '(x)', insertText: 'Math.ceil(' },
            { label: 'console.log', kind: 'method', detail: '(...data)', insertText: 'console.log(' },
            { label: 'Array', kind: 'class', detail: '(length)' },
            { label: 'Map', kind: 'class', detail: '()' },
            { label: 'Set', kind: 'class', detail: '()' }
        ];

        this.listMethods = [
            { label: 'push', kind: 'method', detail: '(...items)' },
            { label: 'pop', kind: 'method', detail: '()' },
            { label: 'shift', kind: 'method', detail: '()' },
            { label: 'unshift', kind: 'method', detail: '(...items)' },
            { label: 'slice', kind: 'method', detail: '(start, end)' },
            { label: 'splice', kind: 'method', detail: '(start, deleteCount)' },
            { label: 'indexOf', kind: 'method', detail: '(searchElement)' },
            { label: 'includes', kind: 'method', detail: '(searchElement)' },
            { label: 'join', kind: 'method', detail: '(separator)' },
            { label: 'reverse', kind: 'method', detail: '()' },
            { label: 'sort', kind: 'method', detail: '(compareFn)' },
            { label: 'map', kind: 'method', detail: '(callback)' },
            { label: 'filter', kind: 'method', detail: '(callback)' },
            { label: 'reduce', kind: 'method', detail: '(callback)' },
            { label: 'forEach', kind: 'method', detail: '(callback)' },
            { label: 'length', kind: 'property', detail: 'number' }
        ];

        this.dictMethods = [
            { label: 'set', kind: 'method', detail: '(key, value)' },
            { label: 'get', kind: 'method', detail: '(key)' },
            { label: 'has', kind: 'method', detail: '(key)' },
            { label: 'delete', kind: 'method', detail: '(key)' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'keys', kind: 'method', detail: '()' },
            { label: 'values', kind: 'method', detail: '()' },
            { label: 'entries', kind: 'method', detail: '()' },
            { label: 'size', kind: 'property', detail: 'number' }
        ];

        this.stringMethods = [
            { label: 'charAt', kind: 'method', detail: '(index)' },
            { label: 'charCodeAt', kind: 'method', detail: '(index)' },
            { label: 'concat', kind: 'method', detail: '(...strings)' },
            { label: 'includes', kind: 'method', detail: '(searchString)' },
            { label: 'indexOf', kind: 'method', detail: '(searchString)' },
            { label: 'slice', kind: 'method', detail: '(start, end)' },
            { label: 'split', kind: 'method', detail: '(separator)' },
            { label: 'substring', kind: 'method', detail: '(start, end)' },
            { label: 'toLowerCase', kind: 'method', detail: '()' },
            { label: 'toUpperCase', kind: 'method', detail: '()' },
            { label: 'trim', kind: 'method', detail: '()' },
            { label: 'length', kind: 'property', detail: 'number' }
        ];

        this.setMethods = [
            { label: 'add', kind: 'method', detail: '(value)' },
            { label: 'has', kind: 'method', detail: '(value)' },
            { label: 'delete', kind: 'method', detail: '(value)' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'size', kind: 'property', detail: 'number' }
        ];
    }
}

if (!window.LCProviders) window.LCProviders = {};
window.LCProviders['javascript'] = new JSProvider();
window.LCProviders['typescript'] = new JSProvider();
