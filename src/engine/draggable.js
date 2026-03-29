// ── Draggable Utility Engine ──────────────────────────────────────────────────
// Makes any LC widget draggable and persists its position in localStorage.
window.LCDraggable = {
    init: function (el, name) {
        if (!el) return;
        
        const KEY = `lc-pos-${name}`;
        const saved = localStorage.getItem(KEY);
        if (saved) {
            const pos = JSON.parse(saved);
            el.style.top  = pos.top;
            el.style.left = pos.left;
            el.style.right = 'auto'; // Disable fixed right/bottom to allow free movement
            el.style.bottom = 'auto';
        }

        let isDragging = false;
        let offsetX, offsetY;

        el.style.cursor = 'grab';

        const onMouseDown = (e) => {
            const interactive = e.target.closest('button, input, select, a');
            const isChildInteractive = interactive && interactive !== el;
            
            if (isChildInteractive) return;
            
            isDragging = true;
            el.style.cursor = 'grabbing';
            el.classList.add('dragging');
            
            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            el.style.left = x + 'px';
            el.style.top  = y + 'px';
            el.style.right = 'auto';
            el.style.bottom = 'auto';
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                el.style.cursor = 'grab';
                el.classList.remove('dragging');
                
                // Save state
                localStorage.setItem(KEY, JSON.stringify({
                    top: el.style.top,
                    left: el.style.left
                }));
            }
        };

        el.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        // Mobile touch support
        el.addEventListener('touchstart', (e) => {
            if (e.target.closest('button, input, select, a')) return;
            isDragging = true;
            const t = e.touches[0];
            const rect = el.getBoundingClientRect();
            offsetX = t.clientX - rect.left;
            offsetY = t.clientY - rect.top;
        });
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const t = e.touches[0];
            el.style.left = (t.clientX - offsetX) + 'px';
            el.style.top  = (t.clientY - offsetY) + 'px';
            el.style.right = 'auto';
            el.style.bottom = 'auto';
        });
        document.addEventListener('touchend', onMouseUp);
    }
};
