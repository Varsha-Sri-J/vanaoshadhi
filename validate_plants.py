#!/usr/bin/env python3
"""
VanaOshadhi — Plant Database Validator
Validates plants.json against schema, uniqueness, image paths, and completeness.
"""

import os
import sys
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PLANTS_JSON = os.path.join(BASE_DIR, "plants.json")
IMAGES_DIR = os.path.join(BASE_DIR, "static", "images")

# Minimum required keys for backwards compatibility and rich schema
REQUIRED_KEYS = [
    "id",
    "name",
    "scientific_name",
    "kannada_name",
    "hindi_name",
    "family",
    "plant_type",
    "region",
    "use",
    "use_kannada",
    "fun_fact",
    "also_known_as",
    "taste",
    "parts_used",
    "images"
]

def validate():
    print("=" * 60)
    print("🌿 VanaOshadhi — Medicinal Plants Database Validator")
    print("=" * 60)

    # 1. Check file existence
    if not os.path.exists(PLANTS_JSON):
        print(f"❌ ERROR: {PLANTS_JSON} does not exist.")
        sys.exit(1)

    # 2. Check JSON validity
    try:
        with open(PLANTS_JSON, "r", encoding="utf-8") as f:
            plants = json.load(f)
    except Exception as e:
        print(f"❌ JSON PARSE ERROR: {e}")
        sys.exit(1)

    if not isinstance(plants, list):
        print("❌ ERROR: plants.json root must be a JSON array.")
        sys.exit(1)

    total_plants = len(plants)
    print(f"✓ Valid JSON format detected ({total_plants} plants found)")

    # 3. Uniqueness checks
    ids_seen = set()
    names_seen = set()
    sci_names_seen = set()
    duplicate_ids = []
    duplicate_names = []
    duplicate_sci_names = []

    for p in plants:
        p_id = p.get("id")
        p_name = p.get("name", "").strip().lower()
        p_sci = p.get("scientific_name", "").strip().lower()

        if p_id in ids_seen:
            duplicate_ids.append(p_id)
        else:
            ids_seen.add(p_id)

        if p_name in names_seen:
            duplicate_names.append(p.get("name"))
        else:
            names_seen.add(p_name)

        if p_sci in sci_names_seen:
            duplicate_sci_names.append(p.get("scientific_name"))
        else:
            sci_names_seen.add(p_sci)

    if duplicate_ids:
        print(f"❌ DUPLICATE IDs found: {duplicate_ids}")
    else:
        print(f"✓ All {len(ids_seen)} plant IDs are unique")

    if duplicate_names:
        print(f"❌ DUPLICATE Common Names found: {duplicate_names}")
    else:
        print(f"✓ No duplicate common names found")

    if duplicate_sci_names:
        print(f"⚠ DUPLICATE Scientific Names found: {duplicate_sci_names}")
    else:
        print(f"✓ No duplicate scientific names found")

    # 4. Required fields and data completeness
    missing_fields_report = {}
    for p in plants:
        p_id = p.get("id", "Unknown")
        for key in REQUIRED_KEYS:
            if key not in p or p[key] is None or (isinstance(p[key], str) and not p[key].strip()):
                missing_fields_report.setdefault(key, []).append(f"ID {p_id} ({p.get('name')})")

    if missing_fields_report:
        print("\n⚠ MISSING OR EMPTY FIELDS:")
        for key, plant_list in missing_fields_report.items():
            print(f"   • {key}: {len(plant_list)} plants (e.g. {', '.join(plant_list[:3])})")
    else:
        print(f"✓ All {len(REQUIRED_KEYS)} core fields present and populated across all plants")

    # 5. Image references checks
    existing_images = set(os.listdir(IMAGES_DIR)) if os.path.exists(IMAGES_DIR) else set()
    total_image_refs = 0
    found_images = 0
    missing_images = []
    placeholder_count = 0

    for p in plants:
        images = p.get("images", [])
        if not images:
            missing_images.append((p.get("name"), "No image array"))
            continue

        for img in images:
            total_image_refs += 1
            if img == "placeholder.svg":
                placeholder_count += 1
            elif img in existing_images:
                found_images += 1
            else:
                missing_images.append((p.get("name"), img))

    print(f"\n🖼 IMAGE AUDIT:")
    print(f"   • Total image references: {total_image_refs}")
    print(f"   • Real custom photos found on disk: {found_images}")
    print(f"   • Clean placeholder fallbacks: {placeholder_count}")

    if missing_images:
        print(f"   ❌ Missing image files referenced ({len(missing_images)}):")
        for name, img in missing_images[:10]:
            print(f"      - {name}: {img}")
    else:
        print("   ✓ All referenced image files exist on disk (zero broken file paths)")

    # 6. Overall result
    has_errors = bool(duplicate_ids or duplicate_names or missing_images)
    print("\n" + "=" * 60)
    if has_errors:
        print("❌ VALIDATION FAILED with errors above.")
        sys.exit(1)
    else:
        print(f"✓ VALIDATION SUCCESSFUL: {total_plants} plants ready and verified.")
        print("=" * 60)

if __name__ == "__main__":
    validate()
