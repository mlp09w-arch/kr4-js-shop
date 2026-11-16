"use strict";

// Общий источник данных для каталога, страницы товара и корзины.
// Новым моделям даны отдельные id; старые комплекты удалены из каталога.
const products = [
  {
    id: 1,
    title: "Лайм",
    category: "work",
    price: 3490,
    isAvailable: true,
    image: "lamp-green",
    description: "Зелёная лампа с регулируемым кронштейном для рабочего стола.",
    isNew: false,
  },
  {
    id: 2,
    title: "Классика",
    category: "classic",
    price: 5990,
    isAvailable: true,
    image: "lamp-beige",
    description:
      "Бежевый тканевый абажур и золотистое основание для уютного вечера.",
    isNew: false,
  },
  {
    id: 3,
    title: "Нуар",
    category: "classic",
    price: 6490,
    isAvailable: false,
    image: "lamp-black",
    description:
      "Чёрная настольная лампа со сдержанным силуэтом и тканевым абажуром.",
    isNew: false,
  },
  {
    id: 4,
    title: "Лесная птица",
    category: "decor",
    price: 8990,
    isAvailable: true,
    image: "lamp-bird",
    description: "Декоративная лампа с фигуркой птицы и резным плафоном.",
    isNew: false,
  },
  {
    id: 9,
    title: "Кристалл",
    category: "classic",
    price: 6490,
    isAvailable: true,
    image: "lamp-crystal",
    description:
      "Белый абажур, изогнутая светлая ножка и прозрачные декоративные подвески.",
    isNew: true,
  },
  {
    id: 10,
    title: "Графит",
    category: "work",
    price: 2990,
    isAvailable: true,
    image: "lamp-graphite",
    description: "Чёрная рабочая лампа с гибкой ножкой и круглым основанием.",
    isNew: true,
  },
  {
    id: 11,
    title: "Лесной уют",
    category: "decor",
    price: 7490,
    isAvailable: true,
    image: "lamp-amber",
    description:
      "Округлое основание с древесным рисунком и фактурный абажур с тёплым свечением.",
    isNew: true,
  },
  {
    id: 12,
    title: "Банкир",
    category: "classic",
    price: 7990,
    isAvailable: false,
    image: "lamp-banker",
    description:
      "Зелёный вытянутый плафон, золотистая ножка и выключатель-цепочка.",
    isNew: true,
  },
];

const categoryNames = {
  work: "Рабочая лампа",
  classic: "Классическая лампа",
  decor: "Декоративная лампа",
};

function formatPrice(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

// Текст всегда добавляем как текст, а не как HTML-разметку.
function createElement(tag, className = "", text = "") {
  const element = document.createElement(tag);
  if (className) element.classList.add(...className.split(" "));
  element.textContent = text;
  return element;
}

function createProductImage(product, className = "") {
  const image = createElement("img", className);
  image.src = `images/${product.image}.webp`;
  image.srcset = `images/${product.image}-360.webp 360w, images/${product.image}-640.webp 640w, images/${product.image}.webp 900w`;
  image.sizes = "(min-width: 1200px) 400px, (min-width: 640px) 45vw, 90vw";
  image.alt = `Настольная лампа ${product.title}`;
  image.width = 900;
  image.height = 900;
  image.loading = "lazy";
  return image;
}

function createActionButton(
  action,
  productId,
  text,
  className = "button button--small",
) {
  const button = createElement("button", className, text);
  button.type = "button";
  button.dataset.action = action;
  button.dataset.productId = productId;
  return button;
}
