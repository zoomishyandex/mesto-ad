let escapeHandler = null;

const onEscapePress = (evt) => {
  if (evt.key === "Escape") {
    const openedPopup = document.querySelector(".popup_is-opened");
    closePopup(openedPopup);
  }
};

export const openPopup = (popupElement) => {
  popupElement.classList.add("popup_is-opened");
  escapeHandler = onEscapePress;
  document.addEventListener("keyup", escapeHandler);
};

export const closePopup = (popupElement) => {
  if (!popupElement) {
    return;
  }
  popupElement.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", escapeHandler);
  escapeHandler = null;
};

export const registerPopupListeners = (popupElement) => {
  popupElement.querySelector(".popup__close").addEventListener("click", () => {
    closePopup(popupElement);
  });

  popupElement.addEventListener("mousedown", (evt) => {
    if (evt.target.classList.contains("popup")) {
      closePopup(popupElement);
    }
  });
};
