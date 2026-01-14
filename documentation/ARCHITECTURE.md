# TamilTheni Architecture Document

**Version:** 2.0  
**Last Updated:** January 2026  
**Author:** Peoria Tamil School Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Diagram](#architecture-diagram)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Architecture](#data-architecture)
6. [Python Tooling Pipeline](#python-tooling-pipeline)
7. [Deployment Architecture](#deployment-architecture)
8. [Module Deep Dives](#module-deep-dives)
9. [Design System](#design-system)
10. [Development Workflow](#development-workflow)
11. [Security Considerations](#security-considerations)
12. [Future Considerations](#future-considerations)

---

## Executive Summary

TamilTheni is a Tamil language learning web application designed for the FETNA Tamil Theni Competition. The application is a static single-page application (SPA) hosted on GitHub Pages, featuring five distinct learning modules targeting different Tamil language skills including vocabulary, sentence construction, translation, and word discovery.

### Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **Vite** | Modern, fast build tool with instant HMR and optimized production builds |
| **TypeScript** | Static typing for better maintainability and error catching |
| **JSON Data** | Structured, interoperable data format separated from logic |
| **CSS Modules** | Component-scoped styling (via standard CSS imports) |
| **Python Tooling** | Offline data processing pipeline for content generation |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TamilTheni System                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────┐ │
│  │   Content Pipeline  │───▶│    Vite Build       │───▶│   GitHub Pages   │ │
│  │   (Python Scripts)  │    │   (TS -> JS Bundle) │    │   (Deployment)   │ │
│  └─────────────────────┘    └─────────────────────┘    └──────────────────┘ │
│           │                          │                                       │
│           ▼                          ▼                                       │
│  ┌─────────────────────┐    ┌─────────────────────┐                         │
│  │   JSON Data Files   │    │   External APIs     │                         │
│  │   (src/data/*.json) │    │   (Wikipedia, AI)   │                         │
│  └─────────────────────┘    └─────────────────────┘                         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture Diagram

```mermaid
graph TB
    subgraph "User Interface Layer"
        INDEX[index.html<br/>Portal Home]
        T1[theni1.html<br/>Word Identification]
        T2[theni2.html<br/>Sentence Building]
        T34[theni34.html<br/>Translation]
        T5[theni5.html<br/>Word Discovery]
    end

    subgraph "TypeScript Logic Layer"
        CONFIG[config.ts<br/>App Configuration]
        UTILS[utils.ts<br/>Shared Utilities]
        LAYOUT[layout.ts<br/>UI Components]
        TIMER[timer.ts<br/>Timer Engine]
        AUDIO[audio_manager.ts<br/>TTS Handler]
        
        T1JS[theni1.ts]
        T2JS[theni2.ts]
        T34JS[theni34.ts]
        T5JS[theni5.ts]
    end

    subgraph "Data Layer"
        WORDS[theni_words.json<br/>800 Words]
        T5WORDS[theni5_words.json<br/>50 Clues]
    end

    subgraph "CSS Design System"
        TOKENS[tokens.css<br/>Design Tokens]
        STYLE[style.css<br/>Shared Styles]
        T1CSS[theni1.css]
        T2CSS[theni2.css]
        T34CSS[theni34.css]
        T5CSS[theni5.css]
    end

    subgraph "External Services"
        WIKI[Wikipedia API<br/>Images]
        GEMINI[Gemini AI<br/>Sentence Generation]
        TTS[Web Speech API<br/>Text-to-Speech]
    end

    INDEX --> T1 & T2 & T34 & T5
    
    T1 --> T1JS --> CONFIG & UTILS & LAYOUT & TIMER & AUDIO
    T2 --> T2JS --> CONFIG & UTILS & LAYOUT & TIMER
    T34 --> T34JS --> CONFIG & UTILS & LAYOUT & TIMER
    T5 --> T5JS --> CONFIG & UTILS & LAYOUT & TIMER

    T1JS & T2JS & T34JS --> WORDS
    T5JS --> T5WORDS
    
    T1JS & T2JS --> WIKI
    T2JS --> GEMINI
    T1JS --> TTS
    
    T1 & T2 & T34 & T5 --> TOKENS & STYLE
    T1 --> T1CSS
    T2 --> T2CSS
    T34 --> T34CSS
    T5 --> T5CSS
```

---

## Frontend Architecture

### Directory Structure

```
tamiltheni/
├── public/                  # Static assets (images, fonts) served efficiently
├── src/                     # Source code
│   ├── css/                 # Stylesheets modularized by page
│   ├── js/                  # TypeScript logic files
│   ├── data/                # JSON data files (Single Source of Truth)
│   └── types/               # TypeScript interface definitions
├── html/                    # HTML entry points for each module
├── test/                    # Test files
│   ├── bat/                 # Build Acceptance Tests
│   └── unit/                # Unit tests
├── documentation/           # Project documentation
│   ├── ARCHITECTURE.md      # This file
│   └── REQUIREMENTS.md      # Product requirements
├── index.html               # Main entry point
├── docs/                    # Production build output (GitHub Pages root)
```

### TypeScript Strategy

We use TypeScript to enforce data contracts and reduce runtime errors. Key interfaces include:

```typescript
// Word Data Structure
interface Word {
    id: number;
    category: string;
    word_en: string;
    word_ta: string;
    difficulty: "D1" | "D2";
    // ...other fields
}
```

The build process (`tsc && vite build`) transpiles this to optimized JavaScript bundles.

### Shared Modules

| Module | Purpose | Key Exports |
|--------|---------|-------------|
| `config.ts` | Centralized configuration | `config` object |
| `utils.ts` | Utility functions | `Utils` class |
| `layout.ts` | UI component injection | `Layout` class |
| `timer.ts` | Countdown timer engine | `Timer` class |
| `audio_manager.ts` | Text-to-Speech wrapper | `AudioManager` class |

---

## Data Architecture

### JSON Data Files (`src/data/`)

Data is stored in standard JSON format, allowing easy manipulation by Python scripts and straightforward import by TypeScript.

- `theni_words.json`: Contains the main dataset of ~800 words.
- `theni5_words.json`: Contains the clue-based dataset for Theni 5.

### Word Data Schema (`theni_words.json`)

```json
[
  {
    "id": 1,
    "category": "Body Parts",
    "category_ta": "உடல் பகுதிகள்",
    "difficulty": "D1",
    "word_en": "ear",
    "word_ta": "காது",
    "image_word": "ear",
    "sentence_en": "I have an <b>ear</b> infection.",
    "sentence_ta": "எனக்கு காதில் தொற்று உள்ளது.",
    "complexity": 2
  }
]
```

### Image Storage Strategy

- **Location:** `public/assets/images/theni12/`
- **Naming:** `{word_en}.jpg` (e.g., `ear.jpg`)
- **Fallback:** Wikipedia API fetch if local image missing

---

## Python Tooling Pipeline

### Pipeline Overview

```mermaid
flowchart LR
    PDF[PDF Word Lists<br/>FETNA Source] --> PARSER[pdf_parser/<br/>extractor.py]
    PARSER --> CSV[Intermediate CSV]
    CSV --> BUILDER[slide_builder/<br/>generator.py]
    BUILDER --> HTML[Output HTML]
    
    CSV --> AUGMENT[scripts/data/<br/>augment_words.py]
    AUGMENT --> JSON[src/data/theni_words.json]
    
    JSON --> IMAGES[scripts/images/<br/>download_theni12_images.py]
    IMAGES --> JPEG[Image Assets]
```

---

## Deployment Architecture

### GitHub Pages Configuration

```yaml
# Deployment: docs/ folder on publish branch
Source: docs/
Branch: publish (primary)
```

### Build Process

1. **Development**: `npm run dev` serves files from memory with hot replacement.
2. **Production**: `npm run build` runs `tsc` (type check) then `vite build`.
3. **Artifacts**: Minified JS/CSS and assets are output to `docs/`.

---

## Module Deep Dives

### Timer Module (`timer.ts`)
Configurable countdown timer with visual pie-chart representation and audio feedback.

### Layout Module (`layout.ts`)
Injects common UI elements (headers, navigation, sidebars) into each HTML page at runtime, ensuring consistency.

---

## Security Considerations

### API Key Management
The Theni 2 module uses the Gemini AI API. Keys are stored in `localStorage` by the user.

> [!WARNING]
> Client-side API key storage is inherently insecure.

---

## Future Considerations

1. **PWA Enhancements**: Improve offline capabilities.
2. **Backend**: Optional backend for user progress tracking.
3. **Testing**: Add unit tests (Vitest) and E2E tests (Playwright).

---

*This document is maintained alongside the codebase.*
