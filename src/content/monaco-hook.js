// This script is injected into the main page context to access window.monaco

(function() {
  let hookedEditors = new Set();
  let lastActiveEditor = null; // store the last editor we interacted with

  function hookEditor(editorInstance) {
    if (hookedEditors.has(editorInstance)) return;
    hookedEditors.add(editorInstance);

    editorInstance.onDidChangeCursorPosition((e) => {
        lastActiveEditor = editorInstance;
        const position = e.position;
        const model = editorInstance.getModel();
        const lineContent = model.getLineContent(position.lineNumber);
        
        let coords = null;
        try {
            let visPos = editorInstance.getScrolledVisiblePosition(position);
            if (visPos) {
                const domNode = editorInstance.getDomNode();
                const rect = domNode.getBoundingClientRect();
                coords = {
                    top: rect.top + window.scrollY + visPos.top,
                    left: rect.left + window.scrollX + visPos.left,
                    height: visPos.height
                };
            } else {
                 console.log("[LeetCode IntelliSense Hook] getScrolledVisiblePosition is null for position", position);
            }
        } catch(err) { 
            console.error("[LeetCode IntelliSense Hook] coords error", err);
        }
        
        const language = model && model.getLanguageId ? model.getLanguageId() : 'python';
        
        // Strip Monaco classes to simple primitive objects to prevent DataCloneError crashes
        const primitivePosition = {
            lineNumber: position.lineNumber,
            column: position.column
        };
        
        window.postMessage({
          source: 'lc-monaco-hook',
          type: 'CURSOR_CHANGED',
          payload: {
            position: primitivePosition,
            lineContent: lineContent,
            coords: coords,
            language: language,
            fullText: model ? model.getValue() : ''
          }
        }, '*');
        console.log("[LeetCode IntelliSense Hook] Triggered cursor change. Prefix:", lineContent.substring(0, position.column - 1));
    });

    editorInstance.onDidChangeCursorSelection((e) => {
        const model = editorInstance.getModel();
        if(!model) return;
        const selectedText = model.getValueInRange(e.selection);
        
        window.postMessage({
            source: 'lc-monaco-hook',
            type: 'SELECTION_CHANGED',
            payload: { text: selectedText }
        }, '*');
    });

    editorInstance.onDidChangeModelContent((e) => {
        const model = editorInstance.getModel();
        
        // Strip changes to simple primitives
        const primitiveChanges = e.changes.map(ch => ({
            text: ch.text,
            rangeLength: ch.rangeLength,
            range: {
                startLineNumber: ch.range.startLineNumber,
                startColumn: ch.range.startColumn,
                endLineNumber: ch.range.endLineNumber,
                endColumn: ch.range.endColumn
            }
        }));
        
        window.postMessage({
          source: 'lc-monaco-hook',
          type: 'CONTENT_CHANGED',
          payload: {
            changes: primitiveChanges,
            versionId: e.versionId,
            fullText: model.getValue()
          }
        }, '*');
    });

    editorInstance.onDidChangeModel((e) => {
        const model = editorInstance.getModel();
        const language = model ? model.getLanguageId() : 'unknown';
        window.postMessage({
            source: 'lc-monaco-hook',
            type: 'MODEL_CHANGED',
            payload: { language }
        }, '*');
    });

    // Notify upon hooking
    const model = editorInstance.getModel();
    const language = model ? (model.getLanguageId ? model.getLanguageId() : 'python') : 'python';
    
    window.postMessage({
      source: 'lc-monaco-hook',
      type: 'MONACO_READY',
      payload: { language }
    }, '*');
  }

  function findAndHookEditors() {
    if (!window.monaco || !window.monaco.editor) return false;
    
    const editors = window.monaco.editor.getEditors();
    let hookedAny = false;
    editors.forEach(ed => {
        if(!hookedEditors.has(ed)) {
            hookEditor(ed);
            hookedAny = true;
        }
    });
    return hookedAny || hookedEditors.size > 0;
  }

  // Intercept insertion commands
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.source !== 'lc-extension') return;
    
    if (event.data.type === 'INSERT_SUGGESTION') {
        const editorToUse = lastActiveEditor || (window.monaco && window.monaco.editor.getEditors()[0]);
        if(!editorToUse) return;
        
        const { text, replaceLength } = event.data.payload;
        const position = editorToUse.getPosition();
        const range = new window.monaco.Range(
            position.lineNumber,
            position.column - replaceLength,
            position.lineNumber,
            position.column
        );
        
        editorToUse.executeEdits("lc-intellisense", [{
            range: range,
            text: text,
            forceMoveMarkers: true
        }]);
        
        editorToUse.focus();
    }
    
    if (event.data.type === 'UPDATE_MARKERS') {
        if (!window.monaco || !window.monaco.editor) return;
        const editorToUse = lastActiveEditor || window.monaco.editor.getEditors()[0];
        if(!editorToUse) return;
        
        const model = editorToUse.getModel();
        if(!model) return;
        
        const markers = event.data.payload.markers || [];
        window.monaco.editor.setModelMarkers(model, "lc-linter", markers);
        
        // --- ERROR LENS INTEGRATION ---
        const lineMap = new Map();
        for (let m of markers) {
            if (!lineMap.has(m.startLineNumber) || m.severity > lineMap.get(m.startLineNumber).severity) {
                lineMap.set(m.startLineNumber, m);
            }
        }
        
        let dynamicCss = '';
        let styleEl = document.getElementById('lc-error-lens-dynamic-styles');
        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = 'lc-error-lens-dynamic-styles';
            document.head.appendChild(styleEl);
        }
        
        const lensDecorations = Array.from(lineMap.values()).map((marker, idx) => {
            let color = '#00b7e4';
            let bgClass = 'error-lens-info-line';
            let prefix = 'ℹ';
            
            if (marker.severity === 8) { // Error
                color = '#ff6464'; 
                bgClass = 'error-lens-error-line'; 
                prefix = '⛔'; 
            } else if (marker.severity === 4) { // Warning
                color = '#fa973a'; 
                bgClass = 'error-lens-warning-line'; 
                prefix = '⚠'; 
            }
            
            const msgClass = `lc-err-lens-msg-dynamic-${idx}`;
            const safeMsg = marker.message.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\n/g, ' ');
            
            // Build pseudo-element css rule natively
            dynamicCss += `.${msgClass}::after {
                content: "\\00a0\\00a0\\00a0\\00a0\\00a0\\00a0\\00a0\\00a0${prefix} ${safeMsg}";
                color: ${color} !important;
                font-style: italic !important;
                font-size: 13.5px !important;
                font-family: Consolas, monospace !important;
                opacity: 0.85;
                white-space: pre !important;
            }\n`;
            
            const maxCol = model.getLineMaxColumn(marker.startLineNumber);

            return [
                // 1. Background highlight (entire line)
                {
                    range: new window.monaco.Range(marker.startLineNumber, 1, marker.startLineNumber, 1),
                    options: {
                        isWholeLine: true,
                        className: bgClass
                    }
                },
                // 2. Inline text (injected strictly at the end of the line)
                {
                    range: new window.monaco.Range(marker.startLineNumber, maxCol, marker.startLineNumber, maxCol),
                    options: {
                        afterContentClassName: msgClass
                    }
                }
            ];
        });
        
        // Flatten the array since each marker maps to 2 decorations now
        const flatDecorations = lensDecorations.flat();
        
        styleEl.textContent = dynamicCss;

        if (!editorToUse._errorLensDecos) {
            editorToUse._errorLensDecos = [];
        }
        
        // Ask Monaco to smartly diff and update the decorations
        editorToUse._errorLensDecos = editorToUse.deltaDecorations(editorToUse._errorLensDecos, flatDecorations);
    }
  });

  // ── Handle control messages from content scripts ─────────────────────────
  window.addEventListener('message', (e) => {
      if (!e.data || e.data.source !== 'lc-intellisense') return;
      const { type, payload } = e.data;
      const editor = lastActiveEditor;

      if (type === 'INSERT_TEXT' && editor) {
          const p = editor.getPosition();
          editor.executeEdits('lc-template', [{
              range: new window.monaco.Range(p.lineNumber, p.column, p.lineNumber, p.column),
              text: payload.text,
              forceMoveMarkers: true
          }]);
          editor.focus();
      }

      if (type === 'SET_THEME' && window.monaco) {
          // Define a custom Monaco theme from the payload colours
          window.monaco.editor.defineTheme('lc-custom-theme', {
              base:    'vs-dark',
              inherit: true,
              rules:   [],
              colors:  {
                  'editor.background':          payload.bg,
                  'editor.foreground':          payload.fg,
                  'editor.selectionBackground': payload.sel,
                  'editor.lineHighlightBackground': payload.lineHi,
              }
          });
          window.monaco.editor.setTheme('lc-custom-theme');
      }

      if (type === 'SET_FONT' && editor) {
          editor.updateOptions({
              fontFamily: `"${payload.family}", "JetBrains Mono", monospace`,
              fontSize:   payload.size,
              fontLigatures: true,
          });
      }

      if (type === 'TOGGLE_VIM') {
          // Monaco does not ship vim natively; we toggle a "vim-like" cursor style as a fallback
          if (editor) {
              editor.updateOptions({
                  cursorStyle: payload.enabled ? 'block' : 'line',
                  cursorBlinking: payload.enabled ? 'solid' : 'blink',
              });
          }
      }
  });

  console.log("[LeetCode IntelliSense Hook] Waiting for Monaco in MAIN world...");
  const interval = setInterval(() => {
    if (findAndHookEditors()) {
      // Don't clear interval right away, LeetCode navigations can create new instances
    }
  }, 1000);
})();

