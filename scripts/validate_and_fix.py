
import json
import re
import urllib.request
import urllib.error
import sys
import os

# File paths
DATA_FILE = "docs/assets/data/theni_words.js"
LOG_FILE = "scripts/validation.log"

# Ollama API
OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL = "llama3.1:latest"

def load_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract JSON part
    match = re.search(r'window\.theniWords\s*=\s*(\[.*\]);', content, re.DOTALL)
    if not match:
        print("Error: Could not find JSON data in JS file.")
        sys.exit(1)
    
    json_str = match.group(1)
    # Remove trailing comma if present before closing bracket (common in JS but invalid in JSON)
    json_str = re.sub(r',\s*\]', ']', json_str)
    
    try:
        data = json.loads(json_str)
        return data, content
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        sys.exit(1)

def save_data(data, original_content):
    json_str = json.dumps(data, indent=2, ensure_ascii=False)
    
    # Replace the array in the original content
    new_content = re.sub(r'(window\.theniWords\s*=\s*)\[.*\];', f'\\1{json_str};', original_content, flags=re.DOTALL)
    
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updates saved to {DATA_FILE}")

def validate_and_fix(item):
    if 'sentence_en' not in item or 'sentence_ta' not in item:
        return None, None
    
    english = item['sentence_en']
    tamil = item['sentence_ta']
    
    prompt = f"""You are a professional translator and Tamil language expert.
    
    Task: Translate the following English sentence into Tamil.
    
    English Sentence: "{english}"
    
    Guidelines:
    1. The translation must be ACCURATE and COMPLETE (conveying the full meaning).
    2. The context must be preserved.
    3. Use formal, standard Tamil (Chentamil) suitable for education.
    4. Do NOT use spoken/colloquial Tamil (Tanglish).
    5. Output ONLY the Tamil translation. No notes, no explanations, no preamble.
    """
    
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.1
        }
    }
    
    try:
        req = urllib.request.Request(
            OLLAMA_API_URL, 
            data=json.dumps(payload).encode('utf-8'), 
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                result_json = json.loads(response.read().decode('utf-8'))
                result = result_json['response'].strip().strip('"')
                result = result.replace("\n", " ")
                return result
            else:
                print(f"Error calling Ollama: {response.status}")
                return None
            
    except Exception as e:
        print(f"Exception during API call: {e}")
        return None

def main():
    print(f"Loading data from {DATA_FILE}...")
    data, original_content = load_data()
    
    modified_count = 0
    total_checked = 0
    
    print(f"Checking {len(data)} items...")
    
    with open(LOG_FILE, 'a', encoding='utf-8') as log:
        for item in data:
            if 'sentence_en' in item:
                total_checked += 1
                original_ta = item['sentence_ta']
                
                print(f"Checking ID {item.get('id')}: {item['sentence_en']}")
                
                fixed_ta = validate_and_fix(item)
                
                if fixed_ta:
                    # Length check: Tamil shouldn't be excessively longer than English (heuristic)
                    # Tamil words are longer, but sentence length shouldn't be 3x+
                    if len(fixed_ta) > 4 * len(item['sentence_en']):
                         print(f"  [WARN] Generated Tamil too long, skipping: {fixed_ta}")
                         continue
                        
                    if fixed_ta != original_ta:
                        print(f"  [FIX] {original_ta} -> {fixed_ta}")
                        log.write(f"ID {item.get('id')}\nEN: {item['sentence_en']}\nOLD: {original_ta}\nNEW: {fixed_ta}\n\n")
                        item['sentence_ta'] = fixed_ta
                        modified_count += 1
                        
                        # Periodic save every 10 updates
                        if modified_count % 10 == 0:
                            save_data(data, original_content)
                    else:
                        print(f"  [OK] Same")

    if modified_count > 0:
        save_data(data, original_content)
    
    print(f"\nCompleted. Checked {total_checked} items. Fixed {modified_count} translations.")

if __name__ == "__main__":
    main()
