const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const updateCardLikeState = (cardData, likeButton, likeCountElement) => {
  const isLiked = cardData.likes.some((user) => user._id === likeButton.dataset.userId);
  likeButton.classList.toggle("card__like-button_is-active", isLiked);
  likeCountElement.textContent = cardData.likes.length;
};

export const removeCard = (cardElement) => {
  cardElement.remove();
};

export const createCardElement = (
  cardData,
  currentUserId,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCountElement = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = cardData.link;
  cardImage.alt = cardData.name;
  cardElement.querySelector(".card__title").textContent = cardData.name;
  likeButton.dataset.userId = currentUserId;
  updateCardLikeState(cardData, likeButton, likeCountElement);

  const isOwnCard = cardData.owner._id === currentUserId;
  if (!isOwnCard) {
    deleteButton.remove();
  }

  likeButton.addEventListener("click", () =>
    onLikeIcon({
      cardId: cardData._id,
      isLiked: likeButton.classList.contains("card__like-button_is-active"),
      likeButton,
      likeCountElement,
    })
  );

  if (isOwnCard) {
    deleteButton.addEventListener("click", () =>
      onDeleteCard({ cardId: cardData._id, cardElement })
    );
  }

  infoButton.addEventListener("click", () => onInfoClick(cardData._id));

  cardImage.addEventListener("click", () => onPreviewPicture(cardData));

  return cardElement;
};
