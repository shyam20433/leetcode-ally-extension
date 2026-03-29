// Premium Paper Shower (Confetti) Engine for LeetCode Successes
window.LCConfetti = {
    activeAudios: [],
    showCompletionText: function() {
        // Load premium font
        if (!document.getElementById('lc-splash-font')) {
            const link = document.createElement('link');
            link.id   = 'lc-splash-font';
            link.rel  = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap';
            document.head.appendChild(link);
        }

        // Outer overlay (click to dismiss)
        const overlay = document.createElement('div');
        overlay.style.cssText = [
            'position:fixed', 'inset:0',
            'display:flex', 'align-items:center', 'justify-content:center',
            'z-index:9999999999', 'pointer-events:none',
        ].join(';');

        // Card
        const card = document.createElement('div');
        card.style.cssText = [
            'display:flex', 'flex-direction:column', 'align-items:center',
            'gap:14px',
            'background:rgba(10,10,14,0.82)',
            'backdrop-filter:blur(28px) saturate(180%)',
            '-webkit-backdrop-filter:blur(28px) saturate(180%)',
            'border:1px solid rgba(255,255,255,0.12)',
            'border-radius:28px',
            'padding:44px 56px',
            'box-shadow:0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)',
            // Animation start state
            'opacity:0',
            'transform:scale(0.6) translateY(30px)',
            'transition:opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        ].join(';');

        // Trophy icon
        const icon = document.createElement('div');
        icon.textContent = '🏆';
        icon.style.cssText = 'font-size:4rem;line-height:1;filter:drop-shadow(0 0 20px rgba(251,191,36,0.6));';

        // Headline
        const headline = document.createElement('div');
        headline.textContent = 'Problem Solved!';
        headline.style.cssText = [
            'font-family:"Plus Jakarta Sans", system-ui, sans-serif',
            'font-size:clamp(2rem, 4vw, 3rem)',
            'font-weight:800',
            'letter-spacing:-1.5px',
            'line-height:1',
            'background:linear-gradient(135deg, #ffffff 0%, #e2e8f0 40%, #94a3b8 100%)',
            '-webkit-background-clip:text',
            '-webkit-text-fill-color:transparent',
            'background-clip:text',
            'white-space:nowrap',
        ].join(';');

        // Green badge
        const badge = document.createElement('div');
        badge.innerHTML = '✓&nbsp;&nbsp;All Test Cases Passed';
        badge.style.cssText = [
            'font-family:"Plus Jakarta Sans", system-ui, sans-serif',
            'font-size:14px',
            'font-weight:700',
            'letter-spacing:0.3px',
            'color:#10b981',
            'background:rgba(16,185,129,0.12)',
            'border:1px solid rgba(16,185,129,0.3)',
            'border-radius:100px',
            'padding:6px 20px',
        ].join(';');

        card.appendChild(icon);
        card.appendChild(headline);
        card.appendChild(badge);
        overlay.appendChild(card);
        document.body.appendChild(overlay);

        // Trigger spring-in
        requestAnimationFrame(() => requestAnimationFrame(() => {
            card.style.opacity  = '1';
            card.style.transform = 'scale(1) translateY(0)';
        }));

        // Fade out after 4s
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity    = '0';
            card.style.transform  = 'scale(0.95) translateY(-10px)';
            setTimeout(() => overlay.remove(), 600);
        }, 4000);
    },

    fire: function(isSubmit = false) {
        if (isSubmit) {
            this.showCompletionText();
            this._playDiwaliSound();
        } else {
            // "Wow" sound for initial test cases (Run Code)
            this._playWowSound();
        }

        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999999998';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const W = canvas.width, H = canvas.height;

        // ── Physics constants ──────────────────────────────
        const GRAVITY      = 0.18;   // px/frame²
        const AIR_DRAG     = 0.985;  // velocity multiplier per frame
        const SPARK_DRAG   = 0.97;
        const SMOKE_DRAG   = 0.93;

        // ── Color palettes inspired by real Diwali shells ──
        const PALETTES = [
            ['#ff3f34','#ff9f43','#ffd32a'],          // Fire
            ['#0abde3','#48dbfb','#f8f8ff'],          // Ice blue
            ['#ff9f43','#fece95','#ffffff'],           // Gold-white
            ['#ff6b81','#ff4757','#ff8ab3'],           // Magenta/rose
            ['#2ed573','#7bed9f','#ffffff'],           // Green sparkle
            ['#a29bfe','#fd79a8','#ffffff'],           // Aurora
            ['#fff200','#ffd32a','#ff9f43'],           // Pure gold
        ];

        // ── Data arrays ────────────────────────────────────
        const confetti  = [];  // paper shower pieces
        const rockets   = [];  // rising shells
        const particles = [];  // all spark/star particles after explosion
        const smokes    = [];  // rocket smoke trail particles

        // ── Build confetti ─────────────────────────────────
        const confColors = ['#6366f1','#a855f7','#ec4899','#10b981','#f59e0b','#3b82f6','#ef4444','#fde047'];
        for (let i = 0; i < 320; i++) {
            confetti.push({
                x: Math.random() * W, y: Math.random() * H - H - 120,
                vx: (Math.random() - 0.5) * 5, vy: Math.random() * 5 + 2.5,
                size: Math.random() * 13 + 6,
                color: confColors[Math.floor(Math.random() * confColors.length)],
                rotSpd: (Math.random() - 0.5) * 14,
                rot: Math.random() * 360,
                tiltInc: Math.random() * 0.07 + 0.04, tiltAngle: 0
            });
        }

        // ── Spawn a new rocket shell ───────────────────────
        function spawnRocket() {
            const x = W * 0.1 + Math.random() * W * 0.8;
            // Target a random altitude in the upper 60% of the screen
            const targetY = H * 0.05 + Math.random() * H * 0.45;
            const dist    = H - targetY;
            // vy to reach targetY under GRAVITY (v² = 2g·h): v = sqrt(2·g·dist)
            const vy0     = -Math.sqrt(2 * GRAVITY * dist) * (0.85 + Math.random() * 0.3);
            const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
            const type    = ['sphere','palm','chrysanthemum','willow','ring'][Math.floor(Math.random() * 5)];
            return { x, y: H, vx: (Math.random() - 0.5) * 3, vy: vy0,
                     palette, type, trail: [], exploded: false };
        }

        // ── Explode a shell into particles ─────────────────
        function explode(rx, ry, palette, type) {
            const count = type === 'willow' ? 90 : type === 'palm' ? 80 : 120;
            const primary   = palette[0];
            const secondary = palette[1];
            const white     = '#ffffff';

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
                let   speed;

                if (type === 'sphere') {
                    speed = 4 + Math.random() * 6;
                } else if (type === 'palm') {
                    // Palm: fast outward then heavy gravity droop
                    speed = 6 + Math.random() * 8;
                } else if (type === 'chrysanthemum') {
                    // Dense uniform sphere with long tail
                    speed = 3 + Math.random() * 3;
                } else if (type === 'willow') {
                    // Slow, heavy, cascading down like weeping willows
                    speed = 1.5 + Math.random() * 3.5;
                } else if (type === 'ring') {
                    // Tight, even speed ring
                    speed = 7 + Math.random() * 0.8;
                }

                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;

                const color = Math.random() > 0.85 ? white :
                              Math.random() > 0.5  ? primary : secondary;

                // Glitter: some particles twinkle
                const glitter = Math.random() < 0.25;
                // Palm fronds droop extra
                const gravMult = type === 'palm'   ? 2.2 :
                                 type === 'willow' ? 2.8 : 1.0;
                const drag     = type === 'willow' ? 0.96 : SPARK_DRAG;

                particles.push({
                    x: rx, y: ry, vx, vy,
                    color, glitter,
                    gravMult, drag,
                    life: 1.0,
                    decay: type === 'willow'       ? 0.010 :
                           type === 'chrysanthemum' ? 0.009 :
                           type === 'palm'          ? 0.013 : 0.012,
                    size: type === 'ring' ? 2.5 : 1.5 + Math.random() * 2.5,
                    tail: [],  // comet trail positions
                    maxTail: type === 'willow' ? 14 : type === 'chrysanthemum' ? 10 : 6,
                });
            }

            // White flash core
            particles.push({
                x: rx, y: ry, vx: 0, vy: 0,
                color: '#ffffff', glitter: false, gravMult: 0, drag: 0.8,
                life: 1.0, decay: 0.08, size: 12, tail: [], maxTail: 0,
                isFlash: true
            });
        }

        // ── Scheduling: stagger rockets during first 8s ────
        let frameCount   = 0;
        const MAX_FRAMES = isSubmit ? 300 : 0; // 300 frames = 5 seconds at 60fps
        const rocketIntervals = [];
 
        if (isSubmit) {
            // Intense Fireworks: Stagger 12 rockets within the 5-second window
            const times = [5, 15, 30, 50, 75, 100, 130, 160, 190, 220, 250, 285];
            times.forEach(t => rocketIntervals.push(t));
        }

        // ── Main render loop ───────────────────────────────
        function render() {
            // For fireworks: ghost-fade to create comet trail afterglow
            // For plain confetti: just clear so we don't darken the page
            if (isSubmit) {
                ctx.fillStyle = 'rgba(0,0,0,0.18)';
                ctx.fillRect(0, 0, W, H);
            } else {
                ctx.clearRect(0, 0, W, H);
            }

            let active = false;

            // 1. Confetti paper shower
            for (let p of confetti) {
                p.tiltAngle += p.tiltInc;
                p.y += (Math.cos(p.tiltAngle) + 1 + p.size / 2) / 2 + p.vy;
                p.x += Math.sin(p.tiltAngle) * 2 + p.vx;
                p.rot += p.rotSpd;
                if (p.y <= H + 30) active = true;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot * Math.PI / 180);
                ctx.scale(1, Math.abs(Math.cos(p.tiltAngle)));
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                ctx.restore();
            }

            if (!isSubmit) {
                if (active) requestAnimationFrame(render);
                else canvas.remove();
                return;
            }

            // 2. FIREWORKS ENGINE
            frameCount++;

            // Spawn scheduled rockets
            if (rocketIntervals.includes(frameCount)) {
                rockets.push(spawnRocket());
            }

            // Update & draw rockets with comet smoke trail
            for (let i = rockets.length - 1; i >= 0; i--) {
                const r = rockets[i];
                r.vx *= AIR_DRAG;
                r.vy += GRAVITY;
                r.x  += r.vx;
                r.y  += r.vy;

                // Smoke particles trailing behind the rocket
                smokes.push({
                    x: r.x + (Math.random()-0.5)*4,
                    y: r.y + (Math.random()-0.5)*4,
                    vx: (Math.random()-0.5)*0.8,
                    vy: Math.random()*0.6 + 0.3,
                    life: 0.7 + Math.random()*0.3,
                    size: 4 + Math.random()*5
                });

                // Draw rocket body
                const grad = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, 5);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.4, r.palette[0]);
                grad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(r.x, r.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                active = true;

                // Explode at apex (vy turning positive = peak reached)
                if (r.vy >= -0.5 && !r.exploded) {
                    r.exploded = true;
                    rockets.splice(i, 1);
                    explode(r.x, r.y, r.palette, r.type);
                }
            }

            // Update & draw smoke
            for (let i = smokes.length - 1; i >= 0; i--) {
                const s = smokes[i];
                s.x  += s.vx;
                s.y  += s.vy;
                s.life -= 0.025;
                s.vx *= SMOKE_DRAG;
                s.vy *= SMOKE_DRAG;
                if (s.life <= 0) { smokes.splice(i, 1); continue; }
                ctx.globalAlpha = s.life * 0.25;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * (1 + (1 - s.life)), 0, Math.PI * 2);
                ctx.fillStyle = '#aaaaaa';
                ctx.fill();
                ctx.globalAlpha = 1;
                active = true;
            }

            // Update & draw explosion particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.vx  *= p.drag;
                p.vy  *= p.drag;
                p.vy  += GRAVITY * p.gravMult;
                p.x   += p.vx;
                p.y   += p.vy;
                p.life -= p.decay;

                if (p.life <= 0) { particles.splice(i, 1); continue; }
                active = true;

                // Store tail
                if (p.maxTail > 0) {
                    p.tail.push({x: p.x, y: p.y});
                    if (p.tail.length > p.maxTail) p.tail.shift();
                }

                // Draw comet tail
                if (p.tail.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(p.tail[0].x, p.tail[0].y);
                    for (let t = 1; t < p.tail.length; t++) {
                        ctx.lineTo(p.tail[t].x, p.tail[t].y);
                    }
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = p.size * 0.6;
                    ctx.globalAlpha = p.life * 0.4;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }

                // Draw head spark
                if (p.isFlash) {
                    // Radial flash burst for explosion core
                    const flash = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * p.life);
                    flash.addColorStop(0, 'rgba(255,255,255,' + p.life + ')');
                    flash.addColorStop(1, 'rgba(255,255,220,0)');
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                    ctx.fillStyle = flash;
                    ctx.fill();
                } else {
                    // Glittering twinkle effect
                    const glitterAlpha = p.glitter ? (Math.random() > 0.4 ? p.life : p.life * 0.2) : p.life;
                    ctx.globalAlpha = glitterAlpha;
                    
                    const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    radGrad.addColorStop(0,   '#ffffff');
                    radGrad.addColorStop(0.3, p.color);
                    radGrad.addColorStop(1,   'transparent');
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = radGrad;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            }

            if (active || frameCount < MAX_FRAMES) {
                requestAnimationFrame(render);
            } else {
                canvas.remove();
                // Stop ALL active audio layers when visuals end
                if (window.LCConfetti.activeAudios.length > 0) {
                    const audios = [...window.LCConfetti.activeAudios];
                    window.LCConfetti.activeAudios = []; // Clear tracking
                    
                    audios.forEach(audio => {
                        // Smooth fade out for each track
                        const fade = setInterval(() => {
                            if (audio.volume > 0.05) audio.volume -= 0.05;
                            else {
                                clearInterval(fade);
                                audio.pause();
                                audio.currentTime = 0;
                            }
                        }, 50);
                    });
                }
            }
        }

        // Prime: fill the canvas with black first so ghost-fade works from frame 1
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, W, H);

        render(); // 🎆 Launch!
    },

    _playDiwaliSound: function() {
        const potentialPaths = [
            'sounds/engyclick-sound-effects-of-fireworks-diwali-celebration-421220.mp3',
            'assets/audio/diwali.mp3', 'assets/audio/diwali.wav',
            'assets/sound/diwali.mp3', 'assets/sound/diwali.wav',
            'assets/sounds/diwali.mp3', 'assets/sounds/diwali.wav',
            'audio/diwali.mp3', 'audio/diwali.wav',
            'sound/diwali.mp3', 'sound/diwali.wav',
            'sounds/diwali.mp3', 'sounds/diwali.wav'
        ];
        
        const tryNext = (idx) => {
            if (idx >= potentialPaths.length) return;
            try {
                const url = chrome.runtime.getURL(potentialPaths[idx]);
                
                // --- Double Audio Layering for "Power" sound ---
                const audio1 = new Audio(url);
                audio1.volume = 1.0;
                
                audio1.play().then(() => {
                    console.log('[LCConfetti] Layer 1 playing:', potentialPaths[idx]);
                    window.LCConfetti.activeAudios.push(audio1);
                    
                    // Slightly offset second boom for impact
                    setTimeout(() => {
                        const audio2 = new Audio(url);
                        audio2.volume = 1.0;
                        audio2.play().then(() => {
                            window.LCConfetti.activeAudios.push(audio2);
                        });
                    }, 150);

                }).catch(e => {
                    console.warn('[LCConfetti] Path failed:', potentialPaths[idx], 'Trying next...');
                    tryNext(idx + 1);
                });
            } catch (e) { tryNext(idx + 1); }
        };
        
        tryNext(0);
    },

    _playWowSound: function() {
        const potentialPaths = [
            'sounds/dragon-studio-wow-423653.mp3',
            'assets/audio/wow.mp3', 'assets/audio/wow.wav',
            'assets/sound/wow.mp3', 'assets/sound/wow.wav',
            'assets/sounds/wow.mp3', 'assets/sounds/wow.wav',
            'audio/wow.mp3', 'audio/wow.wav',
            'sound/wow.mp3', 'sound/wow.wav',
            'sounds/wow.mp3', 'sounds/wow.wav'
        ];
        
        const tryNext = (idx) => {
            if (idx >= potentialPaths.length) return;
            try {
                const url = chrome.runtime.getURL(potentialPaths[idx]);
                const audio = new Audio(url);
                audio.volume = 1.0;
                audio.play().then(() => {
                    console.log('[LCConfetti] Wow sound playing:', potentialPaths[idx]);
                }).catch(e => {
                    console.warn('[LCConfetti] Wow path failed:', potentialPaths[idx], 'Trying next...');
                    tryNext(idx + 1);
                });
            } catch (e) { tryNext(idx + 1); }
        };
        
        tryNext(0);
    },

    initHook: function() {
        // We use a robust event listener to detect Run vs Submit button clicks
        document.addEventListener('click', (e) => {
            // Walk up from clicked element, find the nearest interactive button only
            const btn = e.target.closest('button, [role="button"]');
            if (!btn) return;

            const text    = (btn.textContent || '').trim().toLowerCase();
            const locator = (btn.getAttribute('data-e2e-locator') || '').toLowerCase();
            const aria    = (btn.getAttribute('aria-label') || '').toLowerCase();

            // Detect if it's the Run button specifically
            const isRun = text === 'run' || text === 'run code' ||
                          locator === 'console-run-btn' || locator.includes('run-btn') ||
                          (aria.includes('run') && !aria.includes('submit'));

            // Detect if it's the Submit button specifically (must NOT be Run)
            const isSubmitRaw = !isRun && (
                text === 'submit' || text === 'submit code' ||
                locator === 'console-submit-btn' || locator.includes('submit-btn') ||
                aria.includes('submit')
            );

            const isRunMode = isRun || isSubmitRaw;

            // Validate it's one of our known buttons
            if (isRunMode) {
                window.lcActionPending    = true;
                window.lcAcceptedAlready  = false;
                window.lcIsSubmitMode     = isSubmitRaw; // Only true for full Submit
                    
                    // Give LeetCode's React router 500ms to clear out the previous "Accepted" text from the console
                    setTimeout(() => {
                        let checks = 0;
                        // Start checking the DOM to look for the result
                        const interval = setInterval(() => {
                            checks++;
                            if (checks > 100 || !window.lcActionPending) {
                                clearInterval(interval);
                                return;
                            }
                            
                            let foundMainSuccess = false;
                            let hasAnyFailure    = false;

                            // Targeted search in result containers only
                            const resultHolders = document.querySelectorAll('[data-e2e-locator*="-result"], [class*="result"]');
                            
                            for (let holder of resultHolders) {
                                if (holder.offsetParent === null) continue; // skip hidden
                                const text = holder.textContent.trim();
                                const isSubmission = holder.getAttribute('data-e2e-locator')?.includes('submission-result');
                                const isConsole    = holder.getAttribute('data-e2e-locator')?.includes('console-result');

                                // ── Filter Context ──
                                if (window.lcIsSubmitMode && isConsole) continue;
                                if (!window.lcIsSubmitMode && isSubmission) continue;

                                // ── 1. FAILURE DETECTION (PRIORITY) ──
                                if (text.includes('Wrong Answer') || text.includes('Compile Error') || text.includes('Runtime Error') || text.includes('Limit Exceeded')) {
                                    hasAnyFailure = true;
                                    window.lcActionPending = false;
                                    clearInterval(interval);
                                    if (window.LCFahhh) window.LCFahhh.play();
                                    return;
                                }

                                // ── 2. SUCCESS DETECTION ──
                                if (text.includes('Accepted') || text.includes('Finished') || text.includes('Success')) {
                                    foundMainSuccess = true;
                                }
                            }

                            if (foundMainSuccess && !hasAnyFailure) {
                                if (!window.lcAcceptedAlready) {
                                    window.lcAcceptedAlready = true;
                                    window.lcActionPending = false;
                                    clearInterval(interval);
                                    
                                    if (window.LCHistory) window.LCHistory.record('Accepted');
                                    if (window.lcIsSubmitMode && window.LCTimer) window.LCTimer.recordSolve();
                                    window.postMessage({ type: 'LC_PROBLEM_ACCEPTED' }, '*');
                                    
                                    setTimeout(() => window.LCConfetti.fire(window.lcIsSubmitMode), 50);
                                }
                            }
                        }, 500); // Probe every 0.5s
                    }, 500);
                }
        });
        
        console.log("[LeetCode IntelliSense] Confetti Engine armed and ready.");
    }
};

// Start the trigger system
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    window.LCConfetti.initHook();
} else {
    document.addEventListener('DOMContentLoaded', () => window.LCConfetti.initHook());
}
