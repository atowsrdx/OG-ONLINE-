/* ============================================
   OG ONLINE — app.js  v2 (Bug-Fixed & Full Admin)
   Single shared file for all pages.
   Auto-detects page and routes logic.
============================================ */

// ============================================
// 1. CONFIG  (editable via Admin → Settings)
// ============================================
function loadConfig() {
  try {
    return JSON.parse(localStorage.getItem("og_config")) || {
      upiId: "sugato@okaxis", upiName: "Sugato",
      storeName: "OG ONLINE", deliveryFee: 19,
    };
  } catch { return { upiId:"sugato@okaxis", upiName:"Sugato", storeName:"OG ONLINE", deliveryFee:19 }; }
}
function saveConfig(cfg) { localStorage.setItem("og_config", JSON.stringify(cfg)); }

// ============================================
// 2. PRODUCT CATALOG  (editable via Admin)
// ============================================
const DEFAULT_PRODUCTS = [
  { id:1,  name:"Lay's Classic Salted",    emoji:"🥔", price:20,  weight:"26g",   cat:"snacks"  },
  { id:2,  name:"Kurkure Masala Munch",    emoji:"🍿", price:20,  weight:"90g",   cat:"snacks"  },
  { id:3,  name:"Bingo Mad Angles",        emoji:"🔺", price:30,  weight:"130g",  cat:"snacks"  },
  { id:4,  name:"Hide & Seek Biscuits",    emoji:"🍪", price:30,  weight:"120g",  cat:"snacks"  },
  { id:5,  name:"Coca-Cola Can",           emoji:"🥤", price:45,  weight:"330ml", cat:"drinks"  },
  { id:6,  name:"Tropicana Orange Juice",  emoji:"🍊", price:99,  weight:"1L",    cat:"drinks"  },
  { id:7,  name:"Red Bull Energy Drink",   emoji:"⚡", price:125, weight:"250ml", cat:"drinks"  },
  { id:8,  name:"Sting Berry Blast",       emoji:"🍇", price:30,  weight:"250ml", cat:"drinks"  },
  { id:9,  name:"Amul Taaza Milk",         emoji:"🥛", price:68,  weight:"1L",    cat:"dairy"   },
  { id:10, name:"Amul Butter",             emoji:"🧈", price:56,  weight:"100g",  cat:"dairy"   },
  { id:11, name:"Epigamia Greek Yogurt",   emoji:"🍦", price:50,  weight:"90g",   cat:"dairy"   },
  { id:12, name:"Amul Processed Cheese",   emoji:"🧀", price:99,  weight:"200g",  cat:"dairy"   },
  { id:13, name:"Banana (6 pcs)",          emoji:"🍌", price:39,  weight:"~600g", cat:"fruits"  },
  { id:14, name:"Royal Gala Apples",       emoji:"🍎", price:89,  weight:"4 pcs", cat:"fruits"  },
  { id:15, name:"Maggi 2-Minute Noodles",  emoji:"🍜", price:14,  weight:"70g",   cat:"instant" },
  { id:16, name:"Sunfeast Yippee Noodles", emoji:"🍝", price:15,  weight:"70g",   cat:"instant" },
  { id:17, name:"MTR Poha Instant",        emoji:"🫙", price:45,  weight:"200g",  cat:"instant" },
  { id:18, name:"Haldiram's Aloo Bhujia",  emoji:"🌾", price:60,  weight:"150g",  cat:"snacks"  },
];
function loadProducts() {
  try { return JSON.parse(localStorage.getItem("og_products")) || DEFAULT_PRODUCTS; }
  catch { return DEFAULT_PRODUCTS; }
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

// ============================================
// 4. THEME (runs immediately on script load)
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
    grid.innerHTML = `<div class="col-span-2 text-center py-16 opacity-40"><p class="text-4xl mb-2">📦</p><p>No products here</p></div>`;
    return;
  }
  list.forEach((p, i) => {
    const qty  = getCartQty(p.id);
    const card = document.createElement("div");
    card.className = "product-card fade-in";
    card.style.animationDelay = `${i * 0.04}s`;
    card.innerHTML = `
      <div class="product-img">${p.emoji}</div>
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
function getTotal()    {
  CONFIG = loadConfig();
  return getSubtotal() + (cart.length > 0 ? Number(CONFIG.deliveryFee || 19) : 0);
}

function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  _setEl("cartCount",      count);
  _setEl("subtotalAmt",    `₹${getSubtotal()}`);
  _setEl("deliveryFeeAmt", `₹${CONFIG.deliveryFee || 19}`);
  _setEl("totalAmt",       `₹${getTotal()}`);
  _setEl("payAmount",      getTotal());
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
// 9. CHECKOUT
// ============================================
function openCheckout() {
  if (cart.length === 0) { showToast("🛒 Cart is empty!"); return; }
  // Close drawer first
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

  const order = {
    id:          orderId,
    customer:    name,
    phone:       digits.slice(-10),
    address,
    items:       cart.map(i => ({ id:i.id, name:i.name, emoji:i.emoji, price:i.price, qty:i.qty })),
    subtotal:    getSubtotal(),
    deliveryFee: Number(CONFIG.deliveryFee || 19),
    total,
    status:      "Pending",
    note:        "",
    createdAt:   new Date().toISOString(),
    updatedAt:   null,
    upiRef:      tn,
  };

  saveOrder(order);

  // UPI deep link
  const upiUrl = `upi://pay?pa=${encodeURIComponent(CONFIG.upiId)}&pn=${encodeURIComponent(CONFIG.upiName)}&am=${total}&cu=INR&tn=${encodeURIComponent(tn)}`;
  window.location.href = upiUrl;

  // After 2 s clear cart and show confirmation (fallback if UPI app doesn't redirect)
  setTimeout(() => {
    closeCheckout();
    cart = [];
    _persistCart();
    updateCartUI();
    _showOrderConfirmed(orderId);
  }, 2000);
}

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
// 10. ORDER STORAGE
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
// 11. ADMIN — INIT
// ============================================
function _initAdmin() {
  CONFIG = loadConfig();
  switchAdminTab("orders");
  setInterval(() => { if (adminTab === "orders") refreshOrders(); }, 15000);
}

// ============================================
// 12. ADMIN — TAB SWITCHER
// ============================================
function switchAdminTab(tab) {
  adminTab = tab;
  document.querySelectorAll(".admin-tab-btn").forEach(b => {
    b.classList.toggle("tab-active", b.dataset.tab === tab);
  });
  ["orders", "products", "settings"].forEach(t => {
    const sec = document.getElementById(`section-${t}`);
    if (sec) sec.style.display = (t === tab) ? "block" : "none";
  });
  if (tab === "orders")   refreshOrders();
  if (tab === "products") renderAdminProducts();
  if (tab === "settings") renderSettings();
}

// ============================================
// 13. ADMIN — ORDERS
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

  return `
  <div class="order-card ${sc} fade-in" id="oc-${order.id}">
    <div class="order-meta">
      <span class="order-id">#${order.id}</span>
      <span class="status-${sc}">${order.status}</span>
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
      <textarea class="ofield-input hidden" id="inp-addr-${order.id}" rows="2" placeholder="Delivery address">${_esc(order.address)}</textarea>
    </div>
    <div class="ofield-row">
      <span class="ofield-label">📝 Note</span>
      <span class="ofield-val" id="disp-note-${order.id}">${order.note ? _esc(order.note) : '<span style="opacity:.35">—</span>'}</span>
      <input class="ofield-input hidden" id="inp-note-${order.id}" value="${_esc(order.note || '')}" placeholder="Internal note (not shown to customer)" />
    </div>

    <p class="order-items mt-2">${items}</p>

    <div class="flex items-center justify-between mt-2 mb-3">
      <p class="order-total" style="margin-bottom:0">₹${order.total}
        <span style="font-size:.72rem;opacity:.4;font-weight:400"> · ${time}</span>
      </p>
      <select class="ofield-select" onchange="quickStatusChange('${order.id}', this.value)">
        <option ${order.status==='Pending'  ?'selected':''} value="Pending">🕐 Pending</option>
        <option ${order.status==='Accepted' ?'selected':''} value="Accepted">✅ Accepted</option>
        <option ${order.status==='Rejected' ?'selected':''} value="Rejected">❌ Rejected</option>
        <option ${order.status==='Delivered'?'selected':''} value="Delivered">📦 Delivered</option>
      </select>
    </div>

    <div class="order-actions" id="actions-${order.id}">
      ${isPending ? `
        <button class="btn-accept" onclick="handleAccept('${order.id}')">✅ Accept</button>
        <button class="btn-reject" onclick="handleReject('${order.id}')">❌ Reject</button>` : ""}
      <button class="btn-edit" onclick="toggleEditOrder('${order.id}')">✏️ Edit</button>
      <button class="btn-del"  onclick="handleDeleteOrder('${order.id}')">🗑️</button>
    </div>

    <div class="hidden mt-2" id="editActions-${order.id}" style="display:none">
      <div class="flex gap-2">
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
  if (!confirm("Permanently delete this order? Cannot be undone.")) return;
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
  if (ea) { ea.style.display = "block"; ea.classList.remove("hidden"); }
}

function cancelEditOrder(id) {
  ["name","phone","addr","note"].forEach(f => {
    document.getElementById(`disp-${f}-${id}`)?.classList.remove("hidden");
    document.getElementById(`inp-${f}-${id}`)?.classList.add("hidden");
  });
  const ea = document.getElementById(`editActions-${id}`);
  if (ea) { ea.style.display = "none"; ea.classList.add("hidden"); }
}

function saveOrderEdit(id) {
  const orders = loadOrders();
  const o = orders.find(o => o.id === id);
  if (!o) return;

  const name  = (document.getElementById(`inp-name-${id}`)?.value  || "").trim();
  const phone = (document.getElementById(`inp-phone-${id}`)?.value || "").trim();
  const addr  = (document.getElementById(`inp-addr-${id}`)?.value  || "").trim();
  const note  = (document.getElementById(`inp-note-${id}`)?.value  || "").trim();

  if (!name)  { showToast("⚠️ Name is required");    return; }
  if (!phone) { showToast("⚠️ Phone is required");   return; }
  if (!addr)  { showToast("⚠️ Address is required"); return; }

  o.customer  = name;
  o.phone     = phone;
  o.address   = addr;
  o.note      = note;
  o.updatedAt = new Date().toISOString();
  localStorage.setItem("og_orders", JSON.stringify(orders));
  showToast("💾 Order updated!");
  refreshOrders();
}

// ============================================
// 14. ADMIN — PRODUCTS
// ============================================
function renderAdminProducts() {
  PRODUCTS = loadProducts();
  const container = document.getElementById("adminProductList");
  if (!container) return;

  if (PRODUCTS.length === 0) {
    container.innerHTML = `<div class="text-center py-16 opacity-40"><p class="text-4xl mb-2">📦</p><p>No products. Add one below.</p></div>`;
    return;
  }

  container.innerHTML = PRODUCTS.map(p => `
    <div class="order-card fade-in" id="pc-${p.id}">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-3xl">${p.emoji}</span>
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
  edit.classList.toggle("hidden", !hidden);
  if (actions) actions.classList.toggle("hidden", hidden);
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

  if (!name)            { showToast("⚠️ Product name required"); return; }
  if (isNaN(price) || price < 0) { showToast("⚠️ Enter a valid price"); return; }

  p.name = name; p.price = price; p.emoji = emoji; p.weight = weight; p.cat = cat;
  saveProducts(PRODUCTS);
  showToast("💾 Product updated!");
  renderAdminProducts();
}

function deleteProduct(id) {
  if (!confirm("Delete this product from the store?")) return;
  PRODUCTS = loadProducts().filter(p => p.id !== id);
  saveProducts(PRODUCTS);
  showToast("🗑️ Product deleted");
  renderAdminProducts();
}

function openAddProduct() {
  const modal = document.getElementById("addProductModal");
  if (modal) modal.classList.remove("hidden");
}
function closeAddProduct() {
  const modal = document.getElementById("addProductModal");
  if (modal) modal.classList.add("hidden");
  ["ap-name","ap-emoji","ap-price","ap-weight"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
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

  if (!name)            { showToast("⚠️ Product name required"); return; }
  if (isNaN(price) || price < 0) { showToast("⚠️ Enter a valid price"); return; }

  PRODUCTS = loadProducts();
  const newId = PRODUCTS.length > 0 ? Math.max(...PRODUCTS.map(p => p.id)) + 1 : 1;
  PRODUCTS.push({ id: newId, name, emoji, price, weight, cat });
  saveProducts(PRODUCTS);
  showToast(`✅ "${name}" added to store!`);
  closeAddProduct();
  renderAdminProducts();
}

// ============================================
// 15. ADMIN — SETTINGS
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

  if (!upiId)   { showToast("⚠️ UPI ID is required"); return; }
  if (!upiName) { showToast("⚠️ UPI Name is required"); return; }
  if (isNaN(deliveryFee) || deliveryFee < 0) { showToast("⚠️ Enter a valid delivery fee"); return; }

  saveConfig({ upiId, upiName, storeName, deliveryFee });
  CONFIG = loadConfig();
  showToast("⚙️ Settings saved!");
}

function clearAllOrders() {
  if (!confirm("Delete ALL orders permanently? This cannot be undone!")) return;
  localStorage.removeItem("og_orders");
  showToast("🗑️ All orders cleared");
  refreshOrders();
}

function resetProducts() {
  if (!confirm("Reset all products to factory defaults?")) return;
  saveProducts(DEFAULT_PRODUCTS);
  PRODUCTS = [...DEFAULT_PRODUCTS];
  showToast("🔄 Products reset to defaults");
  renderAdminProducts();
}

function exportOrders() {
  const orders = loadOrders();
  if (orders.length === 0) { showToast("No orders to export"); return; }
  const header = ["ID","Customer","Phone","Address","Items","Subtotal","DeliveryFee","Total","Status","Note","Date","Updated"];
  const rows = orders.map(o => [
    o.id, o.customer, o.phone, o.address,
    o.items.map(i => `${i.name} x${i.qty} @₹${i.price}`).join("; "),
    o.subtotal, o.deliveryFee, o.total,
    o.status, o.note || "", o.createdAt, o.updatedAt || ""
  ]);
  const csv = [header, ...rows]
    .map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `og-orders-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast("📥 Orders exported as CSV!");
}

// ============================================
// 16. MY ORDERS PAGE
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

    return `
      <div class="my-order-card fade-in">
        <div class="flex justify-between items-start mb-2">
          <div style="flex:1;min-width:0;margin-right:8px">
            <p class="font-mono text-xs opacity-40">#${order.id}</p>
            <p class="font-bold text-sm">${order.items.map(i => `${i.emoji} ${_esc(i.name)} ×${i.qty}`).join(", ")}</p>
          </div>
          <span class="status-${sc}" style="white-space:nowrap;flex-shrink:0">${dot}${order.status}</span>
        </div>
        <div class="flex justify-between items-center text-xs mt-2" style="opacity:.5">
          <span>${time}</span>
          <span style="color:var(--accent);opacity:1;font-weight:700;font-size:.9rem">₹${order.total}</span>
        </div>
        ${order.status === "Rejected"  ? `<p class="text-xs mt-2" style="color:var(--danger)">❌ Order was rejected. Please contact support.</p>` : ""}
        ${order.status === "Accepted"  ? `<p class="text-xs mt-2" style="color:var(--success)">🚀 Your order is on the way!</p>` : ""}
        ${order.status === "Delivered" ? `<p class="text-xs mt-2" style="color:#60a5fa">📦 Delivered! Thank you for shopping with us.</p>` : ""}
        ${order.note   ? `<p class="text-xs mt-1 opacity-50">📝 ${_esc(order.note)}</p>` : ""}
      </div>`;
  }).join("");
}

// ============================================
// 17. UTILITIES
// ============================================
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
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
  try { return new Date(iso).toLocaleString("en-IN", { dateStyle:"short", timeStyle:"short" }); }
  catch { return iso; }
}
function _esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
