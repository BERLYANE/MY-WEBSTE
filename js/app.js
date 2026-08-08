(function () {
  "use strict";

  /* ---------- Category icons (inline SVG, stroke-based, single color via currentColor) ---------- */
  const ICONS = {
    fridge: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="12" y="4" width="24" height="40" rx="3"/><line x1="12" y1="18" x2="36" y2="18"/><line x1="18" y1="9" x2="18" y2="13"/><line x1="18" y1="23" x2="18" y2="27"/></svg>',
    washer: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="36" height="36" rx="4"/><circle cx="24" cy="26" r="10"/><circle cx="24" cy="26" r="4"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.5" fill="currentColor" stroke="none"/></svg>',
    dishwasher: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="36" height="36" rx="3"/><rect x="6" y="6" width="36" height="8" rx="3"/><circle cx="12" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M14 26h20M14 32h20M14 20h20" stroke-dasharray="3 3"/></svg>',
    stove: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="10" width="38" height="30" rx="3"/><circle cx="16" cy="22" r="5"/><circle cx="32" cy="22" r="5"/><line x1="10" y1="34" x2="38" y2="34"/></svg>',
    microwave: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="40" height="26" rx="3"/><rect x="8" y="14" width="22" height="18" rx="2"/><line x1="36" y1="17" x2="40" y2="17"/><line x1="36" y1="23" x2="40" y2="23"/><line x1="36" y1="29" x2="40" y2="29"/></svg>',
    vacuum: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="16" cy="16" r="8"/><path d="M22 21 L38 38"/><path d="M33 38h8"/></svg>',
    fan: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="4"/><path d="M24 20c0-6 4-10 9-10 2 0 3 2 1 4-3 3-6 4-10 6z"/><path d="M28 24c6 0 10 4 10 9 0 2-2 3-4 1-3-3-4-6-6-10z"/><path d="M20 24c-6 0-10-4-10-9 0-2 2-3 4-1 3 3 4 6 6 10z"/></svg>',
    iron: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 30 Q8 16 26 16 H36 a4 4 0 0 1 4 4 v6 a4 4 0 0 1-4 4 H14 Q8 30 8 30 Z"/><line x1="16" y1="36" x2="34" y2="36"/></svg>',
    kitchen: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="18" width="20" height="22" rx="2"/><path d="M14 18 L17 8 H31 L34 18"/><line x1="24" y1="24" x2="24" y2="34"/></svg>',
    tv: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="8" width="40" height="24" rx="3"/><line x1="18" y1="40" x2="30" y2="40"/><line x1="24" y1="32" x2="24" y2="40"/></svg>',
    cookware: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="20" cy="24" rx="14" ry="6"/><path d="M6 24v3c0 3.3 6.3 6 14 6s14-2.7 14-6v-3"/><line x1="34" y1="21" x2="44" y2="18"/></svg>',
  };
  function iconFor(key) { return ICONS[key] || ICONS.kitchen; }

  const fmtToman = (n) => n.toLocaleString('fa-IR') + ' تومان';

  /* ---------- State ---------- */
  let state = {
    category: 'all',
    query: '',
    sort: 'default',
    cart: loadCart(),
  };

  function loadCart() {
    try {
      const raw = localStorage.getItem('demo-cart');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem('demo-cart', JSON.stringify(state.cart)); } catch (e) {}
  }

  /* ---------- DOM refs ---------- */
  const grid = document.getElementById('productGrid');
  const chipsEl = document.getElementById('categoryChips');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const resultsMeta = document.getElementById('resultsMeta');
  const emptyState = document.getElementById('emptyState');
  const specCount = document.getElementById('specCount');

  specCount.textContent = PRODUCTS.length + ' ITEMS';

  /* ---------- Category chips ---------- */
  function renderChips() {
    const frag = document.createDocumentFragment();
    const allChip = makeChip('all', 'همه');
    frag.appendChild(allChip);
    CATEGORIES.forEach(c => frag.appendChild(makeChip(c.key, c.label)));
    chipsEl.appendChild(frag);
  }
  function makeChip(key, label) {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = label;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', String(state.category === key));
    btn.addEventListener('click', () => {
      state.category = key;
      [...chipsEl.children].forEach(c => c.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      render();
    });
    return btn;
  }

  /* ---------- Filtering / sorting ---------- */
  function getFiltered() {
    let list = PRODUCTS.filter(p => {
      if (state.category !== 'all' && p.category !== state.category) return false;
      if (state.query) {
        const q = state.query.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.categoryLabel.includes(q);
      }
      return true;
    });
    if (state.sort === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
    if (state.sort === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
    if (state.sort === 'rating-desc') list = list.slice().sort((a, b) => b.rating - a.rating);
    return list;
  }

  /* ---------- Product grid ---------- */
  function renderGrid() {
    const list = getFiltered();
    resultsMeta.textContent = `${list.length.toLocaleString('fa-IR')} محصول از ${PRODUCTS.length.toLocaleString('fa-IR')}`;
    grid.innerHTML = '';
    emptyState.hidden = list.length !== 0;

    const frag = document.createDocumentFragment();
    list.forEach(p => frag.appendChild(productCard(p)));
    grid.appendChild(frag);
  }

  function productCard(p) {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-visual" style="background:${swatchFor(p.category)}" data-open="${p.id}">
        <span class="stock-tag ${p.inStock ? '' : 'out'}">${p.inStock ? 'موجود' : 'ناموجود'}</span>
        <span style="color:${iconColorFor(p.category)}">${iconFor(p.icon)}</span>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.categoryLabel}</div>
        <h3 class="card-name" data-open="${p.id}">${p.name}</h3>
        <div class="card-rating">★ ${p.rating.toLocaleString('fa-IR')}</div>
        <div class="card-price">${fmtToman(p.price)}</div>
      </div>
      <div class="card-plate">
        <span>مدل ${p.model}</span>
        <span>${p.power != null ? p.power.toLocaleString('fa-IR') + 'W' : p.material}</span>
        <span>${p.warranty.toLocaleString('fa-IR')} ماه گارانتی</span>
      </div>
      <div class="card-actions">
        <button class="add-btn" data-add="${p.id}" ${p.inStock ? '' : 'disabled'}>
          ${p.inStock ? 'افزودن به سبد' : 'ناموجود'}
        </button>
      </div>
    `;
    card.querySelectorAll('[data-open]').forEach(el => el.addEventListener('click', () => openModal(p.id)));
    const addBtn = card.querySelector('[data-add]');
    if (addBtn) addBtn.addEventListener('click', () => addToCart(p.id));
    return card;
  }

  /* Monochrome black / white / gold swatch scale — alternates a pale-gold tint
     with a neutral off-white so the grid still reads as distinct categories
     without introducing any hue outside the theme. */
  function swatchFor(cat) {
    const map = {
      fridge: '#F7F1DE', washer: '#F4F4F1', dishwasher: '#F8F0D9', stove: '#F1F1EE',
      microwave: '#F7F1DE', vacuum: '#F4F4F1', fan: '#F8F0D9', iron: '#F1F1EE',
      kitchen: '#F7F1DE', tv: '#F4F4F1', cookware: '#F8F0D9',
    };
    return map[cat] || '#F4F4F1';
  }
  function iconColorFor(cat) {
    // Every other category rendered in gold instead of ink, purely for scan-ability.
    const goldSet = new Set(['fridge', 'stove', 'kitchen', 'fan', 'cookware']);
    return goldSet.has(cat) ? '#B8922B' : '#171717';
  }

  /* ---------- Cart ---------- */
  const cartBtn = document.getElementById('cartBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.getElementById('cartClose');
  const cartItemsEl = document.getElementById('cartItems');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCountEl = document.getElementById('cartCount');

  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    saveCart();
    renderCart();
    openCart();
  }
  function changeQty(id, delta) {
    const next = (state.cart[id] || 0) + delta;
    if (next <= 0) delete state.cart[id];
    else state.cart[id] = next;
    saveCart();
    renderCart();
  }
  function cartCount() {
    return Object.values(state.cart).reduce((a, b) => a + b, 0);
  }
  function renderCart() {
    const ids = Object.keys(state.cart);
    cartCountEl.textContent = cartCount().toLocaleString('fa-IR');
    if (ids.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty">سبد خرید شما خالی است.</p>';
      cartTotalEl.textContent = fmtToman(0);
      return;
    }
    let total = 0;
    cartItemsEl.innerHTML = '';
    ids.forEach(idStr => {
      const id = Number(idStr);
      const p = PRODUCTS.find(x => x.id === id);
      if (!p) return;
      const qty = state.cart[id];
      total += p.price * qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div class="cart-item-icon" style="background:${swatchFor(p.category)}"><span style="color:${iconColorFor(p.category)}">${iconFor(p.icon)}</span></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">${fmtToman(p.price)}</div>
        </div>
        <div class="qty-controls">
          <button data-dec="${id}" aria-label="کم کردن">−</button>
          <span>${qty.toLocaleString('fa-IR')}</span>
          <button data-inc="${id}" aria-label="افزودن">+</button>
        </div>
      `;
      row.querySelector('[data-dec]').addEventListener('click', () => changeQty(id, -1));
      row.querySelector('[data-inc]').addEventListener('click', () => changeQty(id, 1));
      cartItemsEl.appendChild(row);
    });
    cartTotalEl.textContent = fmtToman(total);
  }
  function openCart() {
    cartDrawer.hidden = false;
    cartOverlay.hidden = false;
    cartBtn.setAttribute('aria-expanded', 'true');
  }
  function closeCart() {
    cartDrawer.hidden = true;
    cartOverlay.hidden = true;
    cartBtn.setAttribute('aria-expanded', 'false');
  }
  cartBtn.addEventListener('click', () => {
    if (!cartDrawer.hidden) { closeCart(); } else { openCart(); }
  });
  cartClose.addEventListener('click', (e) => { e.stopPropagation(); closeCart(); });
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCart(); closeModal(); } });

  /* ---------- Product modal ---------- */
  const modal = document.getElementById('productModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const modalBody = document.getElementById('modalBody');

  function openModal(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    modalBody.innerHTML = `
      <div class="modal-visual" style="background:${swatchFor(p.category)}">
        <span style="color:${iconColorFor(p.category)}">${iconFor(p.icon)}</span>
      </div>
      <div class="modal-content">
        <h2 id="modalTitle">${p.name}</h2>
        <div class="modal-cat">${p.categoryLabel} · برند ${p.brand}</div>
        <div class="modal-price">${fmtToman(p.price)}</div>
        <dl class="modal-specs">
          <div><dt>کد مدل</dt><dd>${p.model}</dd></div>
          <div><dt>${p.power != null ? 'توان مصرفی' : 'جنس'}</dt><dd>${p.power != null ? p.power.toLocaleString('fa-IR') + ' وات' : p.material}</dd></div>
          <div><dt>گارانتی</dt><dd>${p.warranty.toLocaleString('fa-IR')} ماه</dd></div>
          <div><dt>وضعیت</dt><dd>${p.inStock ? 'موجود در انبار دمو' : 'ناموجود'}</dd></div>
        </dl>
        <button class="add-btn" ${p.inStock ? '' : 'disabled'} id="modalAddBtn">${p.inStock ? 'افزودن به سبد' : 'ناموجود'}</button>
      </div>
    `;
    const addBtn = document.getElementById('modalAddBtn');
    if (addBtn) addBtn.addEventListener('click', () => { addToCart(p.id); closeModal(); });
    modal.hidden = false;
    modalOverlay.hidden = false;
  }
  function closeModal() {
    modal.hidden = true;
    modalOverlay.hidden = true;
  }
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  /* ---------- Search / sort ---------- */
  let searchTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value.trim();
      renderGrid();
    }, 150);
  });
  sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderGrid();
  });

  /* ---------- Init ---------- */
  function render() { renderGrid(); }
  renderChips();
  renderGrid();
  renderCart();
})();
