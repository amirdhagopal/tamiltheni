import os
import hashlib
import re
import html
import sys
# Import the download logic (assuming it's in the same directory)
import download_theni12_images

BAD_HASH = '2090a5dc21c32952cbf8496339752bd1'
HTML_FILE = 'docs/theni12.html'
ASSETS_DIR = 'docs/assets/images/theni12'

def get_file_hash(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, 'rb') as f:
        return hashlib.md5(f.read()).hexdigest()

def get_words_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    words = re.findall(r'data-word="([^"]+)"', content)
    words = [html.unescape(w) for w in words]
    return list(set(words))

def get_safe_filename(word):
    safe_filename = "".join([c for c in word if c.isalpha() or c.isdigit() or c in (' ', '-', '_')]).rstrip()
    safe_filename = safe_filename.replace(' ', '_')
    return f"{safe_filename}.jpg"

def main():
    print("Scanning for bad images...")
    words = get_words_from_html(HTML_FILE)
    bad_words = []
    
    for word in words:
        filename = get_safe_filename(word)
        file_path = os.path.join(ASSETS_DIR, filename)
        
        current_hash = get_file_hash(file_path)
        if current_hash == BAD_HASH:
            print(f"Found bad image for '{word}' ({filename})")
            os.remove(file_path)
            bad_words.append(word)

    print(f"Removed {len(bad_words)} bad images.")
    
    if not bad_words:
        print("No matches found.")
        return

    print("Attempting to re-download using Wikipedia or Flickr (skipping Pollinations)...")
    
    success_count = 0
    import time
    for word in bad_words:
        print(f"Refetching '{word}'...")
        # Force download, prefer Wiki, fallback to Flickr permitted (strict=False), but exclude Pollinations
        if download_theni12_images.download_image(
            word, 
            ASSETS_DIR, 
            force=True, 
            source_preference='wiki', 
            strict=False, 
            exclude_sources=['pollinations']
        ):
            success_count += 1
            time.sleep(2.0)
            
    print(f"Fixed {success_count} out of {len(bad_words)} images.")

if __name__ == "__main__":
    main()
