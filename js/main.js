"use strict";

initCatalog();
renderProductDetail();
initOrderProducts();
initValidation();
initModals();
initCartEvents();
updateCartCounters();
renderCart();

if (storageProblem) {
  announce(
    "Не удалось прочитать сохранённые данные. Корзина работает на этой странице; проверьте настройки хранения в браузере.",
    true,
  );
}
