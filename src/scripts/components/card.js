const grabPlaceTemplate = () =>
  document.getElementById("card-template").content.querySelector(".card").cloneNode(true);

export const syncLikeButton = (placeData, likeBtn, countNode, viewerId) => {
  const likedByViewer = placeData.likes.some((user) => user._id === viewerId);
  likeBtn.classList.toggle("card__like-button_is-active", likedByViewer);
  countNode.textContent = placeData.likes.length;
};

export const dropPlaceCard = (placeNode) => {
  placeNode.remove();
};

export const renderPlaceCard = (
  placeData,
  viewerId,
  { onZoom, onHeart, onRemove, onFacts }
) => {
  const placeNode = grabPlaceTemplate();
  const likeBtn = placeNode.querySelector(".card__like-button");
  const countNode = placeNode.querySelector(".card__like-count");
  const deleteBtn = placeNode.querySelector(".card__control-button_type_delete");
  const infoBtn = placeNode.querySelector(".card__control-button_type_info");
  const imageNode = placeNode.querySelector(".card__image");

  imageNode.src = placeData.link;
  imageNode.alt = placeData.name;
  placeNode.querySelector(".card__title").textContent = placeData.name;
  syncLikeButton(placeData, likeBtn, countNode, viewerId);

  const isMine = placeData.owner._id === viewerId;
  if (!isMine) {
    deleteBtn.remove();
  }

  likeBtn.addEventListener("click", () => {
    const alreadyLiked = likeBtn.classList.contains("card__like-button_is-active");
    onHeart({
      placeId: placeData._id,
      alreadyLiked,
      likeBtn,
      countNode,
    });
  });

  if (isMine) {
    deleteBtn.addEventListener("click", () => {
      onRemove({ placeId: placeData._id, placeNode });
    });
  }

  infoBtn.addEventListener("click", () => {
    onFacts(placeData._id);
  });

  imageNode.addEventListener("click", () => {
    onZoom(placeData);
  });

  return placeNode;
};
