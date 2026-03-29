// Global state for extension
window.LCExtension = {
  active: false,
  uiWidget: null,
  engine: null,
  language: 'python', // default
  statusDot: null
};

// Initialize everything when the page is ready
function init() {
  console.log("[LeetCode IntelliSense] UI Content script initialized.");
  
  // Listen for messages from the injected hook
  window.addEventListener("message", (event) => {
    // We only accept messages from ourselves
    if (event.source !== window || !event.data || event.data.source !== 'lc-monaco-hook') {
      return;
    }

    const { type, payload } = event.data;

    switch (type) {
      case 'MONACO_READY':
        console.log("[LeetCode IntelliSense] Monaco is ready. Initializing engine...");
        window.LCExtension.active = true;
        
        if (payload && payload.language) {
            window.LCExtension.language = payload.language;
        }

        if (!window.LCExtension.uiWidget) {
            if (window.initUI)      window.initUI();
            if (window.initEngine)  window.initEngine();
            if (window.initInput)   window.initInput();

            // ── Initialize new feature engines ──────────────────────────
            if (window.LCComplexity) window.LCComplexity.init();
            if (window.LCTemplates)  window.LCTemplates.init();
            if (window.LCHistory)    window.LCHistory.init();
            if (window.LCControls)   window.LCControls.init();
        }
        break;
        
      case 'CURSOR_CHANGED':
        if (payload && payload.language) {
            window.LCExtension.language = payload.language;
            if (window.LCExtension.statusText) {
                window.LCExtension.statusText.textContent = `IntelliSense: ${payload.language}`;
            }
        }
        if (window.handleCursorChange) {
            window.handleCursorChange(payload);
        }
        break;
        
      case 'CONTENT_CHANGED':
        if (window.handleContentChange) {
            window.handleContentChange(payload);
        }
        // Run complexity analysis on every content change
        if (window.LCComplexity && payload && payload.fullText) {
            window.LCComplexity.analyze(payload.fullText, window.LCExtension.language);
        }
        break;
        
      case 'MODEL_CHANGED':
        if(payload && payload.language) {
            console.log("[LeetCode IntelliSense] Language changed to " + payload.language);
            window.LCExtension.language = payload.language;
            if (window.LCExtension.statusDot) {
                window.LCExtension.statusDot.title = `LeetCode IntelliSense: Hooked and Active! (Lang: ${payload.language})`;
            }
            if (window.handleLanguageChange) {
                window.handleLanguageChange(payload.language);
            }
        }
        break;
    }
  });

  // Global listener to dismiss widget when clicking outside
  document.addEventListener("mousedown", (e) => {
      if (window.hideUI && !e.target.closest('.lc-intellisense-widget')) {
          window.hideUI();
      }
  });
}

// Fallback script injection in case manifest world: MAIN fails
function injectFallback() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('src/content/monaco-hook.js');
  script.onload = () => script.remove();
  (document.head || document.documentElement).appendChild(script);
}

// Ensure execution when body is available
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { init(); injectFallback(); });
} else {
    init();
    injectFallback();
}
