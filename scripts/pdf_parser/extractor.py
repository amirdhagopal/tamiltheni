import pdfplumber
import pymupdf  # fitz
import csv
import re
import unicodedata
import os

def extract_text_from_bbox(page_fitz, bbox):
    """
    Extracts text from a specific bounding box using PyMuPDF.
    bbox: (x0, top, x1, bottom) from pdfplumber.
    """
    x0, top, x1, bottom = bbox
    # Shrink bbox slightly to avoid border noise
    rect = pymupdf.Rect(x0 + 1, top + 1, x1 - 1, bottom - 1)
    return page_fitz.get_text("text", clip=rect).strip()

def clean_text(text, is_english=True):
    if not text: return None
    text = text.replace('\n', ' ')
    
    if is_english:
        # Remove Tamil characters from English fields
        text = re.sub(r'[\u0B80-\u0BFF]', '', text)
    else:
        # Tamil field: Remove isolated combining marks
        text = re.sub(r'(?:^|\s)[\u0BBE-\u0BD7]+', ' ', text)
        
        # Fix duplicate ghost consonants
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
        
        # Specific corrections
        text = text.replace("ப்பாளி மரம்", "பப்பாளி மரம்")
        text = text.replace("ப்பாளிப்பழம்", "பப்பாளிப்பழம்")
        text = text.replace("பாறுமை", "பொறுமை") # Found in sample verify
        text = text.replace("ெபாறுமை", "பொறுமை")

    # Common cleanup
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_pdf_to_csv(pdf_path, output_csv_path):
    print(f"Extracting directly from {pdf_path} to CSV...")
    
    all_rows = []
    
    pdf_plumber = pdfplumber.open(pdf_path)
    doc_fitz = pymupdf.open(pdf_path)
    
    try:
        for i, page_plumber in enumerate(pdf_plumber.pages):
            page_fitz = doc_fitz[i]
            print(f"  Processing page {i+1}...")
            
            tables = page_plumber.find_tables()
            if not tables: continue
                
            for table in tables:
                rows = table.rows
                header_row_index = -1
                
                table_text = table.extract()
                if not table_text: continue

                # Identify header row
                for r_idx, row_text in enumerate(table_text[:3]):
                    row_str = [str(x) if x else "" for x in row_text]
                    if "No" in row_str and "D1" in row_str:
                        header_row_index = r_idx
                        break
                
                if header_row_index == -1:
                    continue
                
                # Extract Category Info
                category_info = {'id': '', 'en': '', 'ta': ''}
                cat_row_idx = header_row_index - 1
                if cat_row_idx >= 0:
                    cat_cell = rows[cat_row_idx].cells[0] 
                    cat_text = extract_text_from_bbox(page_fitz, cat_cell)
                    
                    if cat_text:
                        parts = cat_text.split('\n')
                        en_part = parts[0].strip().replace('\xa0', ' ').rstrip(',')
                        ta_part = parts[1].strip() if len(parts) > 1 else ""
                        
                        # Handle mixed en/ta in same line
                        tam_char_idx = -1
                        for idx, char in enumerate(en_part):
                            if '\u0b80' <= char <= '\u0bff':
                                tam_char_idx = idx
                                break
                        
                        if tam_char_idx != -1:
                             en_part_real = en_part[:tam_char_idx].strip().rstrip(',').strip()
                             ta_part_real = en_part[tam_char_idx:].strip()
                             en_part = en_part_real
                             ta_part = (ta_part_real + " " + ta_part).strip()
                        
                        # Extract ID
                        id_match = re.match(r"(\d+)\s*-\s*(.+)", en_part)
                        if id_match:
                            category_info['id'] = id_match.group(1)
                            category_info['en'] = id_match.group(2).strip()
                        else:
                            category_info['en'] = en_part
                        
                        category_info['en'] = clean_text(category_info['en'], True)
                        category_info['ta'] = clean_text(ta_part, False)

                # Extract Word Data
                for row in rows[header_row_index+1:]:
                    cells = row.cells
                    if not cells: continue
                    
                    cell_texts = [extract_text_from_bbox(page_fitz, cell) for cell in cells]
                    cell_texts += [None] * (5 - len(cell_texts))
                    
                    s_no = cell_texts[0]
                    d1_en = clean_text(cell_texts[1], True)
                    d1_ta = clean_text(cell_texts[2], False)
                    d2_en = clean_text(cell_texts[3], True)
                    d2_ta = clean_text(cell_texts[4], False)
                    
                    # D1 Row
                    if d1_en or d1_ta:
                        all_rows.append({
                            "Category_Id": category_info['id'],
                            "Difficulty": "D1",
                            "SNo": s_no,
                            "English": d1_en,
                            "Tamil": d1_ta,
                            "Category_Name": category_info['en'],
                            "Category_Name_Tamil": category_info['ta']
                        })
                    
                    # D2 Row
                    if d2_en or d2_ta:
                        all_rows.append({
                            "Category_Id": category_info['id'],
                            "Difficulty": "D2",
                            "SNo": s_no,
                            "English": d2_en,
                            "Tamil": d2_ta,
                            "Category_Name": category_info['en'],
                            "Category_Name_Tamil": category_info['ta']
                        })

    except Exception as e:
        print(f"An error occurred during extraction: {e}")
    finally:
        pdf_plumber.close()
        doc_fitz.close()

    # Sort by Category_Id (numeric) and Difficulty
    all_rows.sort(key=lambda x: (int(x['Category_Id']) if x['Category_Id'] and x['Category_Id'].isdigit() else 999, x['Difficulty']))

    # Add Sequence Numbers
    for idx, row in enumerate(all_rows, start=1):
        row["Sequence"] = idx
        
    # Write to CSV
    headers = ["Sequence", "Category_Id", "Difficulty", "SNo", "English", "Tamil", "Category_Name", "Category_Name_Tamil"]
    
    print(f"Writing {len(all_rows)} rows to {output_csv_path}...")
    with open(output_csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(all_rows)
    
    print("Done.")

if __name__ == "__main__":
    # Test call
    test_pdf = os.path.join("resources", "input", "TT2026-Word-List-Theni-1_2_3_4.pdf")
    test_csv = os.path.join("resources", "artifacts", "test_output.csv")
    if os.path.exists(test_pdf):
        extract_pdf_to_csv(test_pdf, test_csv)
    else:
        print("Test PDF not found, skipping standalone test.")
