import argparse
import os
import sys
from slide_builder import generate_html_slides

def main():
    parser = argparse.ArgumentParser(description="Agent to convert CSV word list to HTML slide deck.")
    parser.add_argument("input_csv", help="Path to the input CSV file.")
    parser.add_argument("--output", help="Path to the output HTML file.")

    args = parser.parse_args()

    input_csv = args.input_csv
    input_path = None

    # Resolution Logic
    if os.path.exists(input_csv):
        input_path = input_csv
    elif os.path.exists(os.path.join("resources", "artifacts", input_csv)):
        input_path = os.path.join("resources", "artifacts", input_csv)
    else:
        print(f"Error: Input CSV '{input_csv}' not found in current directory or 'resources/artifacts'.")
        sys.exit(1)

    # Output Resolution
    if args.output:
        output_path = args.output
        out_dir = os.path.dirname(output_path)
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)
    else:
        # Default to resources/artifacts/<name>.html
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        output_dir = os.path.join("resources", "artifacts")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{base_name}.html")

    try:
        generate_html_slides(input_path, output_path)
        print(f"Successfully generated slide deck at: {output_path}")
    except Exception as e:
        print(f"Error generating slides: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
