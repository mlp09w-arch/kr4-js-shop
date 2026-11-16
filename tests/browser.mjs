import { chromium } from "playwright-core";
import fs from "node:fs";
const browser = await chromium.launch({
  executablePath: process.env.BROWSER_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const results = [];
const consoleErrors = [];
page.on("pageerror", (error) => consoleErrors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
const base = process.env.BASE_URL || "http://127.0.0.1:8000/";
fs.mkdirSync("tests/.artifacts", { recursive: true });
function check(name, condition, detail = "") {
  results.push({ name, passed: Boolean(condition), detail });
  if (!condition) console.log("FAIL", name, detail);
}
async function goto(name) {
  await page.goto(base + name);
  await page.waitForTimeout(120);
}
await goto("catalog.html");
check(
  "8 generated cards",
  (await page.locator("[data-products] .product-card").count()) === 8,
);
check(
  "2 unavailable products cannot be added",
  (await page
    .locator("[data-products] [data-action=add-to-cart]:disabled")
    .count()) === 2,
);
const originalIds = await page.evaluate(() =>
  products.map((p) => p.id).join(","),
);
await page.locator("#search").fill("  лАЙМ ");
check(
  "Search ignores case and edge spaces",
  (await page.locator("[data-products] .product-card").count()) === 2,
);
await page.locator("#category").selectOption("classic");
check(
  "Search and category combine",
  (await page.locator("[data-products] .product-card").count()) === 0,
);
check(
  "Empty result action visible",
  await page.locator("[data-catalog-empty]").isVisible(),
);
await page.locator("[data-action=reset-filters]").click();
await page.waitForTimeout(100);
check(
  "Reset from empty state restores all products",
  (await page.locator("[data-products] .product-card").count()) === 8,
);
await page.locator("#category").selectOption("classic");
await page.locator("#available").check();
await page.locator("#sort").selectOption("price-desc");
check(
  "Combined filters and descending prices",
  (await page
    .locator("[data-products] .product-card")
    .evaluateAll((nodes) =>
      nodes.map((n) => n.dataset.productId).join(","),
    )) === "7,6,2",
);
await page.locator("#sort").selectOption("price-asc");
check(
  "Ascending prices",
  (await page
    .locator("[data-products] .product-card")
    .evaluateAll((nodes) =>
      nodes.map((n) => n.dataset.productId).join(","),
    )) === "2,6,7",
);
await page.locator("#sort").selectOption("title");
check(
  "Alphabetical sorting",
  await page.evaluate(() => {
    const titles = [...document.querySelectorAll("[data-products] h3")].map(
      (n) => n.textContent,
    );
    return titles.every(
      (v, i) => !i || titles[i - 1].localeCompare(v, "ru") <= 0,
    );
  }),
);
check(
  "Source order unchanged by sort",
  (await page.evaluate(() => products.map((p) => p.id).join(","))) ===
    originalIds,
);
await page.locator(".filter__form button[type=reset]").click();
await page.waitForTimeout(100);
await page.locator('[data-action=favorite][data-product-id="1"]').click();
await page.locator("#favorites-only").check();
check(
  "Favorites filter",
  (await page.locator("[data-products] .product-card").count()) === 1,
);
await page.reload();
check(
  "Favorite persists on reload",
  (await page
    .locator('[data-action=favorite][data-product-id="1"]')
    .getAttribute("aria-pressed")) === "true",
);
await page
  .locator('[data-action=add-to-cart][data-product-id="1"]')
  .click({ clickCount: 2 });
await page.locator('[data-action=add-to-cart][data-product-id="2"]').click();
check(
  "Cart badge shows quantities",
  (await page.locator("[data-cart-count]").first().textContent()) === "3",
);
await goto("cart.html");
check(
  "Cart restores two products",
  (await page.locator(".cart-item").count()) === 2,
);
check(
  "reduce calculates 3490*2 +5990",
  (await page.locator("[data-cart-subtotal]").textContent()).replace(
    /\D/g,
    "",
  ) === "12970",
);
await page.locator('[data-action=increase][data-product-id="1"]').click();
check(
  "Quantity increase recalculates sum",
  (await page.locator("[data-cart-subtotal]").textContent()).replace(
    /\D/g,
    "",
  ) === "16460",
);
await page.locator('[data-action=decrease][data-product-id="1"]').click();
await page.locator('[data-action=remove][data-product-id="2"]').click();
check(
  "Removal updates sum and rows",
  (await page.locator(".cart-item").count()) === 1 &&
    (await page.locator("[data-cart-subtotal]").textContent()).replace(
      /\D/g,
      "",
    ) === "6980",
);
await goto("order.html");
check(
  "Order uses cart with quantities",
  (await page.locator("#product").inputValue()) === "cart" &&
    (await page.locator("[data-order-summary]").textContent()).includes("× 2"),
);
await page.locator("#order-form button[type=submit]").click();
check(
  "Empty form shows field errors and focus",
  (await page.locator("[aria-invalid=true]").count()) >= 4 &&
    (await page.locator("#name").evaluate((n) => document.activeElement === n)),
);
await page.locator("#name").fill("Иван");
await page.locator("#email").fill("invalid");
await page.locator("#phone").fill("123");
await page.locator("#agreement").check();
await page.locator("#order-form button[type=submit]").click();
check(
  "Invalid email and phone rejected",
  (await page.locator("#email-error").textContent()).length > 0 &&
    (await page.locator("#phone-error").textContent()).length > 0,
);
await page.locator("#email").fill("ivan@example.ru");
await page.locator("#phone").fill("+7 999 000-00-00");
await page.locator("#name").fill("<img src=x onerror=alert(1)>");
await page.locator("#order-form button[type=submit]").click();
check(
  "Valid order shows truthful local success",
  (await page.locator("[data-form-status]").textContent()).includes(
    "заявка подготовлена",
  ) &&
    (await page.locator("[data-form-status]").textContent()).includes(
      "не отправлены",
    ),
);
check(
  "Form data displayed as text, no injected image",
  (await page.locator("[data-form-status] img").count()) === 0 &&
    (await page.locator("[data-form-status]").textContent()).includes("<img"),
);
check(
  "PII not persisted",
  await page.evaluate(
    () => !JSON.stringify(localStorage).includes("ivan@example.ru"),
  ),
);
await page.locator("#order-form button[type=reset]").click();
check(
  "Reset clears errors and status",
  (await page.locator("[aria-invalid=true]").count()) === 0 &&
    (await page.locator("[data-form-status]").textContent()) === "",
);
await goto("contacts.html");
check(
  "Original reviews preserved",
  (await page.locator(".review-card").count()) === 2 &&
    (await page.locator(".reviews").textContent()).includes("Анна") &&
    (await page.locator(".reviews").textContent()).includes("Михаил"),
);
await page.locator("#feedback-name").fill("Иван");
await page.locator("#feedback-email").fill("ivan@example.ru");
await page
  .locator("#feedback-message")
  .fill("Здравствуйте, подскажите сроки доставки.");
await page.locator("#feedback-consent").check();
await page.locator("#feedback-form button[type=submit]").click();
check(
  "Contact form local validation",
  (await page.locator("[data-form-status]").textContent()).includes(
    "сообщение подготовлено",
  ),
);
await goto("index.html");
check(
  "Homepage uses shared cards",
  (await page.locator("[data-featured-products] .product-card").count()) === 4,
);
await page.locator("[data-open-modal]").click();
check(
  "Delivery modal opens",
  await page.locator("#delivery-modal").isVisible(),
);
await page.keyboard.press("Escape");
check(
  "Escape closes modal and returns focus",
  !(await page.locator("#delivery-modal").isVisible()) &&
    (await page
      .locator("[data-open-modal]")
      .evaluate((n) => n === document.activeElement)),
);
for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
  await goto(`product.html?id=${id}`);
  check(
    `Product ${id} matches data`,
    (await page.locator("h1").textContent()) ===
      (await page.evaluate(
        (id) => products.find((p) => p.id === id).title,
        id,
      )),
  );
}
await goto("product.html?id=999");
check(
  "Unknown product shows useful state",
  (await page.locator("h1").textContent()) === "Товар не найден",
);
for (const width of [360, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 960 });
  for (const file of [
    "index.html",
    "catalog.html",
    "product.html",
    "cart.html",
    "order.html",
    "contacts.html",
  ]) {
    await goto(file);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    );
    check(`${file}: no page overflow at ${width}px`, !overflow);
    const broken = await page
      .locator("img")
      .evaluateAll(
        (images) =>
          images.filter((i) => !i.complete || i.naturalWidth === 0).length,
      );
    check(`${file}: images load at ${width}px`, broken === 0);
    if (width === 360 && file === "catalog.html")
      await page.screenshot({
        path: "tests/.artifacts/catalog-mobile.png",
        fullPage: true,
      });
    if (width === 1440 && file === "catalog.html")
      await page.screenshot({
        path: "tests/.artifacts/catalog-desktop.png",
        fullPage: true,
      });
  }
}
await page.setViewportSize({ width: 360, height: 900 });
await goto("catalog.html");
await page.locator(".menu-toggle").click();
check(
  "Mobile menu opens and links to cart",
  (await page.locator("#mobile-menu").isVisible()) &&
    (await page.locator('#mobile-menu a[href="cart.html"]').isVisible()),
);
await page.keyboard.press("Escape");
await page.locator(".filter__title").click();
check(
  "Filter collapses without JS dependency",
  !(await page.locator(".filter__form").isVisible()),
);
await goto("cart.html");
await page.locator("[data-action=clear-cart]").click();
check(
  "Empty cart hides checkout",
  (await page.locator(".cart-item").count()) === 0 &&
    !(await page.locator("[data-checkout]").isVisible()),
);
await page.evaluate(() => {
  localStorage.setItem("svetdom-kr4-cart", "broken");
  localStorage.setItem("svetdom-kr4-favorites", "{}");
});
await page.reload();
check(
  "Broken JSON storage does not crash",
  await page.locator(".empty-state").isVisible(),
);
await page.evaluate(() =>
  localStorage.setItem(
    "svetdom-kr4-cart",
    JSON.stringify([
      { productId: 1, quantity: 2, price: 1 },
      { productId: 1, quantity: 4 },
      { productId: 3, quantity: 1 },
      { productId: 999, quantity: 1 },
      { productId: 2, quantity: -1 },
      { productId: 4, quantity: 1.5 },
      null,
      "<img>",
    ]),
  ),
);
await page.reload();
check(
  "Storage schema rejects duplicates, unavailable and invalid items; price trusted from data",
  (await page.locator(".cart-item").count()) === 1 &&
    (await page.locator("[data-cart-subtotal]").textContent()).replace(
      /\D/g,
      "",
    ) === "6980",
);
const blocked = await browser.newContext();
await blocked.addInitScript(() => {
  Object.defineProperty(window, "localStorage", {
    get() {
      throw new DOMException("Blocked", "SecurityError");
    },
  });
});
const blockedPage = await blocked.newPage();
await blockedPage.goto(base + "catalog.html");
await blockedPage
  .locator('[data-action=add-to-cart][data-product-id="1"]')
  .click();
check(
  "Blocked storage retains in-memory cart and warns",
  (await blockedPage.locator("[data-cart-count]").first().textContent()) ===
    "1" &&
    (await blockedPage.locator("[data-shop-status]").textContent()).includes(
      "недоступно",
    ),
);
check(
  "No runtime or console errors across pages",
  consoleErrors.length === 0,
  consoleErrors,
);
await browser.close();
fs.mkdirSync("docs", { recursive: true });
const report = {
  testedAt: new Date().toISOString(),
  environment: "Headless Chromium, local HTTP server",
  baseUrl: base,
  total: results.length,
  passed: results.filter((r) => r.passed).length,
  failed: results.filter((r) => !r.passed).length,
  results,
};
fs.writeFileSync(
  "docs/verification.json",
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      total: report.total,
      passed: report.passed,
      failed: report.failed,
      consoleErrors,
    },
    null,
    2,
  ),
);
if (report.failed) process.exitCode = 1;
