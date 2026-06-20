import {
  assembleCardItem,
  detachCardItem,
  refreshLikeCounter,
} from "./components/card.js";
import { showModalLayer, hideModalLayer, initModalDismissal } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  pullUserProfile,
  pullCardCollection,
  pushProfileUpdate,
  pushAvatarUpdate,
  pushNewCard,
  pullCardRemoval,
  pushLikeToggle,
} from "./components/api.js";

const listContainer = document.querySelector(".places__list");

const editLayer = document.querySelector(".popup_type_edit");
const editForm = editLayer.querySelector(".popup__form");
const nameField = editForm.querySelector(".popup__input_type_name");
const aboutField = editForm.querySelector(".popup__input_type_description");

const createLayer = document.querySelector(".popup_type_new-card");
const createForm = createLayer.querySelector(".popup__form");
const titleField = createForm.querySelector(".popup__input_type_card-name");
const urlField = createForm.querySelector(".popup__input_type_url");

const zoomLayer = document.querySelector(".popup_type_image");
const zoomPhoto = zoomLayer.querySelector(".popup__image");
const zoomTitle = zoomLayer.querySelector(".popup__caption");

const editTrigger = document.querySelector(".profile__edit-button");
const createTrigger = document.querySelector(".profile__add-button");

const titleDisplay = document.querySelector(".profile__title");
const aboutDisplay = document.querySelector(".profile__description");
const avatarDisplay = document.querySelector(".profile__image");

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const avatarLayer = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarLayer.querySelector(".popup__form");
const avatarField = avatarForm.querySelector(".popup__input_type_avatar");

const statsLayer = document.querySelector(".popup_type_info");
const statsRows = statsLayer.querySelector(".popup__list_type_definitions");
const statsLikers = statsLayer.querySelector(".popup__list_type_users");
const statsRowMarkup = document.querySelector("#popup-info-definition-template").content;
const likerMarkup = document.querySelector("#popup-info-user-preview-template").content;

const modalLayers = document.querySelectorAll(".popup");

let sessionUserId = "";

const onApiError = (error) => {
  console.log(error);
};

const toReadableDate = (dateObject) =>
  dateObject.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const cacheSubmitText = (submitElement) => {
  if (!submitElement.dataset.initialText) {
    submitElement.dataset.initialText = submitElement.textContent;
  }
};

const markSubmitPending = (submitElement, pending, pendingText) => {
  cacheSubmitText(submitElement);
  submitElement.textContent = pending ? pendingText : submitElement.dataset.initialText;
};

const fillHeaderProfile = (profileData) => {
  titleDisplay.textContent = profileData.name;
  aboutDisplay.textContent = profileData.about;
  avatarDisplay.style.backgroundImage = `url(${profileData.avatar})`;
  sessionUserId = profileData._id;
};

const openZoomLayer = (cardData) => {
  zoomPhoto.src = cardData.link;
  zoomPhoto.alt = cardData.name;
  zoomTitle.textContent = cardData.name;
  showModalLayer(zoomLayer);
};

const createStatsRow = (label, text) => {
  const row = statsRowMarkup.querySelector(".popup__list-item").cloneNode(true);
  row.querySelector(".popup__info-term").textContent = label;
  row.querySelector(".popup__info-item").textContent = text;
  return row;
};

const createLikerChip = (userName) => {
  const chip = likerMarkup.querySelector(".popup__list-item_type_badge").cloneNode(true);
  chip.textContent = userName;
  return chip;
};

const openStatsLayer = (cardId) => {
  pullCardCollection()
    .then((cards) => {
      const targetCard = cards.find((card) => card._id === cardId);
      if (!targetCard) {
        return;
      }

      statsRows.replaceChildren(
        createStatsRow("Описание:", targetCard.name),
        createStatsRow("Дата создания:", toReadableDate(new Date(targetCard.createdAt))),
        createStatsRow("Владелец:", targetCard.owner.name),
        createStatsRow("Количество лайков:", String(targetCard.likes.length))
      );

      if (targetCard.likes.length === 0) {
        statsLikers.replaceChildren(createLikerChip("Пока никто не лайкнул"));
      } else {
        statsLikers.replaceChildren(
          ...targetCard.likes.map((user) => createLikerChip(user.name))
        );
      }

      showModalLayer(statsLayer);
    })
    .catch(onApiError);
};

const onHeartClick = ({ cardId, isAlreadyLiked, heartButton, counterElement }) => {
  pushLikeToggle(cardId, isAlreadyLiked)
    .then((updatedCard) => {
      refreshLikeCounter(updatedCard, heartButton, counterElement, sessionUserId);
    })
    .catch(onApiError);
};

const onTrashClick = ({ cardId, cardElement }) => {
  pullCardRemoval(cardId)
    .then(() => {
      detachCardItem(cardElement);
    })
    .catch(onApiError);
};

const placeCardOnPage = (cardData, atTop = false) => {
  const cardElement = assembleCardItem(cardData, sessionUserId, {
    onImageClick: openZoomLayer,
    onHeartClick,
    onTrashClick,
    onStatsClick: openStatsLayer,
  });

  if (atTop) {
    listContainer.prepend(cardElement);
    return;
  }

  listContainer.append(cardElement);
};

const runPendingSubmit = (submitElement, pendingText, requestPromise) => {
  markSubmitPending(submitElement, true, pendingText);
  return requestPromise.catch(onApiError).finally(() => {
    markSubmitPending(submitElement, false);
  });
};

editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitElement = event.submitter;
  runPendingSubmit(
    submitElement,
    "Сохранение...",
    pushProfileUpdate({
      name: nameField.value,
      about: aboutField.value,
    }).then((profileData) => {
      fillHeaderProfile(profileData);
      hideModalLayer(editLayer);
    })
  );
});

avatarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitElement = event.submitter;
  runPendingSubmit(
    submitElement,
    "Сохранение...",
    pushAvatarUpdate({ avatar: avatarField.value }).then((profileData) => {
      fillHeaderProfile(profileData);
      hideModalLayer(avatarLayer);
    })
  );
});

createForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const submitElement = event.submitter;
  runPendingSubmit(
    submitElement,
    "Создание...",
    pushNewCard({
      name: titleField.value,
      link: urlField.value,
    }).then((cardData) => {
      placeCardOnPage(cardData, true);
      hideModalLayer(createLayer);
    })
  );
});

editTrigger.addEventListener("click", () => {
  nameField.value = titleDisplay.textContent;
  aboutField.value = aboutDisplay.textContent;
  clearValidation(editForm, validationConfig);
  showModalLayer(editLayer);
});

avatarDisplay.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  showModalLayer(avatarLayer);
});

createTrigger.addEventListener("click", () => {
  createForm.reset();
  clearValidation(createForm, validationConfig);
  showModalLayer(createLayer);
});

modalLayers.forEach((layer) => {
  initModalDismissal(layer);
});

enableValidation(validationConfig);

Promise.all([pullCardCollection(), pullUserProfile()])
  .then(([cards, profileData]) => {
    fillHeaderProfile(profileData);
    cards.forEach((cardData) => {
      placeCardOnPage(cardData);
    });
  })
  .catch(onApiError);
