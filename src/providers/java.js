class JavaProvider extends BaseProvider {
    constructor() {
        super();
        this.globals = [
            { label: 'Math.max', kind: 'method', detail: '(a, b)', insertText: 'Math.max(' },
            { label: 'Math.min', kind: 'method', detail: '(a, b)', insertText: 'Math.min(' },
            { label: 'Math.abs', kind: 'method', detail: '(a)', insertText: 'Math.abs(' },
            { label: 'System.out.println', kind: 'method', detail: '(x)', insertText: 'System.out.println(' },
            { label: 'Arrays.sort', kind: 'method', detail: '(a)', insertText: 'Arrays.sort(' },
            { label: 'Arrays.fill', kind: 'method', detail: '(a, val)', insertText: 'Arrays.fill(' },
            { label: 'Collections.sort', kind: 'method', detail: '(list)', insertText: 'Collections.sort(' }
        ];

        this.listMethods = [
            { label: 'add', kind: 'method', detail: '(E e)' },
            { label: 'get', kind: 'method', detail: '(int index)' },
            { label: 'remove', kind: 'method', detail: '(int index)' },
            { label: 'size', kind: 'method', detail: '()' },
            { label: 'isEmpty', kind: 'method', detail: '()' },
            { label: 'contains', kind: 'method', detail: '(Object o)' },
            { label: 'clear', kind: 'method', detail: '()' }
        ];

        this.dictMethods = [
            { label: 'put', kind: 'method', detail: '(K key, V value)' },
            { label: 'get', kind: 'method', detail: '(Object key)' },
            { label: 'getOrDefault', kind: 'method', detail: '(Object key, V defaultValue)' },
            { label: 'remove', kind: 'method', detail: '(Object key)' },
            { label: 'containsKey', kind: 'method', detail: '(Object key)' },
            { label: 'keySet', kind: 'method', detail: '()' },
            { label: 'values', kind: 'method', detail: '()' },
            { label: 'entrySet', kind: 'method', detail: '()' },
            { label: 'size', kind: 'method', detail: '()' },
            { label: 'isEmpty', kind: 'method', detail: '()' }
        ];

        this.stringMethods = [
            { label: 'length', kind: 'method', detail: '()' },
            { label: 'charAt', kind: 'method', detail: '(int index)' },
            { label: 'substring', kind: 'method', detail: '(int beginIndex, int endIndex)' },
            { label: 'indexOf', kind: 'method', detail: '(String str)' },
            { label: 'equals', kind: 'method', detail: '(Object anObject)' },
            { label: 'compareTo', kind: 'method', detail: '(String anotherString)' },
            { label: 'toLowerCase', kind: 'method', detail: '()' },
            { label: 'toUpperCase', kind: 'method', detail: '()' },
            { label: 'toCharArray', kind: 'method', detail: '()' },
            { label: 'split', kind: 'method', detail: '(String regex)' }
        ];

        this.setMethods = [
            { label: 'add', kind: 'method', detail: '(E e)' },
            { label: 'remove', kind: 'method', detail: '(Object o)' },
            { label: 'contains', kind: 'method', detail: '(Object o)' },
            { label: 'size', kind: 'method', detail: '()' },
            { label: 'isEmpty', kind: 'method', detail: '()' },
            { label: 'clear', kind: 'method', detail: '()' }
        ];
    }
}

if (!window.LCProviders) window.LCProviders = {};
window.LCProviders['java'] = new JavaProvider();
