import fitz # PyMuPDF
import re
import csv
import os
import unicodedata

def clean_tamil_text(text):
    if not text: return ""
    
    # Remove any non-Tamil and non-whitespace/basic punctuation
    # Tamil range: \u0B80-\u0BFF
    text = "".join(c for c in text if '\u0B80' <= c <= '\u0BFF' or c.isspace() or c in '(),-')
    
    # Fix ghost initials like "ப பொய்" -> "பொய்"
    words = text.split()
    new_words = []
    i = 0
    while i < len(words):
        w = words[i]
        if len(w) == 1 and '\u0B83' <= w <= '\u0BB9':
            if i + 1 < len(words):
                next_word = words[i+1]
                if next_word.startswith(w):
                    i += 1
                    continue
        new_words.append(w)
        i += 1
    
    text = "".join(new_words)
    
    # Standard normalization
    text = re.sub(r'(?:^|\s)[\u0BBE-\u0BD7]+', ' ', text)
    text = re.sub(r'([\u0B83-\u0BB9])\s?\1', r'\1', text)
    
    suffixes = ['லை', 'ளை', 'னை', 'ன', 'ண']
    for suf in suffixes:
        text = text.replace(f" {suf}", f"{suf}")
        
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_theni5(pdf_path, output_csv):
    print(f"Extracting Theni 5 words from {pdf_path} using PyMuPDF...")
    
    SNO_X_POSITIONS = [37.3, 149.0, 249.2, 363.2, 484.7]
    COL_COUNT = len(SNO_X_POSITIONS)
    
    final_results = []
    
    doc = fitz.open(pdf_path)
    
    for p_idx, page in enumerate(doc):
        if p_idx > 1: continue 
        
        print(f"  Processing page {p_idx + 1}...")
        
        # get_text("words") returns (x0, y0, x1, y1, "word", block_no, line_no, word_no)
        words = page.get_text("words")
        
        page_snos_by_col = [[] for _ in range(COL_COUNT)]
        page_fragments = []
        
        for w in words:
            x0, y0, x1, y1, text = w[0], w[1], w[2], w[3], w[4]
            
            # Ignore noisy headers/footers
            noise_keywords = ["Tamil", "Theni", "Page", "List", "round", "stage", "2025-26", "History", "Change", "of", "IONAL", "AMIL", "HENI", "N", "T", 
                              "தேனீ", "தனீ", "வார்த்ைதப்", "பட்டியல்", "தமிழ்த்தேனி", "வார்த்தைப்", "செடிகள்", "சடிகள்", "("]
            if any(x.lower() in text.lower() for x in noise_keywords):
                continue
            
            sno_match = re.match(r'^(\d+)\)$', text)
            if sno_match:
                val = int(sno_match.group(1))
                best_col = min(range(COL_COUNT), key=lambda i: abs(x0 - SNO_X_POSITIONS[i]))
                page_snos_by_col[best_col].append({
                    'val': val,
                    'top': y0,
                    'x': x0,
                    'fragments': []
                })
            else:
                # Potential fragment
                page_fragments.append({'text': text, 'x': x0, 'top': y0})

        # Assignment logic
        for f in page_fragments:
            x = f['x']
            top = f['top']
            
            best_col = min(range(COL_COUNT), key=lambda i: abs(x - SNO_X_POSITIONS[i]))
            col_snos = page_snos_by_col[best_col]
            
            if col_snos:
                # Only assignment to snos on same page
                best_sno = min(col_snos, key=lambda s: abs(top - s['top']))
                # Buffer check: words shouldn't be TOO far from Sno vertically
                # But for this PDF, we found they can be ~30pts away
                if abs(top - best_sno['top']) < 50:
                    best_sno['fragments'].append(f)

        # Build results for this page
        for col in page_snos_by_col:
            for s in col:
                s['fragments'].sort(key=lambda f: (f['top'], f['x']))
                full_word = clean_tamil_text(" ".join(f['text'] for f in s['fragments']))
                final_results.append({'sno': s['val'], 'word': full_word})

    doc.close()
    
    # Final Output preparation
    unique_results = {}
    for r in final_results:
        sno = r['sno']
        if sno not in unique_results:
            unique_results[sno] = r['word']
        else:
            unique_results[sno] = clean_tamil_text(unique_results[sno] + r['word'])

    sorted_snos = sorted(unique_results.keys())
    
    print(f"Extraction complete. Found {len(unique_results)} unique entries.")
    
    with open(output_csv, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=['sno', 'word'])
        writer.writeheader()
        for sno in sorted_snos:
            writer.writerow({'sno': sno, 'word': unique_results[sno]})
            
    if len(unique_results) != 250:
        print(f"WARNING: Expected 250, found {len(unique_results)}")
        
    if sorted_snos:
        print("\nSamples:")
        for s in sorted_snos[:10]: print(f"  {s}: {unique_results[s]}")
        print("  ...")
        for s in sorted_snos[-10:]: print(f"  {s}: {unique_results[s]}")

if __name__ == "__main__":
    input_pdf = "resources/input/TT2026-Word-List-Theni-5-v1.0.pdf"
    output_csv = "resources/artifacts/TT2026-Word-List-Theni-5.csv"
    extract_theni5(input_pdf, output_csv)
