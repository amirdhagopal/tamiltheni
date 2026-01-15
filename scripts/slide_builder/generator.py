import csv
import os
import html

def generate_html_slides(csv_path, output_html_path):
    print(f"Reading CSV from {csv_path}...")
    slides = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            slides.append(row)

    if not slides:
        print("No data found in CSV.")
        return

    # Generate slides content
    slides_html = ""
    for idx, row in enumerate(slides):
        active_class = " active" if idx == 0 else ""
        
        # Safe get for fields
        sequence = row.get('Sequence', str(idx + 1))  # Use Sequence from CSV, fallback to idx+1
        sno = row.get('SNo', '')
        cat_name = row.get('Category_Name', '')
        cat_name_ta = row.get('Category_Name_Tamil')
        diff = row.get('Difficulty', '')
        word_en = row.get('English', '')
        word_ta = row.get('Tamil', '')



        # Image logic - handled by client side JS via Wikipedia API
        # We just provide the word in data-word attribute
        # Placeholder image while loading
        placeholder = "https://placehold.co/400x300?text=Loading..."

        slides_html += f"""
        <div class="slide{active_class}" id="slide-{int(sequence) - 1}">
            <div class="category-badge">{html.escape(cat_name)}</div>
            <div class="category-badge-ta">{html.escape(cat_name_ta)}</div>
            
            <div class="sno-badge">{sno}</div>
            <div class="difficulty-badge">{html.escape(diff)}</div>

            <div class="word-en">{html.escape(word_en)}</div>
            
            <div class="image-container">
                <img src="{placeholder}" data-word="{html.escape(word_en)}" alt="{html.escape(word_en)}" class="slide-image">
            </div>

            <div class="word-ta">{html.escape(word_ta)}</div>
        </div>
        """

    # Read template
    template_path = os.path.join(os.path.dirname(__file__), 'template.html')
    if not os.path.exists(template_path):
        print(f"Error: Template file not found at {template_path}")
        return

    with open(template_path, 'r', encoding='utf-8') as f:
        template_content = f.read()

    # Inject content
    final_html = template_content.replace('<!-- SLIDES_PLACEHOLDER -->', slides_html)
    final_html = final_html.replace('// TOTAL_SLIDES_PLACEHOLDER', f'const totalSlides = {len(slides)};')

    print(f"Writing HTML to {output_html_path}...")
    with open(output_html_path, 'w', encoding='utf-8') as f:
        f.write(final_html)
    print("Done.")
