let escapeHandler = null;

const onEscapePress = (event) => {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".popup_is-opened");
    closeModal(openedModal);
  }
};

export const openModal = (modalElement) => {
  modalElement.classList.add("popup_is-opened");
  escapeHandler = onEscapePress;
  document.addEventListener("keyup", escapeHandler);
};

export const closeModal = (modalElement) => {
  if (!modalElement) {
    return;
  }
  modalElement.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", escapeHandler);
  escapeHandler = null;
};

export const setupModalControls = (modalElement) => {
  const closeControl = modalElement.querySelector(".popup__close");

  closeControl.addEventListener("click", () => {
    closeModal(modalElement);
  });

  modalElement.addEventListener("mousedown", (event) => {
    const clickedOverlay = event.target.classList.contains("popup");
    if (clickedOverlay) {
      closeModal(modalElement);
    }
  });
};
