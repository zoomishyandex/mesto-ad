const copyGalleryTemplate = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

export const updateLikesUi = (item, likeButton, likesNumber, loggedInUserId) => {
  const hasLike = item.likes.some((member) => member._id === loggedInUserId);
  likeButton.classList.toggle("card__like-button_is-active", hasLike);
  likesNumber.textContent = item.likes.length;
};

export const dropGalleryItem = (itemElement) => {
  itemElement.remove();
};

export const renderGalleryItem = (
  item,
  loggedInUserId,
  { showFullscreen, toggleLike, removeItem, openStatistics }
) => {
  const itemElement = copyGalleryTemplate();
  const likeButton = itemElement.querySelector(".card__like-button");
  const likesNumber = itemElement.querySelector(".card__like-count");
  const removeButton = itemElement.querySelector(".card__control-button_type_delete");
  const statisticsButton = itemElement.querySelector(".card__control-button_type_info");
  const picture = itemElement.querySelector(".card__image");

  picture.src = item.link;
  picture.alt = item.name;
  itemElement.querySelector(".card__title").textContent = item.name;
  updateLikesUi(item, likeButton, likesNumber, loggedInUserId);

  const isOwnedByUser = item.owner._id === loggedInUserId;
  if (!isOwnedByUser) {
    removeButton.remove();
  }

  likeButton.addEventListener("click", () => {
    const userHasLike = likeButton.classList.contains("card__like-button_is-active");
    toggleLike({
      itemId: item._id,
      userHasLike,
      likeButton,
      likesNumber,
    });
  });

  if (isOwnedByUser) {
    removeButton.addEventListener("click", () => {
      removeItem({ itemId: item._id, itemElement });
    });
  }

  statisticsButton.addEventListener("click", () => {
    openStatistics(item._id);
  });

  picture.addEventListener("click", () => {
    showFullscreen(item);
  });

  return itemElement;
};
