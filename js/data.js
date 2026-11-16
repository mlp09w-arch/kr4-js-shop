"use strict";

// Общий источник данных для каталога, страницы товара и корзины.
// Комплекты отличаются от самой лампы наличием LED-лампочки.
const products = [
  {
    id: 1,
    title: "Лайм",
    category: "work",
    price: 3490,
    isAvailable: true,
    image: "lamp-green",
    description: "Зелёная лампа с регулируемым кронштейном для рабочего стола.",
    isLedKit: false,
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
    isLedKit: false,
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
    isLedKit: false,
  },
  {
    id: 4,
    title: "Лесная птица",
    category: "decor",
    price: 8990,
    isAvailable: true,
    image: "lamp-bird",
    description: "Декоративная лампа с фигуркой птицы и резным плафоном.",
    isLedKit: false,
  },
  {
    id: 5,
    title: "Лайм — комплект LED",
    category: "work",
    price: 3980,
    isAvailable: true,
    image: "lamp-green",
    description:
      "Рабочая лампа Лайм в комплекте с LED-лампочкой. Готова к первому включению.",
    isLedKit: true,
  },
  {
    id: 6,
    title: "Классика — комплект LED",
    category: "classic",
    price: 6480,
    isAvailable: true,
    image: "lamp-beige",
    description: "Лампа Классика и LED-лампочка в одном комплекте.",
    isLedKit: true,
  },
  {
    id: 7,
    title: "Нуар — комплект LED",
    category: "classic",
    price: 6980,
    isAvailable: true,
    image: "lamp-black",
    description:
      "Лампа Нуар в комплекте с LED-лампочкой для домашнего освещения.",
    isLedKit: true,
  },
  {
    id: 8,
    title: "Лесная птица — комплект LED",
    category: "decor",
    price: 9480,
    isAvailable: false,
    image: "lamp-bird",
    description: "Декоративная лампа Лесная птица в комплекте с LED-лампочкой.",
    isLedKit: true,
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
