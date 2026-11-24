import { Fragment } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';

export interface AppShellProps {
    title: string;
    contentHTML?: string;
    timerDisplay?: string;
    injectNavigation?: boolean;
}

export function AppShell({ title, contentHTML = '', timerDisplay = '00:15' }: AppShellProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    const collapsePanel = useCallback(() => {
        setIsPanelOpen((prev) => {
            if (prev) {
                document.dispatchEvent(new CustomEvent('panelCollapsed'));
            }
            return false;
        });
    }, []);

    const togglePanel = useCallback(() => {
        setIsPanelOpen((prev) => {
            const next = !prev;
            if (!next) {
                document.dispatchEvent(new CustomEvent('panelCollapsed'));
            }
            return next;
        });
    }, []);

    useEffect(() => {
        document.body.style.paddingTop = '80px';
        (window as unknown as { collapsePanel?: () => void }).collapsePanel = collapsePanel;

        const handleRequestCollapse = () => collapsePanel();
        document.addEventListener('requestPanelCollapse', handleRequestCollapse);

        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                panelRef.current &&
                panelRef.current.classList.contains('open') &&
                !panelRef.current.contains(target) &&
                !headerRef.current?.contains(target) &&
                !target.closest('.dropdown-menu')
            ) {
                collapsePanel();
            }
        };
        document.addEventListener('click', handleOutsideClick);

        return () => {
            document.removeEventListener('requestPanelCollapse', handleRequestCollapse);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [collapsePanel]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.key === 'Escape') {
                if (isHelpOpen) {
                    setIsHelpOpen(false);
                    return;
                }
                if (isPanelOpen) {
                    collapsePanel();
                    return;
                }
            }

            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                setIsHelpOpen(true);
                return;
            }

            if (isHelpOpen) {
                return;
            }

            if (e.key === 'c' || e.key === 'C') {
                togglePanel();
                return;
            }

            if (e.key === 'h' || e.key === 'H') {
                window.location.href = '../index.html';
                return;
            }

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
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isHelpOpen, isPanelOpen, collapsePanel, togglePanel]);

    return (
        <Fragment>
            <header
                className="app-header"
                id="appHeader"
                ref={headerRef}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button, a')) return;
                    togglePanel();
                }}
            >
                <div className="header-left">
                    <a href="../index.html" className="home-btn" title="Go Home (H)" aria-label="Home">
                        <span aria-hidden="true">🏠</span>
                    </a>
                </div>
                <h1 className="header-title">{title}</h1>
                <div className="header-right" style={{ gap: '10px' }}>
                    <button
                        className="settings-toggle"
                        id="settingsToggle"
                        title="Toggle Settings (C)"
                        aria-label="Toggle Settings"
                        aria-expanded={isPanelOpen ? 'true' : 'false'}
                        aria-controls="controlPanel"
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePanel();
                        }}
                    >
                        <span aria-hidden="true">⚙️</span>
                    </button>
                    <button
                        className="settings-toggle"
                        id="showKeyboardHelp"
                        title="Keyboard Shortcuts (?)"
                        aria-label="Show Shortcuts"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsHelpOpen(true);
                        }}
                    >
                        <span aria-hidden="true">⌨️</span>
                    </button>
                </div>
            </header>

            <div
                className={`control-panel ${isPanelOpen ? 'open' : 'collapsed'}`}
                id="controlPanel"
                ref={panelRef}
                aria-hidden={isPanelOpen ? 'false' : 'true'}
            >
                <div className="control-content" id="controlContent">
                    <div
                        id="controlSettings"
                        style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                        dangerouslySetInnerHTML={contentHTML ? { __html: contentHTML } : undefined}
                    />
                </div>
            </div>

            <div className="circular-timer" id="timerPill" role="region" aria-label="Study Timer">
                <div className="timer-visual" id="timerPie" aria-hidden="true" />
                <div className="timer-content">
                    <span className="timer-display" id="timerDisplay" aria-live="off">
                        {timerDisplay}
                    </span>
                    <button
                        className="timer-btn"
                        id="timerBtn"
                        title="Play or Pause Timer"
                        aria-label="Play or Pause Timer"
                    >
                        <span aria-hidden="true">▶</span>
                    </button>
                </div>
            </div>

            <div
                className={`keyboard-help-modal ${isHelpOpen ? 'show' : ''}`}
                id="keyboardHelpModal"
                role="dialog"
                aria-labelledby="keyboardHelpTitle"
                aria-hidden={isHelpOpen ? 'false' : 'true'}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        setIsHelpOpen(false);
                    }
                }}
            >
                <div className="keyboard-help-content">
                    <div className="keyboard-help-header">
                        <h2 id="keyboardHelpTitle">⌨️ Keyboard Shortcuts</h2>
                        <button
                            className="keyboard-help-close"
                            id="closeKeyboardHelp"
                            title="Close (Escape)"
                            aria-label="Close"
                            onClick={() => setIsHelpOpen(false)}
                        >
                            &times;
                        </button>
                    </div>
                    <div className="keyboard-help-body">
                        <div className="shortcut-section">
                            <h3>🧭 Navigation</h3>
                            <div className="shortcut-row">
                                <kbd>H</kbd>
                                <span>Go to Home page</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>Ctrl+1</kbd>
                                <span>Go to Theni 1</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>Ctrl+2</kbd>
                                <span>Go to Theni 2</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>Ctrl+3</kbd>
                                <span>Go to Theni 3 &amp; 4</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>Ctrl+5</kbd>
                                <span>Go to Theni 5</span>
                            </div>
                        </div>
                        <div className="shortcut-section">
                            <h3>📖 Slides</h3>
                            <div className="shortcut-row">
                                <kbd>←</kbd>
                                <span>Previous slide</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>→</kbd> <kbd>Space</kbd> <kbd>Enter</kbd>
                                <span>Next / Reveal</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>Home</kbd> / <kbd>[</kbd>
                                <span>First slide</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>End</kbd> / <kbd>]</kbd>
                                <span>Last slide</span>
                            </div>
                        </div>
                        <div className="shortcut-section">
                            <h3>🎛️ Actions &amp; Filters</h3>
                            <div className="shortcut-row">
                                <kbd>G</kbd>
                                <span>Generate Sentence (Theni 2)</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>S</kbd>
                                <span>Shuffle slides</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>R</kbd>
                                <span>Reset sequence</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>T</kbd>
                                <span>Toggle Timer</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>K</kbd>
                                <span>Toggle Color (Theni 5)</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>1</kbd> / <kbd>2</kbd> / <kbd>A</kbd>
                                <span>Filter D1 / D2 / All</span>
                            </div>
                        </div>
                        <div className="shortcut-section">
                            <h3>❓ Help &amp; UI</h3>
                            <div className="shortcut-row">
                                <kbd>?</kbd>
                                <span>Show this help</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>Esc</kbd>
                                <span>Close modal / panel</span>
                            </div>
                            <div className="shortcut-row">
                                <kbd>C</kbd>
                                <span>Toggle Control Panel</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
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
            `}</style>
        </Fragment>
    );
}
