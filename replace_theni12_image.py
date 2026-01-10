import os
import sys
import requests
import argparse

# Configuration
ASSETS_DIR = 'docs/assets/images/theni12'

def get_safe_filename(word):
    # Logic must match download_theni12_images.py and theni12.html JS
    safe = "".join([c for c in word if c.isalpha() or c.isdigit() or c in (' ', '-', '_')]).rstrip()
    safe = safe.replace(' ', '_')
    return f"{safe}.jpg"

def replace_image(word, image_url):
    filename = get_safe_filename(word)
    file_path = os.path.join(ASSETS_DIR, filename)

    print(f"Target file: {file_path}")
    print(f"Downloading from: {image_url}")

    try:
        # Mocking browser user agent to avoid some 403s
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36'}
        response = requests.get(image_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            # Ensure directory exists (it should, but safety first)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'wb') as f:
                f.write(response.content)
            print(f"SUCCESS: Image for '{word}' replaced at {file_path}")
            return True
        else:
            print(f"ERROR: Failed to download image. Status code: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"ERROR: Exception occurred: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Replace a specific image for Theni 12.')
    parser.add_argument('word', help='The word to replace the image for (e.g., "ear")')
    parser.add_argument('url', help='The URL of the new image')

    args = parser.parse_args()

    replace_image(args.word, args.url)

if __name__ == "__main__":
    main()
