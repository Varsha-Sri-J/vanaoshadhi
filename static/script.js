/* =============================================================
   VanaOshadhi — script.js  (Comprehensive Encyclopedia Engine)
   Modules:
   1. Animated Particles
   2. Global Language Toggle (EN / KN)
   3. LocalStorage Favorites System
   4. Multi-field Search & Category/Part Filters
   5. Plant Detail Gallery & Keyboard Nav
   6. Interactive Fun Fact Reveal
   7. Configurable Dynamic Quiz Engine (Easy, Medium, Hard)
   ============================================================= */

/* ═══════════════════════════════════════════════════════════════
   1. ANIMATED BACKGROUND PARTICLES
   ═══════════════════════════════════════════════════════════════ */
function createParticles() {
  const container = document.getElementById('bgParticles');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 22; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 85 + 18;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 22 + 14}s;
      animation-delay:${Math.random() * 14}s;
      opacity:${Math.random() * 0.32 + 0.05};
    `;
    container.appendChild(p);
  }
}

/* ═══════════════════════════════════════════════════════════════
   2. GLOBAL LANGUAGE TOGGLE (EN / KN)
   ═══════════════════════════════════════════════════════════════ */
let currentLang = 'en';

function toggleGlobalLang() {
  currentLang = (currentLang === 'en') ? 'kn' : 'en';
  applyGlobalLang();
  sessionStorage.setItem('vanaLang', currentLang);
}

function applyGlobalLang() {
  const isKn = (currentLang === 'kn');
  const flag = document.getElementById('globalLangFlag');
  const label = document.getElementById('globalLangText');

  if (flag)  flag.textContent = isKn ? '🇬🇧' : '🇮🇳';
  if (label) label.textContent = isKn ? 'English' : 'ಕನ್ನಡ';

  // Swap elements having data-en and data-kn attributes
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = isKn ? (el.dataset.kn || el.dataset.en) : el.dataset.en;
  });

  // Swap search input placeholder
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.placeholder = isKn
      ? (searchInput.dataset.placeholderKn || searchInput.placeholder)
      : (searchInput.dataset.placeholderEn || searchInput.placeholder);
  }

  // On homepage cards: toggle card plant names (EN title ↔ Kannada title)
  document.querySelectorAll('.plant-card').forEach(card => {
    const enEl = card.querySelector('.card-name-en');
    const knEl = card.querySelector('.card-name-kn');
    if (!enEl || !knEl) return;
    if (isKn) {
      enEl.style.display = 'none';
      knEl.style.display = 'inline';
    } else {
      enEl.style.display = 'inline';
      knEl.style.display = 'none';
    }
  });

  // Results bar text swap
  const resultsEn = document.getElementById('resultsTextEn');
  const resultsKn = document.getElementById('resultsTextKn');
  if (resultsEn && resultsKn) {
    resultsEn.style.display = isKn ? 'none' : 'inline';
    resultsKn.style.display = isKn ? 'inline' : 'none';
  }

  // On detail page: swap uses text and name
  if (typeof PLANT_DATA !== 'undefined') {
    const usesEl = document.getElementById('usesText');
    if (usesEl) {
      usesEl.textContent = isKn && PLANT_DATA.useKannada ? PLANT_DATA.useKannada : PLANT_DATA.use;
    }
    const nameEl = document.getElementById('plantName');
    if (nameEl) {
      nameEl.textContent = isKn && PLANT_DATA.kannadaName ? PLANT_DATA.kannadaName : PLANT_DATA.name;
    }
  }

  // Update favorite button text on detail page
  updateDetailFavBtnText();

  // Update HTML data-lang
  document.documentElement.setAttribute('data-lang', currentLang);
}

/* ═══════════════════════════════════════════════════════════════
   3. FAVORITES / BOOKMARKS SYSTEM (LocalStorage)
   ═══════════════════════════════════════════════════════════════ */
const FAVS_KEY = 'vanaOshadhiFavorites';

function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(favs) {
  try {
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
}

function isFavorite(id) {
  const favs = getFavorites();
  return favs.includes(Number(id));
}

function toggleFavoriteId(id) {
  id = Number(id);
  let favs = getFavorites();
  if (favs.includes(id)) {
    favs = favs.filter(x => x !== id);
  } else {
    favs.push(id);
  }
  saveFavorites(favs);
  updateFavoritesUI();
  return favs.includes(id);
}

function toggleCardFavorite(event, id) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  toggleFavoriteId(id);
  if (currentCategoryFilter === 'favorites') {
    filterPlants();
  }
}

function toggleDetailFavorite(id) {
  const isNowFav = toggleFavoriteId(id);
  updateDetailFavBtn(isNowFav);
}

function updateDetailFavBtnText() {
  const btnText = document.getElementById('detailFavText');
  if (!btnText || typeof PLANT_DATA === 'undefined') return;
  const fav = isFavorite(PLANT_DATA.id);
  const isKn = (currentLang === 'kn');
  if (fav) {
    btnText.textContent = isKn ? 'ಮೆಚ್ಚಿನವುಗಳಿಂದ ತೆಗೆಯಿರಿ' : 'Favorited';
  } else {
    btnText.textContent = isKn ? 'ಮೆಚ್ಚಿನವುಗಳಿಗೆ ಸೇರಿಸಿ' : 'Add to Favorites';
  }
}

function updateDetailFavBtn(fav) {
  const btn = document.getElementById('detailFavBtn');
  const icon = document.getElementById('detailFavIcon');
  if (!btn || !icon) return;
  if (fav) {
    btn.classList.add('active');
    icon.className = 'fas fa-heart';
  } else {
    btn.classList.remove('active');
    icon.className = 'far fa-heart';
  }
  updateDetailFavBtnText();
}

function updateFavoritesUI() {
  const favs = getFavorites();

  // Update card buttons
  document.querySelectorAll('.card-fav-btn').forEach(btn => {
    const pid = Number(btn.getAttribute('data-id') || btn.id.replace('fav-btn-', ''));
    const isFav = favs.includes(pid);
    btn.classList.toggle('active', isFav);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
    }
    btn.setAttribute('aria-label', isFav ? 'Remove from favorites' : 'Add to favorites');
  });

  // Update navbar badge
  const navBadge = document.getElementById('navFavBadge');
  if (navBadge) {
    navBadge.textContent = favs.length;
    navBadge.style.display = favs.length > 0 ? 'inline-block' : 'none';
  }

  // Update category chip pill
  const favPill = document.getElementById('favCountPill');
  if (favPill) {
    favPill.textContent = favs.length;
    favPill.style.display = favs.length > 0 ? 'inline-block' : 'none';
  }

  // Update detail page button if on detail view
  if (typeof PLANT_DATA !== 'undefined' && PLANT_DATA.id) {
    updateDetailFavBtn(favs.includes(Number(PLANT_DATA.id)));
  }
}

/* ═══════════════════════════════════════════════════════════════
   4. MULTI-FIELD SEARCH & CATEGORY / PLANT-PART FILTERS
   ═══════════════════════════════════════════════════════════════ */
let currentCategoryFilter = 'all';
let currentPartFilter     = 'all';

function selectCategory(cat, btnEl) {
  currentCategoryFilter = cat;
  document.querySelectorAll('#categoryChips .filter-chip').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  filterPlants();
}

function selectPart(part, btnEl) {
  currentPartFilter = part;
  document.querySelectorAll('#partChips .part-chip').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  filterPlants();
}

function filterByFavorites() {
  const favBtn = document.querySelector('#categoryChips button[data-category="favorites"]');
  selectCategory('favorites', favBtn);
  const searchSec = document.querySelector('.search-section');
  if (searchSec) {
    searchSec.scrollIntoView({ behavior: 'smooth' });
  }
}

function filterPlants() {
  const searchInput = document.getElementById('searchInput');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) {
    clearBtn.style.display = query.length > 0 ? 'block' : 'none';
  }

  const cards = document.querySelectorAll('.plant-card');
  const favs = getFavorites();
  let visible = 0;

  cards.forEach(card => {
    const id          = Number(card.dataset.id || 0);
    const name        = (card.dataset.name || '');
    const scientific  = (card.dataset.scientific || '');
    const kannada     = (card.dataset.kannada || '');
    const hindi       = (card.dataset.hindi || '');
    const family      = (card.dataset.family || '');
    const ptype       = (card.dataset.type || '');
    const region      = (card.dataset.region || '');
    const use         = (card.dataset.use || '');
    const traditional = (card.dataset.traditional || '');
    const parts       = (card.dataset.parts || '');
    const tags        = (card.dataset.tags || '');

    // 1. Text Query Match across all metadata fields
    let matchQuery = true;
    if (query) {
      matchQuery = name.includes(query) ||
                   scientific.includes(query) ||
                   kannada.includes(query) ||
                   hindi.includes(query) ||
                   family.includes(query) ||
                   ptype.includes(query) ||
                   region.includes(query) ||
                   use.includes(query) ||
                   traditional.includes(query) ||
                   parts.includes(query) ||
                   tags.includes(query);
    }

    // 2. Category Match
    let matchCat = true;
    if (currentCategoryFilter === 'favorites') {
      matchCat = favs.includes(id);
    } else if (currentCategoryFilter === 'herb') {
      matchCat = ptype.includes('herb');
    } else if (currentCategoryFilter === 'tree') {
      matchCat = ptype.includes('tree');
    } else if (currentCategoryFilter === 'shrub') {
      matchCat = ptype.includes('shrub');
    } else if (currentCategoryFilter === 'climber') {
      matchCat = ptype.includes('climber');
    } else if (currentCategoryFilter === 'flower') {
      matchCat = tags.includes('flower') || parts.includes('flower');
    } else if (currentCategoryFilter === 'fruit') {
      matchCat = tags.includes('fruit') || parts.includes('fruit');
    } else if (currentCategoryFilter === 'ayurvedic') {
      matchCat = tags.includes('ayurvedic');
    } else if (currentCategoryFilter === 'aromatic') {
      matchCat = tags.includes('aromatic');
    } else if (currentCategoryFilter === 'kitchen') {
      matchCat = tags.includes('kitchen') || tags.includes('spice');
    }

    // 3. Plant Part Match
    let matchPart = true;
    if (currentPartFilter !== 'all') {
      matchPart = parts.includes(currentPartFilter);
    }

    const isVisible = matchQuery && matchCat && matchPart;
    card.style.display = isVisible ? '' : 'none';
    if (isVisible) visible++;
  });

  // Update counts
  const visibleCountEl = document.getElementById('visibleCount');
  const visibleCountKnEl = document.getElementById('visibleCountKn');
  if (visibleCountEl) visibleCountEl.textContent = visible;
  if (visibleCountKnEl) visibleCountKnEl.textContent = visible;

  // Clear filters button visibility
  const hasActiveFilter = (query.length > 0) || (currentCategoryFilter !== 'all') || (currentPartFilter !== 'all');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  if (clearFiltersBtn) {
    clearFiltersBtn.style.display = hasActiveFilter ? 'inline-flex' : 'none';
  }

  // No results message
  const noRes = document.getElementById('noResults');
  if (noRes) {
    noRes.style.display = visible === 0 ? 'block' : 'none';
  }
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = '';
    filterPlants();
  }
}

function clearAllFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';

  const allCatBtn = document.querySelector('#categoryChips button[data-category="all"]');
  const allPartBtn = document.querySelector('#partChips button[data-part="all"]');

  currentCategoryFilter = 'all';
  currentPartFilter = 'all';

  document.querySelectorAll('#categoryChips .filter-chip').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#partChips .part-chip').forEach(b => b.classList.remove('active'));

  if (allCatBtn) allCatBtn.classList.add('active');
  if (allPartBtn) allPartBtn.classList.add('active');

  filterPlants();
}

/* ═══════════════════════════════════════════════════════════════
   5. IMAGE GALLERY (Plant Detail Page)
   ═══════════════════════════════════════════════════════════════ */
let galleryCurrentIdx = 0;

function switchImageIdx(idx) {
  if (typeof PLANT_DATA === 'undefined' || !PLANT_DATA.images) return;
  const total = PLANT_DATA.images.length;
  galleryCurrentIdx = (idx + total) % total;

  const mainImg = document.getElementById('mainGalleryImg');
  const caption = document.getElementById('galleryCaption');
  const thumbs  = document.querySelectorAll('.gallery-thumb-wrap');
  const newSrc  = `/static/images/${PLANT_DATA.images[galleryCurrentIdx]}`;

  if (!mainImg) return;
  mainImg.style.opacity = '0';
  setTimeout(() => {
    mainImg.src = newSrc;
    mainImg.style.opacity = '1';
    if (caption) caption.textContent = `${galleryCurrentIdx + 1} / ${total}`;
  }, 180);

  thumbs.forEach((t, i) => {
    t.classList.toggle('active-thumb', i === galleryCurrentIdx);
  });
}

function galleryPrev() { switchImageIdx(galleryCurrentIdx - 1); }
function galleryNext() { switchImageIdx(galleryCurrentIdx + 1); }

function initGalleryKeyboard() {
  document.addEventListener('keydown', e => {
    if (document.getElementById('mainGalleryImg')) {
      if (e.key === 'ArrowLeft')  galleryPrev();
      if (e.key === 'ArrowRight') galleryNext();
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   6. FUN FACT — REVEAL ON HOVER / CLICK
   ═══════════════════════════════════════════════════════════════ */
function revealFunFact() {
  const wrapper = document.getElementById('funFactWrapper');
  if (!wrapper) return;
  wrapper.classList.toggle('revealed');
}

function initFunFactHover() {
  const prompt = document.getElementById('funFactPrompt');
  if (!prompt) return;
  prompt.addEventListener('mouseenter', () => {
    const wrapper = document.getElementById('funFactWrapper');
    if (wrapper && !wrapper.classList.contains('revealed')) {
      wrapper.classList.add('revealed');
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   6.5. PLANT KNOWLEDGE NETWORK VISUALIZATION (Interactive SVG Graph)
   ═══════════════════════════════════════════════════════════════ */
function initKnowledgeNetwork() {
  const svg = document.getElementById('knowledgeGraphSvg');
  if (!svg || typeof RELATED_DATA === 'undefined' || !RELATED_DATA.length) return;
  if (typeof PLANT_DATA === 'undefined' || !PLANT_DATA.id) return;

  svg.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';

  // 1. Defs & Gradients
  const defs = document.createElementNS(ns, 'defs');
  defs.innerHTML = `
    <linearGradient id="centerNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4caf50" />
      <stop offset="100%" stop-color="#1b5e20" />
    </linearGradient>
    <linearGradient id="satelliteNodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2d6a4f" />
      <stop offset="100%" stop-color="#081c15" />
    </linearGradient>
    <filter id="glowEffect" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  `;
  svg.appendChild(defs);

  // Background orbital reference rings
  const bgGroup = document.createElementNS(ns, 'g');
  bgGroup.setAttribute('class', 'net-bg-elements');
  bgGroup.innerHTML = `
    <circle cx="400" cy="240" r="160" fill="none" stroke="rgba(82, 183, 136, 0.08)" stroke-width="1" stroke-dasharray="4,6" />
    <circle cx="400" cy="240" r="240" fill="none" stroke="rgba(82, 183, 136, 0.05)" stroke-width="1" />
  `;
  svg.appendChild(bgGroup);

  const centerPos = { x: 400, y: 240 };
  const count = RELATED_DATA.length;

  // Orbit layout presets
  let positions = [];
  if (count === 4) {
    positions = [
      { x: 170, y: 120 }, // Top-Left
      { x: 630, y: 120 }, // Top-Right
      { x: 630, y: 360 }, // Bottom-Right
      { x: 170, y: 360 }  // Bottom-Left
    ];
  } else if (count === 3) {
    positions = [
      { x: 180, y: 140 },
      { x: 620, y: 140 },
      { x: 400, y: 390 }
    ];
  } else if (count === 2) {
    positions = [
      { x: 180, y: 240 },
      { x: 620, y: 240 }
    ];
  } else {
    positions = [{ x: 620, y: 240 }];
  }

  const linksGroup = document.createElementNS(ns, 'g');
  linksGroup.setAttribute('class', 'net-links-group');
  svg.appendChild(linksGroup);

  const nodesGroup = document.createElementNS(ns, 'g');
  nodesGroup.setAttribute('class', 'net-nodes-group');
  svg.appendChild(nodesGroup);

  const hoverCard = document.getElementById('networkHoverCard');

  // Render Connections & Satellite Nodes
  RELATED_DATA.forEach((rel, idx) => {
    const pos = positions[idx] || { x: 200, y: 200 };

    // ── Connecting Line
    const linkLine = document.createElementNS(ns, 'line');
    linkLine.setAttribute('x1', centerPos.x);
    linkLine.setAttribute('y1', centerPos.y);
    linkLine.setAttribute('x2', pos.x);
    linkLine.setAttribute('y2', pos.y);
    linkLine.setAttribute('stroke', 'rgba(82, 183, 136, 0.42)');
    linkLine.setAttribute('stroke-width', '2.2');
    linkLine.setAttribute('stroke-dasharray', '6,4');
    linkLine.setAttribute('class', 'network-link-line');
    linkLine.id = `linkLine_${idx}`;
    linksGroup.appendChild(linkLine);

    // ── Link Badge at midpoint
    const midX = (centerPos.x + pos.x) / 2;
    const midY = (centerPos.y + pos.y) / 2;
    const linkBadge = document.createElementNS(ns, 'g');
    linkBadge.setAttribute('class', 'link-badge-group');
    linkBadge.setAttribute('transform', `translate(${midX}, ${midY})`);
    linkBadge.innerHTML = `
      <rect x="-35" y="-11" width="70" height="22" rx="11" fill="rgba(8, 28, 16, 0.9)" stroke="#52b788" stroke-width="1.2" />
      <text x="0" y="4" text-anchor="middle" fill="#a7f3d0" font-size="10.5" font-weight="600" font-family="Poppins, sans-serif">${rel.score}%</text>
    `;
    linksGroup.appendChild(linkBadge);

    // ── Satellite Node Group
    const nodeG = document.createElementNS(ns, 'g');
    nodeG.setAttribute('class', 'net-node-group');
    nodeG.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
    nodeG.setAttribute('tabindex', '0');
    nodeG.setAttribute('role', 'button');
    nodeG.setAttribute('aria-label', `Explore ${rel.name}`);

    const shortSci = rel.scientific && rel.scientific.length > 22
      ? rel.scientific.substring(0, 20) + '…'
      : (rel.scientific || '');

    nodeG.innerHTML = `
      <circle r="44" fill="none" stroke="#52b788" stroke-width="2" opacity="0" class="node-hover-ring" />
      <circle r="36" fill="url(#satelliteNodeGrad)" stroke="rgba(82, 183, 136, 0.75)" stroke-width="2.5" class="node-main-circle" filter="url(#glowEffect)" />
      <text y="-8" text-anchor="middle" font-size="16">🌿</text>
      <text y="10" text-anchor="middle" fill="#ffffff" font-size="11.5" font-weight="600" font-family="Poppins, sans-serif">${rel.name}</text>
      <text y="22" text-anchor="middle" fill="#95d5b2" font-size="8.5" font-style="italic" font-family="Poppins, sans-serif">${shortSci}</text>
      <g transform="translate(0, 42)">
        <rect x="-32" y="-9" width="64" height="18" rx="9" fill="#1b4332" stroke="#52b788" stroke-width="1" />
        <text x="0" y="3.5" text-anchor="middle" fill="#d8f3dc" font-size="9.5" font-weight="600" font-family="Poppins, sans-serif">${rel.score}% Match</text>
      </g>
    `;

    // Interactivity: Click to navigate
    nodeG.addEventListener('click', () => {
      window.location.href = `/plant/${rel.id}`;
    });
    nodeG.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = `/plant/${rel.id}`;
      }
    });

    // Hover tooltip & highlight
    nodeG.addEventListener('mouseenter', () => {
      linkLine.setAttribute('stroke', '#52b788');
      linkLine.setAttribute('stroke-width', '4');
      linkLine.style.filter = 'drop-shadow(0 0 6px #52b788)';

      if (hoverCard) {
        document.getElementById('nhcTitle').textContent = `${rel.name} (${rel.kannadaName || ''})`;
        document.getElementById('nhcSci').textContent = `${rel.scientific} • ${rel.family || ''}`;
        document.getElementById('nhcScore').innerHTML = `<i class="fas fa-project-diagram"></i> Relationship Score: ${rel.score}% (Attribute Similarity)`;

        let reasonsHtml = '<ul class="nhc-reasons-list">';
        (rel.reasons || []).forEach(r => {
          reasonsHtml += `<li><i class="fas fa-link"></i> ${r}</li>`;
        });
        reasonsHtml += '</ul>';
        document.getElementById('nhcReasons').innerHTML = reasonsHtml;

        hoverCard.style.display = 'block';
      }
    });

    nodeG.addEventListener('mouseleave', () => {
      linkLine.setAttribute('stroke', 'rgba(82, 183, 136, 0.42)');
      linkLine.setAttribute('stroke-width', '2.2');
      linkLine.style.filter = 'none';

      if (hoverCard) {
        hoverCard.style.display = 'none';
      }
    });

    nodesGroup.appendChild(nodeG);
  });

  // ── Center Node (Selected Plant)
  const centerG = document.createElementNS(ns, 'g');
  centerG.setAttribute('class', 'net-center-group');
  centerG.setAttribute('transform', `translate(${centerPos.x}, ${centerPos.y})`);

  centerG.innerHTML = `
    <circle r="56" fill="none" stroke="rgba(82, 183, 136, 0.25)" stroke-width="2" class="net-pulse-ring" />
    <circle r="48" fill="none" stroke="rgba(82, 183, 136, 0.6)" stroke-width="2" />
    <circle r="42" fill="url(#centerNodeGrad)" stroke="#52b788" stroke-width="3" filter="url(#glowEffect)" />
    <text y="-10" text-anchor="middle" font-size="20">🌸</text>
    <text y="10" text-anchor="middle" fill="#ffffff" font-size="12.5" font-weight="700" font-family="Poppins, sans-serif">${PLANT_DATA.name}</text>
    <text y="24" text-anchor="middle" fill="#d8f3dc" font-size="9" font-weight="500" font-family="Poppins, sans-serif">(Current Plant)</text>
  `;
  nodesGroup.appendChild(centerG);
}

/* ═══════════════════════════════════════════════════════════════
   7. CONFIGURABLE DYNAMIC BOTANICAL QUIZ ENGINE
   ═══════════════════════════════════════════════════════════════ */
let quizQuestions = [];
let currentQ      = 0;
let score         = 0;
let answered      = false;
let userAnswers   = [];
let quizDifficulty = 'easy'; // 'easy' | 'medium' | 'hard'
let quizCount     = 5;      // 5 | 10 | 15

function setQuizDifficulty(diff, btnEl) {
  quizDifficulty = diff;
  document.querySelectorAll('#diffOptions .config-chip').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

function setQuizCount(count, btnEl) {
  quizCount = Number(count);
  document.querySelectorAll('#countOptions .config-chip').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
}

function startCustomQuiz() {
  if (typeof PLANTS_FOR_QUIZ === 'undefined' || !PLANTS_FOR_QUIZ.length) {
    alert('Plant data not loaded!');
    return;
  }

  const pool = buildDynamicQuestionPool(PLANTS_FOR_QUIZ, quizDifficulty);
  if (!pool.length) {
    alert('Could not construct questions from available data.');
    return;
  }

  // Shuffle pool and slice down to desired question count
  quizQuestions = shuffle(pool).slice(0, Math.min(quizCount, pool.length));
  currentQ    = 0;
  score       = 0;
  answered    = false;
  userAnswers = [];

  document.getElementById('startScreen').style.display    = 'none';
  document.getElementById('resultScreen').style.display   = 'none';
  document.getElementById('questionScreen').style.display = 'block';

  renderQuestion();
}

/**
 * Build rich questions dynamically from actual plants.json data.
 * Does NOT generate fake placeholders for image questions.
 */
function buildDynamicQuestionPool(plants, difficulty) {
  const pool = [];
  const names     = plants.map(p => p.name);
  const sciNames  = plants.map(p => p.scientific_name);
  const knNames   = plants.map(p => p.kannada_name);
  const families  = Array.from(new Set(plants.map(p => p.family))).filter(Boolean);
  const types     = ['Herb', 'Tree', 'Shrub', 'Climber'];
  const realPhotoPlants = plants.filter(p => p.images && p.images[0] && p.images[0] !== 'placeholder.svg');

  function wrongChoices(arr, correct, count = 3) {
    return shuffle(arr.filter(x => x && x !== correct)).slice(0, count);
  }

  // 1. Easy Questions:
  if (difficulty === 'easy' || difficulty === 'all') {
    // 1a. Identify from image (only plants with real photos!)
    realPhotoPlants.forEach(plant => {
      const wrong = wrongChoices(names, plant.name, 3);
      pool.push({
        type:      'image',
        typeBadge: '🖼️ Identify the Plant',
        typeClass: 'chip-image',
        question:  'Which medicinal plant is shown in this botanical photograph?',
        image:     plant.images[0],
        answer:    plant.name,
        options:   shuffle([plant.name, ...wrong]),
        hint:      `This is <strong>${plant.name}</strong> (${plant.kannada_name}) — <em>${plant.scientific_name}</em>. ${plant.use.split(',')[0]}.`
      });
    });

    // 1b. Common Name from Kannada name
    plants.forEach(plant => {
      const wrong = wrongChoices(names, plant.name, 3);
      pool.push({
        type:      'kannada',
        typeBadge: '🇮🇳 Kannada Identification',
        typeClass: 'chip-kn',
        question:  `Which medicinal plant is known as <strong>${plant.kannada_name}</strong> in Kannada?`,
        image:     null,
        answer:    plant.name,
        options:   shuffle([plant.name, ...wrong]),
        hint:      `<strong>${plant.name}</strong> is widely known as <strong>${plant.kannada_name}</strong>. Also known as ${plant.also_known_as}.`
      });
    });
  }

  // 2. Medium Questions:
  if (difficulty === 'medium' || difficulty === 'all') {
    // 2a. Scientific name identification
    plants.forEach(plant => {
      const wrong = wrongChoices(sciNames, plant.scientific_name, 3);
      pool.push({
        type:      'scientific',
        typeBadge: '🔬 Botanical Nomenclature',
        typeClass: 'chip-sci',
        question:  `What is the botanical scientific name of <strong>${plant.name}</strong> (${plant.kannada_name})?`,
        image:     null,
        answer:    plant.scientific_name,
        options:   shuffle([plant.scientific_name, ...wrong]),
        hint:      `The accepted binomial name of <strong>${plant.name}</strong> is <em>${plant.scientific_name}</em>.`
      });
    });

    // 2b. Botanical family
    plants.forEach(plant => {
      const wrong = wrongChoices(families, plant.family, 3);
      pool.push({
        type:      'family',
        typeBadge: '🌿 Botanical Family',
        typeClass: 'chip-fam',
        question:  `To which botanical plant family does <strong>${plant.name}</strong> (<em>${plant.scientific_name}</em>) belong?`,
        image:     null,
        answer:    plant.family,
        options:   shuffle([plant.family, ...wrong]),
        hint:      `<strong>${plant.name}</strong> belongs to the family <strong>${plant.family}</strong>.`
      });
    });

    // 2c. Medicinal use identification
    plants.forEach(plant => {
      const benefit = (plant.use.split(/[,.]/).find(s => s.trim().length > 15) || plant.use.slice(0, 70)).trim();
      const wrong = wrongChoices(names, plant.name, 3);
      pool.push({
        type:      'use',
        typeBadge: '🍃 Traditional Therapeutics',
        typeClass: 'chip-use',
        question:  `Which medicinal plant is traditionally celebrated for: <em>"${benefit}"</em>?`,
        image:     null,
        answer:    plant.name,
        options:   shuffle([plant.name, ...wrong]),
        hint:      `<strong>${plant.name}</strong> (${plant.kannada_name}) is traditionally recognized for: ${benefit}.`
      });
    });
  }

  // 3. Hard Questions:
  if (difficulty === 'hard' || difficulty === 'all') {
    // 3a. Plant Part used
    plants.forEach(plant => {
      if (plant.parts_used && plant.parts_used.length) {
        const correctPart = plant.parts_used[0];
        const allParts = ['Leaves', 'Roots', 'Bark', 'Fruit', 'Seeds', 'Flowers', 'Rhizome'];
        const wrong = wrongChoices(allParts, correctPart, 3);
        pool.push({
          type:      'parts',
          typeBadge: '🍃 Medicinal Plant Parts',
          typeClass: 'chip-part',
          question:  `Which anatomical part of <strong>${plant.name}</strong> (<em>${plant.scientific_name}</em>) is primarily used in traditional formulations?`,
          image:     null,
          answer:    correctPart,
          options:   shuffle([correctPart, ...wrong]),
          hint:      `In classical formulations, the primary medicinal part of <strong>${plant.name}</strong> is: <strong>${plant.parts_used.join(', ')}</strong>.`
        });
      }
    });

    // 3b. Classification / Plant habit
    plants.forEach(plant => {
      const correctType = plant.plant_type;
      const wrong = wrongChoices(types, correctType, 3);
      if (wrong.length >= 3) {
        pool.push({
          type:      'habit',
          typeBadge: '🌱 Botanical Classification',
          typeClass: 'chip-sci',
          question:  `How is <strong>${plant.name}</strong> (<em>${plant.scientific_name}</em>) categorized according to botanical growth habit?`,
          image:     null,
          answer:    correctType,
          options:   shuffle([correctType, ...wrong]),
          hint:      `<strong>${plant.name}</strong> grows as a <strong>${correctType}</strong> in its native habitat.`
        });
      }
    });

    // 3c. Reverse Scientific match
    plants.forEach(plant => {
      const wrong = wrongChoices(names, plant.name, 3);
      pool.push({
        type:      'reverse_sci',
        typeBadge: '🔬 Reverse Botanical Match',
        typeClass: 'chip-sci',
        question:  `Which medicinal plant corresponds to the binomial botanical name <em>"${plant.scientific_name}"</em>?`,
        image:     null,
        answer:    plant.name,
        options:   shuffle([plant.name, ...wrong]),
        hint:      `<em>${plant.scientific_name}</em> is the scientific name for <strong>${plant.name}</strong> (${plant.kannada_name}).`
      });
    });
  }

  return pool;
}

function renderQuestion() {
  answered = false;
  const q = quizQuestions[currentQ];
  const total = quizQuestions.length;

  // Update progress & counters
  document.getElementById('progressBar').style.width = `${((currentQ) / total) * 100}%`;
  document.getElementById('qCounter').textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById('liveScore').textContent = score;

  // Type badge
  const badge = document.getElementById('qTypeBadge');
  if (badge) {
    badge.innerHTML = q.typeBadge;
    badge.className = `q-type-badge ${q.typeClass}`;
  }

  // Question text
  const qBox = document.getElementById('questionTextBox');
  if (qBox) qBox.innerHTML = q.question;

  // Image handling
  const imgContainer = document.getElementById('quizImageContainer');
  const imgEl        = document.getElementById('quizPlantImg');
  if (imgContainer && imgEl) {
    if (q.type === 'image' && q.image && q.image !== 'placeholder.svg') {
      imgContainer.style.display = 'block';
      imgEl.style.opacity = '0';
      setTimeout(() => {
        imgEl.src = `/static/images/${q.image}`;
        imgEl.style.opacity = '1';
      }, 150);
    } else {
      imgContainer.style.display = 'none';
      imgEl.src = '';
    }
  }

  // Options
  const letters = ['A', 'B', 'C', 'D'];
  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';

  const displayOptions = shuffle([...q.options]);
  const displayCorrectIdx = displayOptions.indexOf(q.answer);

  q._displayOptions    = displayOptions;
  q._displayCorrectIdx = displayCorrectIdx;

  displayOptions.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span class="option-text">${opt}</span>`;
    btn.onclick = () => selectAnswer(i, btn);

    btn.style.opacity = '0';
    btn.style.transform = 'translateY(6px)';
    setTimeout(() => {
      btn.style.transition = 'opacity 0.22s ease, transform 0.22s ease';
      btn.style.opacity = '1';
      btn.style.transform = 'translateY(0)';
    }, i * 50);

    grid.appendChild(btn);
  });

  // Reset feedback & next button
  const fb = document.getElementById('feedbackBox');
  fb.style.display = 'none';
  fb.className     = 'feedback-box';
  document.getElementById('nextBtn').style.display = 'none';
}

function selectAnswer(idx, btnEl) {
  if (answered) return;
  answered = true;

  const q       = quizQuestions[currentQ];
  const allBtns = document.querySelectorAll('.option-btn');
  const fb      = document.getElementById('feedbackBox');

  allBtns.forEach(b => b.disabled = true);

  const isCorrect = (idx === q._displayCorrectIdx);
  if (isCorrect) {
    score++;
    btnEl.classList.add('correct');
    fb.className = 'feedback-box correct';
    fb.innerHTML = `<i class="fas fa-check-circle"></i> <strong>Correct!</strong> ${q.hint}`;
  } else {
    btnEl.classList.add('wrong');
    if (allBtns[q._displayCorrectIdx]) {
      allBtns[q._displayCorrectIdx].classList.add('correct');
    }
    fb.className = 'feedback-box wrong';
    fb.innerHTML = `<i class="fas fa-times-circle"></i> <strong>Incorrect.</strong> ${q.hint}`;
  }

  userAnswers.push({
    type:    q.type,
    badge:   q.typeBadge,
    correct: isCorrect,
    chosen:  q._displayOptions[idx],
    right:   q.answer
  });

  document.getElementById('liveScore').textContent = score;
  fb.style.display = 'block';
  document.getElementById('nextBtn').style.display = 'inline-flex';
}

function nextQuestion() {
  currentQ++;
  if (currentQ < quizQuestions.length) {
    const qs = document.getElementById('questionScreen');
    qs.style.opacity = '0';
    qs.style.transform = 'translateX(-15px)';
    setTimeout(() => {
      renderQuestion();
      qs.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      qs.style.opacity = '1';
      qs.style.transform = 'translateX(0)';
    }, 150);
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById('questionScreen').style.display = 'none';
  document.getElementById('resultScreen').style.display   = 'block';

  const total = quizQuestions.length;
  const pct   = Math.round((score / total) * 100);

  // Animated circle ring
  const circle = document.getElementById('scoreRingCircle');
  if (circle) {
    circle.style.transition = 'none';
    circle.style.strokeDashoffset = '314';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      circle.style.transition = 'stroke-dashoffset 1.4s ease';
      circle.style.strokeDashoffset = String(314 - (314 * pct / 100));
    }));
  }

  document.getElementById('finalScoreNum').textContent   = score;
  document.getElementById('finalScoreDenom').textContent = `/${total}`;

  const msgs = [
    { min:100, emoji:'🏆', title:'Perfect Score!',       msg:'Outstanding mastery! You have demonstrated exceptional knowledge of Indian medicinal botany.' },
    { min:80,  emoji:'🌿', title:'Master Herbalist!',    msg:'Impressive knowledge! You clearly understand Ayurvedic plant varieties, families, and preparations.' },
    { min:60,  emoji:'🌱', title:'Solid Knowledge!',     msg:'Good work! You have a solid grasp of key medicinal plants and traditional healing uses.' },
    { min:40,  emoji:'📚', title:'Good Attempt!',        msg:'Promising start! Revisit our plant encyclopedia profiles to discover deeper botanical secrets.' },
    { min:0,   emoji:'🌾', title:'Just Beginning!',      msg:'Every botanist starts with a single seedling! Explore the encyclopedia and test yourself again.' }
  ];
  const m = msgs.find(x => pct >= x.min) || msgs[msgs.length - 1];
  document.getElementById('resultEmoji').textContent   = m.emoji;
  document.getElementById('resultTitle').textContent   = m.title;
  document.getElementById('resultMessage').textContent = m.msg;

  // Breakdown items
  const bd = document.getElementById('resultBreakdown');
  bd.innerHTML = '';
  userAnswers.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = `breakdown-item ${a.correct ? 'ok' : 'bad'}`;
    div.innerHTML =
      `<span class="bd-q">Q${i+1}</span>` +
      `<span class="bd-icon">${a.correct ? '✅' : '❌'}</span>` +
      `<span class="bd-detail">` +
        (a.correct
          ? `Correct — <strong>${a.right}</strong>`
          : `You picked <strong>${a.chosen}</strong> &bull; Correct: <strong>${a.right}</strong>`) +
      `</span>`;
    bd.appendChild(div);
  });
}

function restartQuiz() {
  const circle = document.getElementById('scoreRingCircle');
  if (circle) {
    circle.style.transition = 'none';
    circle.style.strokeDashoffset = '314';
  }
  document.getElementById('resultScreen').style.display = 'none';
  document.getElementById('startScreen').style.display  = 'block';
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ═══════════════════════════════════════════════════════════════
   8. INITIALIZATION ON DOM READY
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  initFunFactHover();
  initGalleryKeyboard();
  initKnowledgeNetwork();
  updateFavoritesUI();

  // Restore saved language preference from sessionStorage
  const savedLang = sessionStorage.getItem('vanaLang');
  if (savedLang && savedLang !== currentLang) {
    currentLang = savedLang;
    applyGlobalLang();
  }
});
