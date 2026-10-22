// Brew & Bloom Café — menu rendering, search, category filters and cart.
const products = [
  { id: 1, name: "Velvet Latte", category: "coffee", price: 160, tag: "Bestseller", description: "Silky espresso with steamed milk.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80" },
  { id: 2, name: "Classic Cappuccino", category: "coffee", price: 140, tag: "Classic", description: "Rich espresso, soft foam, cocoa.", image: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=700&q=80" },
  { id: 3, name: "Iced Caramel Coffee", category: "coffee", price: 180, tag: "Chilled", description: "Cold coffee with a caramel swirl.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80" },
  { id: 4, name: "Matcha Cloud", category: "tea", price: 190, tag: "A little different", description: "Earthy matcha with a creamy finish.", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=700&q=80" },
  { id: 5, name: "Masala Chai", category: "tea", price: 70, tag: "Comfort cup", description: "A warming blend of tea and spices.", image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=700&q=80" },
  { id: 6, name: "Butter Croissant", category: "food", price: 110, tag: "Freshly baked", description: "Golden, flaky and wonderfully buttery.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80" },
  { id: 7, name: "Garden Sandwich", category: "food", price: 150, tag: "Light bite", description: "Fresh veggies, greens and creamy spread.", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80" },
  { id: 8, name: "Chocolate Brownie", category: "food", price: 120, tag: "Sweet treat", description: "Deep chocolate, soft centre, pure joy.", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80" }
];

const money = amount => `₹${amount.toLocaleString("en-IN")}`;
const productGrid = document.getElementById("productGrid");
const categoryFilters = document.getElementById("categoryFilters");
const menuSearch = document.getElementById("menuSearch");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const cartSummary = document.getElementById("cartSummary");
const toast = document.getElementById("toast");

let activeCategory = "all";
let searchTerm = "";
let cart = {};
let toastTimer;

function renderProducts() {
  const filtered = products.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = `${product.name} ${product.description} ${product.tag}`.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (!filtered.length) {
    productGrid.innerHTML = '<div class="no-results">No treats found. Try another search or category ☕</div>';
    return;
  }

  productGrid.innerHTML = filtered.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
        <span class="product-tag">${product.tag}</span>
        <button class="add-button" data-add="${product.id}" aria-label="Add ${product.name} to cart" title="Add to cart">+</button>
      </div>
      <div class="product-info">
        <div class="product-title-row"><h3>${product.name}</h3><span class="product-price">${money(product.price)}</span></div>
        <p>${product.description}</p>
      </div>
    </article>
  `).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  showToast(`${products.find(product => product.id === id).name} added to your cart ♡`);
}

function updateQuantity(id, change) {
  if (!cart[id]) return;
  cart[id] += change;
  if (cart[id] <= 0) delete cart[id];
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  renderCart();
  showToast("Item removed from your cart.");
}

function renderCart() {
  const entries = Object.entries(cart).map(([id, quantity]) => ({
    ...products.find(product => product.id === Number(id)),
    quantity
  })).filter(item => item.id);
  const count = entries.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = entries.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const packaging = count ? 10 : 0;

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTitleCount").textContent = `(${count})`;
  cartEmpty.hidden = count > 0;
  cartSummary.hidden = count === 0;
  cartItems.innerHTML = entries.map(item => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h3>${item.name}</h3>
        <p class="item-price">${money(item.price)} each</p>
        <div class="quantity-control" aria-label="Quantity for ${item.name}">
          <button data-quantity="${item.id}" data-change="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-quantity="${item.id}" data-change="1" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="remove-item" data-remove="${item.id}" aria-label="Remove ${item.name}" title="Remove item">×</button>
    </article>
  `).join("");

  document.getElementById("cartSubtotal").textContent = money(subtotal);
  document.getElementById("packagingFee").textContent = money(packaging);
  document.getElementById("cartTotal").textContent = money(subtotal + packaging);
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartOverlay.hidden = false;
  document.body.classList.add("cart-open");
  document.getElementById("closeCart").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartOverlay.hidden = true;
  document.body.classList.remove("cart-open");
  document.getElementById("openCart").focus();
}

categoryFilters.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  categoryFilters.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("active", item === button));
  renderProducts();
});

menuSearch.addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  renderProducts();
});

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(Number(button.dataset.add));
});

cartItems.addEventListener("click", event => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  if (quantityButton) updateQuantity(Number(quantityButton.dataset.quantity), Number(quantityButton.dataset.change));
  if (removeButton) removeFromCart(Number(removeButton.dataset.remove));
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.getElementById("browseMenu").addEventListener("click", () => {
  closeCart();
  document.getElementById("menu").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("checkoutButton").addEventListener("click", () => {
  const count = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  if (!count) return;
  showToast("Demo order placed! Thanks for visiting Brew & Bloom ♡");
  cart = {};
  renderCart();
  setTimeout(closeCart, 900);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
