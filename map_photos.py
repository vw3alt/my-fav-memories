import os
import json
import re

def generate_image_json(folder_path):
    # Mapping for month abbreviations to full names
    month_map = {
        "jan": "January", "feb": "February", "mar": "March", "apr": "April",
        "may": "May", "jun": "June", "jul": "July", "aug": "August",
        "sep": "September", "oct": "October", "nov": "November", "dec": "December"
    }

    image_data = []
    
    # Regex to capture month (3 letters), year (2 digits), and the rest of the name
    # Example: apr_24_IMG_4605.JPG
    pattern = re.compile(r'^([a-zA-Z]{3})_(\d{2})_(.*)$')

    # Iterate through the files in the directory
    for filename in os.listdir(folder_path):
        match = pattern.match(filename)
        if match:
            month_abbr = match.group(1).lower()
            year_short = match.group(2)
            
            # Construct full month and year (assuming 20xx)
            month_full = month_map.get(month_abbr, month_abbr.capitalize())
            year_full = f"20{year_short}"
            
            image_data.append({
                "image": filename,
                "month": month_full,
                "year": year_full
            })

    # Sort by filename to keep the JSON organized
    image_data.sort(key=lambda x: x['image'])

    # Write to JSON file
    with open('public/memories.json', 'w') as f:
        json.dump(image_data, f, indent=2)

    print(f"Successfully generated photos.json with {len(image_data)} entries.")

# Usage
generate_image_json('public/photos')