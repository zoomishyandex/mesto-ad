import {
  buildGalleryItem,
  detachGalleryItem,
  updateHeartState,
} from "./components/card.js";
import { showOverlay, hideOverlay, wireOverlayDismiss } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  getMeProfile,
  fetchGallery,
  saveMeDetails,
  saveMePicture,
  publishCard,
  eraseCardById,
  toggleCardLike,
} from "./components/api.js";

const galleryContainer = document.querySelector(".places__list");

const profileOverlay = document.querySelector(".popup_type_edit");
const profileForm = profileOverlay.querySelector(".popup__form");
const nameInput = profileForm.querySelector(".popup__input_type_name");
const aboutInput = profileForm.querySelector(".popup__input_type_description");

const newCardOverlay = document.querySelector(".popup_type_new-card");
const newCardForm = newCardOverlay.querySelector(".popup__form");
const cardTitleInput = newCardForm.querySelector(".popup__input_type_card-name");
const cardUrlInput = newCardForm.querySelector(".popup__input_type_url");

const imageOverlay = document.querySelector(".popup_type_image");
const fullImage = imageOverlay.querySelector(".popup__image");
const imageCaption = imageOverlay.querySelector(".popup__caption");

const editBtn = document.querySelector(".profile__edit-button");
const addCardBtn = document.querySelector(".profile__add-button");

const nameDisplay = document.querySelector(".profile__title");
const aboutDisplay = document.querySelector(".profile__description");
const avatarDisplay = document.querySelector(".profile__image");

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const avatarOverlay = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarOverlay.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const statsOverlay = document.querySelector(".popup_type_info");
const statsDefinitions = statsOverlay.querySelector(".popup__list_type_definitions");
const statsLikers = statsOverlay.querySelector(".popup__list_type_users");
const definitionTpl = document.querySelector("#popup-info-definition-template").content;
const likerTpl = document.querySelector("#popup-info-user-preview-template").content;

const overlayNodes = document.querySelectorAll(".popup");

let myUserId = "";

const handleRequestError = (err) => {
  console.log(err);
};

const formatDateRu = (dateObj) =>
  dateObj.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const setSubmitLoading = (submitEl, loading, loadingText) => {
  if (!submitEl.dataset.savedLabel) {
    submitEl.dataset.savedLabel = submitEl.textContent;
  }
  submitEl.textContent = loading ? loadingText : submitEl.dataset.savedLabel;
};

const applyProfileToDom = (userData) => {
  nameDisplay.textContent = userData.name;
  aboutDisplay.textContent = userData.about;
  avatarDisplay.style.backgroundImage = `url(${userData.avatar})`;
  myUserId = userData._id;
};

const openImagePreview = (cardData) => {
  fullImage.src = cardData.link;
  fullImage.alt = cardData.name;
  imageCaption.textContent = cardData.name;
  showOverlay(imageOverlay);
};

const createDefinitionItem = (term, value) => {
  const item = definitionTpl.querySelector(".popup__list-item").cloneNode(true);
  item.querySelector(".popup__info-term").textContent = term;
  item.querySelector(".popup__info-item").textContent = value;
  return item;
};

const createLikerChip = (userName) => {
  const chip = likerTpl.querySelector(".popup__list-item_type_badge").cloneNode(true);
  chip.textContent = userName;
  return chip;
};

const openCardStats = (cardId) => {
  fetchGallery()
    .then((cards) => {
      const card = cards.find((item) => item._id === cardId);
      if (!card) {
        return;
      }

      statsDefinitions.replaceChildren(
        createDefinitionItem("Описание:", card.name),
        createDefinitionItem(
          "Дата создания:",
          formatDateRu(new Date(card.createdAt))
        ),
        createDefinitionItem("Владелец:", card.owner.name),
        createDefinitionItem("Количество лайков:", String(card.likes.length))
      );

      if (card.likes.length === 0) {
        statsLikers.replaceChildren(createLikerChip("Пока никто не лайкнул"));
      } else {
        statsLikers.replaceChildren(
          ...card.likes.map((liker) => createLikerChip(liker.name))
        );
      }

      showOverlay(statsOverlay);
    })
    .catch(handleRequestError);
};

const handleHeartClick = ({ cardId, isLiked, heartBtn, counterEl }) => {
  toggleCardLike(cardId, isLiked)
    .then((updatedCard) => {
      updateHeartState(updatedCard, heartBtn, counterEl, myUserId);
    })
    .catch(handleRequestError);
};

const handleEraseClick = ({ cardId, cardEl }) => {
  eraseCardById(cardId)
    .then(() => {
      detachGalleryItem(cardEl);
    })
    .catch(handleRequestError);
};

const mountGalleryItem = (cardData, prepend = false) => {
  const cardEl = buildGalleryItem(cardData, myUserId, {
    onPreview: openImagePreview,
    onHeart: handleHeartClick,
    onErase: handleEraseClick,
    onStats: openCardStats,
  });

  if (prepend) {
    galleryContainer.prepend(cardEl);
    return;
  }

  galleryContainer.append(cardEl);
};

const runSubmitWithLoading = (submitEl, loadingText, task) => {
  setSubmitLoading(submitEl, true, loadingText);
  return task.catch(handleRequestError).finally(() => {
    setSubmitLoading(submitEl, false);
  });
};

profileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitEl = evt.submitter;
  runSubmitWithLoading(
    submitEl,
    "Сохранение...",
    saveMeDetails({
      name: nameInput.value,
      about: aboutInput.value,
    }).then((userData) => {
      applyProfileToDom(userData);
      hideOverlay(profileOverlay);
    })
  );
});

avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitEl = evt.submitter;
  runSubmitWithLoading(
    submitEl,
    "Сохранение...",
    saveMePicture({ avatar: avatarInput.value }).then((userData) => {
      applyProfileToDom(userData);
      hideOverlay(avatarOverlay);
    })
  );
});

newCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const submitEl = evt.submitter;
  runSubmitWithLoading(
    submitEl,
    "Создание...",
    publishCard({
      name: cardTitleInput.value,
      link: cardUrlInput.value,
    }).then((cardData) => {
      mountGalleryItem(cardData, true);
      hideOverlay(newCardOverlay);
    })
  );
});

editBtn.addEventListener("click", () => {
  nameInput.value = nameDisplay.textContent;
  aboutInput.value = aboutDisplay.textContent;
  clearValidation(profileForm, validationSettings);
  showOverlay(profileOverlay);
});

avatarDisplay.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  showOverlay(avatarOverlay);
});

addCardBtn.addEventListener("click", () => {
  newCardForm.reset();
  clearValidation(newCardForm, validationSettings);
  showOverlay(newCardOverlay);
});

overlayNodes.forEach((overlay) => {
  wireOverlayDismiss(overlay);
});

enableValidation(validationSettings);

const bootstrap = () => {
  Promise.all([fetchGallery(), getMeProfile()])
    .then(([cards, userData]) => {
      applyProfileToDom(userData);
      cards.forEach((cardData) => {
        mountGalleryItem(cardData);
      });
    })
    .catch(handleRequestError);
};

bootstrap();
