import { makeCardNode, removeCardNode, applyLikeUi } from "./components/card.js";
import { openPopup, closePopup, registerPopupListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  fetchMe,
  fetchCards,
  updateMe,
  updateAvatar,
  sendCard,
  removeCard,
  changeLikeStatus,
} from "./components/api.js";

const cardsGrid = document.querySelector(".places__list");

const profilePopup = document.querySelector(".popup_type_edit");
const profileForm = profilePopup.querySelector(".popup__form");
const profileNameInput = profileForm.querySelector(".popup__input_type_name");
const profileAboutInput = profileForm.querySelector(".popup__input_type_description");

const cardPopup = document.querySelector(".popup_type_new-card");
const cardForm = cardPopup.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imagePopup = document.querySelector(".popup_type_image");
const imagePreview = imagePopup.querySelector(".popup__image");
const imageCaption = imagePopup.querySelector(".popup__caption");

const editBtn = document.querySelector(".profile__edit-button");
const addBtn = document.querySelector(".profile__add-button");

const profileNameEl = document.querySelector(".profile__title");
const profileAboutEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__image");

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const avatarPopup = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarPopup.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input_type_avatar");

const infoPopup = document.querySelector(".popup_type_info");
const infoDefinitions = infoPopup.querySelector(".popup__list_type_definitions");
const infoLikers = infoPopup.querySelector(".popup__list_type_users");
const infoRowTemplate = document.querySelector("#popup-info-definition-template").content;
const likerTemplate = document.querySelector("#popup-info-user-preview-template").content;

const popupList = document.querySelectorAll(".popup");

let ownerId = "";

const onApiError = (error) => {
  console.log(error);
};

const formatRuDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const rememberButtonLabel = (btn) => {
  if (!btn.dataset.defaultLabel) {
    btn.dataset.defaultLabel = btn.textContent;
  }
};

const setButtonBusy = (btn, busy, busyLabel) => {
  rememberButtonLabel(btn);
  btn.textContent = busy ? busyLabel : btn.dataset.defaultLabel;
};

const paintProfile = (userData) => {
  profileNameEl.textContent = userData.name;
  profileAboutEl.textContent = userData.about;
  profileAvatarEl.style.backgroundImage = `url(${userData.avatar})`;
  ownerId = userData._id;
};

const showImagePopup = (cardData) => {
  imagePreview.src = cardData.link;
  imagePreview.alt = cardData.name;
  imageCaption.textContent = cardData.name;
  openPopup(imagePopup);
};

const buildInfoRow = (term, value) => {
  const row = infoRowTemplate.querySelector(".popup__list-item").cloneNode(true);
  row.querySelector(".popup__info-term").textContent = term;
  row.querySelector(".popup__info-item").textContent = value;
  return row;
};

const buildLikerBadge = (name) => {
  const badge = likerTemplate.querySelector(".popup__list-item_type_badge").cloneNode(true);
  badge.textContent = name;
  return badge;
};

const showCardInfo = (cardId) => {
  fetchCards()
    .then((cards) => {
      const card = cards.find((item) => item._id === cardId);
      if (!card) {
        return;
      }

      infoDefinitions.replaceChildren(
        buildInfoRow("Описание:", card.name),
        buildInfoRow("Дата создания:", formatRuDate(new Date(card.createdAt))),
        buildInfoRow("Владелец:", card.owner.name),
        buildInfoRow("Количество лайков:", String(card.likes.length))
      );

      if (card.likes.length === 0) {
        infoLikers.replaceChildren(buildLikerBadge("Пока никто не лайкнул"));
      } else {
        infoLikers.replaceChildren(
          ...card.likes.map((liker) => buildLikerBadge(liker.name))
        );
      }

      openPopup(infoPopup);
    })
    .catch(onApiError);
};

const handleLike = ({ cardId, isLiked, likeBtn, countEl }) => {
  changeLikeStatus(cardId, isLiked)
    .then((updatedCard) => {
      applyLikeUi(updatedCard, likeBtn, countEl, ownerId);
    })
    .catch(onApiError);
};

const handleDelete = ({ cardId, cardNode }) => {
  removeCard(cardId)
    .then(() => {
      removeCardNode(cardNode);
    })
    .catch(onApiError);
};

const insertCard = (cardData, prepend = false) => {
  const cardNode = makeCardNode(cardData, ownerId, {
    onPreview: showImagePopup,
    onLike: handleLike,
    onDelete: handleDelete,
    onInfo: showCardInfo,
  });

  if (prepend) {
    cardsGrid.prepend(cardNode);
    return;
  }

  cardsGrid.append(cardNode);
};

const withLoadingButton = (btn, loadingLabel, promise) => {
  setButtonBusy(btn, true, loadingLabel);
  return promise.catch(onApiError).finally(() => {
    setButtonBusy(btn, false);
  });
};

profileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const btn = evt.submitter;
  withLoadingButton(
    btn,
    "Сохранение...",
    updateMe({
      name: profileNameInput.value,
      about: profileAboutInput.value,
    }).then((userData) => {
      paintProfile(userData);
      closePopup(profilePopup);
    })
  );
});

avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const btn = evt.submitter;
  withLoadingButton(
    btn,
    "Сохранение...",
    updateAvatar({ avatar: avatarInput.value }).then((userData) => {
      paintProfile(userData);
      closePopup(avatarPopup);
    })
  );
});

cardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const btn = evt.submitter;
  withLoadingButton(
    btn,
    "Создание...",
    sendCard({
      name: cardNameInput.value,
      link: cardLinkInput.value,
    }).then((cardData) => {
      insertCard(cardData, true);
      closePopup(cardPopup);
    })
  );
});

editBtn.addEventListener("click", () => {
  profileNameInput.value = profileNameEl.textContent;
  profileAboutInput.value = profileAboutEl.textContent;
  clearValidation(profileForm, validationConfig);
  openPopup(profilePopup);
});

profileAvatarEl.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openPopup(avatarPopup);
});

addBtn.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openPopup(cardPopup);
});

popupList.forEach((popup) => {
  registerPopupListeners(popup);
});

enableValidation(validationConfig);

const startApp = () => {
  Promise.all([fetchCards(), fetchMe()])
    .then(([cards, userData]) => {
      paintProfile(userData);
      cards.forEach((cardData) => {
        insertCard(cardData);
      });
    })
    .catch(onApiError);
};

startApp();
