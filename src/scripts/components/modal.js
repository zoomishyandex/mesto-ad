let keyupListener = null;

const handleEscapeKey = (event) => {
  if (event.key !== "Escape") {
    return;
  }
  const activePopup = document.querySelector(".popup_is-opened");
  dismissPopup(activePopup);
};

export const revealPopup = (popupNode) => {
  popupNode.classList.add("popup_is-opened");
  keyupListener = handleEscapeKey;
  document.addEventListener("keyup", keyupListener);
};

export const dismissPopup = (popupNode) => {
  if (!popupNode) {
    return;
  }
  popupNode.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", keyupListener);
  keyupListener = null;
};

export const bindPopupClosing = (popupNode) => {
  const closeBtn = popupNode.querySelector(".popup__close");

  closeBtn.addEventListener("click", () => {
    dismissPopup(popupNode);
  });

  popupNode.addEventListener("mousedown", (event) => {
    if (event.target === popupNode) {
      dismissPopup(popupNode);
    }
  });
};
