# TamilTheni Product Requirements Document

**Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Active Development

---

## Table of Contents

1. [Product Overview](#product-overview)
2. [Business Requirements](#business-requirements)
3. [Functional Requirements](#functional-requirements)
4. [Technical Requirements](#technical-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Module-Specific Requirements](#module-specific-requirements)
7. [Data Requirements](#data-requirements)
8. [Workflow & Automation Requirements](#workflow--automation-requirements)
9. [Quality Assurance Requirements](#quality-assurance-requirements)
10. [Deployment Requirements](#deployment-requirements)

---

## Product Overview

### Purpose

TamilTheni is a Tamil language learning web application designed to help students prepare for the **FETNA Tamil Theni Competition** (https://tamiltheni.org/). The application provides interactive study modules covering vocabulary, sentence construction, translation, and word discovery skills.

### Target Audience

- Tamil school students (primarily in the USA)
- Competition participants for FETNA Tamil Theni 2026
- Tamil language learners

### Stakeholders

- Peoria Tamil School (Development Team)
- FETNA (Competition organizer)
- Students and Parents

---

## Business Requirements

### BR-001: Competition Alignment

The application must align with the official FETNA Tamil Theni competition format and word lists.

| Attribute | Value           |
| --------- | --------------- |
| Priority  | Critical        |
| Status    | [x] Implemented |

### BR-002: Free and Accessible

The application must be freely accessible to all Tamil school students without requiring registration or payment.

| Attribute      | Value                |
| -------------- | -------------------- |
| Priority       | Critical             |
| Status         | [x] Implemented      |
| Implementation | GitHub Pages hosting |

### BR-003: Five Competition Modules

The application must support all five categories of the Tamil Theni competition.

| Module      | Competition Format          | Description                                        |
| ----------- | --------------------------- | -------------------------------------------------- |
| Theni 1     | Picture → Tamil Word        | Identify the Tamil word for a displayed picture    |
| Theni 2     | Picture Pair → Sentence     | Form a Tamil sentence using two displayed pictures |
| Theni 3 & 4 | English → Tamil Translation | Translate English sentences to Tamil               |
| Theni 5     | Clue Words → Target Word    | Find the target word using clue words              |

| Attribute | Value           |
| --------- | --------------- |
| Priority  | Critical        |
| Status    | [x] Implemented |

### BR-004: Difficulty Levels

The application must support two difficulty levels matching the competition structure.

| Level | Description                                 |
| ----- | ------------------------------------------- |
| D1    | Easier words, suitable for younger students |
| D2    | Advanced words, for older students          |

| Attribute | Value           |
| --------- | --------------- |
| Priority  | High            |
| Status    | [x] Implemented |

### BR-005: Category Filtering

Users must be able to filter content by word categories (Body Parts, Food, Animals, etc.).

| Attribute | Value           |
| --------- | --------------- |
| Priority  | High            |
| Status    | [x] Implemented |

### BR-006: Progressive Web App (PWA)

The application should be installable on mobile devices and work offline.

| Attribute | Value           |
| --------- | --------------- |
| Priority  | Medium          |
| Status    | [x] Implemented |

---

## Functional Requirements

### FR-001: Navigation System

- [ ] [x] First/Previous/Next/Last navigation buttons
- [ ] [x] Keyboard navigation (Arrow keys, Home, End)
- [ ] [x] Progress counter showing current position
- [ ] [x] Progress bar visualization

### FR-002: Timer Functionality

- [ ] [x] Configurable countdown timer per module
- [ ] [x] Visual timer display (circular pie-chart style)
- [ ] [x] Timer toggle checkbox in settings
- [ ] [x] Auto-advance option when timer expires
- [ ] [x] Alarm sound on timer completion

| Module      | Default Timer Duration |
| ----------- | ---------------------- |
| Theni 1     | 10 seconds             |
| Theni 2     | 20 seconds             |
| Theni 3 & 4 | 15 seconds             |
| Theni 5     | 60 seconds             |

### FR-003: Audio/Text-to-Speech

- [ ] [x] Text-to-Speech for English words (Theni 1)
- [ ] [x] Audio toggle checkbox to enable/disable
- [ ] [x] Consecutive audio playback on slide changes
- [ ] [x] Browser autoplay policy compliance (require user gesture)

### FR-004: Shuffle and Reset

- [ ] [x] Shuffle button to randomize slide order
- [ ] [x] Reset button to restore original sequence

### FR-005: Control Panel

- [ ] [x] Collapsible settings panel
- [ ] [x] Category selection dropdown
- [ ] [x] Difficulty filter buttons (All/D1/D2)
- [ ] [x] Timer and audio toggles

### FR-006: Reveal Mechanism (Theni 3 & 4)

- [ ] [x] Hidden answer that reveals on click/tap
- [ ] [x] Click-to-flip card interaction

---

## Technical Requirements

### TR-001: Build System

- [ ] [x] Vite as the build tool
- [ ] [x] TypeScript for all application logic
- [ ] [x] Hot Module Replacement (HMR) in development
- [ ] [x] Minified production builds

### TR-002: TypeScript Architecture

- [ ] [x] Strong typing for all data interfaces
- [ ] [x] Shared utility modules (`utils.ts`, `timer.ts`, `audio_manager.ts`)
- [ ] [x] Layout module for consistent UI injection (`layout.ts`)
- [ ] [x] Centralized configuration (`config.ts`)

### TR-003: CSS Architecture

- [ ] [x] Design tokens in `tokens.css`
- [ ] [x] Shared styles in `style.css`
- [ ] [x] Module-specific CSS files
- [ ] [x] Responsive design for mobile/tablet

### TR-004: Data Format

- [ ] [x] JSON data files in `src/data/`
- [ ] [x] Single source of truth for word lists
- [ ] [x] Merged data for Theni 1 & 2 (`theni_words.json`)
- [ ] [x] Separate data for Theni 5 (`theni5_words.json`)

### TR-005: Image Handling

- [ ] [x] Local images in `public/assets/images/theni12/`
- [ ] [x] Filename convention: `{word_en}.jpg`
- [ ] [x] Fallback to placeholder on image load failure
- [ ] [x] Image caching to avoid re-fetching

### TR-006: Browser Compatibility

- [ ] [x] Modern browsers (Chrome, Firefox, Safari, Edge)
- [ ] [x] Mobile browsers (iOS Safari, Chrome Mobile)
- [ ] [x] Web Speech API support for TTS

### TR-007: Code Quality

- [ ] [x] ESLint for linting
- [ ] [x] Prettier for formatting
- [ ] [x] Type checking via `tsc`

### TR-008: Cache Management

- [ ] [x] Vite handles cache invalidation via content hashing
- [ ] [x] Service worker for offline caching (PWA)
- [ ] ~~Bump version script~~ (Deprecated after Vite migration)

---

## Non-Functional Requirements

### NFR-001: Performance

| Metric            | Target               |
| ----------------- | -------------------- |
| Initial page load | < 3 seconds          |
| Slide navigation  | < 100ms              |
| Image load time   | < 1 second per image |
| Build time        | < 30 seconds         |

### NFR-002: Accessibility

- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] High contrast text for readability
- [ ] Touch-friendly button sizes

### NFR-003: Reliability

- [ ] Graceful degradation on network failures
- [ ] Error handling for missing images
- [ ] Console error logging for debugging

### NFR-004: Maintainability

- [ ] [x] Modular code structure
- [ ] [x] Separated concerns (HTML/CSS/TS/Data)
- [ ] [x] Documented architecture (ARCHITECTURE.md)
- [ ] [x] Clear file naming conventions

### NFR-005: Scalability

- [ ] Support for 800+ words
- [ ] Ability to add new categories
- [ ] Extensible module structure

---

## Module-Specific Requirements

### Theni 1: Picture to Tamil Word

#### T1-001: Display Requirements

- [ ] [x] Single word card per slide
- [ ] [x] Image prominently displayed
- [ ] [x] English word shown
- [ ] [x] Tamil word (revealed on demand)
- [ ] [x] Category and difficulty badges

#### T1-002: Audio Requirements

- [ ] [x] Auto-pronounce English word on slide change
- [ ] [x] Audio toggle in settings
- [ ] [x] Console audio playback on consecutive slides

#### T1-003: Image Requirements

- [ ] [x] High-quality, relevant images
- [ ] [x] Localized images where possible
- [ ] [x] Fallback placeholder for missing images

---

### Theni 2: Sentence Building with Pictures

#### T2-001: Display Requirements

- [ ] [x] Dual-card layout (two words side-by-side)
- [ ] [x] Random pairing of words
- [ ] [x] Persistent partner pairing per session
- [ ] [x] Both English and Tamil words

#### T2-002: AI Sentence Generation

- [ ] [x] Gemini AI integration for sentence generation
- [ ] [x] API key input in settings panel
- [ ] [x] Generated sentence caching
- [ ] [x] Tamil sentence with English translation

#### T2-003: Virtual Slides

- [ ] [x] Virtual DOM elements for filtering (no physical DOM appending)
- [ ] [x] Proper HTML template formatting (querySelector compatibility)

---

### Theni 3 & 4: Translation Practice

#### T34-001: Display Requirements

- [ ] [x] English sentence prominently displayed
- [ ] [x] Tamil translation hidden initially
- [ ] [x] Click-to-reveal interaction
- [ ] [x] Target word highlighted in both languages

#### T34-002: Sentence Quality

- [ ] Context-appropriate sentences
- [ ] Grade-appropriate complexity
- [ ] Accurate translations

---

### Theni 5: Word Discovery

#### T5-001: Display Requirements

- [ ] [x] Clue words displayed prominently
- [ ] [x] Answer hidden initially
- [ ] [x] Click-to-reveal mechanism
- [ ] [x] Word meaning shown after reveal

#### T5-002: Timer Requirements

- [ ] [x] 60-second default timer
- [ ] [x] Circular timer visualization
- [ ] [x] Auto-start option when timer is enabled

---

## Data Requirements

### DR-001: Word Data Schema

```json
{
    "id": "number (unique)",
    "category": "string (English)",
    "category_ta": "string (Tamil)",
    "difficulty": "D1 | D2",
    "word_en": "string",
    "word_ta": "string",
    "image_word": "string (filename base)",
    "sentence_en": "string (HTML with <b> tags)",
    "sentence_ta": "string (HTML with <b> tags)",
    "complexity": "number (1-3)"
}
```

### DR-002: Data Volume

| Dataset           | Count |
| ----------------- | ----- |
| Theni 1 & 2 words | ~800  |
| Theni 5 clues     | ~50   |
| Categories        | 20+   |
| Images            | ~800  |

### DR-003: Image Requirements

| Attribute  | Requirement                     |
| ---------- | ------------------------------- |
| Format     | JPEG                            |
| Resolution | 300x180 minimum                 |
| Quality    | Clear, relevant to word         |
| Naming     | Lowercase, underscore-separated |

---

## Workflow & Automation Requirements

### WA-001: Image Verification Pipeline

- [ ] Script to verify all words have corresponding images
- [ ] Automated fallback image generation
- [ ] Image quality validation

### WA-002: Data Processing Pipeline

- [ ] PDF to JSON conversion for FETNA word lists
- [ ] Data augmentation scripts (sentences, translations)
- [ ] Validation scripts for data integrity

### WA-003: Development Workflow

- [ ] [x] `npm run dev` - Development server with HMR
- [ ] [x] `npm run build` - Production build
- [ ] [x] `npm run preview` - Preview production build
- [ ] [x] `npm run lint` - Code linting
- [ ] [x] `npm run format` - Code formatting
- [ ] [x] `npm test` - Run unit/integration tests

---

## Quality Assurance Requirements

### QA-001: Unit Testing

- [ ] [x] Vitest for unit tests
- [ ] [x] Test coverage for utility functions
- [ ] [x] Test coverage for timer module

### QA-002: Build Acceptance Tests (BAT)

- [ ] [x] BAT tests for each module initialization
- [ ] [x] Filter functionality tests
- [ ] [x] Navigation tests
- [ ] [x] Card reveal logic tests

### QA-003: Manual Testing Checklist

- [ ] Verify all modules load correctly
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify audio functionality
- [ ] Check image loading

---

## Deployment Requirements

### DP-001: Hosting

- [ ] [x] GitHub Pages deployment
- [ ] [x] Custom domain support (tamiltheni.org)
- [ ] [x] HTTPS enabled

### DP-002: Build Artifacts

- [ ] [x] Output to `docs/` folder
- [ ] [x] Minified JavaScript bundles
- [ ] [x] Optimized CSS
- [ ] [x] Copied static assets

### DP-003: Branching Strategy

| Branch    | Purpose                                         |
| --------- | ----------------------------------------------- |
| `publish` | Production-ready code, deployed to GitHub Pages |
| `main`    | Development branch                              |

---

## Issue Tracking (Resolved)

| Issue                  | Description                        | Status                                    |
| ---------------------- | ---------------------------------- | ----------------------------------------- |
| Theni 2 Display        | Words and images not showing       | [x] Fixed (malformed HTML template)       |
| Consecutive Audio      | Audio not playing on slide changes | [x] Fixed                                 |
| Browser Hung Processes | Test processes hanging             | [x] Fixed (process cleanup)               |
| Vite Cache             | Cache invalidation after migration | [x] Resolved (Vite handles automatically) |

---

## Change Log

| Date     | Version | Changes                               |
| -------- | ------- | ------------------------------------- |
| Jan 2026 | 1.0     | Initial requirements document created |

---

_This document is maintained alongside the codebase and should be updated as requirements evolve._
