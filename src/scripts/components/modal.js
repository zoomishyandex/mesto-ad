const handleDocumentKeyup = (event) => {
  if (event.key === "Escape") {
    const activeLayer = document.querySelector(".popup_is-opened");
    hideModalLayer(activeLayer);
  }
};

export const showModalLayer = (layerElement) => {
  layerElement.classList.add("popup_is-opened");
  document.addEventListener("keyup", handleDocumentKeyup);
};

export const hideModalLayer = (layerElement) => {
  if (!layerElement) {
    return;
  }
  layerElement.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", handleDocumentKeyup);
};

export const initModalDismissal = (layerElement) => {
  layerElement.querySelector(".popup__close").addEventListener("click", () => {
    hideModalLayer(layerElement);
  });

  layerElement.addEventListener("mousedown", (event) => {
    if (event.target === layerElement) {
      hideModalLayer(layerElement);
    }
  });
};
