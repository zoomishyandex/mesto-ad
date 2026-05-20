const hideActiveWindow = () => {
  const active = document.querySelector(".popup_is-opened");
  if (active) {
    hideWindow(active);
  }
};

const watchEscape = (event) => {
  if (event.key === "Escape") {
    hideActiveWindow();
  }
};

export const showWindow = (windowElement) => {
  windowElement.classList.add("popup_is-opened");
  document.addEventListener("keyup", watchEscape);
};

export const hideWindow = (windowElement) => {
  windowElement.classList.remove("popup_is-opened");
  document.removeEventListener("keyup", watchEscape);
};

export const initWindowClosing = (windowElement) => {
  windowElement.querySelector(".popup__close").addEventListener("click", () => {
    hideWindow(windowElement);
  });

  windowElement.addEventListener("mousedown", (event) => {
    if (event.target.classList.contains("popup")) {
      hideWindow(windowElement);
    }
  });
};
