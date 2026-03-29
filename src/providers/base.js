// Base Provider Interface

class BaseProvider {
    constructor() {
        this.globals = [];
        this.listMethods = [];
        this.dictMethods = [];
        this.stringMethods = [];
        this.setMethods = [];
        this.mathMethods = [];
        this.dequeMethods = [];
        this.collectionsMethods = [];
        this.heapqMethods = [];
        this.bisectMethods = [];
    }

    getGlobalSuggestions(token) {
        return this.globals;
    }

    getMethodSuggestions(type, token) {
        switch(type) {
            case 'list': return this.listMethods;
            case 'dict': return this.dictMethods;
            case 'string': return this.stringMethods;
            case 'set': return this.setMethods;
            case 'deque': return this.dequeMethods;
            case 'collections': return this.collectionsMethods;
            case 'math': return this.mathMethods;
            case 'heapq': return this.heapqMethods;
            case 'bisect': return this.bisectMethods;
            default:
                return [...this.listMethods, ...this.dictMethods, ...this.stringMethods, ...this.dequeMethods];
        }
    }
}

// Global initialization
if (!window.LCProviders) window.LCProviders = {};
window.LCProviders['base'] = new BaseProvider();
