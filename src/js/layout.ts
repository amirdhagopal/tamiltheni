interface LayoutOptions {
    title: string;
    contentHTML: string;
    timerDisplay: string;
    injectNavigation?: boolean;
}

export const Layout = {
    init: function (options: LayoutOptions): void {
        this.injectHeaderAndPanel(options.title, options.contentHTML);
        this.injectCircularTimer(options.timerDisplay);
        // Navigation injection can be optional if page layout differs significantly
        if (options.injectNavigation) {
            this.injectNavigation();
        }
        // Inject keyboard help modal
        this.injectKeyboardHelpModal();
        // Setup global keyboard shortcuts for page navigation
        this.setupGlobalKeyboardShortcuts();

        // Adjust body padding for fixed header
        document.body.style.paddingTop = '80px';
    },

    injectHeaderAndPanel: function (title: string, contentHTML: string): void {
        // 1. Fixed Header
        const headerStr = `
            <header class="app-header" id="appHeader">
                <div class="header-left">
                    <a href="../index.html" class="home-btn" title="Go Home (H)" aria-label="Home">
                        <span aria-hidden="true">🏠</span>
                    </a>
                </div>
                <h1 class="header-title">${title}</h1>
                <div class="header-right" style="gap: 10px;">
                    <button class="settings-toggle" id="showKeyboardHelp" title="Keyboard Shortcuts (?)" aria-label="Show Shortcuts">
                        <span aria-hidden="true">⌨️</span>
                    </button>
                    <button class="settings-toggle" id="settingsToggle" title="Toggle Settings (C)" aria-label="Toggle Settings" aria-expanded="true" aria-controls="controlPanel">
                        <span aria-hidden="true">⚙️</span>
                    </button>
                </div>
            </header>
        `;
        document.body.insertAdjacentHTML('afterbegin', headerStr);

        // 2. Control Panel (Overlay)
        // Default Open: 'open' class added and aria-hidden="false"
        const panelStr = `
            <div class="control-panel open" id="controlPanel" aria-hidden="false">
                <div class="control-content" id="controlContent">
                    <div id="controlSettings" style="display: flex; flex-direction: column; gap: 15px;">
                        ${contentHTML}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', panelStr);

        // Wire up toggle logic
        const toggleBtn = document.getElementById('settingsToggle');
        const panel = document.getElementById('controlPanel');
        const header = document.getElementById('appHeader');

        const togglePanel = () => {
            if (!panel) return;
            const isOpen = panel.classList.contains('open');
            if (isOpen) {
                panel.classList.remove('open');
                panel.setAttribute('aria-hidden', 'true');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
                document.dispatchEvent(new CustomEvent('panelCollapsed'));
            } else {
                panel.classList.add('open');
                panel.setAttribute('aria-hidden', 'false');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
            }
        };

        // 1. Gear Icon Toggle
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling to header
                togglePanel();
            });
        }

        // 2. Header Click Toggle
        if (header) {
            header.addEventListener('click', (e) => {
                // Ignore clicks on interactive elements inside header
                if ((e.target as HTMLElement).closest('button, a')) {
                    return;
                }
                togglePanel();
            });
            header.style.cursor = 'pointer'; // Indicate clickability
        }

        // 3. Click Outside to Close
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            // If panel is open
            if (panel && panel.classList.contains('open')) {
                // And click is NOT inside panel AND NOT inside header
                if (!panel.contains(target) && !header?.contains(target)) {
                    this.collapsePanel();
                }
            }
        });

        // 4. Global Event / Method for Internal Collapse
        (window as any).collapsePanel = () => this.collapsePanel();
        document.addEventListener('requestPanelCollapse', () => {
            this.collapsePanel();
        });
    },

    collapsePanel: function (): void {
        const panel = document.getElementById('controlPanel');
        const toggleBtn = document.getElementById('settingsToggle');
        if (panel && panel.classList.contains('open')) {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
            if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            document.dispatchEvent(new CustomEvent('panelCollapsed'));
        }
    },

    injectCircularTimer: function (initialDisplay = '00:15'): void {
        const timerStr = `
            <div class="circular-timer" id="timerPill" role="region" aria-label="Study Timer">
                <div class="timer-visual" id="timerPie" aria-hidden="true"></div>
                <div class="timer-content">
                    <span class="timer-display" id="timerDisplay" aria-live="off">${initialDisplay}</span>
                    <button class="timer-btn" id="timerBtn" title="Play or Pause Timer" aria-label="Play or Pause Timer">
                        <span aria-hidden="true">▶</span>
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', timerStr);
    },

    injectNavigation: function (): void {
        const navStr = `
            <div class="navigation" role="navigation" aria-label="Slide Navigation">
                <button class="nav-btn" id="firstBtn" title="First slide (Home)" aria-label="First Slide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="20" x2="7" y2="4"></line><polyline points="17 4 9 12 17 20"></polyline></svg>
                </button>
                <button class="nav-btn" id="prevBtn" title="Previous slide (←)" aria-label="Previous Slide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <span id="counter" aria-live="polite" class="slide-counter"></span>
                <button class="nav-btn" id="nextBtn" title="Next slide (→ / Space / Enter)" aria-label="Next Slide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <button class="nav-btn" id="lastBtn" title="Last slide (End)" aria-label="Last Slide">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="17" y1="20" x2="17" y2="4"></line><polyline points="7 20 15 12 7 4"></polyline></svg>
                </button>
            </div>
        `;
        // Check if slide container exists to append to, otherwise append to body?
        // Usually navigation is inside .slide-container
        const container = document.querySelector('.slide-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', navStr);
        }
    },

    injectKeyboardHelpModal: function (): void {
        const modalStr = `
            <div class="keyboard-help-modal" id="keyboardHelpModal" role="dialog" aria-labelledby="keyboardHelpTitle" aria-hidden="true">
                <div class="keyboard-help-content">
                    <div class="keyboard-help-header">
                        <h2 id="keyboardHelpTitle">⌨️ Keyboard Shortcuts</h2>
                        <button class="keyboard-help-close" id="closeKeyboardHelp" title="Close (Escape)" aria-label="Close">&times;</button>
                    </div>
                    <div class="keyboard-help-body">
                        <div class="shortcut-section">
                            <h3>🧭 Navigation</h3>
                            <div class="shortcut-row"><kbd>H</kbd><span>Go to Home page</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+1</kbd><span>Go to Theni 1</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+2</kbd><span>Go to Theni 2</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+3</kbd><span>Go to Theni 3 & 4</span></div>
                            <div class="shortcut-row"><kbd>Ctrl+5</kbd><span>Go to Theni 5</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>📖 Slides</h3>
                            <div class="shortcut-row"><kbd>←</kbd><span>Previous slide</span></div>
                            <div class="shortcut-row"><kbd>→</kbd> <kbd>Space</kbd> <kbd>Enter</kbd><span>Next / Reveal</span></div>
                            <div class="shortcut-row"><kbd>Home</kbd> / <kbd>[</kbd><span>First slide</span></div>
                            <div class="shortcut-row"><kbd>End</kbd> / <kbd>]</kbd><span>Last slide</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>🎛️ Actions & Filters</h3>
                            <div class="shortcut-row"><kbd>G</kbd><span>Generate Sentence (Theni 2)</span></div>
                            <div class="shortcut-row"><kbd>S</kbd><span>Shuffle slides</span></div>
                            <div class="shortcut-row"><kbd>R</kbd><span>Reset sequence</span></div>
                            <div class="shortcut-row"><kbd>1</kbd> / <kbd>2</kbd> / <kbd>A</kbd><span>Filter D1 / D2 / All</span></div>
                        </div>
                        <div class="shortcut-section">
                            <h3>❓ Help & UI</h3>
                            <div class="shortcut-row"><kbd>?</kbd><span>Show this help</span></div>
                            <div class="shortcut-row"><kbd>Esc</kbd><span>Close modal / panel</span></div>
                            <div class="shortcut-row"><kbd>C</kbd><span>Toggle Control Panel</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .keyboard-help-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                    z-index: 10000;
                    align-items: center;
                    justify-content: center;
                }
                .keyboard-help-modal.show {
                    display: flex;
                }
                .keyboard-help-content {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border-radius: 16px;
                    max-width: 600px;
                    width: 90%;
                    max-height: 85vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .keyboard-help-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .keyboard-help-header h2 {
                    margin: 0;
                    color: #fff;
                    font-size: 1.3em;
                    font-weight: 600;
                }
                .keyboard-help-close {
                    background: none;
                    border: none;
                    color: #999;
                    font-size: 28px;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                    transition: color 0.2s;
                }
                .keyboard-help-close:hover {
                    color: #fff;
                }
                .keyboard-help-body {
                    padding: 20px 24px;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 24px;
                }
                .shortcut-section h3 {
                    color: #667eea;
                    font-size: 0.95em;
                    margin: 0 0 12px 0;
                    font-weight: 600;
                }
                .shortcut-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 6px 0;
                    color: #ccc;
                    font-size: 0.9em;
                }
                .shortcut-row kbd {
                    background: linear-gradient(180deg, #3a3a4a 0%, #2a2a3a 100%);
                    border: 1px solid #555;
                    border-radius: 5px;
                    padding: 4px 8px;
                    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                    font-size: 0.85em;
                    color: #fff;
                    min-width: 24px;
                    text-align: center;
                    box-shadow: 0 2px 0 #222;
                }
                .shortcut-row span:last-child {
                    flex: 1;
                }
                @media (max-width: 500px) {
                    .keyboard-help-body {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
        document.body.insertAdjacentHTML('beforeend', modalStr);

        // Setup modal event listeners
        const modal = document.getElementById('keyboardHelpModal');
        const closeBtn = document.getElementById('closeKeyboardHelp');
        const showBtn = document.getElementById('showKeyboardHelp');

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            });
        }

        if (showBtn && modal) {
            showBtn.addEventListener('click', () => {
                modal.classList.add('show');
                modal.setAttribute('aria-hidden', 'false');
            });
        }

        // Close on click outside
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    },

    setupGlobalKeyboardShortcuts: function (): void {
        const modal = document.getElementById('keyboardHelpModal');

        document.addEventListener('keydown', (e: KeyboardEvent) => {
            // Don't trigger shortcuts when typing in input fields
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            // Escape: Close modal OR Close control panel
            if (e.key === 'Escape') {
                if (modal?.classList.contains('show')) {
                    modal.classList.remove('show');
                    modal.setAttribute('aria-hidden', 'true');
                    return;
                }
                // Also close control panel if open
                const panel = document.getElementById('controlPanel');
                if (panel && panel.classList.contains('open')) {
                    panel.classList.remove('open');
                    panel.setAttribute('aria-hidden', 'true');
                    const toggle = document.getElementById('settingsToggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                    document.dispatchEvent(new CustomEvent('panelCollapsed'));
                    return;
                }
            }

            // ? to show help modal
            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                if (modal) {
                    modal.classList.add('show');
                    modal.setAttribute('aria-hidden', 'false');
                }
                return;
            }

            // Don't trigger other shortcuts if modal is open
            if (modal?.classList.contains('show')) {
                return;
            }

            // C = Toggle Control Panel
            if (e.key === 'c' || e.key === 'C') {
                const panel = document.getElementById('controlPanel');
                const toggle = document.getElementById('settingsToggle');

                if (panel) {
                    const isOpen = panel.classList.contains('open');

                    if (isOpen) {
                        panel.classList.remove('open');
                        panel.setAttribute('aria-hidden', 'true');
                        if (toggle) toggle.setAttribute('aria-expanded', 'false');
                        document.dispatchEvent(new CustomEvent('panelCollapsed'));
                    } else {
                        panel.classList.add('open');
                        panel.setAttribute('aria-hidden', 'false');
                        if (toggle) toggle.setAttribute('aria-expanded', 'true');
                    }
                }
                return;
            }

            // H = Go to Home page
            if (e.key === 'h' || e.key === 'H') {
                window.location.href = '../index.html';
                return;
            }

            // Ctrl+Number shortcuts for navigation to specific Theni pages
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        window.location.href = '../html/theni1.html';
                        break;
                    case '2':
                        e.preventDefault();
                        window.location.href = '../html/theni2.html';
                        break;
                    case '3':
                    case '4':
                        e.preventDefault();
                        window.location.href = '../html/theni34.html';
                        break;
                    case '5':
                        e.preventDefault();
                        window.location.href = '../html/theni5.html';
                        break;
                }
            }
        });
    },
};
