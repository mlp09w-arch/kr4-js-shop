"use strict";

function initModals() {
  let opener = null;
  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = document.getElementById(button.dataset.openModal);
      if (!dialog || dialog.open) return;
      opener = button;
      dialog.showModal();
    });
  });
  document.querySelectorAll("dialog.modal").forEach((dialog) => {
    dialog
      .querySelector("[data-close-modal]")
      ?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      const bounds = dialog.getBoundingClientRect();
      const outside =
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom;
      if (event.target === dialog && outside) dialog.close();
    });
    // Escape закрывает native dialog; событие close возвращает фокус.
    dialog.addEventListener("close", () => opener?.focus());
  });
}
