import {
  instantiatePlaceCard,
  deletePlaceElement,
  renderLikeState,
} from "./components/card.js";
import { enablePopup, disablePopup, registerPopupClosing } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getOwnerProfile,
  getPlacesList,
  patchOwnerProfile,
  patchOwnerPhoto,
  postNewPlace,
  deletePlace,
  togglePlaceLike,
} from "./components/api.js";

const placesList = document.querySelector(".places__list");

const editProfilePopup = document.querySelector(".popup_type_edit");
const editProfileForm = editProfilePopup.querySelector(".popup__form");
const editNameField = editProfileForm.querySelector(".popup__input_type_name");
const editAboutField = editProfileForm.querySelector(".popup__input_type_description");

const addPlacePopup = document.querySelector(".popup_type_new-card");
const addPlaceForm = addPlacePopup.querySelector(".popup__form");
const addPlaceNameField = addPlaceForm.querySelector(".popup__input_type_card-name");
const addPlaceLinkField = addPlaceForm.querySelector(".popup__input_type_url");

const imagePopup = document.querySelector(".popup_type_image");
const imagePopupPicture = imagePopup.querySelector(".popup__image");
const imagePopupCaption = imagePopup.querySelector(".popup__caption");

const editProfileControl = document.querySelector(".profile__edit-button");
const addPlaceControl = document.querySelector(".profile__add-button");

const headerName = document.querySelector(".profile__title");
const headerAbout = document.querySelector(".profile__description");
const headerAvatar = document.querySelector(".profile__image");

const formSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
  lettersOnlyClassList: ["popup__input_type_name", "popup__input_type_card-name"],
  lettersOnlyMessage:
    "Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы",
};

const changeAvatarPopup = document.querySelector(".popup_type_edit-avatar");
const changeAvatarForm = changeAvatarPopup.querySelector(".popup__form");
const changeAvatarLinkField = changeAvatarForm.querySelector(".popup__input_type_avatar");

const placeDetailsPopup = document.querySelector(".popup_type_info");
const placeDetailsRows = placeDetailsPopup.querySelector(".popup__list_type_definitions");
const placeDetailsUsers = placeDetailsPopup.querySelector(".popup__list_type_users");
const placeDetailsRowTemplate = document.querySelector("#popup-info-definition-template")
  .content;
const placeDetailsUserTemplate = document.querySelector("#popup-info-user-preview-template")
  .content;

const popupCollection = document.querySelectorAll(".popup");

let pageUserId = "";

const silentRequestFail = () => {};

const toRussianDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const storeButtonText = (button) => {
  if (!button.dataset.originalText) {
    button.dataset.originalText = button.textContent;
  }
};

const withButtonLoader = (button, loadingText, action) => {
  storeButtonText(button);
  button.textContent = loadingText;
  return action()
    .catch(silentRequestFail)
    .finally(() => {
      button.textContent = button.dataset.originalText;
    });
};

const updateHeader = (profile) => {
  headerName.textContent = profile.name;
  headerAbout.textContent = profile.about;
  headerAvatar.style.backgroundImage = `url(${profile.avatar})`;
  pageUserId = profile._id;
};

const openImagePopup = (place) => {
  imagePopupPicture.src = place.link;
  imagePopupPicture.alt = place.name;
  imagePopupCaption.textContent = place.name;
  enablePopup(imagePopup);
};

const createDetailsRow = (label, value) => {
  const row = placeDetailsRowTemplate.querySelector(".popup__list-item").cloneNode(true);
  row.querySelector(".popup__info-term").textContent = label;
  row.querySelector(".popup__info-item").textContent = value;
  return row;
};

const createUserLabel = (name) => {
  const label = placeDetailsUserTemplate
    .querySelector(".popup__list-item_type_badge")
    .cloneNode(true);
  label.textContent = name;
  return label;
};

const openPlaceDetails = (placeId) => {
  getPlacesList()
    .then((places) => {
      const place = places.find((item) => item._id === placeId);
      if (!place) {
        return;
      }

      placeDetailsRows.replaceChildren(
        createDetailsRow("Описание:", place.name),
        createDetailsRow("Дата создания:", toRussianDate(new Date(place.createdAt))),
        createDetailsRow("Владелец:", place.owner.name),
        createDetailsRow("Количество лайков:", String(place.likes.length))
      );

      if (place.likes.length === 0) {
        placeDetailsUsers.replaceChildren(createUserLabel("Пока никто не лайкнул"));
      } else {
        placeDetailsUsers.replaceChildren(
          ...place.likes.map((person) => createUserLabel(person.name))
        );
      }

      enablePopup(placeDetailsPopup);
    })
    .catch(silentRequestFail);
};

const onPlaceLike = ({ placeId, userAlreadyLiked, likeButton, likeCount }) => {
  togglePlaceLike(placeId, userAlreadyLiked)
    .then((updatedPlace) => {
      renderLikeState(updatedPlace, likeButton, likeCount, pageUserId);
    })
    .catch(silentRequestFail);
};

const onPlaceRemove = ({ placeId, element }) => {
  deletePlace(placeId)
    .then(() => {
      deletePlaceElement(element);
    })
    .catch(silentRequestFail);
};

const insertPlace = (place, insertFirst = false) => {
  const element = instantiatePlaceCard(place, pageUserId, {
    previewImage: openImagePopup,
    likeClick: onPlaceLike,
    removeClick: onPlaceRemove,
    detailsClick: openPlaceDetails,
  });

  if (insertFirst) {
    placesList.prepend(element);
    return;
  }

  placesList.append(element);
};

editProfileForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  withButtonLoader(button, "Сохранение...", () =>
    patchOwnerProfile({
      name: editNameField.value,
      about: editAboutField.value,
    }).then((profile) => {
      updateHeader(profile);
      disablePopup(editProfilePopup);
    })
  );
});

changeAvatarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  withButtonLoader(button, "Сохранение...", () =>
    patchOwnerPhoto({ avatar: changeAvatarLinkField.value }).then((profile) => {
      updateHeader(profile);
      disablePopup(changeAvatarPopup);
    })
  );
});

addPlaceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  withButtonLoader(button, "Создание...", () =>
    postNewPlace({
      name: addPlaceNameField.value,
      link: addPlaceLinkField.value,
    }).then((place) => {
      insertPlace(place, true);
      disablePopup(addPlacePopup);
    })
  );
});

editProfileControl.addEventListener("click", () => {
  editNameField.value = headerName.textContent;
  editAboutField.value = headerAbout.textContent;
  clearValidation(editProfileForm, formSettings);
  enablePopup(editProfilePopup);
});

headerAvatar.addEventListener("click", () => {
  changeAvatarForm.reset();
  clearValidation(changeAvatarForm, formSettings);
  enablePopup(changeAvatarPopup);
});

addPlaceControl.addEventListener("click", () => {
  addPlaceForm.reset();
  clearValidation(addPlaceForm, formSettings);
  enablePopup(addPlacePopup);
});

popupCollection.forEach((popup) => {
  registerPopupClosing(popup);
});

enableValidation(formSettings);

const startApplication = async () => {
  try {
    const [places, profile] = await Promise.all([getPlacesList(), getOwnerProfile()]);
    updateHeader(profile);
    places.forEach((place) => {
      insertPlace(place);
    });
  } catch {
    silentRequestFail();
  }
};

startApplication();
