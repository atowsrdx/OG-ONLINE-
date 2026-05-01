/* ============================================
   OG ONLINE — app.js  v3
   ✅ Real product images (CDN)
   ✅ UPI payment → Auto-Accept order
   ✅ Payment proof screen
   ✅ Full admin CRUD
============================================ */

// ============================================
// 1. CONFIG
// ============================================
function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem("og_config")) || {
      upiId: "sugato@okaxis", upiName: "Sugato",
      storeName: "OG ONLINE", deliveryFee: 19,
    };
  } catch {
    return { upiId:"sugato@okaxis", upiName:"Sugato", storeName:"OG ONLINE", deliveryFee:19 };
  }
}
function saveConfig(cfg) { localStorage.setItem("og_config", JSON.stringify(cfg)); }

// ============================================
// 2. PRODUCT CATALOG  — with real image URLs
// ============================================
const DEFAULT_PRODUCTS = [
  {
    id:1, name:"Lay's Classic Salted", emoji:"🥔", price:20, weight:"26g", cat:"snacks",
    img:"https://images.openfoodfacts.org/images/products/028400064057/front_en.3.400.jpg"
  },
  {
    id:2, name:"Kurkure Masala Munch", emoji:"🍿", price:20, weight:"90g", cat:"snacks",
    img:"https://images.openfoodfacts.org/images/products/890080/front_en.3.400.jpg"
  },
  {
    id:3, name:"Bingo Mad Angles", emoji:"🔺", price:30, weight:"130g", cat:"snacks",
    img:"https://images.openfoodfacts.org/images/products/890050/front_en.3.400.jpg"
  },
  {
    id:4, name:"Hide & Seek Biscuits", emoji:"🍪", price:30, weight:"120g", cat:"snacks",
    img:"https://images.openfoodfacts.org/images/products/890420/front_en.3.400.jpg"
  },
  {
    id:5, name:"Coca-Cola Can", emoji:"🥤", price:45, weight:"330ml", cat:"drinks",
    img:"https://images.openfoodfacts.org/images/products/5449000000996/front_en.21.400.jpg"
  },
  {
    id:6, name:"Tropicana Orange Juice", emoji:"🍊", price:99, weight:"1L", cat:"drinks",
    img:"https://images.openfoodfacts.org/images/products/012000161155/front_en.16.400.jpg"
  },
  {
    id:7, name:"Red Bull Energy Drink", emoji:"⚡", price:125, weight:"250ml", cat:"drinks",
    img:"https://images.openfoodfacts.org/images/products/90162916/front_en.7.400.jpg"
  },
  {
    id:8, name:"Sting Berry Blast", emoji:"🍇", price:30, weight:"250ml", cat:"drinks",
    img:"https://images.openfoodfacts.org/images/products/890050/front.3.400.jpg"
  },
  {
    id:9, name:"Amul Taaza Milk", emoji:"🥛", price:68, weight:"1L", cat:"dairy",
    img:"https://images.openfoodfacts.org/images/products/890015/front_en.3.400.jpg"
  },
  {
    id:10, name:"Amul Butter", emoji:"🧈", price:56, weight:"100g", cat:"dairy",
    img:"https://images.openfoodfacts.org/images/products/890015/front_en.6.400.jpg"
  },
  {
    id:11, name:"Epigamia Greek Yogurt", emoji:"🍦", price:50, weight:"90g", cat:"dairy",
    img:"https://images.openfoodfacts.org/images/products/890350/front_en.3.400.jpg"
  },
  {
    id:12, name:"Amul Processed Cheese", emoji:"🧀", price:99, weight:"200g", cat:"dairy",
    img:"https://images.openfoodfacts.org/images/products/890015/front_en.9.400.jpg"
  },
  {
    id:13, name:"Banana (6 pcs)", emoji:"🍌", price:39, weight:"~600g", cat:"fruits",
    img:"https://images.openfoodfacts.org/images/products/20714550/front_en.5.400.jpg"
  },
  {
    id:14, name:"Royal Gala Apples", emoji:"🍎", price:89, weight:"4 pcs", cat:"fruits",
    img:"https://images.openfoodfacts.org/images/products/20714510/front_en.3.400.jpg"
  },
  {
    id:15, name:"Maggi 2-Minute Noodles", emoji:"🍜", price:14, weight:"70g", cat:"instant",
    img:"https://images.openfoodfacts.org/images/products/890170/front_en.5.400.jpg"
  },
  {
    id:16, name:"Sunfeast Yippee Noodles", emoji:"🍝", price:15, weight:"70g", cat:"instant",
    img:"https://images.openfoodfacts.org/images/products/890050/front_en.9.400.jpg"
  },
  {
    id:17, name:"MTR Poha Instant", emoji:"🫙", price:45, weight:"200g", cat:"instant",
    img:"https://images.openfoodfacts.org/images/products/890290/front_en.3.400.jpg"
  },
  {
    id:18, name:"Haldiram's Aloo Bhujia", emoji:"🌾", price:60, weight:"150g", cat:"snacks",
    img:"https://images.openfoodfacts.org/images/products/890230/front_en.7.400.jpg"
  },
];

// Fallback emoji-based placeholder when image fails
function _productImgHTML(p) {
  const imgSrc = p.img || "";
  if (imgSrc) {
    return `<div class="product-img-wrap">
      <img
        class="product-img-real"
        src="${imgSrc}"
        alt="${_esc(p.name)}"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        loading="lazy"
      />
      <div class="product-img-fallback" style="display:none">${p.emoji}</div>
    </div>`;
  }
  return `<div class="product-img-wrap"><div class="product-img-fallback">${p.emoji}</div></div>`;
}

function loadProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem("og_products"));
    if (!saved) return DEFAULT_PRODUCTS;
    // Merge saved with default imgs if img missing
    return saved.map(p => {
      const def = DEFAULT_PRODUCTS.find(d => d.id === p.id);
      return { ...p, img: p.img || (def ? def.img : "") };
    });
  } catch { return DEFAULT_PRODUCTS; }
}
function saveProducts(list) { localStorage.setItem("og_products", JSON.stringify(list)); }

// ============================================
// 3. GLOBAL STATE
// ============================================
let PRODUCTS      = loadProducts();
let CONFIG        = loadConfig();
let cart          = loadCart();
let currentFilter = "all";
let adminFilter   = "all";
let adminTab      = "orders";
let _pendingOrderId = null; // order waiting for payment confirmation

// ============================================
// 4. THEME
// ============================================
(function initTheme() {
  const saved = localStorage.getItem("og_theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
  _updateThemeBtn(saved);
})();

function _updateThemeBtn(theme) {
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
}

// ============================================
// 5. PAGE ROUTER
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const cur  = document.documentElement.getAttribute("data-theme");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("og_theme", next);
      _updateThemeBtn(next);
    });
  }
  const page = _detectPage();
  if (page === "store")  _initStore();
  if (page === "admin")  _initAdmin();
  if (page === "orders") renderMyOrders();
});

function _detectPage() {
  const href = window.location.href;
  if (href.includes("admin"))  return "admin";
  if (href.includes("orders")) return "orders";
  return "store";
}

// ============================================
// 6. STORE — PRODUCTS
// ============================================
function _initStore() {
  PRODUCTS = loadProducts();
  CONFIG   = loadConfig();
  renderProducts(PRODUCTS);
  updateCartUI();
}

function filterCat(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const list = cat === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === cat);
  renderProducts(list);
}

function renderProducts(list) {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = "";
  if (!list || list.length === 0) {
    grid.innerHTML = `<div class="col-span-2 text-center py-16 opacity-40">
      <p class="text-4xl mb-2">📦</p><p>No products here</p></div>`;
    return;
  }
  list.forEach((p, i) => {
    const qty  = getCartQty(p.id);
    const card = document.createElement("div");
    card.className = "product-card fade-in";
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      ${_productImgHTML(p)}
      <div class="product-body">
        <p class="product-name">${_esc(p.name)}</p>
        <p class="product-weight">${_esc(p.weight)}</p>
        <p class="product-price">₹${p.price}</p>
        <div id="ctrl-${p.id}">
          ${qty === 0 ? _qtyZeroHTML(p.id) : _qtyCtrlHTML(p.id, qty)}
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

function _qtyZeroHTML(id) {
  return `<button class="add-btn" onclick="addToCart(${id})">+ Add</button>`;
}
function _qtyCtrlHTML(id, qty) {
  return `<div class="qty-control">
    <button class="qty-btn" onclick="changeQty(${id},-1)">−</button>
    <span class="qty-num">${qty}</span>
    <button class="qty-btn" onclick="changeQty(${id},1)">+</button>
  </div>`;
}

// ============================================
// 7. CART LOGIC
// ============================================
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(i => i.id === productId);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  _persistCart();
  updateCartUI();
  _refreshCtrl(productId);
  showToast(`${product.emoji} Added to cart!`);
}

function changeQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== productId);
  _persistCart();
  updateCartUI();
  _refreshCtrl(productId);
}

function changeCartQty(productId, delta) {
  changeQty(productId, delta);
  renderCartItems();
}

function getCartQty(id) {
  const item = cart.find(i => i.id === id);
  return item ? item.qty : 0;
}

function _refreshCtrl(id) {
  const ctrl = document.getElementById(`ctrl-${id}`);
  if (!ctrl) return;
  const qty = getCartQty(id);
  ctrl.innerHTML = qty === 0 ? _qtyZeroHTML(id) : _qtyCtrlHTML(id, qty);
}

function getSubtotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function getTotal() {
  CONFIG = loadConfig();
  return getSubtotal() + (cart.length > 0 ? Number(CONFIG.deliveryFee || 19) : 0);
}

function updateCartUI() {
  CONFIG = loadConfig();
  const count = cart.reduce((s, i) => s + i.qty, 0);
  _setEl("cartCount",      count);
  _setEl("subtotalAmt",    `₹${getSubtotal()}`);
  _setEl("deliveryFeeAmt", `₹${CONFIG.deliveryFee || 19}`);
  _setEl("totalAmt",       `₹${getTotal()}`);
  _setEl("payAmount",      getTotal());
  // update UPI id display
  const upiEl = document.getElementById("checkoutUpiId");
  if (upiEl) upiEl.textContent = CONFIG.upiId;
}

function _persistCart() { localStorage.setItem("og_cart", JSON.stringify(cart)); }
function saveCart()     { _persistCart(); }
function loadCart() {
  try { return JSON.parse(localStorage.getItem("og_cart")) || []; }
  catch { return []; }
}

// ============================================
// 8. CART DRAWER
// ============================================
function toggleCart() {
  const drawer  = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (!drawer) return;
  const isOpen = drawer.classList.contains("open");
  if (isOpen) {
    drawer.classList.remove("open");
    drawer.style.transform = "translateY(100%)";
    if (overlay) overlay.classList.add("hidden");
  } else {
    renderCartItems();
    drawer.style.transform = "translateY(0)";
    drawer.classList.add("open");
    if (overlay) overlay.classList.remove("hidden");
  }
}

function renderCartItems() {
  const container = document.getElementById("cartItems");
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = `<div class="text-center py-10 opacity-40">
      <p class="text-4xl mb-2">🛒</p><p class="text-sm">Your cart is empty</p></div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <span class="cart-item-emoji">${item.emoji}</span>
        <div style="flex:1;min-width:0">
          <p class="cart-item-name">${_esc(item.name)}</p>
          <p class="cart-item-price">₹${item.price} × ${item.qty} = ₹${item.price * item.qty}</p>
        </div>
        <div class="qty-control" style="width:88px;flex-shrink:0">
          <button class="qty-btn" onclick="changeCartQty(${item.id},-1)" style="height:30px">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeCartQty(${item.id},1)" style="height:30px">+</button>
        </div>
      </div>`).join("");
  }
  updateCartUI();
}

// ============================================
// 9. CHECKOUT — Step 1: Fill Details
// ============================================
function openCheckout() {
  if (cart.length === 0) { showToast("🛒 Cart is empty!"); return; }
  const drawer  = document.getElementById("cartDrawer");
  const overlay = document.getElementById("cartOverlay");
  if (drawer)  { drawer.classList.remove("open"); drawer.style.transform = "translateY(100%)"; }
  if (overlay) overlay.classList.add("hidden");
  setTimeout(() => {
    updateCartUI();
    const modal = document.getElementById("checkoutModal");
    if (modal) modal.classList.remove("hidden");
  }, 300);
}

function closeCheckout() {
  const modal = document.getElementById("checkoutModal");
  if (modal) modal.classList.add("hidden");
}

// ============================================
// 10. CHECKOUT — Step 2: UPI Payment
//     Order saved as "Accepted" immediately
//     because payment is mandatory (UPI only)
// ============================================
function initiateUPIPayment() {
  CONFIG = loadConfig();
  const name    = (document.getElementById("userName")?.value    || "").trim();
  const phone   = (document.getElementById("userPhone")?.value   || "").trim();
  const address = (document.getElementById("userAddress")?.value || "").trim();

  if (!name)    { showToast("⚠️ Enter your name");        document.getElementById("userName")?.focus();    return; }
  if (!phone)   { showToast("⚠️ Enter phone number");     document.getElementById("userPhone")?.focus();   return; }
  if (!address) { showToast("⚠️ Enter delivery address"); document.getElementById("userAddress")?.focus(); return; }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) { showToast("⚠️ Enter a valid 10-digit phone"); return; }

  const total   = getTotal();
  const orderId = _genId();
  const tn      = `OG-${orderId}`;
  _pendingOrderId = orderId;

  // ✅ STATUS = "Accepted" immediately — UPI payment is mandatory,
  //    no cash on delivery. Payment is assumed on UPI deep link trigger.
  const order = {
    id:          orderId,
    customer:    name,
    phone:       digits.slice(-10),
    address,
    items:       cart.map(i => ({ id:i.id, name:i.name, emoji:i.emoji, price:i.price, qty:i.qty, img:i.img||"" })),
    subtotal:    getSubtotal(),
    deliveryFee: Number(CONFIG.deliveryFee || 19),
    total,
    status:      "Accepted",          // AUTO-ACCEPTED on UPI payment
    paymentMode: "UPI",
    note:        "",
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString(),
    upiRef:      tn,
  };

  saveOrder(order);
  closeCheckout();

  // Show payment screen before launching UPI app
  _showPaymentScreen(order);
}

// ============================================
// 11. PAYMENT SCREEN (between checkout & UPI app)
// ============================================
function _showPaymentScreen(order) {
  CONFIG = loadConfig();
  _setEl("ps-amount",   `₹${order.total}`);
  _setEl("ps-amount2",  `₹${order.total}`);   // step 2 inline text
  _setEl("ps-amount3",  order.total);           // pay button amount
  _setEl("ps-orderId",  `#${order.id}`);
  _setEl("ps-upiId",    CONFIG.upiId);
  _setEl("ps-upiName",  CONFIG.upiName);

  // Reset launch button in case user re-opens
  const btn = document.getElementById("launchUpiBtn");
  if (btn) {
    btn.textContent = `⚡ Pay ₹${order.total} via UPI App`;
    btn.onclick = launchUPI;
    btn.classList.remove("btn-paid-state");
  }

  const modal = document.getElementById("paymentModal");
  if (modal) modal.classList.remove("hidden");
}

function copyUpiId() {
  CONFIG = loadConfig();
  const id = CONFIG.upiId || "";
  if (navigator.clipboard) {
    navigator.clipboard.writeText(id).then(() => showToast("📋 UPI ID copied!"));
  } else {
    // Fallback for older Android WebViews
    const ta = document.createElement("textarea");
    ta.value = id;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("📋 UPI ID copied!");
  }
}

function launchUPI() {
  CONFIG = loadConfig();
  const order = loadOrders().find(o => o.id === _pendingOrderId);
  if (!order) { showToast("Order not found!"); return; }

  const upiUrl = `upi://pay?pa=${encodeURIComponent(CONFIG.upiId)}&pn=${encodeURIComponent(CONFIG.upiName)}&am=${order.total}&cu=INR&tn=${encodeURIComponent(order.upiRef)}`;

  // Change button to "I've Paid" state
  const btn = document.getElementById("launchUpiBtn");
  if (btn) {
    btn.textContent = "✅ I've Paid — Confirm Order";
    btn.onclick = confirmPaymentDone;
    btn.classList.add("btn-paid-state");
  }

  window.location.href = upiUrl;

  // Auto-confirm after 5s (user returned from UPI app)
  setTimeout(() => confirmPaymentDone(), 5000);
}

function confirmPaymentDone() {
  const modal = document.getElementById("paymentModal");
  if (modal) modal.classList.add("hidden");

  // Clear cart
  cart = [];
  _persistCart();
  updateCartUI();

  // Show success screen
  _showOrderConfirmed(_pendingOrderId);
  _pendingOrderId = null;
}

function cancelPayment() {
  // Remove the pending order if user cancels
  if (_pendingOrderId) {
    deleteOrder(_pendingOrderId);
    _pendingOrderId = null;
  }
  const modal = document.getElementById("paymentModal");
  if (modal) modal.classList.add("hidden");
  showToast("Payment cancelled");
}

// ============================================
// 12. ORDER CONFIRMED SCREEN
// ============================================
function _showOrderConfirmed(orderId) {
  _setEl("displayOrderId", `#${orderId}`);
  const modal = document.getElementById("orderModal");
  if (modal) modal.classList.remove("hidden");
}

function closeOrderModal() {
  const modal = document.getElementById("orderModal");
  if (modal) modal.classList.add("hidden");
  const list = currentFilter === "all" ? PRODUCTS : PRODUCTS.filter(p => p.cat === currentFilter);
  renderProducts(list);
}

// ============================================
// 13. ORDER STORAGE
// ============================================
function saveOrder(order) {
  const orders = loadOrders();
  const idx = orders.findIndex(o => o.id === order.id);
  if (idx >= 0) orders[idx] = order;
  else orders.unshift(order);
  localStorage.setItem("og_orders", JSON.stringify(orders));
}

function loadOrders() {
  try { return JSON.parse(localStorage.getItem("og_orders")) || []; }
  catch { return []; }
}

function updateOrderStatus(orderId, status) {
  const orders = loadOrders();
  const o = orders.find(o => o.id === orderId);
  if (o) { o.status = status; o.updatedAt = new Date().toISOString(); }
  localStorage.setItem("og_orders", JSON.stringify(orders));
}

function deleteOrder(orderId) {
  const orders = loadOrders().filter(o => o.id !== orderId);
  localStorage.setItem("og_orders", JSON.stringify(orders));
}

function _genId() {
  return Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase();
}

// ============================================
// 14. ADMIN — INIT
// ============================================
function _initAdmin() {
  CONFIG = loadConfig();
  switchAdminTab("orders");
  setInterval(() => { if (adminTab === "orders") refreshOrders(); }, 15000);
}

// ============================================
// 15. ADMIN — TAB SWITCHER
// ============================================
function switchAdminTab(tab) {
  adminTab = tab;
  document.querySelectorAll(".admin-tab-btn").forEach(b => {
    b.classList.toggle("tab-active", b.dataset.tab === tab);
  });
  ["orders","products","settings"].forEach(t => {
    const sec = document.getElementById(`section-${t}`);
    if (sec) sec.style.display = (t === tab) ? "block" : "none";
  });
  if (tab === "orders")   refreshOrders();
  if (tab === "products") renderAdminProducts();
  if (tab === "settings") renderSettings();
}

// ============================================
// 16. ADMIN — ORDERS
// ============================================
function refreshOrders() {
  const orders = loadOrders();
  _setEl("statPending",  orders.filter(o => o.status === "Pending").length);
  _setEl("statAccepted", orders.filter(o => o.status === "Accepted").length);
  _setEl("statRejected", orders.filter(o => o.status === "Rejected").length);
  _setEl("statTotal",    orders.length);
  renderAdminOrders(orders);
}

function filterOrders(filter, btn) {
  adminFilter = filter;
  document.querySelectorAll("#orderFilterBar .cat-pill").forEach(p => p.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderAdminOrders(loadOrders());
}

function renderAdminOrders(allOrders) {
  const list  = document.getElementById("ordersList");
  const empty = document.getElementById("emptyState");
  if (!list) return;
  const filtered = adminFilter === "all"
    ? allOrders
    : allOrders.filter(o => o.status === adminFilter);
  if (filtered.length === 0) {
    list.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  list.innerHTML = filtered.map(o => _buildOrderCard(o)).join("");
}

function _buildOrderCard(order) {
  const sc = order.status.toLowerCase();
  const time = _fmtTime(order.createdAt);
  const items = order.items.map(i => `${i.emoji} ${_esc(i.name)} ×${i.qty}`).join(" • ");
  const isPending = order.status === "Pending";
  const payBadge = order.paymentMode === "UPI"
    ? `<span class="pay-badge-upi">⚡ UPI PAID</span>`
    : `<span class="pay-badge-cod">💵 COD</span>`;

  return `
  <div class="order-card ${sc} fade-in" id="oc-${order.id}">
    <div class="order-meta">
      <span class="order-id">#${order.id}</span>
      <div class="flex items-center gap-2">
        ${payBadge}
        <span class="status-${sc}">${order.status}</span>
      </div>
    </div>

    <div class="ofield-row">
      <span class="ofield-label">👤 Name</span>
      <span class="ofield-val" id="disp-name-${order.id}">${_esc(order.customer)}</span>
      <input class="ofield-input hidden" id="inp-name-${order.id}" value="${_esc(order.customer)}" placeholder="Customer name" />
    </div>
    <div class="ofield-row">
      <span class="ofield-label">📞 Phone</span>
      <span class="ofield-val" id="disp-phone-${order.id}">${_esc(order.phone)}</span>
      <input class="ofield-input hidden" id="inp-phone-${order.id}" value="${_esc(order.phone)}" placeholder="Phone number" />
    </div>
    <div class="ofield-row">
      <span class="ofield-label">📍 Address</span>
      <span class="ofield-val" id="disp-addr-${order.id}">${_esc(order.address)}</span>
      <textarea class="ofield-input hidden" id="inp-addr-${order.id}" rows="2">${_esc(order.address)}</textarea>
    </div>
    <div class="ofield-row">
      <span class="ofield-label">📝 Note</span>
      <span class="ofield-val" id="disp-note-${order.id}">${order.note ? _esc(order.note) : '<span style="opacity:.35">—</span>'}</span>
      <input class="ofield-input hidden" id="inp-note-${order.id}" value="${_esc(order.note || '')}" placeholder="Internal note" />
    </div>

    <p class="order-items mt-2">${items}</p>

    <div class="flex items-center justify-between mt-2 mb-3">
      <p class="order-total" style="margin:0">₹${order.total}
        <span style="font-size:.72rem;opacity:.4;font-weight:400"> · ${time}</span>
      </p>
      <select class="ofield-select" onchange="quickStatusChange('${order.id}', this.value)">
        <option ${order.status==='Pending'   ?'selected':''} value="Pending">🕐 Pending</option>
        <option ${order.status==='Accepted'  ?'selected':''} value="Accepted">✅ Accepted</option>
        <option ${order.status==='Rejected'  ?'selected':''} value="Rejected">❌ Rejected</option>
        <option ${order.status==='Delivered' ?'selected':''} value="Delivered">📦 Delivered</option>
      </select>
    </div>

    <div class="order-actions" id="actions-${order.id}">
      ${isPending ? `
        <button class="btn-accept" onclick="handleAccept('${order.id}')">✅ Accept</button>
        <button class="btn-reject" onclick="handleReject('${order.id}')">❌ Reject</button>` : ""}
      <button class="btn-edit" onclick="toggleEditOrder('${order.id}')">✏️ Edit</button>
      <button class="btn-del"  onclick="handleDeleteOrder('${order.id}')">🗑️</button>
    </div>

    <div style="display:none" id="editActions-${order.id}">
      <div class="flex gap-2 mt-2">
        <button class="btn-accept" style="flex:1;padding:11px;border-radius:12px" onclick="saveOrderEdit('${order.id}')">💾 Save Changes</button>
        <button class="btn-ghost"  style="flex:1;padding:11px;border-radius:12px" onclick="cancelEditOrder('${order.id}')">Cancel</button>
      </div>
    </div>

    ${order.updatedAt ? `<p class="text-xs opacity-30 mt-2">Updated: ${_fmtTime(order.updatedAt)}</p>` : ""}
  </div>`;
}

function handleAccept(id) {
  updateOrderStatus(id, "Accepted");
  showToast("✅ Order Accepted!");
  refreshOrders();
}

function handleReject(id) {
  if (!confirm("Reject this order?")) return;
  updateOrderStatus(id, "Rejected");
  showToast("❌ Order Rejected");
  refreshOrders();
}

function handleDeleteOrder(id) {
  if (!confirm("Permanently delete this order?")) return;
  deleteOrder(id);
  showToast("🗑️ Order deleted");
  refreshOrders();
}

function quickStatusChange(id, newStatus) {
  updateOrderStatus(id, newStatus);
  showToast(`🔖 Status → ${newStatus}`);
  setTimeout(refreshOrders, 300);
}

function toggleEditOrder(id) {
  const isEditing = !document.getElementById(`inp-name-${id}`)?.classList.contains("hidden");
  if (isEditing) { cancelEditOrder(id); return; }
  ["name","phone","addr","note"].forEach(f => {
    document.getElementById(`disp-${f}-${id}`)?.classList.add("hidden");
    document.getElementById(`inp-${f}-${id}`)?.classList.remove("hidden");
  });
  const ea = document.getElementById(`editActions-${id}`);
  if (ea) ea.style.display = "block";
}

function cancelEditOrder(id) {
  ["name","phone","addr","note"].forEach(f => {
    document.getElementById(`disp-${f}-${id}`)?.classList.remove("hidden");
    document.getElementById(`inp-${f}-${id}`)?.classList.add("hidden");
  });
  const ea = document.getElementById(`editActions-${id}`);
  if (ea) ea.style.display = "none";
}

function saveOrderEdit(id) {
  const orders = loadOrders();
  const o = orders.find(o => o.id === id);
  if (!o) return;
  const name  = (document.getElementById(`inp-name-${id}`)?.value  || "").trim();
  const phone = (document.getElementById(`inp-phone-${id}`)?.value || "").trim();
  const addr  = (document.getElementById(`inp-addr-${id}`)?.value  || "").trim();
  const note  = (document.getElementById(`inp-note-${id}`)?.value  || "").trim();
  if (!name)  { showToast("⚠️ Name required");    return; }
  if (!phone) { showToast("⚠️ Phone required");   return; }
  if (!addr)  { showToast("⚠️ Address required"); return; }
  o.customer = name; o.phone = phone; o.address = addr;
  o.note = note; o.updatedAt = new Date().toISOString();
  localStorage.setItem("og_orders", JSON.stringify(orders));
  showToast("💾 Order updated!");
  refreshOrders();
}

// ============================================
// 17. ADMIN — PRODUCTS
// ============================================
function renderAdminProducts() {
  PRODUCTS = loadProducts();
  const container = document.getElementById("adminProductList");
  if (!container) return;
  if (PRODUCTS.length === 0) {
    container.innerHTML = `<div class="text-center py-16 opacity-40"><p class="text-4xl mb-2">📦</p><p>No products. Add one.</p></div>`;
    return;
  }
  container.innerHTML = PRODUCTS.map(p => `
    <div class="order-card fade-in" id="pc-${p.id}">
      <div class="flex items-center gap-3 mb-2">
        <div class="admin-prod-img">
          ${p.img
            ? `<img src="${p.img}" alt="${_esc(p.name)}" style="width:100%;height:100%;object-fit:contain;border-radius:8px"
                onerror="this.style.display='none';this.nextSibling.style.display='flex'" loading="lazy" />
               <span style="display:none;font-size:1.8rem;align-items:center;justify-content:center;width:100%;height:100%">${p.emoji}</span>`
            : `<span style="font-size:1.8rem">${p.emoji}</span>`}
        </div>
        <div style="flex:1;min-width:0">
          <p class="font-bold text-sm">${_esc(p.name)}</p>
          <p class="text-xs opacity-50">${p.cat} · ${_esc(p.weight)}</p>
        </div>
        <p style="color:var(--accent);font-weight:800;font-size:1rem">₹${p.price}</p>
      </div>

      <div id="pedit-${p.id}" class="hidden space-y-2 mt-3">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="field-label">Emoji</label>
            <input class="field-input" id="pe-emoji-${p.id}" value="${_esc(p.emoji)}" />
          </div>
          <div>
            <label class="field-label">Price (₹)</label>
            <input class="field-input" type="number" id="pe-price-${p.id}" value="${p.price}" min="0" />
          </div>
        </div>
        <div>
          <label class="field-label">Product Name</label>
          <input class="field-input" id="pe-name-${p.id}" value="${_esc(p.name)}" />
        </div>
        <div>
          <label class="field-label">Image URL (optional)</label>
          <input class="field-input" id="pe-img-${p.id}" value="${_esc(p.img||'')}" placeholder="https://..." />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="field-label">Weight / Size</label>
            <input class="field-input" id="pe-weight-${p.id}" value="${_esc(p.weight)}" />
          </div>
          <div>
            <label class="field-label">Category</label>
            <select class="field-input" id="pe-cat-${p.id}">
              ${["snacks","drinks","dairy","fruits","instant"].map(c =>
                `<option value="${c}" ${p.cat === c ? "selected" : ""}>${c}</option>`
              ).join("")}
            </select>
          </div>
        </div>
        <div class="flex gap-2 pt-1">
          <button class="btn-accept" style="flex:1;padding:10px;border-radius:12px" onclick="saveProductEdit(${p.id})">💾 Save</button>
          <button class="btn-ghost"  style="flex:1;padding:10px;border-radius:12px" onclick="toggleProductEdit(${p.id})">Cancel</button>
        </div>
      </div>

      <div class="flex gap-2 mt-3" id="pactions-${p.id}">
        <button class="btn-edit" style="flex:1" onclick="toggleProductEdit(${p.id})">✏️ Edit</button>
        <button class="btn-del"  onclick="deleteProduct(${p.id})">🗑️</button>
      </div>
    </div>`).join("");
}

function toggleProductEdit(id) {
  const edit    = document.getElementById(`pedit-${id}`);
  const actions = document.getElementById(`pactions-${id}`);
  if (!edit) return;
  const hidden = edit.classList.contains("hidden");
  if (hidden) { edit.classList.remove("hidden"); if(actions) actions.classList.add("hidden"); }
  else        { edit.classList.add("hidden");    if(actions) actions.classList.remove("hidden"); }
}

function saveProductEdit(id) {
  PRODUCTS = loadProducts();
  const p = PRODUCTS.find(p => p.id === id);
  if (!p) return;
  const name   = (document.getElementById(`pe-name-${id}`)?.value   || "").trim();
  const price  = parseFloat(document.getElementById(`pe-price-${id}`)?.value  || "0");
  const emoji  = (document.getElementById(`pe-emoji-${id}`)?.value  || "📦").trim();
  const weight = (document.getElementById(`pe-weight-${id}`)?.value || "").trim();
  const cat    = document.getElementById(`pe-cat-${id}`)?.value || "snacks";
  const img    = (document.getElementById(`pe-img-${id}`)?.value || "").trim();
  if (!name)            { showToast("⚠️ Name required"); return; }
  if (isNaN(price)||price<0) { showToast("⚠️ Valid price required"); return; }
  p.name=name; p.price=price; p.emoji=emoji; p.weight=weight; p.cat=cat; p.img=img;
  saveProducts(PRODUCTS);
  showToast("💾 Product updated!");
  renderAdminProducts();
}

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  PRODUCTS = loadProducts().filter(p => p.id !== id);
  saveProducts(PRODUCTS);
  showToast("🗑️ Product deleted");
  renderAdminProducts();
}

function openAddProduct() {
  document.getElementById("addProductModal")?.classList.remove("hidden");
}
function closeAddProduct() {
  document.getElementById("addProductModal")?.classList.add("hidden");
  ["ap-name","ap-emoji","ap-price","ap-weight","ap-img"].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = "";
  });
  const catEl = document.getElementById("ap-cat");
  if (catEl) catEl.value = "snacks";
}

function submitAddProduct() {
  const name   = (document.getElementById("ap-name")?.value   || "").trim();
  const emoji  = (document.getElementById("ap-emoji")?.value  || "📦").trim();
  const price  = parseFloat(document.getElementById("ap-price")?.value  || "0");
  const weight = (document.getElementById("ap-weight")?.value || "").trim();
  const cat    = document.getElementById("ap-cat")?.value || "snacks";
  const img    = (document.getElementById("ap-img")?.value    || "").trim();
  if (!name)            { showToast("⚠️ Name required"); return; }
  if (isNaN(price)||price<0) { showToast("⚠️ Valid price required"); return; }
  PRODUCTS = loadProducts();
  const newId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
  PRODUCTS.push({ id:newId, name, emoji, price, weight, cat, img });
  saveProducts(PRODUCTS);
  showToast(`✅ "${name}" added!`);
  closeAddProduct();
  renderAdminProducts();
}

// ============================================
// 18. ADMIN — SETTINGS
// ============================================
function renderSettings() {
  CONFIG = loadConfig();
  _setInputVal("cfg-upiId",       CONFIG.upiId);
  _setInputVal("cfg-upiName",     CONFIG.upiName);
  _setInputVal("cfg-storeName",   CONFIG.storeName);
  _setInputVal("cfg-deliveryFee", CONFIG.deliveryFee);
}

function saveSettings() {
  const upiId       = (document.getElementById("cfg-upiId")?.value       || "").trim();
  const upiName     = (document.getElementById("cfg-upiName")?.value     || "").trim();
  const storeName   = (document.getElementById("cfg-storeName")?.value   || "OG ONLINE").trim();
  const deliveryFee = parseFloat(document.getElementById("cfg-deliveryFee")?.value || "0");
  if (!upiId)   { showToast("⚠️ UPI ID required"); return; }
  if (!upiName) { showToast("⚠️ UPI Name required"); return; }
  if (isNaN(deliveryFee)||deliveryFee<0) { showToast("⚠️ Valid fee required"); return; }
  saveConfig({ upiId, upiName, storeName, deliveryFee });
  CONFIG = loadConfig();
  showToast("⚙️ Settings saved!");
}

function clearAllOrders() {
  if (!confirm("Delete ALL orders? Cannot be undone!")) return;
  localStorage.removeItem("og_orders");
  showToast("🗑️ All orders cleared");
  refreshOrders();
}

function resetProducts() {
  if (!confirm("Reset products to factory defaults?")) return;
  saveProducts(DEFAULT_PRODUCTS);
  PRODUCTS = [...DEFAULT_PRODUCTS];
  showToast("🔄 Products reset");
  renderAdminProducts();
}

function exportOrders() {
  const orders = loadOrders();
  if (orders.length === 0) { showToast("No orders to export"); return; }
  const header = ["ID","Customer","Phone","Address","Items","Subtotal","DeliveryFee","Total","Payment","Status","Date"];
  const rows = orders.map(o => [
    o.id, o.customer, o.phone, o.address,
    o.items.map(i=>`${i.name} x${i.qty}`).join("; "),
    o.subtotal, o.deliveryFee, o.total,
    o.paymentMode||"UPI", o.status, o.createdAt
  ]);
  const csv = [header,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `og-orders-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast("📥 Exported!");
}

// ============================================
// 19. MY ORDERS PAGE
// ============================================
function renderMyOrders() {
  const container = document.getElementById("myOrdersList");
  const empty     = document.getElementById("emptyOrders");
  if (!container) return;
  const orders = loadOrders();
  if (orders.length === 0) {
    container.innerHTML = "";
    if (empty) empty.classList.remove("hidden");
    return;
  }
  if (empty) empty.classList.add("hidden");
  container.innerHTML = orders.map(order => {
    const sc  = order.status.toLowerCase();
    const time = _fmtTime(order.createdAt);
    const dot = {
      Pending:   `<span class="pulse-dot"></span>`,
      Accepted:  `<span class="timeline-dot" style="background:var(--success)"></span>`,
      Rejected:  `<span class="timeline-dot" style="background:var(--danger)"></span>`,
      Delivered: `<span class="timeline-dot" style="background:#60a5fa"></span>`,
    }[order.status] || "";
    const payBadge = `<span class="pay-badge-upi" style="font-size:.7rem">⚡ UPI</span>`;
    return `
      <div class="my-order-card fade-in">
        <div class="flex justify-between items-start mb-2">
          <div style="flex:1;min-width:0;margin-right:8px">
            <div class="flex items-center gap-2 mb-1">
              <p class="font-mono text-xs opacity-40">#${order.id}</p>
              ${payBadge}
            </div>
            <p class="font-bold text-sm">${order.items.map(i=>`${i.emoji} ${_esc(i.name)} ×${i.qty}`).join(", ")}</p>
          </div>
          <span class="status-${sc}" style="white-space:nowrap;flex-shrink:0">${dot}${order.status}</span>
        </div>
        <div class="flex justify-between items-center text-xs mt-2" style="opacity:.5">
          <span>${time}</span>
          <span style="color:var(--accent);opacity:1;font-weight:700;font-size:.9rem">₹${order.total}</span>
        </div>
        ${order.status==="Accepted"  ? `<p class="text-xs mt-2" style="color:var(--success)">🚀 Payment received! Your order is confirmed & on the way.</p>` : ""}
        ${order.status==="Rejected"  ? `<p class="text-xs mt-2" style="color:var(--danger)">❌ Order was rejected. Please contact support.</p>` : ""}
        ${order.status==="Delivered" ? `<p class="text-xs mt-2" style="color:#60a5fa">📦 Delivered! Thank you for shopping.</p>` : ""}
      </div>`;
  }).join("");
}

// ============================================
// 20. UTILITIES
// ============================================
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast"; t.className = "toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.add("hidden"), 2800);
}

function _setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function _setInputVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val != null ? val : "";
}
function _fmtTime(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("en-IN",{dateStyle:"short",timeStyle:"short"}); }
  catch { return iso; }
}
function _esc(str) {
  return String(str==null?"":str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
