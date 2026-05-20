import {
  createCardElement,
  removeCardFromPage,
  refreshLikeDisplay,
} from "./components/card.js";
import { openModal, closeModal, setupModalControls } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  requestUserInfo,
  requestCardsData,
  updateUserInfo,
  updateUserAvatar,
  submitNewCard,
  requestDeleteCard,
  requestLikeToggle,
} from "./components/api.js";

const cardsListElement = document.querySelector(".places__list");

const profileModal = document.querySelector(".popup_type_edit");
const profileFormElement = profileModal.querySelector(".popup__form");
const profileNameInput = profileFormElement.querySelector(".popup__input_type_name");
const profileAboutInput = profileFormElement.querySelector(".popup__input_type_description");

const newCardModal = document.querySelector(".popup_type_new-card");
const newCardFormElement = newCardModal.querySelector(".popup__form");
const newCardNameInput = newCardFormElement.querySelector(".popup__input_type_card-name");
const newCardLinkInput = newCardFormElement.querySelector(".popup__input_type_url");

const previewModal = document.querySelector(".popup_type_image");
const previewImageElement = previewModal.querySelector(".popup__image");
const previewCaptionElement = previewModal.querySelector(".popup__caption");

const profileEditButton = document.querySelector(".profile__edit-button");
const newCardButton = document.querySelector(".profile__add-button");

const profileNameElement = document.querySelector(".profile__title");
const profileAboutElement = document.querySelector(".profile__description");
const profileAvatarElement = document.querySelector(".profile__image");

const validationConfig = {
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

const avatarModal = document.querySelector(".popup_type_edit-avatar");
const avatarFormElement = avatarModal.querySelector(".popup__form");
const avatarLinkInput = avatarFormElement.querySelector(".popup__input_type_avatar");

const cardInfoModal = document.querySelector(".popup_type_info");
const cardInfoDefinitions = cardInfoModal.querySelector(".popup__list_type_definitions");
const cardInfoLikers = cardInfoModal.querySelector(".popup__list_type_users");
const cardInfoDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template"
).content;
const cardInfoUserTemplate = document.querySelector("#popup-info-user-preview-template")
  .content;

const modalElements = document.querySelectorAll(".popup");

let currentUserKey = "";

const onApiError = () => {};

const formatRussianDate = (dateValue) =>
  dateValue.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const toggleSubmitLabel = (submitButton, isBusy, busyLabel) => {
  if (!submitButton.dataset.savedLabel) {
    submitButton.dataset.savedLabel = submitButton.textContent;
  }
  submitButton.textContent = isBusy ? busyLabel : submitButton.dataset.savedLabel;
};

const renderUserOnPage = (userInfo) => {
  profileNameElement.textContent = userInfo.name;
  profileAboutElement.textContent = userInfo.about;
  profileAvatarElement.style.backgroundImage = `url(${userInfo.avatar})`;
  currentUserKey = userInfo._id;
};

const showImagePreview = (cardInfo) => {
  previewImageElement.src = cardInfo.link;
  previewImageElement.alt = cardInfo.name;
  previewCaptionElement.textContent = cardInfo.name;
  openModal(previewModal);
};

const buildDefinitionRow = (title, description) => {
  const rowElement = cardInfoDefinitionTemplate
    .querySelector(".popup__list-item")
    .cloneNode(true);
  rowElement.querySelector(".popup__info-term").textContent = title;
  rowElement.querySelector(".popup__info-item").textContent = description;
  return rowElement;
};

const buildLikerBadge = (userName) => {
  const badgeElement = cardInfoUserTemplate
    .querySelector(".popup__list-item_type_badge")
    .cloneNode(true);
  badgeElement.textContent = userName;
  return badgeElement;
};

const showCardInfoModal = (cardId) => {
  requestCardsData()
    .then((cards) => {
      const targetCard = cards.find((card) => card._id === cardId);
      if (!targetCard) {
        return;
      }

      cardInfoDefinitions.replaceChildren(
        buildDefinitionRow("Описание:", targetCard.name),
        buildDefinitionRow(
          "Дата создания:",
          formatRussianDate(new Date(targetCard.createdAt))
        ),
        buildDefinitionRow("Владелец:", targetCard.owner.name),
        buildDefinitionRow("Количество лайков:", String(targetCard.likes.length))
      );

      if (targetCard.likes.length === 0) {
        cardInfoLikers.replaceChildren(buildLikerBadge("Пока никто не лайкнул"));
      } else {
        cardInfoLikers.replaceChildren(
          ...targetCard.likes.map((liker) => buildLikerBadge(liker.name))
        );
      }

      openModal(cardInfoModal);
    })
    .catch(onApiError);
};

const handleLikeButtonClick = ({ cardId, likedByMe, likeControl, likesCounter }) => {
  requestLikeToggle(cardId, likedByMe)
    .then((updatedCard) => {
      refreshLikeDisplay(updatedCard, likeControl, likesCounter, currentUserKey);
    })
    .catch(onApiError);
};

const handleDeleteButtonClick = ({ cardId, cardNode }) => {
  requestDeleteCard(cardId)
    .then(() => {
      removeCardFromPage(cardNode);
    })
    .catch(onApiError);
};

const addCardToList = (cardInfo, toBeginning = false) => {
  const cardNode = createCardElement(cardInfo, currentUserKey, {
    onImageOpen: showImagePreview,
    onLikeToggle: handleLikeButtonClick,
    onCardDelete: handleDeleteButtonClick,
    onCardInfo: showCardInfoModal,
  });

  if (toBeginning) {
    cardsListElement.prepend(cardNode);
    return;
  }

  cardsListElement.append(cardNode);
};

const runWithSubmitState = (submitButton, busyLabel, requestPromise) => {
  toggleSubmitLabel(submitButton, true, busyLabel);
  return requestPromise
    .catch(onApiError)
    .finally(() => {
      toggleSubmitLabel(submitButton, false);
    });
};

profileFormElement.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  runWithSubmitState(
    submitButton,
    "Сохранение...",
    updateUserInfo({
      name: profileNameInput.value,
      about: profileAboutInput.value,
    }).then((userInfo) => {
      renderUserOnPage(userInfo);
      closeModal(profileModal);
    })
  );
});

avatarFormElement.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  runWithSubmitState(
    submitButton,
    "Сохранение...",
    updateUserAvatar({ avatar: avatarLinkInput.value }).then((userInfo) => {
      renderUserOnPage(userInfo);
      closeModal(avatarModal);
    })
  );
});

newCardFormElement.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitButton = event.submitter;
  runWithSubmitState(
    submitButton,
    "Создание...",
    submitNewCard({
      name: newCardNameInput.value,
      link: newCardLinkInput.value,
    }).then((cardInfo) => {
      addCardToList(cardInfo, true);
      closeModal(newCardModal);
    })
  );
});

profileEditButton.addEventListener("click", () => {
  profileNameInput.value = profileNameElement.textContent;
  profileAboutInput.value = profileAboutElement.textContent;
  clearValidation(profileFormElement, validationConfig);
  openModal(profileModal);
});

profileAvatarElement.addEventListener("click", () => {
  avatarFormElement.reset();
  clearValidation(avatarFormElement, validationConfig);
  openModal(avatarModal);
});

newCardButton.addEventListener("click", () => {
  newCardFormElement.reset();
  clearValidation(newCardFormElement, validationConfig);
  openModal(newCardModal);
});

modalElements.forEach((modalElement) => {
  setupModalControls(modalElement);
});

enableValidation(validationConfig);

const initApp = () => {
  Promise.all([requestCardsData(), requestUserInfo()])
    .then(([cards, userInfo]) => {
      renderUserOnPage(userInfo);
      cards.forEach((cardInfo) => {
        addCardToList(cardInfo);
      });
    })
    .catch(onApiError);
};

initApp();
