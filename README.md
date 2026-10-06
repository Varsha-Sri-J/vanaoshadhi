# 🌿 VanaOshadhi — Medicinal Plants Encyclopedia
### A Comprehensive Digital Botanical & Ayurvedic Knowledge Platform
*Flask + Python + Vanilla Modern Frontend*

---

## 📖 OVERVIEW

**VanaOshadhi** (ವನೌಷಧಿ) is an interactive, bilingual (English & Kannada) digital encyclopedia of **80 medicinal plants**, featuring rich botanical classifications, Ayurvedic properties, phytochemical compounds, cultivation profiles, safety guidance, and interactive quizzes.

Originally built as a foundational educational prototype, VanaOshadhi has been expanded into an authoritative, fast, lightweight botanical reference with zero external database dependencies.

---

## 📁 PROJECT STRUCTURE

```text
medicinal-plants/
├── app.py                  ← Flask backend (dynamic stats, related plants, routes & JSON APIs)
├── plants.json             ← Curated database of 80 medicinal plants (25 fields each)
├── validate_plants.py      ← Database integrity & image verification test script
├── requirements.txt        ← Python dependencies (Flask >= 2.3.0)
│
├── static/
│   ├── style.css           ← Modern responsive styles (dark glassmorphism, botanical palette)
│   ├── script.js           ← Search, multi-criteria filtering, local favorites, quiz engine, gallery
│   └── images/
│       ├── placeholder.svg ← Clean botanical SVG fallback for plants without local photos
│       ├── tulsi1.jpg      ← 49 real plant photos across 13 core plants
│       ├── neem1.jpg
│       └── ...
│
└── templates/
    ├── index.html          ← Homepage (dynamic stats hero, search, category/part filters, card grid)
    ├── plant.html          ← Plant detail page (3-image gallery, quick facts, growing grid, safety, related plants)
    └── quiz.html           ← Configurable quiz (Easy/Medium/Hard, 5/10/15 questions, score ring)
```

---

## 🚀 HOW TO RUN

### Step 1 — Verify Python Installation
Python 3.8+ is recommended:
```bash
python3 --version
```

### Step 2 — Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3 — Verify Database Integrity (Optional but Recommended)
Run the built-in validator to confirm 100% integrity across all 80 plants and images:
```bash
python3 validate_plants.py
```

### Step 4 — Launch the Application
```bash
python3 app.py
```

### Step 5 — Open in Browser
Visit: **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 📊 DATABASE & BOTANICAL METRICS

The application dynamically computes collection statistics directly from `plants.json`:

- **Total Documented Plants:** 80
- **Botanical Families:** 44 distinct families (*Lamiaceae, Meliaceae, Zingiberaceae, Fabaceae, Asteraceae, etc.*)
- **Growth Habits:** 35 Herbs, 26 Trees, 11 Shrubs, 8 Climbers
- **Therapeutic Coverage:** 74 Ayurvedic & traditional system plants, 15 medicinal flowers, 16 medicinal fruits
- **Bilingual Coverage:** 100% English, Kannada (*ಕನ್ನಡ*), and Hindi (*हिन्दी*) names documented

---

## 🌿 PLANT DATA SCHEMA (25 Fields)

Each entry in `plants.json` conforms to a rigorous botanical schema:

| Field | Type | Description |
|---|---|---|
| `id` | Integer | Unique identifier (1 to 80) |
| `name` | String | Common English botanical name |
| `scientific_name` | String | Latin binominal nomenclature (*e.g., Ocimum sanctum*) |
| `kannada_name` | String | Authentic Kannada name in Kannada script (*e.g., ತುಳಸಿ*) |
| `hindi_name` | String | Authentic Hindi name in Devanagari script (*e.g., तुलसी*) |
| `family` | String | Botanical family with classical synonym (*e.g., Lamiaceae (Mint family)*) |
| `plant_type` | String | Growth habit (*Herb, Tree, Shrub, Woody climber*) |
| `region` | String | Geographic native range and Indian state presence |
| `origin` | String | Botanical geographical origin |
| `habitat` | String | Natural ecosystem (*Tropical forests, riverbanks, cultivated*) |
| `parts_used` | Array | Plant parts used medicinally (*Leaves, Root, Bark, Seeds, etc.*) |
| `use` | String | Comprehensive description of traditional medicinal uses in English |
| `use_kannada` | String | Comprehensive medicinal use description in Kannada |
| `fun_fact` | String | Intriguing botanical or cultural fact (revealed on card click/hover) |
| `also_known_as` | String | Vernacular synonyms and Sanskrit names |
| `taste` | String | Ayurvedic Rasa / taste profile (*Bitter, Pungent, Sweet, Astringent*) |
| `traditional_systems` | Array | Medical traditions (*Ayurveda, Siddha, Unani, Folk medicine*) |
| `traditional_uses` | Array | Bulleted list of documented historical indications |
| `traditional_preparations`| Array | Preparations (*Decoction/Kashaya, Paste/Lepa, Churna, Oil/Taila*) |
| `key_compounds` | Array | Documented phytochemicals (*Eugenol, Curcumin, Withanolides, etc.*) |
| `growing` | Object | Cultivation parameters: `soil`, `sunlight`, `watering`, `climate` |
| `safety_notes` | String | Documented contraindications, pregnancy warnings, or cautions |
| `tags` | Array | Categorical tags for multi-dimensional search & filtering |
| `references` | Array | Classical texts (*Charaka Samhita, Sushruta Samhita, Bhavaprakasha, etc.*) |
| `images` | Array | Relative paths in `static/images/` with fallback to `placeholder.svg` |

---

## ✨ KEY FEATURES

### 1. 🏠 Dynamic Homepage & Hero Statistics
- Real-time counters dynamically computed on server startup: Total Plants, Botanical Families, Herbs, Trees, Shrubs, Climbers, and Ayurvedic Plants.
- Prominent AYUSH / botanical education disclaimer banner.

### 2. 🔍 Multi-Field Live Search
- Search across English names, Kannada names, Hindi names, scientific names, botanical families, uses, and tags with real-time feedback.
- Instant "Clear search" (`×`) button and matching results counter (*"Showing X of 80 plants"*).

### 3. 🏷️ Category & Plant-Part Filtering
- **Category Chips:** All Plants, Herbs, Trees, Shrubs, Climbers, Flowers, Fruits, Ayurveda, and **⭐ My Favorites**.
- **Plant-Part Pills:** Leaves, Roots, Bark, Seeds, Flowers, Fruits.
- Combinable search and filters with an intuitive zero-results empty state.

### 4. ⭐ Client-Side Bookmarks ("My Favorites")
- Star bookmark button on every plant card and detail page.
- Persistent via browser `localStorage` (`vanaOshadhiFavorites`).
- Dedicated filter chip instantly displays bookmarked plants.

### 5. 🌿 Rich Botanical Detail Page
- **Visuals:** 3-image thumbnail gallery with keyboard arrow navigation and full-screen view.
- **Quick Facts Bar:** Scientific name, botanical family, Kannada/Hindi names, parts used, taste profile, and traditional systems.
- **Structured Sections:**
  - Overview & Traditional Use (bilingual toggle support)
  - Documented Traditional Uses
  - Traditional Preparations (Kashaya, Lepa, Churna, etc.)
  - Key Phytochemical Compounds
  - Habitat & Geographic Distribution
  - Growing & Cultivation Profile (Soil, Sunlight, Watering, Climate)
  - ⚠️ Safety Precautions & Guidance
  - 📚 Classical Ayurvedic References
  - Interactive "Fun Fact" secret reveal card
- **Explainable Plant Relationship Engine:** Transparent weighted attribute similarity system computing relationship scores (45%–98%) and generating 2–4 human-readable reasons (shared botanical family, growth habit, parts used, traditional systems, tags, habitat, and native range).
- **Interactive Plant Knowledge Network:** Responsive SVG graph centered on the focus plant displaying connected flora nodes with connecting lines, match percentages, hover cards, and one-click navigation.

### 6. 🧠 Configurable Botanical Quiz
- **Difficulty Modes:** Easy (common names & uses), Medium (scientific names & families), Hard (phytochemicals, taste profiles, Sanskrit names).
- **Question Counts:** Choose 5, 10, or 15 questions.
- **Image Identification:** Automatically excludes placeholders and tests genuine plant photography.
- **Live Progress & Scoring:** Visual progress bar, question-by-question feedback with explanations, and animated SVG score ring with performance tiers.

### 7. 🇮🇳 Bilingual Support (English ↔ Kannada)
- Instant toggle switches between English and Kannada descriptions on homepage cards, detail pages, and quiz questions.

---

## 🖼️ IMAGE ARCHITECTURE

- **49 custom botanical photos** are preserved for the original core plants (Tulsi, Neem, Ashwagandha, Aloe Vera, Turmeric, Brahmi, Ginger, Amla, Shankhpushpi, Shatavari, Giloy, Guggulu, Gotu Kola).
- **67 newly expanded plants** cleanly link to `placeholder.svg` with botanical SVG iconography, preventing missing image errors or 404s.
- Custom photography can be seamlessly added for any plant by dropping JPEG files into `static/images/` and updating the `images` list in `plants.json`.

---

## 🛠️ API ENDPOINTS

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Homepage with plant grid and dynamic hero statistics |
| `/plant/<id>` | GET | Rich detail page for plant with `id` (1–80) with related plants |
| `/quiz` | GET | Interactive configurable botanical quiz |
| `/api/plants` | GET | Returns all 80 plants in JSON format |
| `/api/stats` | GET | Returns dynamically computed statistics dictionary |

---

## 📜 DISCLAIMER

*VanaOshadhi is designed strictly for educational, scientific, and cultural research purposes. Information regarding traditional medicinal practices, phytochemicals, and Ayurvedic properties does not constitute medical advice, diagnosis, or prescription. Always consult a qualified AYUSH physician or healthcare professional before using any botanical preparations for therapeutic purposes.*

---

Made with 💚 using Flask & Python.
