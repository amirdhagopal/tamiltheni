import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                alert: "readonly",
                Audio: "readonly",
                Image: "readonly",
                speechSynthesis: "readonly",
                SpeechSynthesisUtterance: "readonly",
                SpeechRecognition: "readonly",
                webkitSpeechRecognition: "readonly",
                localStorage: "readonly",
                // App globals
                TheniLayout: "readonly",
                TheniTimer: "readonly",
                TheniAudio: "readonly",
                TheniConfig: "readonly",
                TheniUtils: "readonly",
                theniWords: "readonly",
                theni5Words: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
            "prefer-const": "warn",
            "no-var": "warn",
        },
    },
    {
        ignores: ["node_modules/**", "docs/assets/data/**"],
    },
];
