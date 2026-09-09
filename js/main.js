/* Sweet / Salty — Main JavaScript */

/* ---- Path helper ---- */
const ROOT = document.documentElement.dataset.root || '.';
function p(path) { return ROOT + '/' + path; }

/* ---- Cookie consent (gates Google Analytics until accepted) ---- */
const GA_ID = 'G-61EPP7DCVE';
function loadAnalytics() {
  if (window.gaLoaded) return;
  window.gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

function showCookieBanner() {
  const existing = document.querySelector('.cookie-banner');
  if (existing) return;
  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-header">
      <span class="cookie-banner-icon" aria-hidden="true">🍪</span>
      <p>We use cookies to understand how visitors use this site, wherever in the world you're baking from.</p>
    </div>
    <div class="cookie-banner-actions">
      <button class="cookie-btn cookie-decline">Decline</button>
      <button class="cookie-btn cookie-accept">Accept</button>
    </div>
  `;
  document.body.appendChild(banner);
  banner.querySelector('.cookie-accept').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    loadAnalytics();
    banner.remove();
  });
  banner.querySelector('.cookie-decline').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'declined');
    banner.remove();
  });
}

const cookieConsent = localStorage.getItem('cookieConsent');
if (cookieConsent === 'accepted') {
  loadAnalytics();
} else if (cookieConsent !== 'declined') {
  showCookieBanner();
}

// Persistent way to revisit the choice later, injected into every footer.
document.querySelectorAll('.footer-copyright').forEach(copyright => {
  copyright.append(' · ');
  const link = document.createElement('a');
  link.href = '#';
  link.className = 'cookie-preferences-link';
  link.textContent = 'Cookie preferences';
  link.addEventListener('click', e => {
    e.preventDefault();
    showCookieBanner();
  });
  copyright.appendChild(link);
});

/* ---- Recipe data ---- */
const ALL_RECIPES = [
  { title: "Savory Libyan Ka'ak", img: 'images/savory-libyan-kaak.jpg', desc: 'Traditional ring-shaped cookies that hold a special place in Libyan cuisine', tags: ['Cookie','Middle East','Salty','Moderate'], page: 'recipe-pages/savory-libyan-kaak.html', popular: false },
  { title: 'Biscotti', img: 'images/biscotti.jpg', desc: 'Traditional Italian cookie known for its crunchy texture & long shelf life', tags: ['Cookie','Italy','Sweet','Moderate'], page: 'recipe-pages/biscotti.html', popular: false },
  { title: 'Italian S Cookies', img: 'images/italian-s-cookies.jpg', desc: 'Elegant S-shaped butter cookies from northern Italy, lightly perfumed with lemon and vanilla', tags: ['Cookie','Italy','Sweet','Easy'], page: 'recipe-pages/italian-s-cookies.html', popular: false, date: '2026-07-01' },
  { title: 'Muhallebi', img: 'images/muhallebi.jpg', desc: 'Creamy, milk-based dessert often garnished with nuts and fruit syrups', tags: ['Dessert','Middle East','Sweet','Easy'], page: 'recipe-pages/muhallebi.html', popular: false },
  { title: 'Crêpe', img: 'images/crepe.jpg', desc: 'A thin, delicate pancake that originated in the Brittany region of France', tags: ['Breakfast','France','Sweet','Easy'], page: 'recipe-pages/crepe.html', popular: false },
  { title: 'Chocolate Soufflé', img: 'images/chocolate-souffle.jpg', desc: 'Popular and iconic variation of the soufflé, rich flavor and airy texture', tags: ['Pastry','France','Sweet','Moderate'], page: 'recipe-pages/chocolate-souffle.html', popular: false },
  { title: 'Cupcake', img: 'images/cupcake.jpg', desc: 'Popular dessert and treat, known for their convenience & variety', tags: ['Pastry','USA','Sweet','Moderate'], page: 'recipe-pages/cupcake.html', popular: false },
  { title: 'Sablé Cookies', img: 'images/sable-cookies.jpg', desc: 'This French butter cookie originates from the town of Sablé-sur-Sarthe', tags: ['Cookie','France','Sweet','Easy'], page: 'recipe-pages/sable-cookies.html', popular: false },
  { title: 'French Macaron', img: 'images/french-macarons.jpg', desc: 'A delicate and elegant French pastry made from almond flour, egg whites, and sugar', tags: ['Pastry','France','Sweet','Hard'], page: 'recipe-pages/french-macarons.html', popular: false },
  { title: 'Danish Butter', img: 'images/danish-butter-cookies.jpg', desc: 'A Danish classic cookie, characterized by rich buttery flavor and crisp texture', tags: ['Cookie','Denmark','Sweet','Easy'], page: 'recipe-pages/danish-butter-cookies.html', popular: false },
  { title: 'Chocolate Chip Cookie', img: 'images/chocolate-chip-cookies.jpg', desc: 'Sweet buttery dough and rich chocolate texture make these cookies a favorite', tags: ['Cookie','USA','Sweet','Easy'], page: 'recipe-pages/chocolate-chip-cookies.html', popular: true },
  { title: 'Apple Strudel', img: 'images/apple-strudel.jpg', desc: 'The "Apfelstrudel" is a traditional Viennese pastry popular throughout the world', tags: ['Pastry','Austria','Sweet','Moderate'], page: 'recipe-pages/apple-strudel.html', popular: true },
  { title: 'Gingerbread', img: 'images/gingerbread-cookies.jpg', desc: 'A traditional winter treat flavored with ginger, cloves, cinnamon, and molasses', tags: ['Cookie','Germany','Sweet','Easy'], page: 'recipe-pages/gingerbread-cookies.html', popular: false },
  { title: 'French Toast', img: 'images/french-toast.jpg', desc: 'Pain perdu (French for "lost bread"), tender interior with a crispy exterior', tags: ['Breakfast','France','Sweet','Easy'], page: 'recipe-pages/french-toast.html', popular: true },
  { title: 'Pizza', img: 'images/pizza.jpg', desc: 'Universally beloved dish that originated in Italy, specifically from Naples', tags: ['Pastry','Italy','Salty','Easy'], page: 'recipe-pages/pizza.html', popular: true },
  { title: 'New York Cheesecake', img: 'images/new-york-cheesecake.jpg', desc: 'Rich, creamy, & dense dessert that is beloved for its smooth consistency & elegance', tags: ['Cake','USA','Sweet','Moderate'], page: 'recipe-pages/new-york-cheesecake.html', popular: false },
  { title: 'Croissant', img: 'images/croissant.jpg', desc: 'Flaky, buttery pastry known for its crescent shape, an emblem of French cuisine', tags: ['Pastry','France','Sweet','Moderate'], page: 'recipe-pages/croissant.html', popular: false },
  { title: 'Vanillekipferl', img: 'images/vanillekipferl.jpg', desc: 'Delicate crescent-shaped shortbread cookies rolled in vanilla sugar, an Austrian Christmas classic', tags: ['Cookie','Austria','Sweet','Moderate'], page: 'recipe-pages/vanillekipferl.html', popular: false, date: '2026-08-29' },
  { title: 'Gevulde Koek', img: 'images/gevulde-koek.jpg', desc: 'A round Dutch shortcrust cookie filled with sweet almond paste and topped with a single whole almond', tags: ['Cookie','Netherlands','Sweet','Moderate'], page: 'recipe-pages/gevulde-koek.html', popular: false, date: '2026-09-08' },
  { title: 'Sachertorte', img: 'images/sachertorte.jpg', desc: "Vienna's iconic dense chocolate cake, layered with apricot jam and finished with a glossy dark chocolate glaze", tags: ['Cake','Austria','Sweet','Hard'], page: 'recipe-pages/sachertorte.html', popular: false, date: '2026-09-09' },
];

const TAG_LINKS = {
  'Cookie': 'collection-pages/cookie-recipes.html',
  'Pastry': 'collection-pages/pastry-recipes.html',
  'Cake': 'collection-pages/sweet-recipes.html',
  'Dessert': 'collection-pages/sweet-recipes.html',
  'Breakfast': 'collection-pages/breakfast-recipes.html',
  'France': 'collection-pages/france-recipes.html',
  'Italy': 'collection-pages/italy-recipes.html',
  'Germany': 'collection-pages/germany-recipes.html',
  'Denmark': 'collection-pages/denmark-recipes.html',
  'USA': 'collection-pages/usa-recipes.html',
  'Austria': 'collection-pages/austria-recipes.html',
  'Netherlands': 'collection-pages/netherlands-recipes.html',
  'Middle East': 'collection-pages/middle-east-recipes.html',
  'Sweet': 'collection-pages/sweet-recipes.html',
  'Salty': 'collection-pages/salty-recipes.html',
  'Easy': 'collection-pages/easy-level-recipes.html',
  'Moderate': 'collection-pages/moderate-level-recipes.html',
  'Hard': 'all-recipes.html',
};

/* ---- Recipe grid rendering (collection & all-recipes pages) ---- */
const NEW_BADGE_DAYS = 7;
function isNewRecipe(r) {
  if (!r.date) return false;
  const daysSince = (Date.now() - new Date(r.date + 'T00:00:00')) / 86400000;
  return daysSince >= 0 && daysSince <= NEW_BADGE_DAYS;
}

function recipeCardHTML(r) {
  const href = r.page ? p(r.page) : '#';
  const popularBadge = r.popular ? '<span class="badge-popular">Popular Recipe</span>' : '';
  const newBadge = isNewRecipe(r) ? '<span class="badge-new">New!</span>' : '';
  const tags = r.tags.map(t => `<a href="${p(TAG_LINKS[t] || 'all-recipes.html')}" class="tag">${t}</a>`).join('');
  const imgTag = `<img src="${p(r.img)}" alt="${r.title}" loading="lazy" width="800" height="800">`;
  const imgWrap = r.page
    ? `<a href="${href}" class="recipe-card-img">${popularBadge}${newBadge}${imgTag}</a>`
    : `<div class="recipe-card-img">${popularBadge}${newBadge}${imgTag}</div>`;
  const titleHTML = r.page ? `<a href="${href}">${r.title}</a>` : r.title;
  return `
    <article class="recipe-card">
      ${imgWrap}
      <div class="recipe-card-body">
        <h3>${titleHTML}</h3>
        <p>${r.desc}</p>
        <div class="recipe-tags">${tags}</div>
      </div>
    </article>`;
}

document.querySelectorAll('.recipe-grid[data-tag]').forEach(grid => {
  const tag = grid.dataset.tag;
  const list = (tag === 'All' ? ALL_RECIPES.slice() : ALL_RECIPES.filter(r => r.tags.includes(tag)));
  // New recipes float to the top, most recent first; everything else keeps its original order.
  list.sort((a, b) => {
    const aNew = isNewRecipe(a), bNew = isNewRecipe(b);
    if (aNew && bNew) return new Date(b.date) - new Date(a.date);
    if (aNew) return -1;
    if (bNew) return 1;
    return 0;
  });
  grid.innerHTML = list.map(recipeCardHTML).join('');
});

/* ---- Search ---- */
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchClose = document.getElementById('searchClose');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

function openSearch() {
  searchOverlay.classList.add('active');
  searchInput.focus();
  renderSearch('');
}
function closeSearch() {
  searchOverlay.classList.remove('active');
  searchInput.value = '';
}

if (searchBtn) searchBtn.addEventListener('click', openSearch);
if (searchClose) searchClose.addEventListener('click', closeSearch);
if (searchOverlay) {
  searchOverlay.addEventListener('click', e => { if (e.target === searchOverlay) closeSearch(); });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

function renderSearch(query) {
  const q = query.toLowerCase().trim();
  const matches = q === '' ? ALL_RECIPES : ALL_RECIPES.filter(r =>
    r.title.toLowerCase().includes(q) ||
    r.tags.some(t => t.toLowerCase().includes(q)) ||
    r.desc.toLowerCase().includes(q)
  );
  if (matches.length === 0) {
    searchResults.innerHTML = '<div class="search-empty">No recipes found for "' + query + '"</div>';
    return;
  }
  searchResults.innerHTML = matches.map(r => {
    const href = r.page ? p(r.page) : '#';
    return `
      <a class="search-result-item" href="${href}">
        <img src="${p(r.img)}" alt="${r.title}">
        <div class="result-info">
          <strong>${r.title}</strong>
          <span class="result-tags">${r.tags.join(' · ')}</span>
        </div>
      </a>`;
  }).join('');
}

if (searchInput) {
  searchInput.addEventListener('input', e => renderSearch(e.target.value));
}

/* ---- Mobile nav ---- */
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
if (navToggle && mobileNav) {
  navToggle.addEventListener('click', () => mobileNav.classList.toggle('open'));
}

const mobileDropdownLabel = document.querySelector('.mobile-nav .mobile-dropdown-label');
if (mobileDropdownLabel) {
  mobileDropdownLabel.addEventListener('click', () => {
    mobileDropdownLabel.classList.toggle('open');
    mobileDropdownLabel.nextElementSibling.classList.toggle('open');
  });
}

/* ---- Hero rotating text (mover approach, mirrors Webflow) ---- */
const wordMover = document.querySelector('.word-mover');
if (wordMover) {
  const slots = wordMover.querySelectorAll('.rotating-word');
  const wordBox = wordMover.closest('.word-box');
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const dur = 380;
  let current = 0;

  // CSS already sets an approximate word-box height so the first word paints
  // immediately with no JS dependency (better LCP). Use getBoundingClientRect
  // here for sub-pixel accuracy — offsetHeight rounds to integers which
  // causes 1-2px bleed from the previous word at the top — and correct the
  // CSS value now that the font has actually loaded and laid out.
  const gap = 8;
  const slotH = slots[0].getBoundingClientRect().height;
  const step = slotH + gap;
  wordBox.style.height = slotH + 'px';

  setInterval(() => {
    current++;

    wordMover.style.transition = `transform ${dur}ms ${ease}`;
    wordMover.style.transform = `translateY(-${current * step}px)`;

    // Last slot is a duplicate of the first — snap back silently after it lands
    if (current === slots.length - 1) {
      setTimeout(() => {
        wordMover.style.transition = 'none';
        wordMover.style.transform = 'translateY(0)';
        current = 0;
      }, dur + 60);
    }
  }, 2600);
}

/* ---- Newsletter forms ---- */
document.querySelectorAll('.newsletter-form').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const success = form.parentElement.querySelector('.newsletter-success');
    if (success) { success.classList.add('show'); form.style.display = 'none'; }
  });
});

/* ---- Auto-update copyright year ---- */
const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ---- Recipe interactive checkboxes ---- */
document.querySelectorAll('.ingredients-list li').forEach(li => {
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.className = 'recipe-check';
  li.prepend(cb);
  cb.addEventListener('change', () => li.classList.toggle('checked', cb.checked));
  li.addEventListener('click', e => {
    if (e.target === cb) return;
    cb.checked = !cb.checked;
    li.classList.toggle('checked', cb.checked);
  });
});

document.querySelectorAll('.instructions-list li').forEach(li => {
  li.addEventListener('click', e => {
    if (e.target.tagName === 'A') return;
    li.classList.toggle('checked');
  });
});

/* ---- Contact form (Formspree) ---- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = contactForm.querySelector('.btn-submit');
    const successEl = document.getElementById('formSuccess');
    const errorEl = document.getElementById('formError');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch('https://formspree.io/f/xvzjogvk', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(contactForm)
      });
      if (res.ok) {
        contactForm.style.display = 'none';
        if (successEl) successEl.classList.add('show');
      } else {
        if (errorEl) errorEl.classList.add('show');
        btn.disabled = false;
        btn.textContent = 'Send message';
      }
    } catch {
      if (errorEl) errorEl.classList.add('show');
      btn.disabled = false;
      btn.textContent = 'Send message';
    }
  });
}
