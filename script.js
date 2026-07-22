document.addEventListener("DOMContentLoaded", () => {
    
    // Helper: Debounce utility for non-frame critical events (e.g. resize)
    function debounce(func, wait = 100) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /* -------------------------------------------------------------
       1. ULTRA-RESPONSIVE HARDWARE ACCELERATED CURSOR (rAF LERP)
       ------------------------------------------------------------- */
    const cursor = document.getElementById("custom-cursor");
    const cursorDot = document.getElementById("cursor-dot");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    // Passive listener updates raw mouse coordinates
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }, { passive: true });

    // High refresh-rate rendering loop running strictly via requestAnimationFrame
    function animateCursor() {
        if (cursorDot) {
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        }

        // Snappy lerp factor (0.55) for smooth trailing without input lag
        const lerpFactor = 0.55;
        const dx = mouseX - cursorX;
        const dy = mouseY - cursorY;

        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
            cursorX += dx * lerpFactor;
            cursorY += dy * lerpFactor;

            if (cursor) {
                cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            }
        }

        requestAnimationFrame(animateCursor);
    }
    requestAnimationFrame(animateCursor);

    // Event delegation with passive listener for hover states
    document.addEventListener("mouseover", (e) => {
        if (!cursor) return;
        const target = e.target.closest("a, button, .skill-badge, .card, .filter-btn, .cli-btn, .nav-item, input, textarea");
        if (target) {
            cursor.classList.add("cursor-hover");
        } else {
            cursor.classList.remove("cursor-hover");
        }
    }, { passive: true });


    /* -------------------------------------------------------------
       1B. NAVIGATION SCROLL SPY & SMOOTH SCROLLING (rAF THROTTLED)
       ------------------------------------------------------------- */
    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("section[id], header[id]");

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // rAF-throttled scroll handler for active state synchronization
    let isScrollTicking = false;
    const onScrollHandler = () => {
        if (!isScrollTicking) {
            requestAnimationFrame(() => {
                const scrollPos = window.scrollY + 120;
                sections.forEach(sec => {
                    const top = sec.offsetTop;
                    const height = sec.offsetHeight;
                    if (scrollPos >= top && scrollPos < top + height) {
                        const id = sec.getAttribute("id");
                        navLinks.forEach(l => {
                            if (l.getAttribute("href") === `#${id}`) {
                                l.classList.add("active");
                            } else {
                                l.classList.remove("active");
                            }
                        });
                    }
                });
                isScrollTicking = false;
            });
            isScrollTicking = true;
        }
    };

    window.addEventListener("scroll", onScrollHandler, { passive: true });


    /* -------------------------------------------------------------
       2. ELASTIC MAGNETIC PHYSICS HOVER (rAF THROTTLED)
       ------------------------------------------------------------- */
    const magneticItems = document.querySelectorAll(".magnetic");

    magneticItems.forEach(item => {
        let cachedRect = null;
        let ticking = false;

        item.addEventListener("mouseenter", () => {
            cachedRect = item.getBoundingClientRect();
        }, { passive: true });

        item.addEventListener("mousemove", (e) => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (!cachedRect) cachedRect = item.getBoundingClientRect();
                    const x = e.clientX - cachedRect.left - cachedRect.width / 2;
                    const y = e.clientY - cachedRect.top - cachedRect.height / 2;

                    item.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0)`;
                    item.style.transition = "transform 0.08s ease";
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        item.addEventListener("mouseleave", () => {
            cachedRect = null;
            ticking = false;
            item.style.transform = "translate3d(0px, 0px, 0)";
            item.style.transition = "transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)";
        }, { passive: true });
    });


    /* -------------------------------------------------------------
       3. PHYSICALLY DETAILED 3D CARD TILT (rAF THROTTLED)
       ------------------------------------------------------------- */
    const cards = document.querySelectorAll(".tilt-card");
    
    cards.forEach(card => {
        let cachedRect = null;
        let ticking = false;

        card.addEventListener("mouseenter", () => {
            cachedRect = card.getBoundingClientRect();
        }, { passive: true });

        card.addEventListener("mousemove", (e) => {
            if (window.innerWidth <= 900) return;
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (!cachedRect) cachedRect = card.getBoundingClientRect();
                    const x = e.clientX - cachedRect.left - cachedRect.width / 2;
                    const y = e.clientY - cachedRect.top - cachedRect.height / 2;
                    
                    const rotX = -(y / (cachedRect.height / 2)) * 5; 
                    const rotY = (x / (cachedRect.width / 2)) * 5; 
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.01)`;
                    card.style.borderColor = "var(--accent-red)";
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        card.addEventListener("mouseleave", () => {
            cachedRect = null;
            ticking = false;
            card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
            card.style.borderColor = "var(--border)";
        }, { passive: true });
    });


    /* -------------------------------------------------------------
       4. INTERACTIVE ROBOTIC ARM INVERSE KINEMATICS (OPTIMIZED)
       ------------------------------------------------------------- */
    const canvas = document.getElementById("robotic-canvas");
    const ctx = canvas.getContext("2d", { alpha: true });
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }, 150);
    }, { passive: true });

    const arm = {
        baseX: width * 0.78,
        baseY: height * 0.62,
        link1: 220,
        link2: 180,
        elbowX: 0,
        elbowY: 0,
        wristX: 0,
        wristY: 0
    };

    let targetXFiltered = width / 2;
    let targetYFiltered = height / 2;

    function solveIK(targetX, targetY) {
        arm.baseX = width * 0.78;
        arm.baseY = height * 0.62;

        const dx = targetX - arm.baseX;
        const dy = targetY - arm.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let tx = targetX;
        let ty = targetY;
        const maxReach = (arm.link1 + arm.link2) * 0.99;
        if (dist > maxReach) {
            tx = arm.baseX + (dx / dist) * maxReach;
            ty = arm.baseY + (dy / dist) * maxReach;
        }

        const dCurrent = Math.sqrt((tx - arm.baseX) ** 2 + (ty - arm.baseY) ** 2);

        let cosElbow = (dCurrent ** 2 - arm.link1 ** 2 - arm.link2 ** 2) / (2 * arm.link1 * arm.link2);
        cosElbow = Math.max(-1, Math.min(1, cosElbow));
        const angleElbow = Math.acos(cosElbow);

        const alpha = Math.atan2(ty - arm.baseY, tx - arm.baseX);
        const beta = Math.atan2(arm.link2 * Math.sin(angleElbow), arm.link1 + arm.link2 * Math.cos(angleElbow));
        const angleShoulder = alpha - beta;

        arm.elbowX = arm.baseX + arm.link1 * Math.cos(angleShoulder);
        arm.elbowY = arm.baseY + arm.link1 * Math.sin(angleShoulder);
        arm.wristX = arm.elbowX + arm.link2 * Math.cos(angleShoulder + angleElbow);
        arm.wristY = arm.elbowY + arm.link2 * Math.sin(angleShoulder + angleElbow);
    }

    // Canvas draw cycle - Optimized to pause when document hidden
    function animateRobotics() {
        if (document.hidden) {
            requestAnimationFrame(animateRobotics);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        targetXFiltered += (mouseX - targetXFiltered) * 0.05;
        targetYFiltered += (mouseY - targetYFiltered) * 0.05;

        solveIK(targetXFiltered, targetYFiltered);

        // Draw Arm Base Plate
        ctx.fillStyle = "rgba(2, 132, 199, 0.05)";
        ctx.beginPath();
        ctx.arc(arm.baseX, arm.baseY, 32, 0, Math.PI * 2);
        ctx.fill();

        // Link 1 (Electric Cyan/Blue)
        ctx.strokeStyle = "rgba(2, 132, 199, 0.45)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(arm.baseX, arm.baseY);
        ctx.lineTo(arm.elbowX, arm.elbowY);
        ctx.stroke();

        // Link 2 (Rose / Red)
        ctx.strokeStyle = "rgba(225, 29, 72, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arm.elbowX, arm.elbowY);
        ctx.lineTo(arm.wristX, arm.wristY);
        ctx.stroke();

        // Joints
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "rgba(2, 132, 199, 0.7)";
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(arm.baseX, arm.baseY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "rgba(225, 29, 72, 0.7)";
        ctx.beginPath();
        ctx.arc(arm.elbowX, arm.elbowY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.arc(arm.wristX, arm.wristY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(2, 132, 199, 0.3)";
        ctx.beginPath();
        ctx.arc(arm.wristX, arm.wristY, 15, 0, Math.PI * 2);
        ctx.stroke();

        requestAnimationFrame(animateRobotics);
    }
    animateRobotics();


    /* -------------------------------------------------------------
       6. MODAL INTERACTIVE CONTROLLER & TAB SYSTEM
       ------------------------------------------------------------- */
    const clickableCards = document.querySelectorAll(".clickable-card");
    const modals = document.querySelectorAll(".modal-overlay");
    const modalCloses = document.querySelectorAll(".modal-close");

    // Open Modal
    clickableCards.forEach(card => {
        card.addEventListener("click", () => {
            const modalId = card.getAttribute("data-modal");
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add("active");
                document.body.style.overflow = "hidden";

                // If Resonance modal opened, start visualizer
                if (modalId === "resonance-modal" && typeof startAudioVisualizer === "function") {
                    startAudioVisualizer();
                }
            }
        });
    });

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove("active");
            document.body.style.overflow = "";

            // Stop audio visualizer if resonance modal closed
            if (modal.id === "resonance-modal" && typeof stopAudioVisualizer === "function") {
                stopAudioVisualizer();
            }
        }
    }

    modalCloses.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            closeModal(btn.closest(".modal-overlay"));
        });
    });

    modals.forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            modals.forEach(m => closeModal(m));
        }
    });

    // Tab Switching
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            const parentModal = btn.closest(".modal-content");
            if (!parentModal) return;

            parentModal.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            parentModal.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            const targetContent = parentModal.querySelector(`#${tabId}`);
            if (targetContent) {
                targetContent.classList.add("active");
            }
        });
    });


    /* -------------------------------------------------------------
       7. TERMINAL INTERACTIVE SIMULATORS (BINANCE & WSB)
       ------------------------------------------------------------- */
    const cliButtons = document.querySelectorAll(".cli-btn:not(.wsb-cli-btn)");
    const terminalOutput = document.getElementById("binance-terminal-output");

    const terminalPresets = {
        "python main.py balance": [
            `<div class="term-line"><span class="term-prompt">C:\\trading_bot&gt;</span> python main.py balance</div>`,
            `<div class="term-line term-success">[CONNECTED] Binance USDT-M Futures Testnet API v2</div>`,
            `<div class="term-line">---------------------------------------------------------</div>`,
            `<div class="term-line"> Total Wallet Balance:   15,240.50 USDT</div>`,
            `<div class="term-line"> Available Margin:        12,890.10 USDT</div>`,
            `<div class="term-line"> Unrealized PnL:         +245.40 USDT (Active Leverage: 10x)</div>`,
            `<div class="term-line"> Active Open Positions:   1 (BTCUSDT Long @ 64,200)</div>`,
            `<div class="term-line">---------------------------------------------------------</div>`
        ],
        "python main.py buy BTCUSDT 0.002": [
            `<div class="term-line"><span class="term-prompt">C:\\trading_bot&gt;</span> python main.py buy BTCUSDT 0.002</div>`,
            `<div class="term-line">[PRE-FLIGHT GUARDIAN] Validating symbol precision & margin balance...</div>`,
            `<div class="term-line term-success">&check; Symbol BTCUSDT valid | Min Step: 0.001 | Margin required: 12.84 USDT</div>`,
            `<div class="term-line">[ORDER SUBMITTED] Type: MARKET | Side: BUY | Symbol: BTCUSDT | Qty: 0.002</div>`,
            `<div class="term-line term-success">[ORDER FILLED] Order ID: 884920194 | Avg Price: $64,210.00 | Status: FILLED</div>`
        ],
        "python main.py limit ETHUSDT SELL 0.05 3500": [
            `<div class="term-line"><span class="term-prompt">C:\\trading_bot&gt;</span> python main.py limit ETHUSDT SELL 0.05 3500</div>`,
            `<div class="term-line">[PRE-FLIGHT GUARDIAN] Checking tick precision for limit target...</div>`,
            `<div class="term-line term-success">&check; Target Price $3500.00 conforms to tick size $0.01</div>`,
            `<div class="term-line">[ORDER CREATED] Type: LIMIT | Side: SELL | Symbol: ETHUSDT | Qty: 0.05 @ $3500.00</div>`,
            `<div class="term-line term-success">[ACTIVE] Order ID: 884920202 | Status: NEW | Registered in Binance Open Book</div>`
        ],
        "python main.py orders": [
            `<div class="term-line"><span class="term-prompt">C:\\trading_bot&gt;</span> python main.py orders</div>`,
            `<div class="term-line">Fetching active open orders from Binance Futures REST API...</div>`,
            `<div class="term-line">----------------------------------------------------------------------</div>`,
            `<div class="term-line"> ID          SYMBOL    TYPE    SIDE   QUANTITY  LIMIT PRICE  STATUS</div>`,
            `<div class="term-line"> 884920202   ETHUSDT   LIMIT   SELL   0.050     3500.00 USDT NEW</div>`,
            `<div class="term-line"> 884919830   BTCUSDT   STOP    SELL   0.002     62000.00USDT UNTRIGGERED</div>`,
            `<div class="term-line">----------------------------------------------------------------------</div>`
        ]
    };

    cliButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const cmd = btn.getAttribute("data-cmd");
            if (terminalOutput && terminalPresets[cmd]) {
                terminalOutput.innerHTML = terminalPresets[cmd].join("");
            }
        });
    });

    const wsbCliButtons = document.querySelectorAll(".wsb-cli-btn");
    const wsbTerminalOutput = document.getElementById("wsb-terminal-output");

    const wsbTerminalPresets = {
        "ingest": [
            `<div class="term-line"><span class="term-prompt">quant_env&gt;</span> python wsb_alpha_system.py --ingest</div>`,
            `<div class="term-line term-success">[INGESTION] Connected to Apify Puppeteer Scraper API...</div>`,
            `<div class="term-line">[FETCH] Scraped 142 long-form "Due Diligence" flaired posts</div>`,
            `<div class="term-line">[NLP ENGINE] Executing FinBERT Transformer Classification...</div>`,
            `<div class="term-line term-success">&check; Ticker collision filter resolved: 89 valid stock targets isolated</div>`,
            `<div class="term-line">&check; Sentiment breakdown: 64 Bullish | 18 Bearish | 7 Neutral</div>`
        ],
        "normalize": [
            `<div class="term-line"><span class="term-prompt">quant_env&gt;</span> python wsb_alpha_system.py --normalize</div>`,
            `<div class="term-line">[OXFORD MODEL] Calculating Subreddit Share of Conversation...</div>`,
            `<div class="term-line term-success">&check; Mentions normalized by total daily DD volume (Daily DD count = 142)</div>`,
            `<div class="term-line">[GRAPH ENGINE] Updating adjacency matrix in co_mentions.json</div>`,
            `<div class="term-line term-success">&check; Isolated 3 low-density niche stock clusters (unhyped institutional targets)</div>`
        ],
        "evaluate": [
            `<div class="term-line"><span class="term-prompt">quant_env&gt;</span> python wsb_alpha_system.py --evaluate</div>`,
            `<div class="term-line">[EXECUTION REALIGNMENT] Forcing T+1 close trade entry...</div>`,
            `<div class="term-line">[YFINANCE API] Downloading elapsed price bars for open NaN entries...</div>`,
            `<div class="term-line term-success">&check; Re-evaluation complete: 28 post-returns populated</div>`,
            `<div class="term-line term-success">&check; Mean 30-Day Excess Return (vs SPY): +14.2% Alpha (Out-Of-Sample)</div>`
        ],
        "export": [
            `<div class="term-line"><span class="term-prompt">quant_env&gt;</span> python wsb_alpha_system.py --export</div>`,
            `<div class="term-line">[EXPORT ENGINE] Appending clean structured records to database...</div>`,
            `<div class="term-line term-success">&check; Saved: wsb_factual_research_data.csv (Dropped 4 duplicate post-ticker pairs)</div>`,
            `<div class="term-line term-success">&check; Exported: co_mentions.json network graph for institutional AltData API</div>`
        ]
    };

    wsbCliButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const cmd = btn.getAttribute("data-cmd");
            if (wsbTerminalOutput && wsbTerminalPresets[cmd]) {
                wsbTerminalOutput.innerHTML = wsbTerminalPresets[cmd].join("");
            }
        });
    });


    /* -------------------------------------------------------------
       8. RESONANCE AUDIO VISUALIZER CANVAS (LAZY ON-DEMAND LOOP)
       ------------------------------------------------------------- */
    const audioCanvas = document.getElementById("audio-visualizer-canvas");
    let audioAnimFrame = null;

    function startAudioVisualizer() {
        if (!audioCanvas) return;
        const actx = audioCanvas.getContext("2d");
        
        function drawAudioVisualizer() {
            const resonanceModal = document.getElementById("resonance-modal");
            if (!resonanceModal || !resonanceModal.classList.contains("active")) {
                if (audioAnimFrame) cancelAnimationFrame(audioAnimFrame);
                return;
            }

            if (audioCanvas.parentElement) {
                audioCanvas.width = audioCanvas.parentElement.clientWidth;
            }
            const w = audioCanvas.width;
            const h = audioCanvas.height;

            actx.clearRect(0, 0, w, h);
            const numBars = 32;
            const barWidth = (w / numBars) - 3;
            const time = Date.now() * 0.005;

            for (let i = 0; i < numBars; i++) {
                const barHeight = Math.abs(Math.sin(time + i * 0.2) * Math.cos(time * 0.5 + i * 0.1)) * (h * 0.8) + 5;
                const x = i * (barWidth + 3);
                const y = h - barHeight;

                const gradient = actx.createLinearGradient(0, h, 0, 0);
                gradient.addColorStop(0, "rgba(0, 242, 254, 0.3)");
                gradient.addColorStop(1, "rgba(255, 90, 95, 0.9)");

                actx.fillStyle = gradient;
                actx.fillRect(x, y, barWidth, barHeight);
            }
            audioAnimFrame = requestAnimationFrame(drawAudioVisualizer);
        }
        drawAudioVisualizer();
    }

    function stopAudioVisualizer() {
        if (audioAnimFrame) {
            cancelAnimationFrame(audioAnimFrame);
            audioAnimFrame = null;
        }
    }

    window.startAudioVisualizer = startAudioVisualizer;
    window.stopAudioVisualizer = stopAudioVisualizer;
});
