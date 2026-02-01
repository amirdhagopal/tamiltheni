import { Fragment } from 'preact';
import { createPortal } from 'preact/compat';

interface ControlsProps {
    categories: string[];
    selectedCategories: string[];
    onToggleCategory: (cat: string) => void;
    onToggleAllCategories: () => void;

    difficulty?: 'all' | 'D1' | 'D2';
    setDifficulty?: (d: 'all' | 'D1' | 'D2') => void;

    // Theni 3/4 Level Control
    level?: number;
    setLevel?: (l: number) => void;

    // Theni 5 Range Control
    rangeStart?: number;
    rangeEnd?: number;
    onApplyRange?: (start: number, end: number) => void;

    shuffle?: boolean;
    setShuffle?: (s: boolean | ((p: boolean) => boolean)) => void;
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
    if (!portalTarget) return null;

    return createPortal(
        <Fragment>
            {/* Range Selection (Theni 5) */}
            {(rangeStart !== undefined && rangeEnd !== undefined && onApplyRange) && (
                <div className="control-row">
                    <span className="control-label">Range:</span>
                    <input type="number" id="startRange" defaultValue={rangeStart} min="1" max="250" title="Starting word number" style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    <span style={{ margin: '0 10px' }}>to</span>
                    <input type="number" id="endRange" defaultValue={rangeEnd} min="1" max="250" title="Ending word number" style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }} />
                    <button className="action-button" onClick={() => {
                        const s = parseInt((document.getElementById('startRange') as HTMLInputElement).value);
                        const e = parseInt((document.getElementById('endRange') as HTMLInputElement).value);
                        onApplyRange(s, e);
                    }} style={{ marginLeft: '10px' }}>Apply</button>
                </div>
            )}

            {/* Level Selection (Theni 3/4) */}
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
                        <button className="dropdown-button" id="cat-dropdown-btn"
                            onClick={(e) => { e.stopPropagation(); document.getElementById('categoryMenu')?.classList.toggle('show'); }}
                            title="Select word categories to display">
                            <span id="selectedCatText">
                                {selectedCategories.length === categories.length ? 'All Categories' :
                                    selectedCategories.length === 0 ? 'None selected' :
                                        `${selectedCategories.length} selected`}
                            </span>
                            <span>▼</span>
                        </button>
                        <div className="dropdown-menu" id="categoryMenu" onClick={(e) => e.stopPropagation()}>
                            <div className="dropdown-item header" id="select-all-cat-row" onClick={onToggleAllCategories}>
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
                        </div>
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
                <span className="control-label">Sequence:</span>
                <div className="pill-group">
                    {setShuffle && (
                        <button className={`action-button ${shuffle ? 'active' : ''}`} onClick={() => setShuffle && setShuffle(!shuffle as any)}>
                            <span aria-hidden="true">🔀</span> Shuffle
                        </button>
                    )}
                    <button className="action-button" onClick={reset}>
                        <span aria-hidden="true">↩️</span> Reset
                    </button>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em' }}>
                        <input type="checkbox" checked={showTimer} onChange={(e) => setShowTimer(e.currentTarget.checked)} /> ⏱️ {timerLabel}
                    </label>
                    {audioEnabled !== undefined && setAudioEnabled && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85em' }}>
                            <input type="checkbox" checked={audioEnabled} onChange={(e) => setAudioEnabled(e.currentTarget.checked)} /> 🔊 Audio
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
