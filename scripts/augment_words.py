
import json
import re
import urllib.request
import urllib.error
import time
import os
import sys

# Configuration
FILE_PATH = '../docs/assets/data/theni_words.js'
MODEL = 'llama3.1:latest'
OLLAMA_API_URL = 'http://localhost:11434/api/chat'
SAVE_INTERVAL = 10

def load_words(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract JSON part
    # Assuming format: window.theniWords = [...];
    match = re.search(r'window\.theniWords\s*=\s*(\[.*\])', content, re.DOTALL)
    if not match:
        # Try finding just the array if exact match fails
        match = re.search(r'(\[.*\])', content, re.DOTALL)
        if not match:
            print("Error: Could not find JSON array in file.")
            sys.exit(1)
            
    json_str = match.group(1)
    # Remove trailing semicolon if captured
    if json_str.strip().endswith(';'):
        json_str = json_str.strip()[:-1]
        
    try:
        words = json.loads(json_str)
        return words, content
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        sys.exit(1)

def save_words(file_path, words, original_content):
    # Reconstruct the file content
    # We want to keep the header comments.
    # We'll replace the array part in the original content
    
    # Format JSON with indentation
    new_json_str = json.dumps(words, indent=2, ensure_ascii=False)
    
    # Replace the old array with the new one using regex
    # We need to be careful to replace only the array part we extracted
    new_content = re.sub(r'window\.theniWords\s*=\s*\[.*\]', f'window.theniWords = {new_json_str}', original_content, flags=re.DOTALL)
    
    # If regex replacement failed (maybe due to complexity), just reconstruction
    if new_content == original_content:
        # Fallback: strict reconstruction
        header = original_content.split('window.theniWords')[0]
        new_content = f"{header}window.theniWords = {new_json_str};"
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Saved progress to {file_path}")

def generate_sentence(word_en, word_ta):
    prompt = f"""You are a helpful assistant. Generate a simple sentence in English using the word '{word_en}' (max 10 words).
Then generate a Tamil sentence using '{word_ta}' that is a STRICT, EXACT TRANSLATION of the English sentence.
The sentences should be suitable for a 12 year old student.
Both sentences MUST contain the words '{word_en}' and '{word_ta}' respectively.
Complexity score (1-4).
Return ONLY a JSON object with keys: "sentence_en", "sentence_ta", "complexity". 
Do not output anything else. valid JSON only."""

    data = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": False,
        "format": "json"
    }
    
    req = urllib.request.Request(
        OLLAMA_API_URL, 
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    retries = 3
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
                content = result['message']['content']
                return json.loads(content)
        except (urllib.error.URLError, json.JSONDecodeError) as e:
            print(f"Error generating for {word_en} (attempt {attempt+1}/{retries}): {e}")
            time.sleep(1)
            
    return None

def main():
    print(f"Reading words from {FILE_PATH}...")
    words, original_content = load_words(FILE_PATH)
    print(f"Found {len(words)} words.")
    
    count = 0
    start_time = time.time()
    
    for i, word in enumerate(words):
        if 'sentence_en' in word and 'sentence_ta' in word and 'complexity' in word:
            continue # Skip already processed
            
        print(f"[{i+1}/{len(words)}] Generating for: {word['word_en']} ({word['word_ta']})")
        
        result = generate_sentence(word['word_en'], word['word_ta'])
        
        if result:
            word['sentence_en'] = result.get('sentence_en', '')
            word['sentence_ta'] = result.get('sentence_ta', '')
            word['complexity'] = result.get('complexity', 1)
            count += 1
            
            # Save periodically
            if count % SAVE_INTERVAL == 0:
                save_words(FILE_PATH, words, original_content)
        else:
            print(f"Failed to generate for {word['word_en']}")
            
    # Final save
    save_words(FILE_PATH, words, original_content)
    print(f"Done! Processed {count} words in {time.time() - start_time:.2f} seconds.")

if __name__ == "__main__":
    main()
