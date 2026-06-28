const copySpotTemplate = () =>
  document.getElementById("card-template").content.querySelector(".card").cloneNode(true);

export const paintLikeState = (spotData, likeControl, likesCounter, activeUserId) => {
  const iLiked = spotData.likes.some((user) => user._id === activeUserId);
  likeControl.classList.toggle("card__like-button_is-active", iLiked);
  likesCounter.textContent = spotData.likes.length;
};

export const eraseSpotCard = (spotElement) => {
  spotElement.remove();
};

export const buildSpotCard = (
  spotData,
  activeUserId,
  { onPhotoOpen, onLikePress, onSpotDelete, onSpotInfo }
) => {
  const spotElement = copySpotTemplate();
  const likeControl = spotElement.querySelector(".card__like-button");
  const likesCounter = spotElement.querySelector(".card__like-count");
  const deleteControl = spotElement.querySelector(".card__control-button_type_delete");
  const infoControl = spotElement.querySelector(".card__control-button_type_info");
  const photoElement = spotElement.querySelector(".card__image");

  photoElement.src = spotData.link;
  photoElement.alt = spotData.name;
  spotElement.querySelector(".card__title").textContent = spotData.name;
  paintLikeState(spotData, likeControl, likesCounter, activeUserId);

  const iAmAuthor = spotData.owner._id === activeUserId;
  if (!iAmAuthor) {
    deleteControl.remove();
  }

  likeControl.addEventListener("click", () => {
    const likedAlready = likeControl.classList.contains("card__like-button_is-active");
    onLikePress({
      spotId: spotData._id,
      likedAlready,
      likeControl,
      likesCounter,
    });
  });

  if (iAmAuthor) {
    deleteControl.addEventListener("click", () => {
      onSpotDelete({ spotId: spotData._id, spotElement });
    });
  }

  infoControl.addEventListener("click", () => {
    onSpotInfo(spotData._id);
  });

  photoElement.addEventListener("click", () => {
    onPhotoOpen(spotData);
  });

  return spotElement;
};
