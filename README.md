# TamilTheni (தமிழ்த்தேனி)

A Tamil language learning web application for the FETNA Tamil Theni competition (https://tamiltheni.org/) developed by the Peoria Tamil School.

## 🌐 Live Site

Visit the application at: https://amirdhagopal.github.io/tamiltheni/

## 📚 Features

The app includes study modules for five competition categories:

| Module | Description |
|--------|-------------|
| **Theni 1** | Tell the Tamil word for the picture shown |
| **Theni 2** | Form a sentence using pictures |
| **Theni 3 & 4** | Translate English sentences to Tamil |
| **Theni 5** | Find word using clue words |

## 🚀 Running Locally

1. Navigate to the `docs` directory:
   ```bash
   cd docs
   ```

2. Start a local HTTP server:
   ```bash
   python3 -m http.server 8888
   ```

3. Open http://localhost:8888 in your browser

## 📁 Project Structure

```
tamiltheni/
├── docs/                    # Web application (GitHub Pages root)
│   ├── index.html           # Home page
│   ├── theni1.html          # Theni 1 module
│   ├── theni2.html          # Theni 2 module
│   ├── theni34.html         # Theni 3 & 4 module
│   ├── theni5.html          # Theni 5 module
│   └── assets/
│       ├── css/             # Stylesheets
│       ├── js/              # JavaScript modules
│       ├── data/            # Word data (theni_words.js, theni5_words.js)
│       └── images/          # Image assets
├── scripts/                 # Python utility scripts
│   ├── images/              # Image management scripts
│   ├── data/                # Data processing scripts
│   └── agents/              # Conversion tool scripts
├── pdf_parser/              # PDF extraction utilities
├── slide_builder/           # Slide generation utilities
├── resources/               # Input resources and artifacts
└── bump-version.sh          # Version bump script
```

## 🛠️ Development

### Prerequisites

- Python 3.x (for local server and scripts)
- Node.js 20+ (for linting and formatting)
- Modern web browser

### Setup

```bash
npm install
```

### NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local development server on port 8888 |
| `npm run lint` | Run ESLint on JavaScript files |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

### Scripts

The `scripts/` folder contains utility scripts organized by category:

```
scripts/
├── images/          # Image management
│   ├── download_theni12_images.py
│   ├── fix_bad_images.py
│   ├── check_missing_images.py
│   └── replace_theni12_image.py
├── data/            # Data processing
│   ├── augment_words.py
│   └── validate_and_fix.py
└── agents/          # Conversion tools
    ├── csv_to_html_agent.py
    └── pdf_parse_agent.py
```

## 📄 License

© 2026 Peoria Tamil School. All rights reserved.
