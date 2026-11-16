"use strict";

// defer выполняет файлы после разбора HTML, в порядке их подключения.
// Каждый инициализатор проверяет наличие элементов своей страницы.
initCatalog();
renderProductDetail();
initOrderProducts();
initValidation();
initModals();
initCartEvents();
updateCartCounters();
updateFavoriteButtons();
renderCart();

if (storageProblem) {
  announce(
    "Не удалось прочитать сохранённые данные. Корзина работает на этой странице; проверьте настройки хранения в браузере.",
    true,
  );
}
