/* ═══════════════════════════════════════════════════════════
   배민 프로덕트인사이트팀 뉴스 스크랩 — app.js
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
let latestCollectedDate = null;  // date of the most recent update batch
let showOnlyNew    = false;

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
const $tagToggleBtn  = document.getElementById('tag-toggle-btn');

/* ── Utility: date ─────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return { abs: '', rel: '' };
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return { abs: dateStr, rel: '' };

  const abs = dateStr;
  const now = new Date();
  const diffDay = Math.floor((now - d) / 86400000);

  let rel;
  if (diffDay < 0)       rel = `${Math.abs(diffDay)}일 후`;
  else if (diffDay === 0) rel = '오늘';
  else if (diffDay === 1) rel = '어제';
  else if (diffDay < 8)  rel = `${diffDay}일 전`;
  else if (diffDay < 31) rel = `${Math.floor(diffDay / 7)}주 전`;
  else if (diffDay < 365)rel = `${Math.floor(diffDay / 30)}개월 전`;
  else                    rel = `${Math.floor(diffDay / 365)}년 전`;

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

/* ── Utility: copy markdown to clipboard ──────────────── */
function buildMarkdown(article) {
  const bullets = (article.summary_ko || '')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

  const summaryMd = bullets.map(b => `- ${b}`).join('\n');
  return [
    `*${article.title}*`,
    article.source_url,
    `> 출처: ${article.source} | ${article.published_date}`,
    '',
    summaryMd,
  ].join('\n');
}

/* ── Render a single card ─────────────────────────────── */
function renderCard(article) {
  const { abs, rel } = formatDate(article.published_date);

  const bullets = (article.summary_ko || '')
    .split('|')
    .map(s => s.trim())
    .filter(Boolean);

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

  const isNew = latestCollectedDate && (article.first_collected_date || '').trim() === latestCollectedDate;

  li.innerHTML = `
    <div class="card-header">
      <div class="card-badges">
        <span class="badge ${catClass}">${esc(catLabel)}</span>
        ${article.region ? `<span class="badge ${regClass}">${esc(article.region)}</span>` : ''}
      </div>
      <div class="card-header-right">
        <time class="card-date" datetime="${esc(article.published_date)}">
          <span class="abs">${esc(abs)}</span>
          ${rel ? `<span class="rel"> (${esc(rel)})</span>` : ''}
        </time>
        <button class="copy-btn" aria-label="마크다운으로 복사" title="마크다운으로 복사">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span class="copy-label">Copy</span>
        </button>
      </div>
    </div>
    <h2 class="card-title">
      ${isNew ? `<button class="new-badge${showOnlyNew ? ' active' : ''}" aria-pressed="${showOnlyNew}" aria-label="새로운 기사 모아보기">NEW</button>` : ''}
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
    btn.addEventListener('click', () => toggleTagFilter(btn.dataset.tag));
  });

  // NEW badge click → toggle NEW filter
  const newBadgeBtn = li.querySelector('.new-badge');
  if (newBadgeBtn) {
    newBadgeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showOnlyNew = !showOnlyNew;
      applyFilters();
    });
  }

  // Copy button
  li.querySelector('.copy-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const label = btn.querySelector('.copy-label');
    try {
      await navigator.clipboard.writeText(buildMarkdown(article));
      label.textContent = '✓ Copied!';
      btn.classList.add('copied');
    } catch {
      // Fallback for non-https
      const ta = document.createElement('textarea');
      ta.value = buildMarkdown(article);
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      label.textContent = '✓ Copied!';
      btn.classList.add('copied');
    }
    setTimeout(() => {
      label.textContent = 'Copy';
      btn.classList.remove('copied');
    }, 2000);
  });

  return li;
}

/* ── Render a page slice ──────────────────────────────── */
function renderPage() {
  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  slice.forEach(article => $newsList.appendChild(renderCard(article)));
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

/* ── Rebuild tag cloud for a given set of articles ───── */
/*
 * When a category is active, only show tags that actually
 * exist in articles of that category. Preserve the selected
 * state of any tag that is still shown.
 */
function rebuildTagCloud(sourceArticles) {
  // Count tags within the source article set
  const tagCount = {};
  sourceArticles.forEach(a => {
    (a.tags || '').split(';').forEach(t => {
      const tag = t.trim();
      if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 80)
    .map(([tag]) => tag);

  $tagCloud.innerHTML = '';
  sortedTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-chip' + (activeTags.has(tag) ? ' selected' : '');
    btn.dataset.tag = tag;
    btn.textContent = `#${tag}`;
    btn.setAttribute('aria-pressed', String(activeTags.has(tag)));
    btn.addEventListener('click', () => {
      toggleTagFilter(tag);
      btn.setAttribute('aria-pressed', String(activeTags.has(tag)));
    });
    $tagCloud.appendChild(btn);
  });

  // Re-collapse and check overflow
  $tagCloud.classList.remove('expanded');
  setupTagToggle();
}

/* ── Tag cloud collapse/expand logic ─────────────────── */
function setupTagToggle() {
  if (!$tagToggleBtn) return;
  // Use rAF to ensure layout is calculated after DOM update
  requestAnimationFrame(() => {
    const hasOverflow = $tagCloud.scrollHeight > $tagCloud.clientHeight + 4;
    if (hasOverflow) {
      $tagToggleBtn.style.display = 'block';
      updateToggleLabel(false);
    } else {
      $tagToggleBtn.style.display = 'none';
    }
  });
}

function updateToggleLabel(expanded) {
  $tagToggleBtn.textContent = expanded ? '접기 ▴' : '펼치기 ▾';
  $tagToggleBtn.setAttribute('aria-expanded', String(expanded));
}

/* ── Apply filters & re-render ────────────────────────── */
function applyFilters() {
  // 1. Articles that belong to the active category
  const catArticles = activeCat === 'all'
    ? [...allArticles]
    : allArticles.filter(a => (a.category || '').toLowerCase() === activeCat);

  // 2. Rebuild tag cloud from category-scoped articles
  rebuildTagCloud(catArticles);

  // 3. Tag filter (OR) applied on top of catArticles
  let result = catArticles;
  if (activeTags.size > 0) {
    result = catArticles.filter(a => {
      const articleTags = (a.tags || '').split(';').map(t => t.trim());
      return [...activeTags].some(sel => articleTags.includes(sel));
    });
  }

  // 3.5. NEW filter
  if (showOnlyNew) {
    result = result.filter(a => latestCollectedDate && (a.first_collected_date || '').trim() === latestCollectedDate);
  }

  // 4. Sort
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
  updateCardTagHighlights();
}

/* ── Filter status badge ──────────────────────────────── */
function updateFilterStatus() {
  const hasFilter = activeCat !== 'all' || activeTags.size > 0 || showOnlyNew;
  if (hasFilter) {
    $filterStatus.classList.remove('hidden');
    const parts = [];
    if (activeCat !== 'all') parts.push(activeCat);
    if (showOnlyNew) parts.push('NEW 기사');
    activeTags.forEach(t => parts.push(`#${t}`));
    $filterCount.textContent = parts.slice(0, 3).join(', ') +
      (parts.length > 3 ? ` 외 ${parts.length - 3}개` : '');
  } else {
    $filterStatus.classList.add('hidden');
  }
}

/* ── Update card tag highlights ───────────────────────── */
function updateCardTagHighlights() {
  document.querySelectorAll('.card-tag').forEach(btn => {
    btn.classList.toggle('selected', activeTags.has(btn.dataset.tag));
  });
}

/* ── Toggle tag ──────────────────────────────────────── */
function toggleTagFilter(tag) {
  if (activeTags.has(tag)) {
    activeTags.delete(tag);
  } else {
    activeTags.add(tag);
  }
  applyFilters();
}

/* ── Build GNB: category tabs only (tags built dynamically) */
function buildCategoryTabs() {
  const catCount = {};
  allArticles.forEach(a => {
    const c = (a.category || '').toLowerCase();
    if (c) catCount[c] = (catCount[c] || 0) + 1;
  });

  const fixedOrder = ['product', 'business', 'tech', 'partnership'];
  const cats = Object.keys(catCount).sort((a, b) => {
    let idxA = fixedOrder.indexOf(a);
    let idxB = fixedOrder.indexOf(b);
    if (idxA === -1) idxA = 999;
    if (idxB === -1) idxB = 999;
    if (idxA !== idxB) return idxA - idxB;
    return catCount[b] - catCount[a];
  });
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-tab';
    btn.dataset.cat = cat;
    btn.role = 'tab';
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = cat;
    btn.addEventListener('click', () => setCategoryFilter(cat));
    $categoryTabs.appendChild(btn);
  });

  // "전체" tab
  const allTab = $categoryTabs.querySelector('[data-cat="all"]');
  allTab.addEventListener('click', () => setCategoryFilter('all'));
}

/* ── Set category filter ─────────────────────────────── */
function setCategoryFilter(cat) {
  activeCat = cat;
  // Clear tags that may no longer exist in new category
  activeTags.clear();

  document.querySelectorAll('.cat-tab').forEach(t => {
    const isActive = t.dataset.cat === cat;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', String(isActive));
  });

  applyFilters();
}

/* ── GNB scroll shadow ───────────────────────────────── */
window.addEventListener('scroll', () => {
  $gnb.classList.toggle('scrolled', window.scrollY > 4);
}, { passive: true });

/* ── Clear all filters ───────────────────────────────── */
$clearAllBtn.addEventListener('click', () => {
  activeCat = 'all';
  activeTags.clear();
  showOnlyNew = false;
  document.querySelectorAll('.cat-tab').forEach(t => {
    const isAll = t.dataset.cat === 'all';
    t.classList.toggle('active', isAll);
    t.setAttribute('aria-selected', String(isAll));
  });
  applyFilters();
});

/* ── Sort ────────────────────────────────────────────── */
$sortSelect.addEventListener('change', () => {
  sortOrder = $sortSelect.value;
  applyFilters();
});

/* ── Tag Toggle ──────────────────────────────────────── */
if ($tagToggleBtn) {
  $tagToggleBtn.addEventListener('click', () => {
    const expanded = $tagCloud.classList.toggle('expanded');
    updateToggleLabel(expanded);
  });
}

/* ── Load More ───────────────────────────────────────── */
$loadMoreBtn.addEventListener('click', () => renderPage());

/* ── Set last updated near the logo ──────────────────── */
function setLastUpdated(articles) {
  if (!articles.length) return;
  const dates = articles
    .map(a => (a.first_collected_date || '').trim())
    .filter(Boolean)
    .sort()
    .reverse();
  if (dates[0]) {
    latestCollectedDate = dates[0];
    if ($lastUpdated) {
      $lastUpdated.textContent = `마지막 업데이트: ${dates[0]}`;
    }
  }
}

/* ── Main: Fetch & Init ──────────────────────────────── */
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

    buildCategoryTabs();
    setLastUpdated(allArticles);
    applyFilters();

  } catch (err) {
    console.error('Failed to load CSV:', err);
    $loading.classList.add('hidden');
    $errorState.classList.remove('hidden');
  }
}

init();
