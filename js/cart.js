"use strict";

const CART_KEY = "svetdom-kr4-cart";
let storageProblem = false;
let announcementTimer;

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    storageProblem = true;
    return [];
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    storageProblem = true;
    announce(
      "Сохранение в браузере недоступно. До закрытия страницы корзина продолжит работать.",
      true,
    );
  }
}
function restoreCart() {
  const result = [];
  readStorage(CART_KEY).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const product = products.find((product) => product.id === item.productId);
    if (!product || !product.isAvailable || !Number.isInteger(item.quantity))
      return;
    if (item.quantity < 1 || item.quantity > 99) return;
    if (!result.some((row) => row.productId === product.id)) {
      result.push({ productId: product.id, quantity: item.quantity });
    }
  });
  return result;
}

let cart = restoreCart();

function announce(message, persistent = false) {
  const status = document.querySelector("[data-shop-status]");
  if (status) {
    status.classList.remove("visually-hidden");
    status.textContent = message;
    clearTimeout(announcementTimer);
    if (!persistent) {
      announcementTimer = setTimeout(() => {
        status.textContent = "";
        status.classList.add("visually-hidden");
      }, 6000);
    }
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => {
    const product = products.find((product) => product.id === item.productId);
    return sum + product.price * item.quantity;
  }, 0);
}

function updateCartCounters() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = count;
  });
}

function saveCart() {
  writeStorage(CART_KEY, cart);
  updateCartCounters();
  renderCart();
  updateOrderSummary();
}

function addToCart(id) {
  const product = products.find((product) => product.id === id);
  if (!product || !product.isAvailable) return;
  const item = cart.find((item) => item.productId === id);
  if (item && item.quantity >= 99) {
    announce("В одной позиции можно выбрать не больше 99 ламп.");
    return;
  }
  if (item) item.quantity += 1;
  else cart.push({ productId: id, quantity: 1 });
  saveCart();
  if (!storageProblem) announce(`«${product.title}» добавлена в корзину.`);
}

function renderCart() {
  const container = document.querySelector("[data-cart-items]");
  if (!container) return;
  container.replaceChildren();
  if (cart.length === 0) {
    const empty = createElement("div", "empty-state");
    empty.append(
      createElement("h2", "", "Корзина пока пуста"),
      createElement(
        "p",
        "",
        "Подберите лампу для своего дома или рабочего стола.",
      ),
    );
    const link = createElement("a", "button", "Выбрать лампу");
    link.href = "catalog.html";
    empty.append(link);
    container.append(empty);
  }
  cart.forEach((item) => {
    const product = products.find((product) => product.id === item.productId);
    const row = createElement("article", "cart-item");
    row.dataset.cartProduct = product.id;
    const image = createProductImage(product, "cart-item__image");
    image.sizes = "96px";
    const details = createElement("div", "cart-item__details");
    const link = createElement("a", "", product.title);
    link.href = `product.html?id=${product.id}`;
    const heading = createElement("h2");
    heading.append(link);
    details.append(
      heading,
      createElement("p", "", `${formatPrice(product.price)} за шт.`),
    );
    const quantity = createElement("div", "quantity-controls");
    const minus = createActionButton("decrease", product.id, "−");
    minus.setAttribute("aria-label", `Уменьшить количество: ${product.title}`);
    minus.disabled = item.quantity <= 1;
    const count = createElement("span", "", `${item.quantity} шт.`);
    count.setAttribute("aria-label", `Количество: ${item.quantity}`);
    const plus = createActionButton("increase", product.id, "+");
    plus.setAttribute("aria-label", `Увеличить количество: ${product.title}`);
    plus.disabled = item.quantity >= 99;
    quantity.append(minus, count, plus);
    details.append(
      quantity,
      createElement("strong", "", formatPrice(product.price * item.quantity)),
    );
    const remove = createActionButton(
      "remove",
      product.id,
      "Удалить",
      "button button--outline button--small",
    );
    remove.setAttribute("aria-label", `Удалить из корзины: ${product.title}`);
    details.append(remove);
    row.append(image, details);
    container.append(row);
  });
  document.querySelector("[data-cart-subtotal]").textContent =
    formatPrice(getCartTotal());
  document.querySelector('[data-action="clear-cart"]').hidden =
    cart.length === 0;
  document.querySelector("[data-checkout]").hidden = cart.length === 0;
}

function initCartEvents() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    const id = Number(button.dataset.productId);
    if (action === "add-to-cart") addToCart(id);
    if (["remove", "increase", "decrease", "clear-cart"].includes(action)) {
      const row = cart.find((item) => item.productId === id);
      if (action === "clear-cart") cart = [];
      if (action === "remove")
        cart = cart.filter((item) => item.productId !== id);
      if (action === "increase" && row && row.quantity < 99) row.quantity += 1;
      if (action === "decrease" && row && row.quantity > 1) row.quantity -= 1;
      saveCart();
      const nextButton = document.querySelector(
        `[data-cart-items] [data-action="${action}"][data-product-id="${id}"]:not(:disabled)`,
      );
      const fallback = document.querySelector(
        "[data-cart-items] button:not(:disabled), [data-cart-items] a",
      );
      (nextButton || fallback)?.focus();
      if (!storageProblem)
        announce(
          action === "remove" || action === "clear-cart"
            ? "Корзина обновлена."
            : "Количество изменено.",
        );
    }
  });
}
