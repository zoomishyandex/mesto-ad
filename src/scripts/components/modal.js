const onEscapeKey = (event) => {
  if (event.key !== "Escape") {
    return;
  }
  const opened = document.querySelector(".popup_is-opened");
  hidePopup(opened);
};

export const showPopup = (popupNode) => {
  popupNode.classList.add("popup_is-opened");
  document.addEventListener("keyup", onEscapeKey);
};

export const hidePopup = (popupNode) => {
  popupNode.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", onEscapeKey);
};

export const attachPopupCloseHandlers = (popupNode) => {
  const closeBtn = popupNode.querySelector(".popup__close");
  closeBtn.addEventListener("click", () => {
    hidePopup(popupNode);
  });

  popupNode.addEventListener("mousedown", (event) => {
    if (event.target.classList.contains("popup")) {
      hidePopup(popupNode);
    }
  });
};
