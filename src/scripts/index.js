import { buildSpotCard, eraseSpotCard, paintLikeState } from "./components/card.js";
import { openOverlay, closeOverlay, wireOverlayClose } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  loadAccount,
  loadSpots,
  saveAccount,
  saveAccountPhoto,
  createSpot,
  deleteSpot,
  toggleSpotLike,
} from "./components/api.js";

const spotsGrid = document.querySelector(".places__list");

const accountOverlay = document.querySelector(".popup_type_edit");
const accountForm = accountOverlay.querySelector(".popup__form");
const accountNameInput = accountForm.querySelector(".popup__input_type_name");
const accountAboutInput = accountForm.querySelector(".popup__input_type_description");

const spotOverlay = document.querySelector(".popup_type_new-card");
const spotForm = spotOverlay.querySelector(".popup__form");
const spotTitleInput = spotForm.querySelector(".popup__input_type_card-name");
const spotUrlInput = spotForm.querySelector(".popup__input_type_url");

const photoOverlay = document.querySelector(".popup_type_image");
const photoPreview = photoOverlay.querySelector(".popup__image");
const photoCaption = photoOverlay.querySelector(".popup__caption");

const accountEditTrigger = document.querySelector(".profile__edit-button");
const spotAddTrigger = document.querySelector(".profile__add-button");

const accountNameDisplay = document.querySelector(".profile__title");
const accountAboutDisplay = document.querySelector(".profile__description");
const accountAvatarDisplay = document.querySelector(".profile__image");

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const avatarOverlay = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarOverlay.querySelector(".popup__form");
const avatarUrlInput = avatarForm.querySelector(".popup__input_type_avatar");

const detailsOverlay = document.querySelector(".popup_type_info");
const detailsRows = detailsOverlay.querySelector(".popup__list_type_definitions");
const detailsLikers = detailsOverlay.querySelector(".popup__list_type_users");
const detailsRowTemplate = document.querySelector("#popup-info-definition-template").content;
const likerChipTemplate = document.querySelector("#popup-info-user-preview-template").content;

const overlayElements = document.querySelectorAll(".popup");

let activeUserId = "";

const onApiError = (error) => {
  console.log(error);
};

const formatSpotDate = (dateValue) =>
  dateValue.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const storeButtonCaption = (buttonElement) => {
  if (!buttonElement.dataset.storedCaption) {
    buttonElement.dataset.storedCaption = buttonElement.textContent;
  }
};

const setSubmitPending = (buttonElement, pending, pendingCaption) => {
  storeButtonCaption(buttonElement);
  buttonElement.textContent = pending ? pendingCaption : buttonElement.dataset.storedCaption;
};

const renderAccount = (accountData) => {
  accountNameDisplay.textContent = accountData.name;
  accountAboutDisplay.textContent = accountData.about;
  accountAvatarDisplay.style.backgroundImage = `url(${accountData.avatar})`;
  activeUserId = accountData._id;
};

const openPhotoOverlay = (spotData) => {
  photoPreview.src = spotData.link;
  photoPreview.alt = spotData.name;
  photoCaption.textContent = spotData.name;
  openOverlay(photoOverlay);
};

const createDetailsRow = (term, value) => {
  const row = detailsRowTemplate.querySelector(".popup__list-item").cloneNode(true);
  row.querySelector(".popup__info-term").textContent = term;
  row.querySelector(".popup__info-item").textContent = value;
  return row;
};

const createLikerChip = (userName) => {
  const chip = likerChipTemplate
    .querySelector(".popup__list-item_type_badge")
    .cloneNode(true);
  chip.textContent = userName;
  return chip;
};

const openSpotDetails = (spotId) => {
  loadSpots()
    .then((spots) => {
      const spot = spots.find((item) => item._id === spotId);
      if (!spot) {
        return;
      }

      detailsRows.replaceChildren(
        createDetailsRow("Описание:", spot.name),
        createDetailsRow("Дата создания:", formatSpotDate(new Date(spot.createdAt))),
        createDetailsRow("Владелец:", spot.owner.name),
        createDetailsRow("Количество лайков:", String(spot.likes.length))
      );

      if (spot.likes.length === 0) {
        detailsLikers.replaceChildren(createLikerChip("Пока никто не лайкнул"));
      } else {
        detailsLikers.replaceChildren(
          ...spot.likes.map((liker) => createLikerChip(liker.name))
        );
      }

      openOverlay(detailsOverlay);
    })
    .catch(onApiError);
};

const handleLikePress = ({ spotId, likedAlready, likeControl, likesCounter }) => {
  toggleSpotLike(spotId, likedAlready)
    .then((updatedSpot) => {
      paintLikeState(updatedSpot, likeControl, likesCounter, activeUserId);
    })
    .catch(onApiError);
};

const handleSpotDelete = ({ spotId, spotElement }) => {
  deleteSpot(spotId)
    .then(() => {
      eraseSpotCard(spotElement);
    })
    .catch(onApiError);
};

const pushSpotToGrid = (spotData, toBeginning = false) => {
  const spotElement = buildSpotCard(spotData, activeUserId, {
    onPhotoOpen: openPhotoOverlay,
    onLikePress: handleLikePress,
    onSpotDelete: handleSpotDelete,
    onSpotInfo: openSpotDetails,
  });

  if (toBeginning) {
    spotsGrid.prepend(spotElement);
    return;
  }

  spotsGrid.append(spotElement);
};

const runSubmitWithPending = (buttonElement, pendingCaption, requestPromise) => {
  setSubmitPending(buttonElement, true, pendingCaption);
  return requestPromise.catch(onApiError).finally(() => {
    setSubmitPending(buttonElement, false);
  });
};

accountForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const buttonElement = event.submitter;
  runSubmitWithPending(
    buttonElement,
    "Сохранение...",
    saveAccount({
      name: accountNameInput.value,
      about: accountAboutInput.value,
    }).then((accountData) => {
      renderAccount(accountData);
      closeOverlay(accountOverlay);
    })
  );
});

avatarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const buttonElement = event.submitter;
  runSubmitWithPending(
    buttonElement,
    "Сохранение...",
    saveAccountPhoto({ avatar: avatarUrlInput.value }).then((accountData) => {
      renderAccount(accountData);
      closeOverlay(avatarOverlay);
    })
  );
});

spotForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const buttonElement = event.submitter;
  runSubmitWithPending(
    buttonElement,
    "Создание...",
    createSpot({
      name: spotTitleInput.value,
      link: spotUrlInput.value,
    }).then((spotData) => {
      pushSpotToGrid(spotData, true);
      closeOverlay(spotOverlay);
    })
  );
});

accountEditTrigger.addEventListener("click", () => {
  accountNameInput.value = accountNameDisplay.textContent;
  accountAboutInput.value = accountAboutDisplay.textContent;
  clearValidation(accountForm, validationConfig);
  openOverlay(accountOverlay);
});

accountAvatarDisplay.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openOverlay(avatarOverlay);
});

spotAddTrigger.addEventListener("click", () => {
  spotForm.reset();
  clearValidation(spotForm, validationConfig);
  openOverlay(spotOverlay);
});

overlayElements.forEach((overlayElement) => {
  wireOverlayClose(overlayElement);
});

enableValidation(validationConfig);

Promise.all([loadSpots(), loadAccount()])
  .then(([spots, accountData]) => {
    renderAccount(accountData);
    spots.forEach((spotData) => {
      pushSpotToGrid(spotData);
    });
  })
  .catch(onApiError);
