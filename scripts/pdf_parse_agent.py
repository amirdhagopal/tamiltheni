import argparse
import os
import sys
from pdf_parser import extract_pdf_to_csv

def main():
    parser = argparse.ArgumentParser(description="Agent to convert PDF word lists directly to CSV.")
    parser.add_argument("input_file", help="Path to the input PDF file.")
    parser.add_argument("--output", help="Path to the output CSV file. Defaults to resources/artifacts/.")

    args = parser.parse_args()

    input_file = args.input_file
    # Check if file exists as is
    if os.path.exists(input_file):
        input_path = input_file
    # Check in resources/input
    elif os.path.exists(os.path.join("resources", "input", input_file)):
        input_path = os.path.join("resources", "input", input_file)
    else:
        print(f"Error: Input file '{input_file}' not found in current directory or 'resources/input'.")
        sys.exit(1)

    base_name = os.path.splitext(os.path.basename(input_path))[0]
    
    if args.output:
        output_path = args.output
        out_dir = os.path.dirname(output_path)
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)
    else:
        # Default to resources/artifacts
        output_dir = os.path.join("resources", "artifacts")
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"{base_name}.csv")

    try:
        print(f"Starting direct conversion: {input_path} -> {output_path}")
        extract_pdf_to_csv(input_path, output_path)
        print(f"Successfully created {output_path}")
    except Exception as e:
        print(f"Error during CSV extraction: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
