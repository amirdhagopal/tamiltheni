#!/bin/bash
# bump-version.sh - Increment the version parameter on all CSS/JS files
# Usage: ./bump-version.sh
#
# This script finds all ?v=N parameters in HTML files and increments them to N+1
# This forces browsers to fetch fresh copies of CSS and JS files

cd "$(dirname "$0")/docs" || exit 1

# Get current version from first match
current=$(grep -oE '\?v=[0-9]+' theni1.html | head -1 | grep -oE '[0-9]+')

if [ -z "$current" ]; then
    echo "No version found. Adding v=1..."
    next=1
else
    next=$((current + 1))
    echo "Bumping version from v=$current to v=$next"
fi

# Update all HTML files
for file in theni1.html theni2.html theni34.html theni5.html; do
    if [ -f "$file" ]; then
        sed -i '' "s/?v=$current/?v=$next/g" "$file"
        echo "  Updated: $file"
    fi
done

echo "Done! All assets now use ?v=$next"
