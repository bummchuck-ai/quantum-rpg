import json

def clean_talent_data(input_file_path, output_file_path):
    print(f"Starting clean_talent_data for input: {input_file_path}")
    with open(input_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded {len(data)} career entries.")

    cleaned_data = []

    for career_entry in data:
        print(f"Processing career: {career_entry.get('career', 'N/A')}, specialization: {career_entry.get('specialization', 'N/A')}")
        
        talents_by_row = {}
        for talent in career_entry["talents"]:
            row = talent["row"]
            if row not in talents_by_row:
                talents_by_row[row] = []
            talents_by_row[row].append(talent)
        
        # Sort talents within each row by column to ensure correct order for merging
        for row in talents_by_row:
            talents_by_row[row].sort(key=lambda x: x["col"])

        cleaned_talents = []
        processed_coords = set() # To avoid processing already merged talents

        for row in sorted(talents_by_row.keys()):
            talents_in_row = talents_by_row[row]
            
            i = 0
            while i < len(talents_in_row):
                current_talent_data = talents_in_row[i]
                
                if (current_talent_data["row"], current_talent_data["col"]) in processed_coords:
                    i += 1
                    continue

                merged_name = current_talent_data["name"].strip().replace("   ", " ")
                merged_description = current_talent_data["description"].strip().replace("   ", " ")
                
                initial_cost = current_talent_data["cost"]
                initial_isRanked = current_talent_data["isRanked"]

                j = i + 1
                while j < len(talents_in_row):
                    next_talent_data = talents_in_row[j]
                    
                    if next_talent_data["col"] == current_talent_data["col"] + (j - i): # Check for direct horizontal adjacency
                        can_merge = False
                        
                        # Heuristics for merging:
                        # 1. Current name ends with a hyphen or a backslash (indicating split)
                        if merged_name.endswith('-') or merged_name.endswith('\\'):
                            can_merge = True
                        
                        # 2. Current description is empty, or ends with a hyphen/backslash, and next one has content
                        if (merged_description == "" and next_talent_data["description"].strip() != "") or \
                           ((merged_description.endswith('-') or merged_description.endswith('\\')) and next_talent_data["description"].strip() != ""):
                            can_merge = True
                        
                        # Additional heuristic: If the current name is very short (e.g., < 3 chars and not a common short word) and next_talent_data name has content
                        # This is to catch things like "rie, leichte Fernkampfwaffen" but requires a more sophisticated word parsing
                        # For now, stick to simpler, more reliable indicators.

                        if can_merge:
                            # Merge name
                            if merged_name.endswith('-') or merged_name.endswith('\\'):
                                merged_name = merged_name[:-1].strip()
                            merged_name += " " + next_talent_data["name"].strip().replace("   ", " ")

                            # Merge description
                            if merged_description.endswith('-') or merged_description.endswith('\\'):
                                merged_description = merged_description[:-1].strip()
                            
                            # Only add description if it's not a duplicate of what's already there or significantly different
                            if next_talent_data["description"].strip() != "" and next_talent_data["description"].strip() not in merged_description:
                                if merged_description == "":
                                    merged_description = next_talent_data["description"].strip().replace("   ", " ")
                                else:
                                    merged_description += " " + next_talent_data["description"].strip().replace("   ", " ")
                            
                            processed_coords.add((next_talent_data["row"], next_talent_data["col"]))
                            j += 1
                        else:
                            break # No more logical continuation for this talent
                    else:
                        break # Not a direct horizontal continuation

                # Add the consolidated talent
                cleaned_talents.append({
                    "name": merged_name.strip(),
                    "cost": initial_cost,
                    "description": merged_description.strip(),
                    "isRanked": initial_isRanked,
                    "row": current_talent_data["row"], # Keep original row for the start of the merged talent
                    "col": current_talent_data["col"]  # Keep original col for the start of the merged talent
                })
                i = j # Move to the next unprocessed talent

        # Update the talents list of the current career_entry with the cleaned talents
        career_entry["talents"] = cleaned_talents
        cleaned_data.append(career_entry)

    with open(output_file_path, 'w', encoding='utf-8') as f:
        json.dump(cleaned_data, f, indent=2, ensure_ascii=False)

clean_talent_data('data/json/talents_final.json', 'data/json/talents_cleaned.json')