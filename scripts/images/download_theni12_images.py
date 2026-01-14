import os
import re
import time
import requests
import urllib.parse

# Configuration
SOURCE_FILE = 'src/js/theni_words.ts'
ASSETS_DIR = 'public/assets/images/theni12'
WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"

def get_words_from_source(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex to find "image_word": "some word" in TS file
    words = re.findall(r'"image_word":\s*"([^"]+)"', content)
    
    return list(set(words))

def download_image(word, output_dir, force=False, source_preference='all', strict=False, exclude_sources=None):
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

    def try_openverse():
         try:
            # Openverse API (free, no key required)
            url = f"https://api.openverse.org/v1/images/?q={urllib.parse.quote(word)}&format=json"
            resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                if data.get('results'):
                    print(f"  Found valid Openverse image for {word}")
                    return data['results'][0]['url']
         except Exception as e:
            print(f"  Openverse error for {word}: {e}")
         return None

    def try_pollinations():
         # Generative AI
         sanitized_word = urllib.parse.quote(word)
         import random
         seed = random.randint(0, 1000)
         return f"https://image.pollinations.ai/prompt/{sanitized_word}?width=400&height=300&nologo=true&seed={seed}"

    # Determine validation strategy
    sources = []
    
    import time
    import random

    # Priority logic
    if source_preference == 'pollinations':
        sources = [try_pollinations, try_wikipedia, try_openverse, try_loremflickr]
    elif source_preference == 'wiki':
        sources = [try_wikipedia, try_openverse, try_loremflickr, try_pollinations]
    elif source_preference == 'flickr':
        sources = [try_loremflickr, try_openverse, try_wikipedia, try_pollinations]
    elif source_preference == 'openverse':
        sources = [try_openverse, try_wikipedia, try_loremflickr, try_pollinations]
    else: # 'all' / default
        sources = [try_wikipedia, try_openverse, try_loremflickr, try_pollinations]
        
    if strict:
        sources = sources[:1]
        
    if exclude_sources:
        func_map = {
            try_wikipedia: 'wiki',
            try_loremflickr: 'flickr',
            try_pollinations: 'pollinations'
        }
        sources = [s for s in sources if func_map.get(s, '') not in exclude_sources]

    download_success = False

    # List of User-Agents to rotate
    user_agents = [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    ]

    for source_func in sources:
        if download_success: break
        
        url = source_func()
        if not url: continue
        
        # Determine strictness for retries
        max_retries = 3 if "pollinations" not in url else 1
        
        for attempt in range(max_retries):
            current_headers = headers.copy()
            current_headers['User-Agent'] = random.choice(user_agents)
            
            try:
                # Add delay before request to be nice
                time.sleep(random.uniform(1.0, 3.0)) 
                
                timeout = 25 if "pollinations" in url else 15
                resp = requests.get(url, headers=current_headers, timeout=timeout)
                
                if resp.status_code == 200:
                    # OPTIMIZATION: Only overwrite if we successfully got the new image
                    with open(file_path, 'wb') as f:
                        f.write(resp.content)
                    print(f"  Saved to {file_path}")
                    download_success = True
                    break # Break retry loop
                
                elif resp.status_code == 429:
                    wait_time = (attempt + 1) * 5
                    print(f"  Rate limited (429) on {url}. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue # Retry
                
                elif resp.status_code == 403:
                    print(f"  Forbidden (403) on {url}.")
                    # specific handling? maybe simple retry with diff UA helps?
                    # usually 403 is persistent for a URL pattern unless UA fixes it.
                    if attempt < max_retries - 1:
                        time.sleep(2)
                        continue
                    break # Stop retrying 403s
                
                else:
                    print(f"  Failed download {url} status: {resp.status_code}")
                    break # Don't retry other errors
                    
            except Exception as e:
                print(f"  Download error for {word} from {url}: {e}")
                time.sleep(1)

    return download_success

import argparse

def main():
    parser = argparse.ArgumentParser(description='Download images for Theni 12 words.')
    parser.add_argument('--force', action='store_true', help='Overwrite existing images')
    parser.add_argument('--source', choices=['wiki', 'flickr', 'pollinations', 'openverse', 'all'], default='all', help='Preferred source strategy')
    parser.add_argument('--words', nargs='+', help='Specific words to download (overrides HTML scan)')
    parser.add_argument('--strict', action='store_true', help='Disable fallbacks (use only preferred source)')
    parser.add_argument('--exclude', nargs='+', help='Sources to exclude (e.g. pollinations)')
    
    args = parser.parse_args()

    if not os.path.exists(SOURCE_FILE):
        print(f"Error: {SOURCE_FILE} not found.")
        return

    if not os.path.exists(ASSETS_DIR):
        os.makedirs(ASSETS_DIR)
        print(f"Created directory: {ASSETS_DIR}")

    if args.words:
        words = args.words
        print(f"Processing {len(words)} specific words provided via arguments.")
    else:
        words = get_words_from_source(SOURCE_FILE)
        print(f"Found {len(words)} unique words in source file.")
    
    count = 0
    for word in words:
        # If specific words are provided, we likely want to force them, or user should use --force
        force_download = args.force
        
        if download_image(word, ASSETS_DIR, force=force_download, source_preference=args.source, strict=args.strict, exclude_sources=args.exclude):
            count += 1
            # Only sleep if we actually downloaded something to be nice to APIs
            time.sleep(2.0)

    print(f"Finished. Downloaded/Verified {count} images.")

if __name__ == "__main__":
    main()
