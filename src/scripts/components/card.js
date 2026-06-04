const cloneCardShell = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

export const updateHeartState = (cardData, heartBtn, counterEl, myUserId) => {
  const iLiked = cardData.likes.some((liker) => liker._id === myUserId);
  heartBtn.classList.toggle("card__like-button_is-active", iLiked);
  counterEl.textContent = cardData.likes.length;
};

export const detachGalleryItem = (cardEl) => {
  cardEl.remove();
};

export const buildGalleryItem = (
  cardData,
  myUserId,
  { onPreview, onHeart, onErase, onStats }
) => {
  const cardEl = cloneCardShell();
  const heartBtn = cardEl.querySelector(".card__like-button");
  const counterEl = cardEl.querySelector(".card__like-count");
  const eraseBtn = cardEl.querySelector(".card__control-button_type_delete");
  const statsBtn = cardEl.querySelector(".card__control-button_type_info");
  const photoEl = cardEl.querySelector(".card__image");

  photoEl.src = cardData.link;
  photoEl.alt = cardData.name;
  cardEl.querySelector(".card__title").textContent = cardData.name;
  updateHeartState(cardData, heartBtn, counterEl, myUserId);

  const iOwnIt = cardData.owner._id === myUserId;
  if (!iOwnIt) {
    eraseBtn.remove();
  }

  heartBtn.addEventListener("click", () => {
    const isLiked = heartBtn.classList.contains("card__like-button_is-active");
    onHeart({
      cardId: cardData._id,
      isLiked,
      heartBtn,
      counterEl,
    });
  });

  if (iOwnIt) {
    eraseBtn.addEventListener("click", () => {
      onErase({ cardId: cardData._id, cardEl });
    });
  }

  statsBtn.addEventListener("click", () => {
    onStats(cardData._id);
  });

  photoEl.addEventListener("click", () => {
    onPreview(cardData);
  });

  return cardEl;
};
