import pdfplumber
import pymupdf  # fitz
import json
import re
import unicodedata

def extract_text_from_bbox(page_fitz, bbox):
    """
    Extracts text from a specific bounding box using PyMuPDF.
    bbox: (x0, top, x1, bottom) from pdfplumber.
    """
    x0, top, x1, bottom = bbox
    # Shrink bbox slightly
    rect = pymupdf.Rect(x0 + 1, top + 1, x1 - 1, bottom - 1)
    return page_fitz.get_text("text", clip=rect).strip()

def clean_text(text, is_english=True):
    if not text: return None
    text = text.replace('\n', ' ')
    
    if is_english:
        # Remove Tamil characters
        text = re.sub(r'[\u0B80-\u0BFF]', '', text)
    else:
        # Tamil field: Remove isolated combining marks
        text = re.sub(r'(?:^|\s)[\u0BBE-\u0BD7]+', ' ', text)
        
        # Fix duplicate ghost consonants (Simple)
        text = re.sub(r'([\u0B83-\u0BB9])\s?\1', r'\1', text)

        # Fix Ghost Initial: "ப பொருள்கள்" -> "பொருள்கள்"
        words = text.split()
        new_words = []
        skip_next = False
        
        for idx, w in enumerate(words):
            if skip_next:
                skip_next = False
                continue
            
            # Check if w is single char (length 1) and next word starts with same base
            if len(w) == 1 and '\u0B83' <= w <= '\u0BB9':
                if idx + 1 < len(words):
                    next_word = words[idx+1]
                    w_norm = unicodedata.normalize('NFD', w)
                    next_norm = unicodedata.normalize('NFD', next_word)
                    
                    if next_norm.startswith(w_norm):
                        continue
            
            new_words.append(w)
        
        text = " ".join(new_words)
        
        # Fix Split Suffixes
        suffixes = ['லை', 'ளை', 'னை', 'ன', 'ண']
        for suf in suffixes:
            text = text.replace(f" {suf}", f"{suf}")
        
        # Specific corrections for known extraction errors
        text = text.replace("ப்பாளி மரம்", "பப்பாளி மரம்")

    # Common cleanup
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_pdf_to_json(pdf_path, output_json_path):
    print(f"Extracting from {pdf_path} using hybrid approach...")
    data = []
    
    pdf_plumber = pdfplumber.open(pdf_path)
    doc_fitz = pymupdf.open(pdf_path)
    
    try:
        for i, page_plumber in enumerate(pdf_plumber.pages):
            page_fitz = doc_fitz[i]
            print(f"Processing page {i+1}...")
            
            tables = page_plumber.find_tables()
            if not tables: continue
                
            for table in tables:
                rows = table.rows
                header_row_index = -1
                
                table_text = table.extract()
                if not table_text: continue

                for r_idx, row_text in enumerate(table_text[:3]):
                    row_str = [str(x) if x else "" for x in row_text]
                    if "No" in row_str and "D1" in row_str:
                        header_row_index = r_idx
                        break
                
                if header_row_index == -1:
                    print(f"  Skipping table on page {i+1}, no header found.")
                    continue
                
                category_info = {}
                cat_row_idx = header_row_index - 1
                if cat_row_idx >= 0:
                    cat_cell = rows[cat_row_idx].cells[0] 
                    cat_text = extract_text_from_bbox(page_fitz, cat_cell)
                    
                    if cat_text:
                        parts = cat_text.split('\n')
                        en_part = parts[0].strip()
                        ta_part = parts[1].strip() if len(parts) > 1 else ""
                        
                        en_part = en_part.replace('\xa0', ' ').strip().rstrip(',')

                        # Strategy: Find first Tamil character index for splitting mixed lines
                        tam_char_idx = -1
                        for idx, char in enumerate(en_part):
                            if '\u0b80' <= char <= '\u0bff':
                                tam_char_idx = idx
                                break
                        
                        if tam_char_idx != -1:
                             en_part_real = en_part[:tam_char_idx].strip().rstrip(',').strip()
                             ta_part_real = en_part[tam_char_idx:].strip()
                             en_part = en_part_real
                             if not ta_part:
                                 ta_part = ta_part_real
                             else:
                                 ta_part = ta_part_real + " " + ta_part
                        
                        pass # Placeholder removal
                        
                        match = re.match(r"(\d+)\s*-\s*(.+)", en_part)
                        if match:
                            category_info['id'] = match.group(1)
                            category_info['en'] = match.group(2).strip()
                        else:
                            category_info['en'] = en_part
                        
                        # Apply cleanup
                        category_info['en'] = clean_text(category_info['en'], True)
                        category_info['ta'] = clean_text(ta_part, False)
                        category_info['ta'] = clean_text(category_info.get('ta', ''), False)

                items = []
                for row in rows[header_row_index+1:]:
                    cells = row.cells
                    if not cells: continue
                    
                    # Normalize to 5 columns
                    cell_texts = [extract_text_from_bbox(page_fitz, cell) for cell in cells]
                    cell_texts += [None] * (5 - len(cell_texts))
                    
                    no_val = cell_texts[0]
                    d1_en = cell_texts[1]
                    d1_ta = cell_texts[2]
                    d2_en = cell_texts[3]
                    d2_ta = cell_texts[4]
                    
                    if not any([d1_en, d1_ta, d2_en, d2_ta]):
                        continue

                    if d1_en: d1_en = clean_text(d1_en, True)
                    if d1_ta: d1_ta = clean_text(d1_ta, False)
                    if d2_en: d2_en = clean_text(d2_en, True)
                    if d2_ta: d2_ta = clean_text(d2_ta, False)

                    items.append({
                        "no": no_val,
                        "d1": {"en": d1_en, "ta": d1_ta},
                        "d2": {"en": d2_en, "ta": d2_ta}
                    })
                
                if category_info:
                    data.append({
                        "category": category_info,
                        "words": items
                    })
                else:
                     print("  Warning: No category found for table.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        pdf_plumber.close()
        doc_fitz.close()

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Extraction complete. Saved {len(data)} categories to {output_json_path}")

if __name__ == "__main__":
    extract_pdf_to_json("TT2026-Word-List-Theni-1_2_3_4.pdf", "theni_word_list.json")
