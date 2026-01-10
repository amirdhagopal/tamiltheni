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

def download_image(word, output_dir):
    safe_filename = "".join([c for c in word if c.isalpha() or c.isdigit() or c in (' ', '-', '_')]).rstrip()
    safe_filename = safe_filename.replace(' ', '_')
    file_path = os.path.join(output_dir, f"{safe_filename}.jpg")
    
    if os.path.exists(file_path):
        print(f"Skipping {word} (already exists)")
        return False # Return False so we don't sleep in the main loop

    print(f"Processing: {word}...")
    
    image_url = None
    
    # Common headers - mimicking a real browser to avoid 403s
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'
    }
    
    # 1. Try Wikipedia
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
        
        # Check if content type is actually JSON (avoid JSONDecodeError)
        if 'application/json' in resp.headers.get('Content-Type', ''):
             data = resp.json()
             if "query" in data and "pages" in data["query"]:
                for page_id, page_data in data["query"]["pages"].items():
                    if "thumbnail" in page_data:
                        image_url = page_data["thumbnail"]["source"]
                        print(f"  Found valid Wikipedia image for {word}")
                        break
        else:
             print(f"  Wikipedia returned non-JSON for {word}")

    except Exception as e:
        print(f"  Wikipedia error for {word}: {e}")

    # If Wikipedia found an image, try to download it first
    download_success = False
    if image_url:
        try:
            img_resp = requests.get(image_url, headers=headers, timeout=10)
            if img_resp.status_code == 200:
                with open(file_path, 'wb') as f:
                    f.write(img_resp.content)
                print(f"  Saved to {file_path}")
                download_success = True
            else:
                print(f"  Failed download {image_url} status: {img_resp.status_code}")
        except Exception as e:
            print(f"  Download error for {word}: {e}")
    
    # 2. Fallback to LoremFlickr if no Wikipedia image or Wikipedia download failed
    if not download_success:
        print(f"  Fallback to LoremFlickr for {word}")
        sanitized_word = urllib.parse.quote(word)
        image_url = f"https://loremflickr.com/400/300/{sanitized_word}?lock=1"

        # Download from LoremFlickr
        try:
            img_resp = requests.get(image_url, headers=headers, timeout=10)
            if img_resp.status_code == 200:
                with open(file_path, 'wb') as f:
                    f.write(img_resp.content)
                print(f"  Saved to {file_path}")
                download_success = True
            else:
                print(f"  Failed download {image_url} status: {img_resp.status_code}")
        except Exception as e:
            print(f"  Download error for {word}: {e}")

    # 3. Fallback to Pollinations AI (Generative) if LoremFlickr failed or 403d
    if not download_success:
         print(f"  Fallback to Pollinations AI for {word}")
         sanitized_word = urllib.parse.quote(word)
         # Using a specific seed (random number) to keep it consistent
         import random
         seed = random.randint(0, 1000)
         image_url = f"https://image.pollinations.ai/prompt/{sanitized_word}?width=400&height=300&nologo=true&seed={seed}"
         
         try:
            img_resp = requests.get(image_url, headers=headers, timeout=20) # Slower timeout for generation
            if img_resp.status_code == 200:
                with open(file_path, 'wb') as f:
                    f.write(img_resp.content)
                print(f"  Saved to {file_path}")
                return True
            else:
                print(f"  Failed download {image_url} status: {img_resp.status_code}")
         except Exception as e:
            print(f"  Download error for {word}: {e}")
            
    return download_success

def main():
    if not os.path.exists(HTML_FILE):
        print(f"Error: {HTML_FILE} not found.")
        return

    if not os.path.exists(ASSETS_DIR):
        os.makedirs(ASSETS_DIR)
        print(f"Created directory: {ASSETS_DIR}")

    words = get_words_from_html(HTML_FILE)
    print(f"Found {len(words)} unique words.")
    
    count = 0
    for word in words:
        if download_image(word, ASSETS_DIR):
            count += 1
            # Only sleep if we actually downloaded something to be nice to APIs
            time.sleep(2.0)

    print(f"Finished. Downloaded/Verified {count} images.")

if __name__ == "__main__":
    main()
