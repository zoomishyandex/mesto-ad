import {
  createCardElement,
  removeCard,
  updateCardLikeState,
} from "./components/card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getUserInfo,
  getCardList,
  setUserInfo,
  setUserAvatar,
  addCard,
  deleteCardById,
  changeLikeCardStatus,
} from "./components/api.js";

const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(
  ".popup__input_type_description"
);

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");
const infoModalWindow = document.querySelector(".popup_type_info");
const infoDefinitionList = infoModalWindow.querySelector(".popup__list_type_definitions");
const infoUsersList = infoModalWindow.querySelector(".popup__list_type_users");
const infoDefinitionTemplate = document.querySelector("#popup-info-definition-template").content;
const infoUserTemplate = document.querySelector("#popup-info-user-preview-template").content;
const allPopups = document.querySelectorAll(".popup");
let currentUserId = "";

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const renderSubmitButton = (button, isLoading, loadingText) => {
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }

  button.textContent = isLoading ? loadingText : button.dataset.defaultText;
};

const setUserData = (userData) => {
  profileTitle.textContent = userData.name;
  profileDescription.textContent = userData.about;
  profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
  currentUserId = userData._id;
};

const createInfoString = (term, value) => {
  const definitionItem = infoDefinitionTemplate
    .querySelector(".popup__list-item")
    .cloneNode(true);
  definitionItem.querySelector(".popup__info-term").textContent = term;
  definitionItem.querySelector(".popup__info-item").textContent = value;
  return definitionItem;
};

const createUserPreview = (userName) => {
  const userPreview = infoUserTemplate
    .querySelector(".popup__list-item_type_badge")
    .cloneNode(true);
  userPreview.textContent = userName;
  return userPreview;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);
      if (!cardData) {
        return;
      }

      infoDefinitionList.replaceChildren(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", String(cardData.likes.length))
      );

      if (cardData.likes.length === 0) {
        infoUsersList.replaceChildren(createUserPreview("Пока никто не лайкнул"));
      } else {
        infoUsersList.replaceChildren(
          ...cardData.likes.map((user) => createUserPreview(user.name))
        );
      }

      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeClick = ({ cardId, isLiked, likeButton, likeCountElement }) => {
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      updateCardLikeState(updatedCard, likeButton, likeCountElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleDeleteCard = ({ cardId, cardElement }) => {
  deleteCardById(cardId)
    .then(() => {
      removeCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const renderCard = (cardData, isPrepend = false) => {
  const cardElement = createCardElement(cardData, currentUserId, {
    onPreviewPicture: handlePreviewPicture,
    onLikeIcon: handleLikeClick,
    onDeleteCard: handleDeleteCard,
    onInfoClick: handleInfoClick,
  });

  if (isPrepend) {
    placesWrap.prepend(cardElement);
    return;
  }

  placesWrap.append(cardElement);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderSubmitButton(submitButton, true, "Сохранение...");
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      setUserData(userData);
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderSubmitButton(submitButton, false);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderSubmitButton(submitButton, true, "Сохранение...");
  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      setUserData(userData);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderSubmitButton(submitButton, false);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.submitter;
  renderSubmitButton(submitButton, true, "Создание...");
  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      renderCard(cardData, true);
      closeModalWindow(cardFormModalWindow);
      cardForm.reset();
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderSubmitButton(submitButton, false);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

enableValidation(validationSettings);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    setUserData(userData);
    cards.forEach((card) => {
      renderCard(card);
    });
  })
  .catch((err) => {
    console.log(err);
  });
