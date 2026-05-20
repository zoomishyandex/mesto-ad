const getCardTemplateNode = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

export const refreshLikeDisplay = (cardInfo, likeControl, likesCounter, currentUserKey) => {
  const userLiked = cardInfo.likes.some((liker) => liker._id === currentUserKey);
  likeControl.classList.toggle("card__like-button_is-active", userLiked);
  likesCounter.textContent = cardInfo.likes.length;
};

export const removeCardFromPage = (cardNode) => {
  cardNode.remove();
};

export const createCardElement = (
  cardInfo,
  currentUserKey,
  { onImageOpen, onLikeToggle, onCardDelete, onCardInfo }
) => {
  const cardNode = getCardTemplateNode();
  const likeControl = cardNode.querySelector(".card__like-button");
  const likesCounter = cardNode.querySelector(".card__like-count");
  const deleteControl = cardNode.querySelector(".card__control-button_type_delete");
  const infoControl = cardNode.querySelector(".card__control-button_type_info");
  const imageElement = cardNode.querySelector(".card__image");

  imageElement.src = cardInfo.link;
  imageElement.alt = cardInfo.name;
  cardNode.querySelector(".card__title").textContent = cardInfo.name;
  refreshLikeDisplay(cardInfo, likeControl, likesCounter, currentUserKey);

  const isAuthor = cardInfo.owner._id === currentUserKey;
  if (!isAuthor) {
    deleteControl.remove();
  }

  likeControl.addEventListener("click", () => {
    const likedByMe = likeControl.classList.contains("card__like-button_is-active");
    onLikeToggle({
      cardId: cardInfo._id,
      likedByMe,
      likeControl,
      likesCounter,
    });
  });

  if (isAuthor) {
    deleteControl.addEventListener("click", () => {
      onCardDelete({ cardId: cardInfo._id, cardNode });
    });
  }

  infoControl.addEventListener("click", () => {
    onCardInfo(cardInfo._id);
  });

  imageElement.addEventListener("click", () => {
    onImageOpen(cardInfo);
  });

  return cardNode;
};
