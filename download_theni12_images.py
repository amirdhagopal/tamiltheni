import os
import re
import time
import requests
import urllib.parse

# Configuration
HTML_FILE = 'docs/theni12.html'
ASSETS_DIR = 'docs/assets/images/theni12'
WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"

def get_words_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find data-word="..."
    # Matches data-word="some word"
    words = re.findall(r'data-word="([^"]+)"', content)
    # Deduplicate but keep order if possible, though set is fine
    import html
    words = [html.unescape(w) for w in words]
    return list(set(words))

def download_image(word, output_dir, force=False, source_preference='all', strict=False):
    safe_filename = "".join([c for c in word if c.isalpha() or c.isdigit() or c in (' ', '-', '_')]).rstrip()
    safe_filename = safe_filename.replace(' ', '_')
    file_path = os.path.join(output_dir, f"{safe_filename}.jpg")
    
    if not force and os.path.exists(file_path):
        print(f"Skipping {word} (already exists)")
        return False # Return False so we don't sleep in the main loop

    print(f"Processing: {word}...")
    
    image_url = None
    
    # Common headers
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    }

    # Define source functions
    def try_wikipedia():
        try:
            params = {
                "action": "query",
                "generator": "search",
                "gsrsearch": word,
                "gsrlimit": 1,
                "prop": "pageimages",
                "pithumbsize": 400,
                "format": "json",
                "origin": "*"
            }
            resp = requests.get(WIKIPEDIA_API_URL, params=params, headers=headers, timeout=10)
            if 'application/json' in resp.headers.get('Content-Type', ''):
                 data = resp.json()
                 if "query" in data and "pages" in data["query"]:
                    for page_id, page_data in data["query"]["pages"].items():
                        if "thumbnail" in page_data:
                            print(f"  Found valid Wikipedia image for {word}")
                            return page_data["thumbnail"]["source"]
            else:
                 print(f"  Wikipedia returned non-JSON for {word}")
        except Exception as e:
            print(f"  Wikipedia error for {word}: {e}")
        return None

    def try_loremflickr():
        sanitized_word = urllib.parse.quote(word)
        return f"https://loremflickr.com/400/300/{sanitized_word}?lock=1"

    def try_pollinations():
         # Generative AI
         sanitized_word = urllib.parse.quote(word)
         import random
         seed = random.randint(0, 1000)
         # Adding "educational illustration" to prompt to potentially improve relevance?
         # Or just keeping it simple. Pollinations usually takes the prompt literally.
         return f"https://image.pollinations.ai/prompt/{sanitized_word}?width=400&height=300&nologo=true&seed={seed}"

    # Determine validation strategy
    # For Wikipedia, we get a URL that is "guaranteed" to exist (unless 403).
    # For LoremFlickr/Pollinations, we construct a URL and have to test it.
    
    sources = []
    
    # Priority logic
    if source_preference == 'pollinations':
        sources = [try_pollinations, try_wikipedia, try_loremflickr]
    elif source_preference == 'wiki':
        sources = [try_wikipedia, try_loremflickr, try_pollinations]
    elif source_preference == 'flickr':
        sources = [try_loremflickr, try_wikipedia, try_pollinations]
    else: # 'all' / default
        sources = [try_wikipedia, try_loremflickr, try_pollinations]
        
    if strict:
        # Keep only the first source from the priority list
        sources = sources[:1]

    download_success = False

    for source_func in sources:
        if download_success: break
        
        # Don't retry same source types if we are strictly preferring one? 
        # No, the preference just sets the ORDER. We still fallback unless user only wants one source? 
        # For now, fallback is good.
        
        url = source_func()
        if not url: continue
        
        # Skip if we are trying the same URL type again? (Not really possible with this structure)
        
        if "pollinations" in url:
             print(f"  Attempting Pollinations AI for {word}")
        elif "loremflickr" in url:
             print(f"  Attempting LoremFlickr for {word}")
             
        try:
             # Standard download attempt
             timeout = 20 if "pollinations" in url else 10
             resp = requests.get(url, headers=headers, timeout=timeout)
             if resp.status_code == 200:
                # OPTIMIZATION: Only overwrite if we successfully got the new image
                with open(file_path, 'wb') as f:
                    f.write(resp.content)
                print(f"  Saved to {file_path}")
                download_success = True
             else:
                print(f"  Failed download {url} status: {resp.status_code}")
        except Exception as e:
            print(f"  Download error for {word} from {url}: {e}")

    return download_success

import argparse

def main():
    parser = argparse.ArgumentParser(description='Download images for Theni 12 words.')
    parser.add_argument('--force', action='store_true', help='Overwrite existing images')
    parser.add_argument('--source', choices=['wiki', 'flickr', 'pollinations', 'all'], default='all', help='Preferred source strategy')
    parser.add_argument('--words', nargs='+', help='Specific words to download (overrides HTML scan)')
    parser.add_argument('--strict', action='store_true', help='Disable fallbacks (use only preferred source)')
    
    args = parser.parse_args()

    if not os.path.exists(HTML_FILE):
        print(f"Error: {HTML_FILE} not found.")
        return

    if not os.path.exists(ASSETS_DIR):
        os.makedirs(ASSETS_DIR)
        print(f"Created directory: {ASSETS_DIR}")

    if args.words:
        words = args.words
        print(f"Processing {len(words)} specific words provided via arguments.")
    else:
        words = get_words_from_html(HTML_FILE)
        print(f"Found {len(words)} unique words in HTML.")
    
    count = 0
    for word in words:
        # If specific words are provided, we likely want to force them, or user should use --force
        force_download = args.force
        
        if download_image(word, ASSETS_DIR, force=force_download, source_preference=args.source, strict=args.strict):
            count += 1
            # Only sleep if we actually downloaded something to be nice to APIs
            time.sleep(2.0)

    print(f"Finished. Downloaded/Verified {count} images.")

if __name__ == "__main__":
    main()
