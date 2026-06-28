const onEscapeKeyup = (event) => {
  if (event.key === "Escape") {
    const openedOverlay = document.querySelector(".popup_is-opened");
    closeOverlay(openedOverlay);
  }
};

export const openOverlay = (overlayElement) => {
  overlayElement.classList.add("popup_is-opened");
  document.addEventListener("keyup", onEscapeKeyup);
};

export const closeOverlay = (overlayElement) => {
  if (!overlayElement) {
    return;
  }
  overlayElement.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", onEscapeKeyup);
};

export const wireOverlayClose = (overlayElement) => {
  overlayElement.querySelector(".popup__close").addEventListener("click", () => {
    closeOverlay(overlayElement);
  });

  overlayElement.addEventListener("mousedown", (event) => {
    if (event.target.classList.contains("popup")) {
      closeOverlay(overlayElement);
    }
  });
};
