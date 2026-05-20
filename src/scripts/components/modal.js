const closeOpenedPopup = () => {
  const opened = document.querySelector(".popup_is-opened");
  if (opened) {
    disablePopup(opened);
  }
};

const handleDocumentKeyup = (event) => {
  if (event.key === "Escape") {
    closeOpenedPopup();
  }
};

export const enablePopup = (popup) => {
  popup.classList.add("popup_is-opened");
  document.addEventListener("keyup", handleDocumentKeyup);
};

export const disablePopup = (popup) => {
  popup.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", handleDocumentKeyup);
};

export const registerPopupClosing = (popup) => {
  popup.querySelector(".popup__close").addEventListener("click", () => {
    disablePopup(popup);
  });

  popup.addEventListener("mousedown", (event) => {
    if (event.target.classList.contains("popup")) {
      disablePopup(popup);
    }
  });
};
