/* Sweet / Salty — Main JavaScript */

/* ---- Path helper ---- */
const ROOT = document.documentElement.dataset.root || '.';
function p(path) { return ROOT + '/' + path; }

/* ---- Recipe data ---- */
const ALL_RECIPES = [
  { title: "Savory Libyan Ka'ak", img: 'images/66d8046f1a2bf9c9c828c40d_Kaak.jpg', desc: 'Traditional ring-shaped cookies that hold a special place in Libyan cuisine', tags: ['Cookie','Middle East','Salty','Moderate'], page: 'recipe-pages/savory-libyan-kaak.html', popular: false },
  { title: 'Biscotti', img: 'images/66938ab052591b8b1e3baa47_Biscotti.jpg', desc: 'Traditional Italian cookie known for its crunchy texture & long shelf life', tags: ['Cookie','Italy','Sweet','Moderate'], page: 'recipe-pages/biscotti.html', popular: false },
  { title: 'Italian S Cookies', img: 'images/italian-s-cookies.jpg', desc: 'Elegant S-shaped butter cookies from northern Italy, lightly perfumed with lemon and vanilla', tags: ['Cookie','Italy','Sweet','Easy'], page: 'recipe-pages/italian-s-cookies.html', popular: false },
  { title: 'Muhallebi', img: 'images/670d4b1d02bc62ddc06a8206_Muhallebi.jpg', desc: 'Creamy, milk-based dessert often garnished with nuts and fruit syrups', tags: ['Dessert','Middle East','Sweet','Easy'], page: 'recipe-pages/muhallebi.html', popular: false },
  { title: 'Crêpe', img: 'images/67080587dcf7620cb0970ba7_crepe.jpg', desc: 'A thin, delicate pancake that originated in the Brittany region of France', tags: ['Breakfast','France','Sweet','Easy'], page: 'recipe-pages/crepe.html', popular: false },
  { title: 'Chocolate Soufflé', img: 'images/66abcf08878b3e806066e4e5_chocolate-souffle.jpg', desc: 'Popular and iconic variation of the soufflé, rich flavor and airy texture', tags: ['Pastry','France','Sweet','Moderate'], page: 'recipe-pages/chocolate-souffle.html', popular: false },
  { title: 'Cupcake', img: 'images/6690f66d5dcb6ff9d8da9677_Cupcake.jpg', desc: 'Popular dessert and treat, known for their convenience & variety', tags: ['Pastry','USA','Sweet','Moderate'], page: 'recipe-pages/cupcake.html', popular: false },
  { title: 'Sablé Cookies', img: 'images/662122e2c2248e3e2b6997fb_Sable.jpg', desc: 'This French butter cookie originates from the town of Sablé-sur-Sarthe', tags: ['Cookie','France','Sweet','Easy'], page: 'recipe-pages/sable-cookies.html', popular: false },
  { title: 'French Macaron', img: 'images/65fec25e7c4899eab7a0d13d_Macaroon.jpg', desc: 'A delicate and elegant French pastry made from almond flour, egg whites, and sugar', tags: ['Pastry','France','Sweet','Hard'], page: 'recipe-pages/french-macarons.html', popular: false },
  { title: 'Danish Butter', img: 'images/65fea7a07c4899eab78aabec_Danish-butter.jpg', desc: 'A Danish classic cookie, characterized by rich buttery flavor and crisp texture', tags: ['Cookie','Denmark','Sweet','Easy'], page: 'recipe-pages/danish-butter-cookies.html', popular: false },
  { title: 'Chocolate Chip Cookie', img: 'images/65fe8adeef634cea51b280cf_Chocolatechip-cookie.jpg', desc: 'Sweet buttery dough and rich chocolate texture make these cookies a favorite', tags: ['Cookie','USA','Sweet','Easy'], page: 'recipe-pages/chocolate-chip-cookies.html', popular: true },
  { title: 'Apple Strudel', img: 'images/663cc93781dd003d404b07a9_Apple-strudel.jpg', desc: 'The "Apfelstrudel" is a traditional Viennese pastry popular throughout the world', tags: ['Pastry','Austria','Sweet','Moderate'], page: 'recipe-pages/apple-strudel.html', popular: true },
  { title: 'Gingerbread', img: 'images/65fee50498ab5f81e15de6e4_Gingerbread.jpg', desc: 'A traditional winter treat flavored with ginger, cloves, cinnamon, and molasses', tags: ['Cookie','Germany','Sweet','Easy'], page: 'recipe-pages/gingerbread-cookies.html', popular: false },
  { title: 'French Toast', img: 'images/66018a4221916c7e9a53dbdc_French-toast.jpg', desc: 'Pain perdu (French for "lost bread"), tender interior with a crispy exterior', tags: ['Breakfast','France','Sweet','Easy'], page: 'recipe-pages/french-toast.html', popular: true },
  { title: 'Pizza', img: 'images/6633a6f13cfd4836d2593f35_Pizza.jpg', desc: 'Universally beloved dish that originated in Italy, specifically from Naples', tags: ['Pastry','Italy','Salty','Easy'], page: 'recipe-pages/pizza.html', popular: true },
  { title: 'New York Cheesecake', img: 'images/662b78c8d52e59c71dd74e35_NY-cheesecake.jpg', desc: 'Rich, creamy, & dense dessert that is beloved for its smooth consistency & elegance', tags: ['Cake','USA','Sweet','Moderate'], page: 'recipe-pages/new-york-cheesecake.html', popular: false },
  { title: 'Croissant', img: 'images/6601b52f41da3aef04d7d4d3_Croissant.jpg', desc: 'Flaky, buttery pastry known for its crescent shape, an emblem of French cuisine', tags: ['Pastry','France','Sweet','Moderate'], page: 'recipe-pages/croissant.html', popular: false },
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
  'Austria': 'collection-pages/sweet-recipes.html',
  'Middle East': 'collection-pages/middle-east-recipes.html',
  'Sweet': 'collection-pages/sweet-recipes.html',
  'Salty': 'collection-pages/salty-recipes.html',
  'Easy': 'collection-pages/easy-level-recipes.html',
  'Moderate': 'collection-pages/moderate-level-recipes.html',
  'Hard': 'all-recipes.html',
};

/* ---- Recipe grid rendering (collection & all-recipes pages) ---- */
function recipeCardHTML(r) {
  const href = r.page ? p(r.page) : '#';
  const badge = r.popular ? '<span class="badge-popular">Popular Recipe</span>' : '';
  const tags = r.tags.map(t => `<a href="${p(TAG_LINKS[t])}" class="tag">${t}</a>`).join('');
  const imgTag = `<img src="${p(r.img)}" alt="${r.title}">`;
  const imgWrap = r.page
    ? `<a href="${href}" class="recipe-card-img">${badge}${imgTag}</a>`
    : `<div class="recipe-card-img">${badge}${imgTag}</div>`;
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
  const list = tag === 'All' ? ALL_RECIPES : ALL_RECIPES.filter(r => r.tags.includes(tag));
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

  // Use getBoundingClientRect for sub-pixel accuracy — offsetHeight rounds
  // to integers which causes 1-2px bleed from the previous word at the top
  const gap = 8;
  const slotH = slots[0].getBoundingClientRect().height;
  const step = slotH + gap;
  wordBox.style.height = slotH + 'px';
  wordMover.style.opacity = '1';

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

/* ---- Recipe tag overflow: hide last tag until all fit ---- */
function fitRecipeTags() {
  document.querySelectorAll('.recipe-tags').forEach(container => {
    const tags = Array.from(container.querySelectorAll('.tag'));
    // Reset visibility
    tags.forEach(t => t.style.display = '');
    // Hide from the end until nothing overflows
    for (let i = tags.length - 1; i >= 0; i--) {
      if (container.scrollWidth <= container.clientWidth) break;
      tags[i].style.display = 'none';
    }
  });
}
fitRecipeTags();
window.addEventListener('resize', fitRecipeTags);

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
