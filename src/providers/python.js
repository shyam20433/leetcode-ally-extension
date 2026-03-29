// Python Provider

class PythonProvider extends BaseProvider {
    constructor() {
        super();
        
        this.globals = [
            { label: 'if', kind: 'keyword', detail: '' },
            { label: 'else', kind: 'keyword', detail: '' },
            { label: 'elif', kind: 'keyword', detail: '' },
            { label: 'for', kind: 'keyword', detail: '' },
            { label: 'while', kind: 'keyword', detail: '' },
            { label: 'in', kind: 'keyword', detail: '' },
            { label: 'is', kind: 'keyword', detail: '' },
            { label: 'return', kind: 'keyword', detail: '' },
            { label: 'def', kind: 'keyword', detail: '' },
            { label: 'class', kind: 'keyword', detail: '' },
            { label: 'import', kind: 'keyword', detail: '' },
            { label: 'from', kind: 'keyword', detail: '' },
            { label: 'pass', kind: 'keyword', detail: '' },
            { label: 'break', kind: 'keyword', detail: '' },
            { label: 'continue', kind: 'keyword', detail: '' },
            { label: 'True', kind: 'keyword', detail: '' },
            { label: 'False', kind: 'keyword', detail: '' },
            { label: 'None', kind: 'keyword', detail: '' },
            { label: 'and', kind: 'keyword', detail: '' },
            { label: 'or', kind: 'keyword', detail: '' },
            { label: 'not', kind: 'keyword', detail: '' },
            { label: 'self', kind: 'keyword', detail: '' },
            { label: 'int', kind: 'class', detail: '' },
            { label: 'str', kind: 'class', detail: '' },
            { label: 'float', kind: 'class', detail: '' },
            { label: 'bool', kind: 'class', detail: '' },
            { label: 'list', kind: 'class', detail: '' },
            { label: 'dict', kind: 'class', detail: '' },
            { label: 'set', kind: 'class', detail: '' },
            { label: 'tuple', kind: 'class', detail: '' },
            { label: 'len', kind: 'method', detail: '(obj)', insertText: 'len(' },
            { label: 'range', kind: 'method', detail: '(stop)', insertText: 'range(' },
            { label: 'min', kind: 'method', detail: '(iterable, *args)', insertText: 'min(' },
            { label: 'max', kind: 'method', detail: '(iterable, *args)', insertText: 'max(' },
            { label: 'sum', kind: 'method', detail: '(iterable)', insertText: 'sum(' },
            { label: 'sorted', kind: 'method', detail: '(iterable)', insertText: 'sorted(' },
            { label: 'enumerate', kind: 'method', detail: '(iterable)', insertText: 'enumerate(' },
            { label: 'zip', kind: 'method', detail: '(*iterables)', insertText: 'zip(' },
            { label: 'map', kind: 'method', detail: '(func, *iterables)', insertText: 'map(' },
            { label: 'filter', kind: 'method', detail: '(func, iterable)', insertText: 'filter(' },
            { label: 'collections', kind: 'class', detail: 'standard lib' },
            { label: 'math', kind: 'class', detail: 'standard lib' },
            { label: 'heapq', kind: 'class', detail: 'standard lib' },
            { label: 'bisect', kind: 'class', detail: 'standard lib' },
            { label: 'defaultdict', kind: 'class', detail: 'collections', insertText: 'defaultdict(' },
            { label: 'deque', kind: 'class', detail: 'collections', insertText: 'deque(' },
            { label: 'Counter', kind: 'class', detail: 'collections', insertText: 'Counter(' },
        ];
        
        this.listMethods = [
            { label: 'append', kind: 'method', detail: '(object)' },
            { label: 'extend', kind: 'method', detail: '(iterable)' },
            { label: 'insert', kind: 'method', detail: '(index, object)' },
            { label: 'remove', kind: 'method', detail: '(value)' },
            { label: 'pop', kind: 'method', detail: '(index=-1)' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'index', kind: 'method', detail: '(value, start, stop)' },
            { label: 'count', kind: 'method', detail: '(value)' },
            { label: 'sort', kind: 'method', detail: '(key=None, reverse=False)' },
            { label: 'reverse', kind: 'method', detail: '()' },
        ];
        
        this.dictMethods = [
            { label: 'keys', kind: 'method', detail: '()' },
            { label: 'values', kind: 'method', detail: '()' },
            { label: 'items', kind: 'method', detail: '()' },
            { label: 'get', kind: 'method', detail: '(key, default=None)' },
            { label: 'pop', kind: 'method', detail: '(key, default)' },
            { label: 'popitem', kind: 'method', detail: '()' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'update', kind: 'method', detail: '([E, ]**F)' },
            { label: 'setdefault', kind: 'method', detail: '(key, default=None)' },
        ];
        
        this.stringMethods = [
            { label: 'split', kind: 'method', detail: '(sep=None, maxsplit=-1)' },
            { label: 'join', kind: 'method', detail: '(iterable)' },
            { label: 'strip', kind: 'method', detail: '([chars])' },
            { label: 'replace', kind: 'method', detail: '(old, new, count=-1)' },
            { label: 'find', kind: 'method', detail: '(sub[, start[, end]])' },
            { label: 'count', kind: 'method', detail: '(sub[, start[, end]])' },
            { label: 'startswith', kind: 'method', detail: '(prefix[, start[, end]])' },
            { label: 'endswith', kind: 'method', detail: '(suffix[, start[, end]])' },
            { label: 'lower', kind: 'method', detail: '()' },
            { label: 'upper', kind: 'method', detail: '()' },
            { label: 'isalpha', kind: 'method', detail: '()' },
            { label: 'isdigit', kind: 'method', detail: '()' },
            { label: 'isalnum', kind: 'method', detail: '()' },
        ];
        
        this.setMethods = [
            { label: 'add', kind: 'method', detail: '(element)' },
            { label: 'remove', kind: 'method', detail: '(element)' },
            { label: 'discard', kind: 'method', detail: '(element)' },
            { label: 'pop', kind: 'method', detail: '()' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'union', kind: 'method', detail: '(*others)' },
            { label: 'intersection', kind: 'method', detail: '(*others)' },
            { label: 'difference', kind: 'method', detail: '(*others)' },
        ];
        
        this.dequeMethods = [
            { label: 'append', kind: 'method', detail: '(x)' },
            { label: 'appendleft', kind: 'method', detail: '(x)' },
            { label: 'pop', kind: 'method', detail: '()' },
            { label: 'popleft', kind: 'method', detail: '()' },
            { label: 'clear', kind: 'method', detail: '()' },
            { label: 'count', kind: 'method', detail: '(x)' },
            { label: 'extend', kind: 'method', detail: '(iterable)' },
            { label: 'extendleft', kind: 'method', detail: '(iterable)' },
            { label: 'remove', kind: 'method', detail: '(value)' },
            { label: 'reverse', kind: 'method', detail: '()' },
            { label: 'rotate', kind: 'method', detail: '(n=1)' },
            { label: 'maxlen', kind: 'property', detail: '' }
        ];
        
        this.collectionsMethods = [
            { label: 'deque', kind: 'class', detail: '()', insertText: 'deque(' },
            { label: 'Counter', kind: 'class', detail: '()', insertText: 'Counter(' },
            { label: 'defaultdict', kind: 'class', detail: '(function)', insertText: 'defaultdict(' },
            { label: 'OrderedDict', kind: 'class', detail: '()', insertText: 'OrderedDict(' }
        ];
        
        this.mathMethods = [
            { label: 'ceil', kind: 'method', detail: '(x)' },
            { label: 'floor', kind: 'method', detail: '(x)' },
            { label: 'gcd', kind: 'method', detail: '(a, b)' },
            { label: 'log', kind: 'method', detail: '(x[, base])' },
            { label: 'log10', kind: 'method', detail: '(x)' },
            { label: 'log2', kind: 'method', detail: '(x)' },
            { label: 'sqrt', kind: 'method', detail: '(x)' },
            { label: 'pow', kind: 'method', detail: '(x, y)' },
            { label: 'inf', kind: 'property', detail: 'infinity' },
            { label: 'pi', kind: 'property', detail: 'pi' }
        ];
        
        this.heapqMethods = [
            { label: 'heappush', kind: 'method', detail: '(heap, item)' },
            { label: 'heappop', kind: 'method', detail: '(heap)' },
            { label: 'heapify', kind: 'method', detail: '(x)' },
            { label: 'heappushpop', kind: 'method', detail: '(heap, item)' },
            { label: 'heapreplace', kind: 'method', detail: '(heap, item)' },
            { label: 'nlargest', kind: 'method', detail: '(n, iterable)' },
            { label: 'nsmallest', kind: 'method', detail: '(n, iterable)' }
        ];
        
        this.bisectMethods = [
            { label: 'bisect_left', kind: 'method', detail: '(a, x)' },
            { label: 'bisect_right', kind: 'method', detail: '(a, x)' },
            { label: 'bisect', kind: 'method', detail: '(a, x)' },
            { label: 'insort_left', kind: 'method', detail: '(a, x)' },
            { label: 'insort_right', kind: 'method', detail: '(a, x)' },
            { label: 'insort', kind: 'method', detail: '(a, x)' }
        ];
    }
}

if (!window.LCProviders) window.LCProviders = {};
window.LCProviders['python'] = new PythonProvider();
