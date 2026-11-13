(function () {
  var FREE_FROM = 8000; // demo threshold for free Nova Poshta delivery, UAH
  var PRODUCTS = {
    mallow: { title: 'Dress "Mallow"', price: 3920, was: 5600, img: 'assets/img/dress_mallow.webp' },
    mallow35: { title: 'Dress "Mallow"', price: 3500, was: 5600, img: 'assets/img/dress_mallow.webp' },
    raglan: { title: 'Raglan Top "Festive Goats"', price: 2900, was: 0, img: 'assets/img/raglan_goats.webp' },
    fleece: { title: 'Fleece Sweatshirt "Home"', price: 3700, was: 0, img: 'assets/img/fleece_home.webp' },
    mint: { title: 'Embroidered Linen Wrap Dress "Forest Tale"', price: 9600, was: 0, img: 'assets/img/dress_mint.webp' },
    pink: { title: 'Embroidered Cotton Wrap Dress "Forest Tale"', price: 5500, was: 0, img: 'assets/img/dress_pink.webp' },
    vest: { title: 'Quilted Embroidered Vest "Carpathians"', price: 4900, was: 0, img: 'assets/img/vest_carpathians.webp' }
  };

  function load(key, def) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {} }
  function uah(n) { return '₴' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var state = {
    lines: load('syn_cart', [
      { id: 'mallow', variant: 'Pink · S-M', qty: 1 },
      { id: 'raglan', variant: 'Blue stripe · S-M', qty: 1 }
    ]),
    market: load('syn_market', 'ukraine'),
    note: false
  };

  function persist() { save('syn_cart', state.lines); save('syn_market', state.market); }

  function render() {
    var count = state.lines.reduce(function (s, l) { return s + l.qty; }, 0);
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = count; });
    var d = document.getElementById('drawer'); if (!d) return;
    var isUA = state.market === 'ukraine';
    var subtotal = 0, saving = 0, html = '';
    state.lines.forEach(function (l, i) {
      var p = PRODUCTS[l.id]; if (!p) return;
      subtotal += p.price * l.qty; if (p.was) saving += (p.was - p.price) * l.qty;
      html += '<div class="line"><a class="ph" href="product.html"><img src="' + p.img + '" alt="' + esc(p.title) + '"></a><div class="info">' +
        '<div class="top"><a href="product.html">' + esc(p.title) + '</a><button class="rm" aria-label="Remove" data-rm="' + i + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6A7174" stroke-width="1.6" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div>' +
        '<small>' + esc(l.variant) + '</small><div class="bottom"><span class="qty"><button aria-label="Decrease" data-dec="' + i + '">−</button><span>' + l.qty + '</span><button aria-label="Increase" data-inc="' + i + '">+</button></span>' +
        '<span class="price' + (p.was ? ' sale' : '') + '"><b>' + uah(p.price * l.qty) + '</b>' + (p.was ? '<s>' + uah(p.was * l.qty) + '</s>' : '') + '</span></div></div></div>';
    });
    if (!state.lines.length) html = '<p class="empty">Your cart is empty.</p>';
    if (!state.lines.some(function (l) { return l.id === 'fleece'; })) {
      html += '<div class="upsell"><img src="assets/img/fleece_home.webp" alt=""><span><small>Complete the look</small><b>Fleece Sweatshirt "Home"</b><br>₴3 700</span><button data-upsell>Add</button></div>';
    }
    html += '<button class="notebtn" data-note aria-expanded="' + state.note + '">Add a note or gift message<span>' + (state.note ? '−' : '+') + '</span></button>' +
      (state.note ? '<label class="sr" for="cart-note">Order note</label><textarea id="cart-note" rows="3" placeholder="For example: it\'s a gift, please don\'t include the receipt"></textarea>' : '');
    d.querySelector('.lines').innerHTML = html;
    d.querySelector('[data-count]').textContent = '(' + count + ')';
    var left = Math.max(0, FREE_FROM - subtotal);
    d.querySelector('.ship').innerHTML = isUA
      ? (left > 0 ? 'Add ' + uah(left) + ' more for free Nova Poshta delivery' : 'You have free Nova Poshta delivery') +
        '<div class="bar"><i style="width:' + Math.min(100, Math.round(subtotal / FREE_FROM * 100)) + '%"></i></div>'
      : 'We ship worldwide. Delivery and duties are shown at checkout.';
    d.querySelector('[data-subtotal]').textContent = uah(subtotal);
    var sv = d.querySelector('[data-save]'); sv.textContent = saving ? 'You save ' + uah(saving) : ''; sv.style.display = saving ? '' : 'none';
    d.querySelector('[data-tax]').textContent = isUA ? 'Delivery is calculated at checkout.' : 'Taxes, duties and shipping are calculated at checkout.';
    d.querySelector('[data-cta]').textContent = isUA ? 'Checkout · Nova Poshta →' : 'Checkout →';
    d.querySelector('.express').style.display = isUA ? 'none' : 'flex';
    d.querySelector('[data-pay]').textContent = isUA ? 'Secure checkout · [Monobank, cards, Apple Pay, Google Pay]' : 'Secure checkout · [card brands]';
    document.querySelectorAll('[data-market]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-market') === state.market); });
    document.querySelectorAll('[data-market-label]').forEach(function (el) { el.textContent = isUA ? 'EN · ₴' : 'EN · Intl'; });
    persist();
  }

  function openCart() { document.body.classList.add('cart-open'); }
  function closeCart() { document.body.classList.remove('cart-open'); }
  function toast(msg) {
    var t = document.getElementById('toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }
  window.SYN = {
    add: function (id, variant) {
      var ex = state.lines.find(function (l) { return l.id === id && l.variant === variant; });
      if (ex) ex.qty++; else state.lines.push({ id: id, variant: variant, qty: 1 });
      render(); openCart();
    },
    toast: toast
  };

  document.addEventListener('click', function (e) {
    var t = e.target.closest('button,a'); if (!t) return;
    if (t.matches('[data-open-cart]')) { e.preventDefault(); openCart(); }
    else if (t.matches('[data-close-cart]')) closeCart();
    else if (t.hasAttribute('data-inc')) { state.lines[+t.getAttribute('data-inc')].qty++; render(); }
    else if (t.hasAttribute('data-dec')) { var i = +t.getAttribute('data-dec'); state.lines[i].qty--; if (state.lines[i].qty < 1) state.lines.splice(i, 1); render(); }
    else if (t.hasAttribute('data-rm')) { state.lines.splice(+t.getAttribute('data-rm'), 1); render(); }
    else if (t.hasAttribute('data-upsell')) { state.lines.push({ id: 'fleece', variant: 'Green · One size', qty: 1 }); render(); }
    else if (t.hasAttribute('data-note')) { state.note = !state.note; render(); }
    else if (t.hasAttribute('data-market')) { state.market = t.getAttribute('data-market'); render(); }
    else if (t.matches('[data-checkout]')) { e.preventDefault(); toast(state.market === 'ukraine' ? 'Demo: would open GetCheckout (Nova Poshta)' : 'Demo: would open Shopify checkout'); }
    else if (t.matches('[data-demo]')) { e.preventDefault(); toast('Demo page — link not active yet'); }
    else if (t.hasAttribute('data-scroll')) {
      var tr = document.getElementById(t.getAttribute('data-scroll')); if (tr) tr.scrollBy({ left: (+t.getAttribute('data-dir')) * 324, behavior: 'smooth' });
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });
  document.addEventListener('DOMContentLoaded', render);
})();
