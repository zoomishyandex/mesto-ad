let escapeListener = null;

const onDocumentKeyup = (evt) => {
  if (evt.key === "Escape") {
    const opened = document.querySelector(".popup_is-opened");
    hideOverlay(opened);
  }
};

export const showOverlay = (overlay) => {
  overlay.classList.add("popup_is-opened");
  escapeListener = onDocumentKeyup;
  document.addEventListener("keyup", escapeListener);
};

export const hideOverlay = (overlay) => {
  if (!overlay) {
    return;
  }
  overlay.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", escapeListener);
  escapeListener = null;
};

export const wireOverlayDismiss = (overlay) => {
  const closeTrigger = overlay.querySelector(".popup__close");

  closeTrigger.addEventListener("click", () => {
    hideOverlay(overlay);
  });

  overlay.addEventListener("mousedown", (evt) => {
    const isBackdrop = evt.target.classList.contains("popup");
    if (isBackdrop) {
      hideOverlay(overlay);
    }
  });
};
