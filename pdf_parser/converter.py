import json
import csv

def json_to_csv(json_path, csv_path):
    print(f"Reading {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    headers = ["Category_Id", "Difficulty", "SNo", "English", "Tamil", "Category_Name", "Category_Name_Tamil"]
    
    rows = []
    
    for category_entry in data:
        cat_info = category_entry.get('category', {})
        cat_id = cat_info.get('id', '')
        cat_name_en = cat_info.get('en', '')
        cat_name_ta = cat_info.get('ta', '')
        
        for word in category_entry.get('words', []):
            s_no = word.get('no', '')
            
            # Process D1
            d1 = word.get('d1', {})
            if d1 and (d1.get('en') or d1.get('ta')):
                rows.append({
                    "Category_Id": cat_id,
                    "Difficulty": "D1",
                    "SNo": s_no,
                    "English": d1.get('en', ''),
                    "Tamil": d1.get('ta', ''),
                    "Category_Name": cat_name_en,
                    "Category_Name_Tamil": cat_name_ta
                })
            
            # Process D2
            d2 = word.get('d2', {})
            if d2 and (d2.get('en') or d2.get('ta')):
                rows.append({
                    "Category_Id": cat_id,
                    "Difficulty": "D2",
                    "SNo": s_no,
                    "English": d2.get('en', ''),
                    "Tamil": d2.get('ta', ''),
                    "Category_Name": cat_name_en,
                    "Category_Name_Tamil": cat_name_ta
                })
                
    print(f"Writing {len(rows)} rows to {csv_path}...")
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=headers)
        writer.writeheader()
        writer.writerows(rows)
        
    print("Done.")

if __name__ == "__main__":
    json_to_csv("theni_word_list.json", "theni_word_list.csv")
