# ============================================================
# Medicinal Plants Encyclopedia - Flask Backend
# ============================================================

from flask import Flask, render_template, jsonify, abort
import json
import os

app = Flask(__name__)

def load_plants():
    """Read plants.json and return the list of plant dicts."""
    json_path = os.path.join(os.path.dirname(__file__), "plants.json")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def calculate_statistics(plants):
    """Dynamically compute collection statistics from plants.json."""
    total_plants = len(plants)
    families = set()
    herbs = 0
    trees = 0
    shrubs = 0
    climbers = 0
    flowers = 0
    fruits = 0
    ayurvedic = 0

    for p in plants:
        fam = p.get("family", "")
        if fam:
            # Extract main family botanical name
            families.add(fam.split()[0].rstrip(",;."))

        ptype = (p.get("plant_type") or "").lower()
        if "herb" in ptype:
            herbs += 1
        if "tree" in ptype:
            trees += 1
        if "shrub" in ptype:
            shrubs += 1
        if "climber" in ptype:
            climbers += 1

        tags = [t.lower() for t in p.get("tags", [])]
        parts = [part.lower() for part in p.get("parts_used", [])]
        systems = [s.lower() for s in p.get("traditional_systems", [])]

        if "flower" in tags or any("flower" in part for part in parts):
            flowers += 1
        if "fruit" in tags or any("fruit" in part for part in parts):
            fruits += 1
        if "ayurveda" in systems or "ayurvedic" in tags:
            ayurvedic += 1

    return {
        "total_plants": total_plants,
        "total_families": len(families),
        "herbs": herbs,
        "trees": trees,
        "shrubs": shrubs,
        "climbers": climbers,
        "flowers": flowers,
        "fruits": fruits,
        "ayurvedic": ayurvedic
    }

def get_plant_relationships(current_plant, all_plants, limit=4):
    """
    Calculate an explainable botanical attribute similarity score between
    the current plant and other plants in the collection.
    
    Transparent weighted scoring criteria (Max ~100 pts):
      1. Botanical Family: 25 pts (strongest phylogenetic link)
      2. Plant Type / Growth Habit: 15 pts (structural affinity)
      3. Shared Parts Used: up to 15 pts (5 pts per matching part)
      4. Shared Traditional Systems: up to 15 pts (5 pts per system)
      5. Shared Tags & Properties: up to 15 pts (4 pts per tag)
      6. Habitat Overlap: up to 8 pts (shared ecological niche)
      7. Geographic Region Overlap: up to 7 pts (shared native range)
      
    Returns a list of dicts with:
      - plant: dict
      - similarity_score: int (45 - 98%)
      - reasons: list of 2-4 human-readable explanation strings
    """
    scored = []
    curr_id = current_plant.get("id")
    curr_fam = (current_plant.get("family") or "").split("(")[0].strip().lower()
    curr_type = (current_plant.get("plant_type") or "").strip().lower()
    curr_parts = set(p.strip().title() for p in current_plant.get("parts_used", []))
    curr_systems = set(s.strip().title() for s in current_plant.get("traditional_systems", []))
    curr_tags = set(t.strip().lower() for t in current_plant.get("tags", []))
    curr_hab = (current_plant.get("habitat") or "").lower()
    curr_reg = (current_plant.get("region") or "").lower()

    for p in all_plants:
        if p.get("id") == curr_id:
            continue

        raw_score = 0
        reasons = []

        # 1. Botanical Family (25 pts)
        p_fam_raw = p.get("family") or ""
        p_fam = p_fam_raw.split("(")[0].strip().lower()
        if curr_fam and p_fam and curr_fam == p_fam:
            raw_score += 25
            fam_clean = p_fam_raw.split("(")[0].strip()
            reasons.append(f"Same botanical family: {fam_clean}")

        # 2. Plant Type / Growth Form (15 pts)
        p_type = (p.get("plant_type") or "").strip().lower()
        if curr_type and p_type and curr_type == p_type:
            raw_score += 15
            type_label = curr_type.capitalize()
            reasons.append(f"Both are {type_label}s")

        # 3. Medicinal Parts Used (up to 15 pts)
        p_parts = set(part.strip().title() for part in p.get("parts_used", []))
        shared_parts = curr_parts.intersection(p_parts)
        if shared_parts:
            pts = min(len(shared_parts) * 5, 15)
            raw_score += pts
            reasons.append(f"Shared plant parts: {', '.join(sorted(shared_parts)[:2])}")

        # 4. Traditional Medical Systems (up to 15 pts)
        p_systems = set(s.strip().title() for s in p.get("traditional_systems", []))
        shared_sys = curr_systems.intersection(p_systems)
        if shared_sys:
            pts = min(len(shared_sys) * 5, 15)
            raw_score += pts
            reasons.append(f"Shared traditional systems: {', '.join(sorted(shared_sys)[:2])}")

        # 5. Shared Botanical & Therapeutic Tags (up to 15 pts)
        p_tags = set(t.strip().lower() for t in p.get("tags", []))
        shared_tags = curr_tags.intersection(p_tags)
        # Exclude basic growth habits already handled above
        meaningful_tags = {t for t in shared_tags if t not in ["herb", "tree", "shrub", "climber"]}
        if meaningful_tags:
            pts = min(len(meaningful_tags) * 4, 15)
            raw_score += pts
            formatted = ", ".join(t.capitalize() for t in sorted(meaningful_tags)[:2])
            reasons.append(f"Shared attributes: {formatted}")

        # 6. Ecological Habitat Overlap (up to 8 pts)
        p_hab = (p.get("habitat") or "").lower()
        hab_keywords = ["tropical", "forest", "deciduous", "moist", "arid", "dry", "himalayan", "riverbanks", "gardens", "subtropical", "cultivated"]
        matched_hab = [w for w in hab_keywords if w in curr_hab and w in p_hab]
        if matched_hab:
            raw_score += 8
            reasons.append(f"Similar habitat: {matched_hab[0].capitalize()} zone")

        # 7. Geographic Native Range (up to 7 pts)
        p_reg = (p.get("region") or "").lower()
        reg_keywords = ["western ghats", "himalayas", "tropical india", "pan-india", "karnataka", "deccan", "peninsular"]
        matched_reg = [w for w in reg_keywords if w in curr_reg and w in p_reg]
        if matched_reg:
            raw_score += 7
            reasons.append(f"Overlapping native range: {matched_reg[0].title()}")

        # Ensure at least 2 clear explanation reasons
        if len(reasons) < 2:
            reasons.append("Shared traditional Indian flora usage")

        # Normalized Relationship Score (scaled between 45% and 98%)
        rel_score = min(max(int(raw_score), 45), 98)

        scored.append({
            "plant": p,
            "similarity_score": rel_score,
            "reasons": reasons[:4]
        })

    # Sort descending by similarity score, breaking ties by plant name
    scored.sort(key=lambda x: (x["similarity_score"], x["plant"]["name"]), reverse=True)
    return scored[:limit]

def get_related_plants(current_plant, all_plants, limit=4):
    """Backward-compatible helper returning list of plant dictionaries."""
    rels = get_plant_relationships(current_plant, all_plants, limit=limit)
    return [item["plant"] for item in rels]

# Homepage - shows all plant cards and dynamic collection statistics
@app.route("/")
def index():
    plants = load_plants()
    stats = calculate_statistics(plants)
    return render_template("index.html", plants=plants, stats=stats)

# Plant detail page
@app.route("/plant/<int:plant_id>")
def plant_detail(plant_id):
    plants = load_plants()
    plant = next((p for p in plants if p["id"] == plant_id), None)
    if plant is None:
        abort(404)
    relationships = get_plant_relationships(plant, plants, limit=4)
    return render_template("plant.html", plant=plant, related_plants=relationships)

# Quiz page
@app.route("/quiz")
def quiz():
    plants = load_plants()
    return render_template("quiz.html", plants=plants)

# JSON API endpoints
@app.route("/api/plants")
def api_plants():
    return jsonify(load_plants())

@app.route("/api/stats")
def api_stats():
    plants = load_plants()
    return jsonify(calculate_statistics(plants))

if __name__ == "__main__":
    app.run(debug=True)

