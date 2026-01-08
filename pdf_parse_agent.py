import argparse
import os
import sys
from pdf_parser import extract_pdf_to_json, json_to_csv

def main():
    parser = argparse.ArgumentParser(description="Agent to convert PDF to JSON or CSV.")
    parser.add_argument("input_file", help="Path to the input PDF file.")
    parser.add_argument("--format", choices=["json", "csv"], default="json", help="Output format (default: json).")
    parser.add_argument("--output", help="Path to the output file. If not provided, defaults to input filename with new extension.")

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
        # Ensure directory exists if path has dirs
        out_dir = os.path.dirname(output_path)
        if out_dir and not os.path.exists(out_dir):
            os.makedirs(out_dir, exist_ok=True)
    else:
        # Default to resources/artifacts
        output_dir = os.path.join("resources", "artifacts")
        os.makedirs(output_dir, exist_ok=True)
        ext = "json" if args.format == "json" else "csv"
        output_path = os.path.join(output_dir, f"{base_name}.{ext}")

    if args.format == "json":
        if not output_path:
             # Should be handled above, but for safety
             output_path = f"{base_name}.json"
        
        try:
            print(f"Starting conversion: {input_path} -> {output_path} (JSON)")
            extract_pdf_to_json(input_path, output_path)
            print(f"Successfully created {output_path}")
        except Exception as e:
            print(f"Error during JSON extraction: {e}")
            sys.exit(1)

    elif args.format == "csv":
        if not output_path:
             output_path = f"{base_name}.csv"
        
        # Intermediate JSON
        temp_json = output_path.replace(".csv", "_temp.json")
        try:
            print(f"Starting conversion: {input_path} -> {output_path} (CSV)")
            # First extract to temp JSON
            extract_pdf_to_json(input_path, temp_json)
            # Then convert to CSV
            json_to_csv(temp_json, output_path)
            print(f"Successfully created {output_path}")
        except Exception as e:
             print(f"Error during CSV conversion: {e}")
             if os.path.exists(temp_json):
                 os.remove(temp_json)
             sys.exit(1)
        finally:
            # Cleanup temp if it exists
            if os.path.exists(temp_json):
                os.remove(temp_json)

if __name__ == "__main__":
    main()
