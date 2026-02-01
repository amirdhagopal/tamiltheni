# Makefile for Tamil Theni Project

# Variables
NPM := npm
RM := rm -rf

# Phony targets
.PHONY: all install dev build preview lint lint-fix format format-check test test-e2e check clean help

# Default target
all: help

# Install dependencies
install:
	$(NPM) install

# Start development server
dev:
	$(NPM) run dev

# Build for production
build:
	$(NPM) run build

# Preview production build
preview:
	$(NPM) run preview

# Lint code
lint:
	$(NPM) run lint

# Lint and fix code
lint-fix:
	$(NPM) run lint:fix

# Format code
format:
	$(NPM) run format

# Check code formatting
format-check:
	$(NPM) run format:check

# Run unit tests
test:
	$(NPM) test

# Run E2E tests
test-e2e:
	$(NPM) run test:e2e

# Run all checks (format, lint, test, build, e2e)
check:
	$(NPM) run check-all

# --- Data & Image Utilities ---

# Download missing Theni 2 images
download-images:
	python3 scripts/images/download_theni12_images.py

# Check for missing images
check-images:
	python3 scripts/images/check_missing_images.py

# Fix bad images (convert webp/verify)
fix-images:
	python3 scripts/images/fix_bad_images.py

# Clean build artifacts
clean:
	$(RM) docs/html/*.html
	git checkout docs/html/*.html 2>/dev/null || true
	$(RM) dist dev-dist node_modules/.vite

# Show help
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install       Install dependencies"
	@echo "  dev           Start development server"
	@echo "  build         Build for production"
	@echo "  preview       Preview production build"
	@echo "  lint          Lint code"
	@echo "  lint-fix      Lint and fix code"
	@echo "  format        Format code"
	@echo "  test          Run unit tests"
	@echo "  test-e2e      Run E2E tests"
	@echo "  check         Run all checks (format, lint, unit & e2e tests, build)"
	@echo "  clean         Clean build artifacts and cache"
	@echo "  help          Show this help message"
