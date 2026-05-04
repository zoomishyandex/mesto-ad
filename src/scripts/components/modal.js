const closeTopPopup = () => {
  const layer = document.querySelector(".popup_is-opened");
  if (!layer) {
    return;
  }
  closeLayer(layer);
};

const onKeyUp = (event) => {
  if (event.key === "Escape") {
    closeTopPopup();
  }
};

export const openLayer = (layer) => {
  layer.classList.add("popup_is-opened");
  document.addEventListener("keyup", onKeyUp);
};

export const closeLayer = (layer) => {
  layer.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", onKeyUp);
};

export const bindLayerDismiss = (layer) => {
  layer.querySelector(".popup__close").addEventListener("click", () => {
    closeLayer(layer);
  });

  layer.addEventListener("mousedown", (event) => {
    if (event.target === layer) {
      closeLayer(layer);
    }
  });
};
