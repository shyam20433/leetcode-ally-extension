// UI Management for IntelliSense

let suggestions = [];
let selectedIndex = 0;
let widgetEl = null;
let currentToken = '';

window.initUI = function() {
  widgetEl = document.createElement('div');
  widgetEl.className = 'lc-intellisense-widget';
  document.body.appendChild(widgetEl);
  window.LCExtension.uiWidget = widgetEl;
};

window.renderSuggestions = function(data, coords, token) {
  if (!data || data.length === 0) {
    window.hideUI();
    return;
  }

  suggestions = data;
  currentToken = token;
  selectedIndex = 0; // reset
  
  widgetEl.innerHTML = '';
  
  data.forEach((item, index) => {
    const itemEl = document.createElement('div');
    itemEl.className = 'lc-intellisense-item' + (index === 0 ? ' selected' : '');
    itemEl.onclick = () => {
      selectedIndex = index;
      window.insertSelected();
    };
    itemEl.onmouseenter = () => {
        // Remove old selected
        const old = widgetEl.querySelector('.selected');
        if(old) old.classList.remove('selected');
        itemEl.classList.add('selected');
        selectedIndex = index;
    };
    
    const icon = document.createElement('span');
    icon.className = 'lc-intellisense-icon ' + (item.kind || 'method');
    
    const label = document.createElement('span');
    label.className = 'lc-intellisense-label';
    
    // Highlight matched part
    if (token) {
        const regex = new RegExp("(" + token + ")", "i"); // Simple match for now
        const parts = item.label.split(regex);
        label.innerHTML = parts.map(p => 
            p.toLowerCase() === token.toLowerCase() ? `<span class="lc-intellisense-match">${p}</span>` : p
        ).join('');
    } else {
        label.textContent = item.label;
    }
    
    const detail = document.createElement('span');
    detail.className = 'lc-intellisense-detail';
    detail.textContent = item.detail || '';
    
    itemEl.appendChild(icon);
    itemEl.appendChild(label);
    itemEl.appendChild(detail);
    
    widgetEl.appendChild(itemEl);
  });

  // Position it just below cursor
  if (coords) {
      widgetEl.style.position = 'absolute';
      widgetEl.style.top = (coords.top + coords.height) + 'px';
      widgetEl.style.left = coords.left + 'px';
  } else {
      widgetEl.style.position = 'fixed';
      widgetEl.style.top = '100px';
      widgetEl.style.right = '50px';
  }
  
  widgetEl.style.display = 'flex';
  console.log(`[LeetCode IntelliSense] Rendered ${data.length} suggestions for token '${token}'`);
};

window.hideUI = function() {
  if (widgetEl) widgetEl.style.display = 'none';
  suggestions = [];
};

window.isUIActive = function() {
    return widgetEl && widgetEl.style.display === 'flex' && suggestions.length > 0;
};

window.moveSelection = function(dir) {
    if (!window.isUIActive()) return;
    
    selectedIndex += dir;
    if (selectedIndex < 0) selectedIndex = suggestions.length - 1;
    if (selectedIndex >= suggestions.length) selectedIndex = 0;
    
    const children = widgetEl.children;
    for(let i=0; i<children.length; i++) {
        children[i].classList.remove('selected');
    }
    
    const selectedEl = children[selectedIndex];
    selectedEl.classList.add('selected');
    
    // Ensure visible
    selectedEl.scrollIntoView({ block: "nearest" });
};

window.insertSelected = function() {
    if (!window.isUIActive() || selectedIndex < 0 || selectedIndex >= suggestions.length) return;
    
    const selected = suggestions[selectedIndex];
    let insertText = selected.insertText || selected.label;
    
    // Post message back to hook
    window.postMessage({
        source: 'lc-extension',
        type: 'INSERT_SUGGESTION',
        payload: {
            text: insertText,
            replaceLength: currentToken.length
        }
    }, '*');
    
    window.hideUI();
};
