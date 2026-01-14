import re
import json
from collections import Counter

file_path = 'src/js/theni_words.ts'

def analyze_words():
    with open(file_path, 'r') as f:
        content = f.read()

    # Extract the array content
    match = re.search(r'export const theniWords: Word\[\] = \[(.*?)\];', content, re.DOTALL)
    if not match:
        print("Could not find theniWords array")
        return

    data_str = match.group(1)
    
    # Simple regex parsing since it's not strict JSON (keys aren't always quoted, trailing commas)
    # But wait, looking at my previous view_file, keys ARE quoted ("id": 1).
    # so maybe I can massage it into JSON.
    
    # Remove comments
    data_str = re.sub(r'//.*', '', data_str)
    
    items = []
    # Split by closing brace + comma to approximate items
    raw_items = data_str.split('},')
    
    total_count = 0
    categories = Counter()
    difficulties = Counter()
    cat_diff_map = {} # Category -> Difficulty set
    
    print(f"Analyzing {file_path}...")
    
    for raw in raw_items:
        if not raw.strip(): continue
        
        # simple check for category and difficulty
        cat_match = re.search(r'"category":\s*"(.*?)"', raw)
        cat_ta_match = re.search(r'"category_ta":\s*"(.*?)"', raw)
        diff_match = re.search(r'"difficulty":\s*"(.*?)"', raw)
        
        if cat_match and diff_match:
            total_count += 1
            cat = cat_match.group(1)
            cat_ta = cat_ta_match.group(1) if cat_ta_match else "UNKNOWN"
            diff = diff_match.group(1)
            
            full_cat = f"{cat} - {cat_ta}"
            
            categories[full_cat] += 1
            difficulties[diff] += 1
            
            if full_cat not in cat_diff_map:
                cat_diff_map[full_cat] = set()
            cat_diff_map[full_cat].add(diff)

    print(f"Total items found: {total_count}")
    print("\nCategory Distribution:")
    for cat, count in categories.items():
        print(f"{cat}: {count}")
        
    print("\nDifficulty Distribution:")
    for diff, count in difficulties.items():
        print(f"{diff}: {count}")

    print("\nChecking for Categories with mixed/missing difficulties:")
    for cat, diffs in cat_diff_map.items():
        if len(diffs) > 1:
            print(f"Mixed difficulties in {cat}: {diffs}")

if __name__ == "__main__":
    analyze_words()
