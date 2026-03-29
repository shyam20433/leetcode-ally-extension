// Keyboard handling

window.initInput = function() {
    // We attach an event listener in the capture phase to stop events before Monaco textarea handles them.
    document.addEventListener('keydown', (e) => {
        if (!window.isUIActive()) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                e.stopPropagation();
                window.moveSelection(1);
                break;
            case 'ArrowUp':
                e.preventDefault();
                e.stopPropagation();
                window.moveSelection(-1);
                break;
            case 'Enter':
            case 'Tab':
                e.preventDefault();
                e.stopPropagation();
                window.insertSelected();
                break;
            case 'Escape':
                e.preventDefault();
                e.stopPropagation();
                window.hideUI();
                break;
            default:
                // Let other keys pass through, but if they are alphanumeric, it might trigger new suggestions
                break;
        }
    }, true); // true = capture phase
};
