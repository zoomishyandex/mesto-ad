const clonePlaceTemplate = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

export const renderLikeState = (place, likeButton, likeCount, userId) => {
  const liked = place.likes.some((person) => person._id === userId);
  likeButton.classList.toggle("card__like-button_is-active", liked);
  likeCount.textContent = place.likes.length;
};

export const deletePlaceElement = (element) => {
  element.remove();
};

export const instantiatePlaceCard = (
  place,
  userId,
  { previewImage, likeClick, removeClick, detailsClick }
) => {
  const element = clonePlaceTemplate();
  const likeButton = element.querySelector(".card__like-button");
  const likeCount = element.querySelector(".card__like-count");
  const removeButton = element.querySelector(".card__control-button_type_delete");
  const detailsButton = element.querySelector(".card__control-button_type_info");
  const image = element.querySelector(".card__image");

  image.src = place.link;
  image.alt = place.name;
  element.querySelector(".card__title").textContent = place.name;
  renderLikeState(place, likeButton, likeCount, userId);

  const createdByUser = place.owner._id === userId;
  if (!createdByUser) {
    removeButton.remove();
  }

  likeButton.addEventListener("click", () => {
    const userAlreadyLiked = likeButton.classList.contains("card__like-button_is-active");
    likeClick({
      placeId: place._id,
      userAlreadyLiked,
      likeButton,
      likeCount,
    });
  });

  if (createdByUser) {
    removeButton.addEventListener("click", () => {
      removeClick({ placeId: place._id, element });
    });
  }

  detailsButton.addEventListener("click", () => {
    detailsClick(place._id);
  });

  image.addEventListener("click", () => {
    previewImage(place);
  });

  return element;
};
