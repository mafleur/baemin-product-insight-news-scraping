/* ═══════════════════════════════════════════════════════════
   Baemin Insight News Dashboard — app.js
   Reads food_news_db.csv from GitHub, renders news cards
   with category + multi-tag filtering and lazy loading.
═══════════════════════════════════════════════════════════ */

const CSV_URL =
  'https://raw.githubusercontent.com/mafleur/baemin-product-insight-news-scraping/main/food_news_db.csv';

const PAGE_SIZE = 20;

/* ── State ─────────────────────────────────────────────── */
let allArticles    = [];   // all parsed rows
let filtered       = [];   // after category + tag filter
let page           = 0;    // how many pages rendered so far

let activeCat      = 'all';
let activeTags     = new Set();  // multi-select OR
let sortOrder      = 'newest';

/* ── DOM refs ──────────────────────────────────────────── */
const $loading       = document.getElementById('loading');
const $errorState    = document.getElementById('error-state');
const $noResults     = document.getElementById('no-results');
const $newsList      = document.getElementById('news-list');
const $loadMoreWrap  = document.getElementById('load-more-wrap');
const $loadMoreBtn   = document.getElementById('load-more-btn');
const $listFooter    = document.getElementById('list-footer');
const $categoryTabs  = document.getElementById('category-tabs');
const $tagCloud      = document.getElementById('tag-cloud');
const $sortSelect    = document.getElementById('sort-select');
const $filterStatus  = document.getElementById('filter-status');
const $filterCount   = document.getElementById('filter-count');
const $clearAllBtn   = document.getElementById('clear-all-btn');
const $lastUpdated   = document.getElementById('last-updated');
const $gnb           = document.getElementById('gnb');

/* ── Utility: date ─────────────────────────────────────── */
/**
 * Returns "2026-03-10 (5일 전)" style string.
 * @param {string} dateStr  YYYY-MM-DD
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return dateStr;

  const abs = dateStr; // e.g. "2026-03-10"
  const now = new Date();
  const diffMs  = now - d;
  const diffDay = Math.floor(diffMs / 86400000);

  let rel;
  if (diffDay < 0) {
    rel = `${Math.abs(diffDay)}일 후`;
  } else if (diffDay === 0) {
    rel = '오늘';
  } else if (diffDay === 1) {
    rel = '어제';
  } else if (diffDay < 8) {
    rel = `${diffDay}일 전`;
  } else if (diffDay < 31) {
    rel = `${Math.floor(diffDay / 7)}주 전`;
  } else if (diffDay < 365) {
    rel = `${Math.floor(diffDay / 30)}개월 전`;
  } else {
    rel = `${Math.floor(diffDay / 365)}년 전`;
  }

  return { abs, rel };
}

/* ── Utility: category badge class ────────────────────── */
const CAT_CLASS = {
  product:     'badge-product',
  tech:        'badge-tech',
  'tech & ai': 'badge-tech',
  'ma':        'badge-ma',
  'm&a':       'badge-ma',
  regulation:  'badge-regulation',
  partnership: 'badge-partnership',
};

function catBadgeClass(cat) {
  if (!cat) return 'badge-default';
  const key = cat.toLowerCase().replace(/\s+/g, '');
  return CAT_CLASS[cat.toLowerCase()] || CAT_CLASS[key] || 'badge-default';
}

function regionBadgeClass(region) {
  if (!region) return 'badge-global';
  return region.toUpperCase() === 'KR' ? 'badge-kr' : 'badge-global';
}

/* ── Utility: escape HTML ─────────────────────────────── */
function esc(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Render a single card ─────────────────────────────── */
function renderCard(article) {
  const { abs, rel } = formatDate(article.published_date) || { abs: '', rel: '' };

  // summary bullets
  const bullets = (article.summary_ko || '')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

  // tags
  const tags = (article.tags || '')
    .split(';')
    .map(t => t.trim())
    .filter(Boolean);

  const catClass = catBadgeClass(article.category);
  const regClass = regionBadgeClass(article.region);
  const catLabel = article.category ? article.category.toUpperCase() : 'ETC';

  const li = document.createElement('li');
  li.className = 'news-card';
  li.dataset.id = article.id;

  const tagsHtml = tags.map(tag => {
    const isSelected = activeTags.has(tag);
    return `<button class="card-tag${isSelected ? ' selected' : ''}" data-tag="${esc(tag)}">#${esc(tag)}</button>`;
  }).join('');

  const bulletsHtml = bullets.map(b => `<li>${esc(b)}</li>`).join('');

  li.innerHTML = `
    <div class="card-header">
      <div class="card-badges">
        <span class="badge ${catClass}">${esc(catLabel)}</span>
        ${article.region ? `<span class="badge ${regClass}">${esc(article.region)}</span>` : ''}
      </div>
      <time class="card-date" datetime="${esc(article.published_date)}">
        <span class="abs">${esc(abs)}</span>
        ${rel ? `<span class="rel"> (${esc(rel)})</span>` : ''}
      </time>
    </div>
    <h2 class="card-title">
      <a href="${esc(article.source_url)}" target="_blank" rel="noreferrer noopener">
        ${esc(article.title)}
      </a>
    </h2>
    <p class="card-source">${esc(article.source)}</p>
    ${bulletsHtml ? `<hr class="card-divider" /><ul class="card-summary">${bulletsHtml}</ul>` : ''}
    ${tagsHtml ? `<hr class="card-divider" /><div class="card-tags">${tagsHtml}</div>` : ''}
  `;

  // Card tag click → toggle tag filter
  li.querySelectorAll('.card-tag').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleTagFilter(btn.dataset.tag);
    });
  });

  return li;
}

/* ── Render a page slice ──────────────────────────────── */
function renderPage() {
  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);

  slice.forEach(article => {
    $newsList.appendChild(renderCard(article));
  });

  page += 1;
  updateLoadMore();
}

/* ── Update "더 보기" visibility ─────────────────────── */
function updateLoadMore() {
  const rendered = page * PAGE_SIZE;
  const remaining = filtered.length - Math.min(rendered, filtered.length);

  if (rendered < filtered.length) {
    $loadMoreWrap.classList.remove('hidden');
    $loadMoreBtn.textContent = `더 보기 (${remaining}개 남음)`;
    $listFooter.classList.add('hidden');
  } else {
    $loadMoreWrap.classList.add('hidden');
    if (filtered.length > 0) {
      $listFooter.textContent = `총 ${filtered.length}개의 뉴스`;
      $listFooter.classList.remove('hidden');
    } else {
      $listFooter.classList.add('hidden');
    }
  }
}

/* ── Apply filters & re-render ────────────────────────── */
function applyFilters() {
  // 1. Category filter
  let result = activeCat === 'all'
    ? [...allArticles]
    : allArticles.filter(a => (a.category || '').toLowerCase() === activeCat);

  // 2. Tag filter (OR: article must contain at least one selected tag)
  if (activeTags.size > 0) {
    result = result.filter(a => {
      const articleTags = (a.tags || '').split(';').map(t => t.trim());
      return [...activeTags].some(sel => articleTags.includes(sel));
    });
  }

  // 3. Sort
  result.sort((a, b) => {
    const da = a.published_date || '';
    const db = b.published_date || '';
    return sortOrder === 'newest' ? db.localeCompare(da) : da.localeCompare(db);
  });

  filtered = result;
  page = 0;
  $newsList.innerHTML = '';

  if (filtered.length === 0) {
    $noResults.classList.remove('hidden');
    $loadMoreWrap.classList.add('hidden');
    $listFooter.classList.add('hidden');
  } else {
    $noResults.classList.add('hidden');
    renderPage();
  }

  updateFilterStatus();
  // update card tag highlights
  updateCardTagHighlights();
}

/* ── Filter status badge ──────────────────────────────── */
function updateFilterStatus() {
  const hasFilter = activeCat !== 'all' || activeTags.size > 0;
  if (hasFilter) {
    $filterStatus.classList.remove('hidden');
    const parts = [];
    if (activeCat !== 'all') parts.push(activeCat);
    activeTags.forEach(t => parts.push(`#${t}`));
    $filterCount.textContent = parts.slice(0, 3).join(', ') + (parts.length > 3 ? ` 외 ${parts.length - 3}개` : '');
  } else {
    $filterStatus.classList.add('hidden');
  }
}

/* ── Update card tag button highlights (after re-render) */
function updateCardTagHighlights() {
  document.querySelectorAll('.card-tag').forEach(btn => {
    btn.classList.toggle('selected', activeTags.has(btn.dataset.tag));
  });
}

/* ── Toggle tag ─────────────────────────────────────────*/
function toggleTagFilter(tag) {
  if (activeTags.has(tag)) {
    activeTags.delete(tag);
  } else {
    activeTags.add(tag);
  }
  // Update GNB chip state
  document.querySelectorAll(`.tag-chip[data-tag="${CSS.escape(tag)}"]`).forEach(chip => {
    chip.classList.toggle('selected', activeTags.has(tag));
  });
  applyFilters();
}

/* ── Build GNB: categories + tags ─────────────────────── */
function buildGnb() {
  // ── Categories (unique, sorted by count desc)
  const catCount = {};
  allArticles.forEach(a => {
    const c = (a.category || '').toLowerCase();
    if (c) catCount[c] = (catCount[c] || 0) + 1;
  });

  const cats = Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab';
    btn.dataset.cat = cat;
    btn.role = 'tab';
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = cat;
    btn.addEventListener('click', () => setCategoryFilter(cat, btn));
    $categoryTabs.appendChild(btn);
  });

  // Category tab click logic for "전체"
  const allTab = $categoryTabs.querySelector('[data-cat="all"]');
  allTab.addEventListener('click', () => setCategoryFilter('all', allTab));

  // ── Tags (sorted by frequency desc)
  const tagCount = {};
  allArticles.forEach(a => {
    (a.tags || '').split(';').forEach(t => {
      const tag = t.trim();
      if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)     // cap at 80 most frequent
    .map(([tag]) => tag);

  sortedTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-chip';
    btn.dataset.tag = tag;
    btn.textContent = `#${tag}`;
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      toggleTagFilter(tag);
      btn.setAttribute('aria-pressed', String(activeTags.has(tag)));
    });
    $tagCloud.appendChild(btn);
  });
}

/* ── Set category filter ────────────────────────────────*/
function setCategoryFilter(cat, el) {
  activeCat = cat;

  document.querySelectorAll('.cat-tab').forEach(t => {
    const isActive = t.dataset.cat === cat;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
  });

  applyFilters();
}

/* ── GNB scroll shadow ──────────────────────────────────*/
window.addEventListener('scroll', () => {
  $gnb.classList.toggle('scrolled', window.scrollY > 4);
}, { passive: true });

/* ── Clear all filters ──────────────────────────────────*/
$clearAllBtn.addEventListener('click', () => {
  activeCat = 'all';
  activeTags.clear();

  document.querySelectorAll('.cat-tab').forEach(t => {
    const isAll = t.dataset.cat === 'all';
    t.classList.toggle('active', isAll);
    t.setAttribute('aria-selected', String(isAll));
  });
  document.querySelectorAll('.tag-chip').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-pressed', 'false');
  });

  applyFilters();
});

/* ── Sort ───────────────────────────────────────────────*/
$sortSelect.addEventListener('change', () => {
  sortOrder = $sortSelect.value;
  applyFilters();
});

/* ── Load More ──────────────────────────────────────────*/
$loadMoreBtn.addEventListener('click', () => {
  renderPage();
  // Smooth scroll hint to newly added cards
});

/* ── Set last updated from newest first_collected_date ── */
function setLastUpdated(articles) {
  if (!articles.length) return;
  const dates = articles
    .map(a => a.first_collected_date)
    .filter(Boolean)
    .sort()
    .reverse();
  if (dates[0]) {
    $lastUpdated.textContent = `마지막 업데이트: ${dates[0]}`;
  }
}

/* ── Main: Fetch & Init ─────────────────────────────────*/
async function init() {
  try {
    const res = await fetch(CSV_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const csvText = await res.text();

    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim(),
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parse warnings:', parsed.errors);
    }

    allArticles = parsed.data.filter(r => r.title && r.source_url);

    $loading.classList.add('hidden');

    if (allArticles.length === 0) {
      $noResults.classList.remove('hidden');
      return;
    }

    buildGnb();
    setLastUpdated(allArticles);
    applyFilters();

  } catch (err) {
    console.error('Failed to load CSV:', err);
    $loading.classList.add('hidden');
    $errorState.classList.remove('hidden');
  }
}

init();
