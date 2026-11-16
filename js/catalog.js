"use strict";

function createProductCard(product) {
  const card = createElement("article", "product-card");
  card.dataset.productId = product.id;
  if (product.isLedKit)
    card.append(createElement("span", "product-card__badge", "Комплект LED"));
  const photoLink = createElement("a");
  photoLink.href = `product.html?id=${product.id}`;
  photoLink.append(createProductImage(product, "product-card__image"));
  const content = createElement("div", "product-card__content");
  const title = createElement("h3", "product-card__title");
  const link = createElement("a", "", product.title);
  link.href = photoLink.href;
  title.append(link);
  const stock = createElement(
    "p",
    "stock",
    product.isAvailable ? "В наличии" : "Нет в наличии",
  );
  stock.classList.toggle("stock--unavailable", !product.isAvailable);
  content.append(
    createElement(
      "p",
      "product-card__category",
      categoryNames[product.category],
    ),
    title,
    createElement("p", "product-card__text", product.description),
    stock,
  );
  const bottom = createElement("div", "product-card__bottom");
  const add = createActionButton("add-to-cart", product.id, "В корзину");
  add.disabled = !product.isAvailable;
  add.setAttribute("aria-label", `В корзину: ${product.title}`);
  bottom.append(createElement("strong", "", formatPrice(product.price)), add);
  content.append(
    bottom,
    createActionButton(
      "favorite",
      product.id,
      "♡ В избранное",
      "favorite-button",
    ),
  );
  card.append(photoLink, content);
  return card;
}

function renderCatalog() {
  const container = document.querySelector("[data-products]");
  if (!container) return;
  const query = document
    .querySelector("#search")
    .value.trim()
    .toLocaleLowerCase("ru-RU");
  const category = document.querySelector("#category").value;
  const sort = document.querySelector("#sort").value;
  const onlyAvailable = document.querySelector("#available").checked;
  const onlyFavorites = document.querySelector("#favorites-only").checked;
  // Копия сохраняет исходный порядок products после любой сортировки.
  let result = [...products].filter((product) => {
    return (
      product.title.toLocaleLowerCase("ru-RU").includes(query) &&
      (category === "all" || product.category === category) &&
      (!onlyAvailable || product.isAvailable) &&
      (!onlyFavorites || favorites.includes(product.id))
    );
  });
  if (sort === "price-asc") result.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") result.sort((a, b) => b.price - a.price);
  if (sort === "title")
    result.sort((a, b) => a.title.localeCompare(b.title, "ru"));
  container.replaceChildren();
  result.forEach((product) => container.append(createProductCard(product)));
  document.querySelector("[data-results-count]").textContent = result.length;
  document.querySelector("[data-catalog-empty]").hidden = result.length !== 0;
  updateFavoriteButtons();
}

function resetFilters() {
  document.querySelector(".filter__form")?.reset();
}

function initCatalog() {
  const container = document.querySelector("[data-products]");
  if (container) {
    const form = document.querySelector(".filter__form");
    form.addEventListener("submit", (event) => event.preventDefault());
    form.addEventListener("input", (event) => {
      if (event.target.id === "search") renderCatalog();
    });
    form.addEventListener("change", renderCatalog);
    // reset срабатывает до восстановления стандартных значений полей.
    form.addEventListener("reset", () => {
      requestAnimationFrame(renderCatalog);
    });
    document
      .querySelector('[data-action="reset-filters"]')
      .addEventListener("click", () => {
        resetFilters();
        document.querySelector("#search").focus();
      });
    renderCatalog();
  }
  const featured = document.querySelector("[data-featured-products]");
  if (featured)
    products
      .slice(0, 4)
      .forEach((product) => featured.append(createProductCard(product)));
}

function renderProductDetail() {
  const container = document.querySelector("[data-product-detail]");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.has("id") ? Number(params.get("id")) : 1;
  const product = products.find((product) => product.id === id);
  if (!product) {
    document.title = "Товар не найден - СветДом";
    const empty = createElement("div", "empty-state container");
    empty.append(
      createElement("h1", "", "Товар не найден"),
      createElement("p", "", "Выберите другую лампу в каталоге."),
    );
    container.append(empty);
    return;
  }
  document.title = `${product.title} - СветДом`;
  document.querySelector('meta[name="description"]').content =
    product.description;
  const article = createElement("article", "product-detail container");
  const photo = createElement("div", "product-detail__photo");
  const image = createProductImage(product);
  image.loading = "eager";
  image.sizes = "(min-width: 768px) 46vw, 90vw";
  photo.append(image);
  const content = createElement("div", "product-detail__content");
  const add = createActionButton(
    "add-to-cart",
    product.id,
    "В корзину",
    "button",
  );
  add.disabled = !product.isAvailable;
  content.append(
    createElement("p", "label", categoryNames[product.category]),
    createElement("h1", "product-detail__title", product.title),
    createElement("p", "product-detail__description", product.description),
    createElement("p", "product-detail__price", formatPrice(product.price)),
    createElement(
      "p",
      "stock",
      product.isAvailable ? "В наличии" : "Нет в наличии",
    ),
    add,
    createActionButton(
      "favorite",
      product.id,
      "♡ В избранное",
      "favorite-button",
    ),
  );
  article.append(photo, content);
  container.append(article);
  const section = createElement("section", "section section--gray");
  const layout = createElement("div", "container specs");
  const intro = createElement("div");
  intro.append(
    createElement("h2", "section__title", "Характеристики"),
    createElement(
      "p",
      "",
      "Комплект поставки указан отдельно для каждой позиции.",
    ),
  );
  const wrapper = createElement("div", "table-wrapper");
  wrapper.setAttribute("role", "region");
  wrapper.setAttribute("aria-labelledby", "specs-caption");
  wrapper.tabIndex = 0;
  const table = createElement("table", "specs-table");
  const caption = createElement(
    "caption",
    "",
    `Характеристики «${product.title}»`,
  );
  caption.id = "specs-caption";
  const head = createElement("thead");
  const headRow = createElement("tr");
  for (const text of ["Параметр", "Значение"]) {
    const cell = createElement("th", "", text);
    cell.scope = "col";
    headRow.append(cell);
  }
  head.append(headRow);
  const body = createElement("tbody");
  const specs = [
    ["Модель", product.title],
    ["Стиль", categoryNames[product.category]],
    [
      "Комплект",
      product.isLedKit ? "Лампа и LED-лампочка" : "Лампа без лампочки",
    ],
    ["Наличие", product.isAvailable ? "В наличии" : "Нет в наличии"],
  ];
  // Сохраняем известные характеристики исходной лампы, не придумываем параметры других.
  if (product.image === "lamp-green")
    specs.push(
      ["Материал", "Металл"],
      ["Цвет", "Зелёный"],
      ["Высота", "До 70 см"],
      ["Тип цоколя", "E27"],
      ["Мощность лампы", "До 60 Вт"],
      ["Гарантия", "1 год"],
    );
  specs.forEach(([name, value]) => {
    const row = createElement("tr");
    const heading = createElement("th", "", name);
    heading.scope = "row";
    row.append(heading, createElement("td", "", value));
    body.append(row);
  });
  table.append(caption, head, body);
  wrapper.append(table);
  layout.append(intro, wrapper);
  section.append(layout);
  container.append(section);
}
