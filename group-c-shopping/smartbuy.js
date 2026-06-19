/* SmartBuy Ghana – Full Functionality JS */

/* ── CART STATE ── */
let cart = JSON.parse(localStorage.getItem('smartbuy_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('smartbuy_wishlist') || '[]');

function saveCart() { localStorage.setItem('smartbuy_cart', JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem('smartbuy_wishlist', JSON.stringify(wishlist)); }

/* ── CART COUNT BADGE ── */
function updateCartBadge() {
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline-flex' : 'none';
  });
}

/* ── TOAST NOTIFICATION ── */
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = 'sb-toast ' + type;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

/* ── ADD TO CART ── */
function addToCart(name, price, qty = 1) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ name, price, qty });
  }
  saveCart();
  updateCartBadge();
  toast('🛒 Added to cart: ' + name);
}

/* ── WISHLIST TOGGLE ── */
function toggleWishlist(btn, name) {
  const idx = wishlist.indexOf(name);
  if (idx === -1) {
    wishlist.push(name);
    btn.textContent = '♥';
    btn.classList.add('wishlisted');
    toast('❤️ Saved to wishlist: ' + name);
  } else {
    wishlist.splice(idx, 1);
    btn.textContent = '♡';
    btn.classList.remove('wishlisted');
    toast('💔 Removed from wishlist: ' + name, 'info');
  }
  saveWishlist();
}

/* ── WIRE UP PRODUCT CARDS (index + products + cart) ── */
function wireProductCards() {
  document.querySelectorAll('.product-card').forEach(card => {
    const nameEl = card.querySelector('.product-name');
    const priceEl = card.querySelector('.product-price');
    const addBtn = card.querySelector('.add-to-cart');
    const wishBtn = card.querySelector('.wishlist-btn');
    if (!nameEl) return;

    const name = nameEl.textContent.trim();
    const price = priceEl ? priceEl.textContent.trim() : '';

    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        addToCart(name, price);
        addBtn.textContent = '✅ Added!';
        addBtn.disabled = true;
        setTimeout(() => { addBtn.textContent = '🛒 Add to Cart'; addBtn.disabled = false; }, 1500);
      });
    }

    if (wishBtn) {
      const saved = wishlist.includes(name);
      wishBtn.textContent = saved ? '♥' : '♡';
      if (saved) wishBtn.classList.add('wishlisted');
      wishBtn.addEventListener('click', () => toggleWishlist(wishBtn, name));
    }
  });
}

/* ── HAMBURGER MENU ── */
function wireHamburger() {
  const ham = document.getElementById('hamburger');
  const nav = document.getElementById('navLinks');
  if (ham && nav) ham.addEventListener('click', () => nav.classList.toggle('open'));
}

/* ── SEARCH BAR ── */
function wireSearch() {
  const searchInputs = document.querySelectorAll('.search-bar input');
  searchInputs.forEach(input => {
    const btn = input.nextElementSibling;
    const doSearch = () => {
      const q = input.value.trim();
      if (q) {
        window.location.href = 'products.html?search=' + encodeURIComponent(q);
      }
    };
    if (btn) btn.addEventListener('click', doSearch);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  });
}

/* ── PRODUCT PAGE: FILTER SEARCH ── */
function wireProductSearch() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('search');
  if (!q) return;

  const cards = document.querySelectorAll('.product-card');
  let found = 0;
  cards.forEach(card => {
    const name = (card.querySelector('.product-name') || {}).textContent || '';
    const cat = (card.querySelector('.product-category') || {}).textContent || '';
    if (name.toLowerCase().includes(q.toLowerCase()) || cat.toLowerCase().includes(q.toLowerCase())) {
      card.style.display = '';
      found++;
    } else {
      card.style.display = 'none';
    }
  });

  const countEl = document.querySelector('.result-count strong');
  if (countEl) countEl.textContent = `${found} product${found !== 1 ? 's' : ''} for "${q}"`;

  // Pre-fill search bar
  document.querySelectorAll('.search-bar input').forEach(el => el.value = q);
}

/* ── PRODUCT PAGE: SORT ── */
function wireSort() {
  const sortSelect = document.getElementById('sortBy');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', () => {
    const grid = document.querySelector('.products-main-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.product-card'));
    const getPrice = c => parseFloat((c.querySelector('.product-price') || {}).textContent.replace(/[^\d.]/g, '') || 0);

    cards.sort((a, b) => {
      switch (sortSelect.value) {
        case 'Price: Low to High': return getPrice(a) - getPrice(b);
        case 'Price: High to Low': return getPrice(b) - getPrice(a);
        default: return 0;
      }
    });
    cards.forEach(c => grid.appendChild(c));
  });
}

/* ── PRODUCT PAGE: FILTER BUTTON ── */
function wireFilterBtn() {
  const btn = document.querySelector('.filter-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const minInput = document.querySelector('.price-range-inputs input:first-child');
    const maxInput = document.querySelector('.price-range-inputs input:last-child');
    const min = parseFloat(minInput?.value || 0);
    const max = parseFloat(maxInput?.value || Infinity);

    const cards = document.querySelectorAll('.product-card');
    let found = 0;
    cards.forEach(card => {
      const price = parseFloat((card.querySelector('.product-price') || {}).textContent.replace(/[^\d.]/g, '') || 0);
      if (price >= min && price <= max) { card.style.display = ''; found++; }
      else card.style.display = 'none';
    });
    toast(`Showing ${found} products in ₵${min.toLocaleString()}–₵${max.toLocaleString()} range`);
    const countEl = document.querySelector('.result-count strong');
    if (countEl) countEl.textContent = `${found} products`;
  });
}

/* ── PRODUCT PAGE: PAGINATION ── */
function wirePagination() {
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast('📄 Page ' + btn.textContent);
    });
  });
}

/* ── CATEGORY FILTER CHECKBOXES ── */
function wireCategoryCheckboxes() {
  const checkboxes = document.querySelectorAll('.sidebar-section input[type=checkbox]');
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      const checkedCats = Array.from(document.querySelectorAll('.sidebar-section:first-child input:checked'))
        .map(c => c.parentElement.textContent.trim().replace(/\(\d+\)/, '').trim().toLowerCase());

      const cards = document.querySelectorAll('.product-card');
      cards.forEach(card => {
        const cat = (card.querySelector('.product-category') || {}).textContent.trim().toLowerCase();
        const show = checkedCats.length === 0 || checkedCats.some(c => cat.includes(c.toLowerCase().replace(/&amp;/g, '&').split(' ')[0]));
        card.style.display = show ? '' : 'none';
      });
    });
  });
}

/* ── CART PAGE FUNCTIONALITY ── */
function wireCartPage() {
  if (!document.querySelector('.cart-section')) return;

  // Quantity controls
  document.querySelectorAll('.cart-qty-control').forEach(ctrl => {
    const input = ctrl.querySelector('input');
    const [minus, plus] = ctrl.querySelectorAll('button');
    minus.addEventListener('click', () => {
      const v = Math.max(1, parseInt(input.value) - 1);
      input.value = v;
      recalcCart();
    });
    plus.addEventListener('click', () => {
      input.value = parseInt(input.value) + 1;
      recalcCart();
    });
    input.addEventListener('change', recalcCart);
  });

  // Remove items
  document.querySelectorAll('.cart-item-remove').forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.cart-item');
      item.style.opacity = '0';
      item.style.transition = 'opacity 0.3s';
      setTimeout(() => { item.remove(); recalcCart(); }, 300);
      toast('🗑 Item removed from cart', 'info');
    });
  });

  // Update cart button
  const updateBtn = document.querySelector('.cart-actions button');
  if (updateBtn) {
    updateBtn.addEventListener('click', () => {
      recalcCart();
      toast('✅ Cart updated!');
    });
  }

  // Coupon
  const couponBtn = document.querySelector('.coupon-row button');
  const couponInput = document.querySelector('.coupon-row input');
  if (couponBtn && couponInput) {
    couponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      const discounts = { 'GHANA20': 20, 'WELCOME10': 10, 'SMARTBUY15': 15 };
      if (discounts[code]) {
        appliedDiscount = discounts[code];
        recalcCart();
        toast(`🎉 Coupon ${code} applied! ${discounts[code]}% off`);
        document.querySelector('.summary-row.discount span:last-child').textContent =
          `− ₵${(getSubtotal() * appliedDiscount / 100).toLocaleString()}`;
      } else {
        toast('❌ Invalid coupon code', 'error');
      }
    });
  }

  // Checkout button
  const checkoutBtn = document.querySelector('.checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toast('🔒 Proceeding to secure checkout...');
      setTimeout(() => alert('✅ In a real site, this would go to the payment page.\n\nAccepted: MTN MoMo, Vodafone Cash, VISA, Mastercard'), 1000);
    });
  }

  // Move saved item to cart
  const moveBtn = document.querySelector('[class="btn-secondary"]');
  if (moveBtn && moveBtn.textContent.includes('Move to Cart')) {
    moveBtn.addEventListener('click', () => {
      toast('🛒 Nike Air Max moved to cart!');
      moveBtn.closest('div[style]').style.opacity = '0.4';
      moveBtn.disabled = true;
      moveBtn.textContent = '✅ In Cart';
    });
  }

  recalcCart();
}

let appliedDiscount = 0;
function getSubtotal() {
  let sub = 0;
  document.querySelectorAll('.cart-item').forEach(item => {
    const priceEl = item.querySelector('.cart-item-price');
    const qtyEl = item.querySelector('input[type=number]');
    if (priceEl && qtyEl) {
      const price = parseFloat(priceEl.textContent.replace(/[^\d.]/g, ''));
      sub += price * parseInt(qtyEl.value || 1);
    }
  });
  return sub;
}

function recalcCart() {
  document.querySelectorAll('.cart-item').forEach(item => {
    const priceEl = item.querySelector('.cart-item-price');
    const qtyEl = item.querySelector('input[type=number]');
    const totalEl = item.querySelector('.cart-item-total');
    if (priceEl && qtyEl && totalEl) {
      const price = parseFloat(priceEl.textContent.replace(/[^\d.]/g, ''));
      const qty = parseInt(qtyEl.value || 1);
      totalEl.textContent = '₵' + (price * qty).toLocaleString();
    }
  });

  const sub = getSubtotal();
  const discount = sub * appliedDiscount / 100;
  const vat = (sub - discount) * 0.15;
  const total = sub - discount + vat;

  const rows = document.querySelectorAll('.summary-row span:last-child');
  if (rows[0]) rows[0].textContent = '₵' + sub.toLocaleString();
  if (rows[1]) rows[1].textContent = appliedDiscount > 0 ? `− ₵${discount.toLocaleString()}` : '− ₵0.00';
  if (rows[3]) rows[3].textContent = '₵' + Math.round(vat).toLocaleString();
  const totalEl = document.querySelector('.summary-row.total .amount');
  if (totalEl) totalEl.textContent = '₵' + Math.round(total).toLocaleString();

  const itemCount = document.querySelectorAll('.cart-item').length;
  const subtitleEl = document.querySelector('.summary-row span:first-child');
  if (subtitleEl) subtitleEl.textContent = `Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})`;
}

/* ── PRODUCT DETAILS PAGE ── */
function wireProductDetailPage() {
  if (!document.querySelector('.product-detail-section')) return;

  // Add to Cart large
  const cartLargeBtn = document.querySelector('.btn-cart-large');
  if (cartLargeBtn) {
    cartLargeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = (document.querySelector('.detail-title') || {}).textContent || 'Product';
      const price = (document.querySelector('.detail-price') || {}).textContent || '';
      const qty = parseInt(document.getElementById('qtyInput')?.value || 1);
      addToCart(name, price, qty);
      cartLargeBtn.textContent = '✅ Added to Cart!';
      setTimeout(() => cartLargeBtn.textContent = '🛒 Add to Cart', 2000);
    });
  }

  // Buy Now
  const buyBtn = document.querySelector('.btn-buy-large');
  if (buyBtn) {
    buyBtn.addEventListener('click', () => {
      toast('⚡ Redirecting to checkout...');
      setTimeout(() => alert('In a real store, this takes you straight to payment!'), 800);
    });
  }

  // Wishlist large
  const wishLarge = document.querySelector('.btn-wish-large');
  if (wishLarge) {
    const name = (document.querySelector('.detail-title') || {}).textContent || 'Product';
    wishLarge.addEventListener('click', () => toggleWishlist(wishLarge, name));
  }

  // Color swatches
  document.querySelectorAll('[title$="Titanium"], [title="Black Titanium"]').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('[title$="Titanium"]').forEach(s => s.style.border = '2px solid var(--border)');
      swatch.style.border = '3px solid var(--primary)';
      const colorLabel = document.querySelector('.detail-actions')?.previousElementSibling?.previousElementSibling?.previousElementSibling?.querySelector('span:last-child');
    });
  });

  // Storage options
  document.querySelectorAll('.qty-selector').length; // just ensure wired
}

/* ── NEWSLETTER FORM ── */
function wireNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type=email]').value.trim();
    if (!email) { toast('Please enter a valid email', 'error'); return; }
    toast('🎉 Subscribed! Check your inbox for exclusive deals.');
    form.querySelector('input').value = '';
  });
}

/* ── CONTACT FORM ── */
function wireContactForm() {
  const form = document.querySelector('.contact-form, form[id]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    toast('✅ Message sent! We\'ll reply within 24 hours.');
    form.reset();
  });
}

/* ── FAQ ACCORDION ── */
function wireFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    const a = item.querySelector('.faq-answer');
    if (!q || !a) return;
    a.style.display = 'none';
    q.style.cursor = 'pointer';
    q.addEventListener('click', () => {
      const isOpen = a.style.display !== 'none';
      document.querySelectorAll('.faq-answer').forEach(el => el.style.display = 'none');
      document.querySelectorAll('.faq-question span').forEach(s => s.textContent = '+');
      if (!isOpen) {
        a.style.display = 'block';
        const span = q.querySelector('span');
        if (span) span.textContent = '−';
      }
    });
  });
}

/* ── INJECT TOAST CSS ── */
function injectToastStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .sb-toast {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      background: #1a3a6b; color: #fff; padding: 14px 22px;
      border-radius: 10px; font-size: .9rem; font-weight: 600;
      box-shadow: 0 6px 24px rgba(0,0,0,.25);
      opacity: 0; transform: translateY(20px);
      transition: opacity .3s, transform .3s;
      max-width: 320px;
    }
    .sb-toast.show { opacity: 1; transform: translateY(0); }
    .sb-toast.error { background: #c0392b; }
    .sb-toast.info  { background: #2c7a7b; }
    .wishlist-btn.wishlisted { color: #e74c3c !important; }
    .cart-count { display: inline-flex; align-items: center; justify-content: center;
      background: #e74c3c; color: #fff; border-radius: 50%;
      width: 20px; height: 20px; font-size: .72rem; font-weight: 800; margin-left: 4px; }
  `;
  document.head.appendChild(style);
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  injectToastStyles();
  wireHamburger();
  wireSearch();
  updateCartBadge();
  wireProductCards();
  wireNewsletter();
  wireContactForm();
  wireFAQ();

  // Page-specific
  const path = window.location.pathname;
  if (path.includes('products.html')) {
    wireProductSearch();
    wireSort();
    wireFilterBtn();
    wirePagination();
    wireCategoryCheckboxes();
  }
  if (path.includes('cart.html')) {
    wireCartPage();
  }
  if (path.includes('product-details.html')) {
    wireProductDetailPage();
  }
});
