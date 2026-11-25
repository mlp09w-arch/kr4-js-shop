"use strict";

function initOrderProducts() {
  const select = document.querySelector("#product");
  if (!select) return;
  if (cart.length > 0) {
    const option = createElement("option", "", "Все товары из корзины");
    option.value = "cart";
    select.append(option);
  }
  products.forEach((product) => {
    const option = createElement(
      "option",
      "",
      `${product.title} — ${formatPrice(product.price)}${product.isAvailable ? "" : " (нет в наличии)"}`,
    );
    option.value = product.id;
    option.disabled = !product.isAvailable;
    select.append(option);
  });
  select.value = cart.length > 0 ? "cart" : "";
  select.addEventListener("change", updateOrderSummary);
  updateOrderSummary();
}

function updateOrderSummary() {
  const summary = document.querySelector("[data-order-summary]");
  if (!summary) return;
  const value = document.querySelector("#product").value;
  const product = products.find((product) => product.id === Number(value));
  if (value === "cart") {
    const titles = cart.map((item) => {
      const product = products.find((product) => product.id === item.productId);
      return `${product.title} × ${item.quantity}`;
    });
    summary.textContent = `В заявке: ${titles.join("; ")}. Итого: ${formatPrice(getCartTotal())}. Доставка рассчитывается отдельно.`;
  } else {
    summary.textContent = product
      ? `В заявке: ${product.title}, 1 шт. Стоимость: ${formatPrice(product.price)}. Доставка рассчитывается отдельно.`
      : "Выберите лампу или добавьте товары в корзину.";
  }
}

function getFieldError(field) {
  const value = field.value.trim();
  if (field.type === "checkbox")
    return field.required && !field.checked
      ? "Подтвердите согласие на обработку данных."
      : "";
  if (field.required && value === "") return "Заполните это поле.";
  if (field.validity.badInput) return "Проверьте введённое значение.";
  if (!value) return "";
  if (field.name === "name" && value.length < 2)
    return "Введите имя: не менее двух символов.";
  if (
    field.type === "email" &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || field.validity.typeMismatch)
  )
    return "Введите e-mail, например name@example.ru.";
  if (field.type === "tel") {
    const digits = value.replace(/\D/g, "");
    if (
      !/^\+?[0-9 ()-]+$/.test(value) ||
      digits.length < 10 ||
      digits.length > 15
    )
      return "Введите от 10 до 15 цифр. Допустимы + в начале, пробелы, скобки и дефисы.";
  }
  if (field.name === "product") {
    if (value === "cart")
      return cart.length > 0 ? "" : "Корзина пуста. Выберите лампу.";
    const product = products.find((product) => product.id === Number(value));
    if (!product || !product.isAvailable) return "Выберите лампу в наличии.";
  }
  if (field.type === "date" && value < getToday())
    return "Выберите сегодняшнюю или будущую дату.";
  if (field.minLength > 0 && value.length < field.minLength)
    return `Введите не менее ${field.minLength} символов.`;
  if (field.maxLength > 0 && value.length > field.maxLength)
    return `Допустимо не более ${field.maxLength} символов.`;
  return "";
}

function getToday() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function showFieldError(field, error) {
  document.getElementById(`${field.id}-error`).textContent = error;
  field.setAttribute("aria-invalid", String(Boolean(error)));
}

function initValidation() {
  document.querySelectorAll("form[data-validation]").forEach((form) => {
    form.noValidate = true;
    const fields = [...form.querySelectorAll("input, select, textarea")];
    const status = form.querySelector("[data-form-status]");
    let submitted = false;
    fields.forEach((field) => {
      const error = createElement("small", "field-error");
      error.id = `${field.id}-error`;
      const parent = field.type === "checkbox" ? field.closest("label") : field;
      parent.after(error);
      field.setAttribute(
        "aria-describedby",
        `${field.getAttribute("aria-describedby") || ""} ${error.id}`.trim(),
      );
      if (field.type === "date") field.min = getToday();
      const check = () => {
        status.textContent = "";
        status.classList.remove("form-status--success");
        if (submitted) showFieldError(field, getFieldError(field));
      };
      field.addEventListener("input", check);
      field.addEventListener("change", check);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitted = true;
      let firstInvalid = null;
      fields.forEach((field) => {
        const error = getFieldError(field);
        showFieldError(field, error);
        if (error && !firstInvalid) firstInvalid = field;
      });
      status.classList.toggle("form-status--success", !firstInvalid);
      if (firstInvalid) {
        status.textContent = "Проверьте отмеченные поля. Данные не отправлены.";
        firstInvalid.focus();
        return;
      }
      const name = form.elements.name.value.trim();
      const summary =
        form.id === "order-form"
          ? document.querySelector("[data-order-summary]").textContent
          : "";
      status.textContent = `${name}, ${form.id === "order-form" ? "заявка подготовлена" : "сообщение подготовлено"}. ${summary} Данные проверены, но не отправлены. Для оформления свяжитесь с нами по телефону или почте на странице контактов.`;
    });
    form.addEventListener("reset", () => {
      submitted = false;
      fields.forEach((field) => showFieldError(field, ""));
      status.textContent = "";
      status.classList.remove("form-status--success");
      requestAnimationFrame(updateOrderSummary);
    });
  });
}
