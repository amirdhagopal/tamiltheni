# TamilTheni (தமிழ்த்தேனி)

A Tamil language learning web application for the FETNA Tamil Theni competition (https://tamiltheni.org/) developed by the Peoria Tamil School.

## 🌐 Live Site

Visit the application at: https://amirdhagopal.github.io/tamiltheni/

## 📚 Features

The app includes study modules for five competition categories:

| Module          | Description                                 |
| --------------- | ------------------------------------------- |
| **Theni 1**     | Tell the Tamil word for the picture shown   |
| **Theni 2**     | Form a sentence using pictures (AI Powered) |
| **Theni 3 & 4** | Translate English sentences to Tamil        |
| **Theni 5**     | Find word using clue words                  |

## ⌨️ Keyboard Shortcuts

The application supports global keyboard shortcuts for improved accessibility and navigation:

| Key               | Action                         |
| ----------------- | ------------------------------ |
| **?**             | Show Keyboard Help Modal       |
| **C**             | Toggle Control Panel           |
| **Esc**           | Close Modal / Control Panel    |
| **H**             | Go to Home Page                |
| **1 - 5**         | Go to Theni 1-5 (Home Page)    |
| **Ctrl + 1-5**    | Go to Theni 1-5 (Module Pages) |
| **← / →**         | Previous / Next Slide          |
| **Space / Enter** | Next Slide / Reveal            |
| **Home / [**      | First Slide                    |
| **End / ]**       | Last Slide                     |
| **G**             | Generate Sentence (Theni 2)    |
| **S**             | Shuffle Slides                 |
| **R**             | Reset Sequence                 |
| **A / 1 / 2**     | Filter All / D1 / D2           |

## 🚀 Running Locally

1. Install dependencies:

    ```bash
    npm install
    ```

2. Start a local development server:

    ```bash
    npm run dev
    ```

3. Open the provided localhost URL (usually http://localhost:5173/) in your browser.

## 📖 Documentation

| Document                                         | Description                                            |
| ------------------------------------------------ | ------------------------------------------------------ |
| [ARCHITECTURE.md](documentation/ARCHITECTURE.md) | System architecture, diagrams, and technical decisions |
| [REQUIREMENTS.md](documentation/REQUIREMENTS.md) | Business and technical requirements                    |

## 📁 Project Structure

```
tamiltheni/
├── public/                  # Static assets (images, fonts, manifest)
│   ├── assets/
│   │   ├── images/
│   │   └── icons/
│   └── manifest.json
├── src/                     # Source code (TypeScript/CSS)
│   ├── css/                 # Stylesheets
│   ├── js/                  # TypeScript Logic
│   ├── data/                # JSON Data Files
│   ├── types/               # Type definitions
│   └── vite-env.d.ts        # Vite env definitions
├── html/                    # Game Module Pages
│   ├── theni1.html
│   ├── theni2.html
│   ├── theni34.html
│   └── theni5.html
├── test/                    # Test files
│   ├── bat/                 # Build Acceptance Tests
│   └── unit/                # Unit tests
├── documentation/           # Project documentation
│   ├── ARCHITECTURE.md
│   └── REQUIREMENTS.md
├── index.html               # Home page
├── vite.config.ts           # Vite Build configuration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies and scripts
```

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Modern web browser

### NPM Scripts

| Script            | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `npm run dev`     | Start local Vite development server                        |
| `npm run build`   | Type-check (tsc) and build production artifacts to `docs/` |
| `npm run preview` | Preview production build locally                           |
| `npm run lint`    | Run ESLint on TypeScript files                             |
| `npm run format`  | Format code with Prettier                                  |
| `npm test`        | Run unit and BAT tests with Vitest                         |

### Scripts (Python)

The `scripts/` folder contains Python utility scripts for data processing and image management. The build pipeline converts raw data into the JSON files found in `src/data/`.

```
scripts/
├── images/          # Image management (downloading, fixing)
├── data/            # Data processing (augmentation, validation)
└── agents/          # Conversion tools
```

## 📄 License

This project is licensed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.

You are free to:

- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially.

Under the following terms:

- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.

[![CC BY 4.0][cc-by-image]][cc-by]

[cc-by]: http://creativecommons.org/licenses/by/4.0/
[cc-by-image]: https://i.creativecommons.org/l/by/4.0/88x31.png

© 2026 Peoria Tamil School.
