chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'FETCH_DICTIONARY') {
        const url = 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt';
        
        fetch(url)
            .then(res => res.text())
            .then(text => {
                const words = text.split('\n').map(w => w.trim()).filter(w => w.length >= 3);
                sendResponse({ words: words });
            })
            .catch(err => {
                console.error("Dictionary fetch failed", err);
                sendResponse({ words: [] });
            });
            
        return true; // Keep message channel open for async response
    }
});
