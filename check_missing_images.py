import os
import re

HTML_FILE = 'docs/theni12.html'
ASSETS_DIR = 'docs/assets/images/theni12'

def get_words_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    import html
    words = re.findall(r'data-word="([^"]+)"', content)
    words = [html.unescape(w) for w in words]
    return list(set(words))

def get_safe_filename(word):
    safe_filename = "".join([c for c in word if c.isalpha() or c.isdigit() or c in (' ', '-', '_')]).rstrip()
    safe_filename = safe_filename.replace(' ', '_')
    return f"{safe_filename}.jpg"

def main():
    if not os.path.exists(HTML_FILE):
        print(f"Error: {HTML_FILE} not found.")
        return

    words = get_words_from_html(HTML_FILE)
    print(f"Found {len(words)} unique words in HTML.")
    
    missing = []
    
    for word in words:
        filename = get_safe_filename(word)
        file_path = os.path.join(ASSETS_DIR, filename)
        if not os.path.exists(file_path):
            missing.append(word)
            print(f"Missing: {word} -> {filename}")
            
    print(f"\nTotal Missing: {len(missing)}")
    if missing:
        print("Missing words list:")
        print(missing)

if __name__ == "__main__":
    main()
