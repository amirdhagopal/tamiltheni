import { Fragment } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useState, useRef } from 'preact/hooks';

interface ControlsProps {
    categories: string[];
    selectedCategories: string[];
    onToggleCategory: (cat: string) => void;
    onToggleAllCategories: () => void;

    difficulty?: 'all' | 'D1' | 'D2' | 'D3';
    setDifficulty?: (d: 'all' | 'D1' | 'D2' | 'D3') => void;

    // Theni 3/4 Level Control
    level?: number;
    setLevel?: (l: number) => void;

    // Theni 5 Range Control
    rangeStart?: number;
    rangeEnd?: number;
    onApplyRange?: (start: number, end: number) => void;

    shuffle?: boolean;
    setShuffle?: (s: boolean) => void;
    reset: () => void;

    audioEnabled?: boolean;
    setAudioEnabled?: (enabled: boolean) => void;

    // Timer
    showTimer: boolean;
    setShowTimer: (show: boolean) => void;
    timerLabel?: string;

    // Extra
    voiceEnabled?: boolean;
    setVoiceEnabled?: (enabled: boolean) => void;

    progressText: string;

    // AI / Extra
    apiKey?: string;
    setApiKey?: (key: string) => void;
}

export const Controls = ({
    // ... props
    categories,
    selectedCategories,
    onToggleCategory,
    onToggleAllCategories,
    difficulty,
    setDifficulty,
    level,
    setLevel,
    rangeStart,
    rangeEnd,
    onApplyRange,
    shuffle,
    setShuffle,
    reset,
    audioEnabled,
    setAudioEnabled,
    showTimer,
    setShowTimer,
    timerLabel = 'Timer',
    voiceEnabled,
    setVoiceEnabled,
    progressText,
    apiKey,
    setApiKey
}: ControlsProps) => {
    const portalTarget = document.getElementById('controlSettings') || document.getElementById('controlContent');

    // Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Close dropdown on global click or panel collapse
    useEffect(() => {
        const handleDocumentClick = (e: MouseEvent) => {
            // If click is NOT inside dropdown menu (which is now in body) AND NOT on button
            const dropdown = document.getElementById('categoryMenu');
            const btn = buttonRef.current;

            if (isDropdownOpen && dropdown && btn) {
                const target = e.target as Node;
                if (!dropdown.contains(target) && !btn.contains(target)) {
                    setIsDropdownOpen(false);
                }
            }
        };

        const handlePanelCollapsed = () => setIsDropdownOpen(false);

        const handleScroll = (e: Event) => {
            const dropdown = document.getElementById('categoryMenu');
            // If scrolling happens inside the dropdown, do NOT close it
            if (dropdown && dropdown.contains(e.target as Node)) {
                return;
            }
            // If scrolling happens elsewhere (e.g. main page), close it to prevent detachment
            if (isDropdownOpen) setIsDropdownOpen(false);
        };

        document.addEventListener('click', handleDocumentClick);
        document.addEventListener('panelCollapsed', handlePanelCollapsed);
        document.addEventListener('scroll', handleScroll, true); // Capture scroll

        return () => {
            document.removeEventListener('click', handleDocumentClick);
            document.removeEventListener('panelCollapsed', handlePanelCollapsed);
            document.removeEventListener('scroll', handleScroll, true);
        };
    }, [isDropdownOpen]);

    const toggleDropdown = (e: MouseEvent) => {
        e.stopPropagation();
        if (!isDropdownOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 5,
                left: rect.left,
                width: rect.width
            });
        }
        setIsDropdownOpen(!isDropdownOpen);
    };

    if (!portalTarget) return null;

    const closeDropdown = () => setIsDropdownOpen(false);

    return createPortal(
        <Fragment>
            {/* ... Range & Level ... */}
            {(rangeStart !== undefined && rangeEnd !== undefined && onApplyRange) && (
                <div className="control-row">
                    {/* ... copied Range ... */}
                    <span className="control-label">Range:</span>
                    <input type="number" id="startRange" value={rangeStart} min="1" max="250" title="Starting word number"
                        onChange={(e) => {
                            const val = parseInt(e.currentTarget.value);
                            if (!isNaN(val)) onApplyRange(val, rangeEnd!);
                        }}
                        style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    <span style={{ margin: '0 10px' }}>to</span>
                    <input type="number" id="endRange" value={rangeEnd} min="1" max="250" title="Ending word number"
                        onChange={(e) => {
                            const val = parseInt(e.currentTarget.value);
                            if (!isNaN(val)) onApplyRange(rangeStart!, val);
                        }}
                        style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    <button className="action-button" onClick={() => {
                        // closeDropdown via logic if needed, or keeping explicit logic? 
                        // The original code passed closeDropdown() which closed via DOM ID.
                        // We should update reset() calls to also setIsDropdownOpen(false)?
                        // Actually the only consumers of closeDropdown() were reset/shuffle buttons.

                        const s = parseInt((document.getElementById('startRange') as HTMLInputElement).value);
                        const e = parseInt((document.getElementById('endRange') as HTMLInputElement).value);
                        onApplyRange(s, e);
                    }} style={{ marginLeft: '10px' }}>Apply</button>
                </div>
            )}

            {level !== undefined && setLevel && (
                <div className="control-row">
                    <span className="control-label">Level:</span>
                    <div className="pill-group">
                        <button className={`pill-button ${level === 3 ? 'active' : ''}`} onClick={() => setLevel(3)}>Theni 3</button>
                        <button className={`pill-button ${level === 4 ? 'active' : ''}`} onClick={() => setLevel(4)}>Theni 4</button>
                    </div>
                </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
                <div className="control-row">
                    <span className="control-label">Categories:</span>
                    <div className="category-dropdown">
                        <button
                            className="dropdown-button"
                            id="cat-dropdown-btn"
                            ref={buttonRef}
                            onClick={toggleDropdown}
                            title="Select word categories to display">
                            <span id="selectedCatText">
                                {selectedCategories.length === categories.length ? 'All Categories' :
                                    selectedCategories.length === 0 ? 'None selected' :
                                        `${selectedCategories.length} selected`}
                            </span>
                            <span>▼</span>
                        </button>

                        {/* Render Dropdown via Portal to Body */}
                        {isDropdownOpen && createPortal(
                            <div
                                className="dropdown-menu show"
                                id="categoryMenu"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    display: 'block',
                                    position: 'fixed',
                                    top: dropdownPos.top,
                                    left: dropdownPos.left,
                                    width: dropdownPos.width,
                                    maxHeight: '60vh', // Prevent running off screen
                                    zIndex: 9999, // Ensure on top of everything
                                }}
                            >
                                <div className="dropdown-item header" id="select-all-cat-row" onClick={() => { onToggleAllCategories(); }}>
                                    <input type="checkbox" id="selectAllCats" checked={selectedCategories.length === categories.length} readOnly />
                                    <span>Select All / None</span>
                                </div>
                                <div id="categoryList">
                                    {categories.map((cat: string) => {
                                        const isSelected = selectedCategories.includes(cat);
                                        return (
                                            <div className="dropdown-item" key={cat} onClick={() => onToggleCategory(cat)}>
                                                <input type="checkbox" checked={isSelected} readOnly />
                                                <span>{cat}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                </div>
            )}

            {/* Difficulty */}
            {difficulty && setDifficulty && (
                <div className="control-row">
                    <span className="control-label">Difficulty:</span>
                    <div className="pill-group">
                        <button className={`pill-button ${difficulty === 'all' ? 'active' : ''}`} onClick={() => setDifficulty('all')}>All</button>
                        <button className={`pill-button ${difficulty === 'D1' ? 'active' : ''}`} onClick={() => setDifficulty('D1')}>D1 Only</button>
                        <button className={`pill-button ${difficulty === 'D2' ? 'active' : ''}`} onClick={() => setDifficulty('D2')}>D2 Only</button>
                    </div>
                </div>
            )}

            {/* Sequence & Toggles */}
            <div className="control-row">
                <span className="control-label">Actions:</span>
                <div className="pill-group">
                    {setShuffle && (
                        <button className={`action-button ${shuffle ? 'active' : ''}`} onClick={() => { closeDropdown(); setShuffle && setShuffle(!shuffle); }}>
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ marginRight: '4px' }}><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                            Shuffle
                        </button>
                    )}
                    <button className="action-button" id="btn-reset-seq" onClick={() => { closeDropdown(); reset(); }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style={{ marginRight: '4px' }}><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                        Reset
                    </button>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em' }}>
                        <input type="checkbox" id="showTimer" checked={showTimer} onChange={(e) => setShowTimer(e.currentTarget.checked)} /> {timerLabel}
                    </label>
                    {audioEnabled !== undefined && setAudioEnabled && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em' }}>
                            <input type="checkbox" id="audioToggle" checked={audioEnabled} onChange={(e) => setAudioEnabled(e.currentTarget.checked)} /> 🔊 Audio
                        </label>
                    )}
                    {voiceEnabled !== undefined && setVoiceEnabled && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em' }}>
                            <input type="checkbox" checked={voiceEnabled} onChange={(e) => setVoiceEnabled(e.currentTarget.checked)} /> 🎤 Voice
                        </label>
                    )}
                </div>
            </div>

            {/* Progress & API */}
            <div className="control-row">
                <span className="control-label">Progress:</span>
                <span className="progress-info">{progressText}</span>
                {apiKey !== undefined && setApiKey && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.85em', display: 'flex', alignItems: 'center', gap: '6px' }}>🔑 Gemini AI API:</label>
                        <input type="password" placeholder="Enter API Key" value={apiKey} onChange={(e) => setApiKey(e.currentTarget.value)}
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.85em', width: '140px' }} />
                    </div>
                )}
            </div>
        </Fragment>,
        portalTarget
    );
};
