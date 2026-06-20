const cloneCardMarkup = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

export const refreshLikeCounter = (cardData, heartButton, counterElement, sessionUserId) => {
  const userLikedCard = cardData.likes.some((user) => user._id === sessionUserId);
  heartButton.classList.toggle("card__like-button_is-active", userLikedCard);
  counterElement.textContent = cardData.likes.length;
};

export const detachCardItem = (cardElement) => {
  cardElement.remove();
};

export const assembleCardItem = (
  cardData,
  sessionUserId,
  { onImageClick, onHeartClick, onTrashClick, onStatsClick }
) => {
  const cardElement = cloneCardMarkup();
  const heartButton = cardElement.querySelector(".card__like-button");
  const counterElement = cardElement.querySelector(".card__like-count");
  const trashButton = cardElement.querySelector(".card__control-button_type_delete");
  const statsButton = cardElement.querySelector(".card__control-button_type_info");
  const photoElement = cardElement.querySelector(".card__image");

  photoElement.src = cardData.link;
  photoElement.alt = cardData.name;
  cardElement.querySelector(".card__title").textContent = cardData.name;
  refreshLikeCounter(cardData, heartButton, counterElement, sessionUserId);

  const createdByMe = cardData.owner._id === sessionUserId;
  if (!createdByMe) {
    trashButton.remove();
  }

  heartButton.addEventListener("click", () => {
    const isAlreadyLiked = heartButton.classList.contains("card__like-button_is-active");
    onHeartClick({
      cardId: cardData._id,
      isAlreadyLiked,
      heartButton,
      counterElement,
    });
  });

  if (createdByMe) {
    trashButton.addEventListener("click", () => {
      onTrashClick({ cardId: cardData._id, cardElement });
    });
  }

  statsButton.addEventListener("click", () => {
    onStatsClick(cardData._id);
  });

  photoElement.addEventListener("click", () => {
    onImageClick(cardData);
  });

  return cardElement;
};
