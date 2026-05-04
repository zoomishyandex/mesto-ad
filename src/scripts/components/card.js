const cloneCardFromTemplate = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

export const applyLikeVisual = (cardPayload, likeBtn, counterNode) => {
  const viewerId = likeBtn.dataset.viewerId;
  const likedByMe = cardPayload.likes.some((person) => person._id === viewerId);
  likeBtn.classList.toggle("card__like-button_is-active", likedByMe);
  counterNode.textContent = String(cardPayload.likes.length);
};

export const detachCardNode = (node) => {
  node.remove();
};

export const buildCard = (
  cardPayload,
  viewerUserId,
  { handleImageClick, handleLike, handleRemove, handleInfo }
) => {
  const root = cloneCardFromTemplate();
  const likeBtn = root.querySelector(".card__like-button");
  const counterNode = root.querySelector(".card__like-count");
  const trashBtn = root.querySelector(".card__control-button_type_delete");
  const infoBtn = root.querySelector(".card__control-button_type_info");
  const img = root.querySelector(".card__image");

  img.src = cardPayload.link;
  img.alt = cardPayload.name;
  root.querySelector(".card__title").textContent = cardPayload.name;
  likeBtn.dataset.viewerId = viewerUserId;
  applyLikeVisual(cardPayload, likeBtn, counterNode);

  const mine = cardPayload.owner._id === viewerUserId;
  if (!mine) {
    trashBtn.remove();
  }

  likeBtn.addEventListener("click", () =>
    handleLike({
      cardId: cardPayload._id,
      alreadyLiked: likeBtn.classList.contains("card__like-button_is-active"),
      likeBtn,
      counterNode,
    })
  );

  if (mine) {
    trashBtn.addEventListener("click", () =>
      handleRemove({ cardId: cardPayload._id, root })
    );
  }

  infoBtn.addEventListener("click", () => handleInfo(cardPayload._id));
  img.addEventListener("click", () => handleImageClick(cardPayload));

  return root;
};
