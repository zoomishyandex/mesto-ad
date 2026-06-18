const takeCardTemplate = () =>
  document.getElementById("card-template").content.querySelector(".card").cloneNode(true);

export const applyLikeUi = (cardData, likeBtn, countEl, ownerId) => {
  const likedByMe = cardData.likes.some((user) => user._id === ownerId);
  likeBtn.classList.toggle("card__like-button_is-active", likedByMe);
  countEl.textContent = cardData.likes.length;
};

export const removeCardNode = (cardNode) => {
  cardNode.remove();
};

export const makeCardNode = (
  cardData,
  ownerId,
  { onPreview, onLike, onDelete, onInfo }
) => {
  const cardNode = takeCardTemplate();
  const likeBtn = cardNode.querySelector(".card__like-button");
  const countEl = cardNode.querySelector(".card__like-count");
  const deleteBtn = cardNode.querySelector(".card__control-button_type_delete");
  const infoBtn = cardNode.querySelector(".card__control-button_type_info");
  const imageEl = cardNode.querySelector(".card__image");

  imageEl.src = cardData.link;
  imageEl.alt = cardData.name;
  cardNode.querySelector(".card__title").textContent = cardData.name;
  applyLikeUi(cardData, likeBtn, countEl, ownerId);

  const isOwner = cardData.owner._id === ownerId;
  if (!isOwner) {
    deleteBtn.remove();
  }

  likeBtn.addEventListener("click", () => {
    const isLiked = likeBtn.classList.contains("card__like-button_is-active");
    onLike({
      cardId: cardData._id,
      isLiked,
      likeBtn,
      countEl,
    });
  });

  if (isOwner) {
    deleteBtn.addEventListener("click", () => {
      onDelete({ cardId: cardData._id, cardNode });
    });
  }

  infoBtn.addEventListener("click", () => {
    onInfo(cardData._id);
  });

  imageEl.addEventListener("click", () => {
    onPreview(cardData);
  });

  return cardNode;
};
