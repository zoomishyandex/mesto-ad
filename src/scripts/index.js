import { renderPlaceCard, dropPlaceCard, syncLikeButton } from "./components/card.js";
import { revealPopup, dismissPopup, bindPopupClosing } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  readProfile,
  readAllPlaces,
  patchProfileData,
  patchProfilePhoto,
  addPlace,
  removePlace,
  flipPlaceLike,
} from "./components/api.js";

const placeList = document.querySelector(".places__list");

const editPopup = document.querySelector(".popup_type_edit");
const editForm = editPopup.querySelector(".popup__form");
const editNameField = editForm.querySelector(".popup__input_type_name");
const editAboutField = editForm.querySelector(".popup__input_type_description");

const addPopup = document.querySelector(".popup_type_new-card");
const addForm = addPopup.querySelector(".popup__form");
const placeNameField = addForm.querySelector(".popup__input_type_card-name");
const placeLinkField = addForm.querySelector(".popup__input_type_url");

const zoomPopup = document.querySelector(".popup_type_image");
const zoomImage = zoomPopup.querySelector(".popup__image");
const zoomCaption = zoomPopup.querySelector(".popup__caption");

const editProfileBtn = document.querySelector(".profile__edit-button");
const addPlaceBtn = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileAbout = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const formSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarUrlField = avatarForm.querySelector(".popup__input_type_avatar");

const factsPopup = document.querySelector(".popup_type_info");
const factsList = factsPopup.querySelector(".popup__list_type_definitions");
const likersList = factsPopup.querySelector(".popup__list_type_users");
const factRowTemplate = document.querySelector("#popup-info-definition-template").content;
const likerBadgeTemplate = document.querySelector("#popup-info-user-preview-template").content;

const allPopups = document.querySelectorAll(".popup");

let viewerId = "";

const logApiFailure = (error) => {
  console.log(error);
};

const toRussianDate = (rawDate) =>
  rawDate.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const swapButtonText = (button, busy, busyText) => {
  if (!button.dataset.savedLabel) {
    button.dataset.savedLabel = button.textContent;
  }
  button.textContent = busy ? busyText : button.dataset.savedLabel;
};

const fillProfileBar = (profile) => {
  profileTitle.textContent = profile.name;
  profileAbout.textContent = profile.about;
  profileAvatar.style.backgroundImage = `url(${profile.avatar})`;
  viewerId = profile._id;
};

const openZoom = (placeData) => {
  zoomImage.src = placeData.link;
  zoomImage.alt = placeData.name;
  zoomCaption.textContent = placeData.name;
  revealPopup(zoomPopup);
};

const makeFactRow = (label, value) => {
  const row = factRowTemplate.querySelector(".popup__list-item").cloneNode(true);
  row.querySelector(".popup__info-term").textContent = label;
  row.querySelector(".popup__info-item").textContent = value;
  return row;
};

const makeLikerBadge = (name) => {
  const badge = likerBadgeTemplate
    .querySelector(".popup__list-item_type_badge")
    .cloneNode(true);
  badge.textContent = name;
  return badge;
};

const openFactsPopup = (placeId) => {
  readAllPlaces()
    .then((places) => {
      const target = places.find((item) => item._id === placeId);
      if (!target) {
        return;
      }

      factsList.replaceChildren(
        makeFactRow("Описание:", target.name),
        makeFactRow("Дата создания:", toRussianDate(new Date(target.createdAt))),
        makeFactRow("Владелец:", target.owner.name),
        makeFactRow("Количество лайков:", String(target.likes.length))
      );

      if (target.likes.length === 0) {
        likersList.replaceChildren(makeLikerBadge("Пока никто не лайкнул"));
      } else {
        likersList.replaceChildren(
          ...target.likes.map((user) => makeLikerBadge(user.name))
        );
      }

      revealPopup(factsPopup);
    })
    .catch(logApiFailure);
};

const onHeartClick = ({ placeId, alreadyLiked, likeBtn, countNode }) => {
  flipPlaceLike(placeId, alreadyLiked)
    .then((updated) => {
      syncLikeButton(updated, likeBtn, countNode, viewerId);
    })
    .catch(logApiFailure);
};

const onRemoveClick = ({ placeId, placeNode }) => {
  removePlace(placeId)
    .then(() => {
      dropPlaceCard(placeNode);
    })
    .catch(logApiFailure);
};

const appendPlace = (placeData, toTop = false) => {
  const placeNode = renderPlaceCard(placeData, viewerId, {
    onZoom: openZoom,
    onHeart: onHeartClick,
    onRemove: onRemoveClick,
    onFacts: openFactsPopup,
  });

  if (toTop) {
    placeList.prepend(placeNode);
    return;
  }

  placeList.append(placeNode);
};

const withBusyButton = (button, busyText, promise) => {
  swapButtonText(button, true, busyText);
  return promise.catch(logApiFailure).finally(() => {
    swapButtonText(button, false);
  });
};

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  withBusyButton(
    button,
    "Сохранение...",
    patchProfileData({
      name: editNameField.value,
      about: editAboutField.value,
    }).then((profile) => {
      fillProfileBar(profile);
      dismissPopup(editPopup);
    })
  );
});

avatarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  withBusyButton(
    button,
    "Сохранение...",
    patchProfilePhoto({ avatar: avatarUrlField.value }).then((profile) => {
      fillProfileBar(profile);
      dismissPopup(avatarPopup);
    })
  );
});

addForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  withBusyButton(
    button,
    "Создание...",
    addPlace({
      name: placeNameField.value,
      link: placeLinkField.value,
    }).then((placeData) => {
      appendPlace(placeData, true);
      dismissPopup(addPopup);
    })
  );
});

editProfileBtn.addEventListener("click", () => {
  editNameField.value = profileTitle.textContent;
  editAboutField.value = profileAbout.textContent;
  clearValidation(editForm, formSettings);
  revealPopup(editPopup);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, formSettings);
  revealPopup(avatarPopup);
});

addPlaceBtn.addEventListener("click", () => {
  addForm.reset();
  clearValidation(addForm, formSettings);
  revealPopup(addPopup);
});

for (const popupNode of allPopups) {
  bindPopupClosing(popupNode);
}

enableValidation(formSettings);

Promise.all([readAllPlaces(), readProfile()])
  .then(([places, profile]) => {
    fillProfileBar(profile);
    for (const placeData of places) {
      appendPlace(placeData);
    }
  })
  .catch(logApiFailure);
