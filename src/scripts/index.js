import { buildCard, detachCardNode, applyLikeVisual } from "./components/card.js";
import { showPopup, hidePopup, attachPopupCloseHandlers } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  fetchProfile,
  fetchAllCards,
  patchProfile,
  patchAvatar,
  postCard,
  removeCardRemote,
  setCardLike,
} from "./components/api.js";

const cardsContainer = document.querySelector(".places__list");

const editPopup = document.querySelector(".popup_type_edit");
const editForm = editPopup.querySelector(".popup__form");
const nameField = editForm.querySelector(".popup__input_type_name");
const aboutField = editForm.querySelector(".popup__input_type_description");

const addPlacePopup = document.querySelector(".popup_type_new-card");
const addPlaceForm = addPlacePopup.querySelector(".popup__form");
const placeTitleField = addPlaceForm.querySelector(".popup__input_type_card-name");
const placeUrlField = addPlaceForm.querySelector(".popup__input_type_url");

const zoomPopup = document.querySelector(".popup_type_image");
const zoomImage = zoomPopup.querySelector(".popup__image");
const zoomCaption = zoomPopup.querySelector(".popup__caption");

const editProfileBtn = document.querySelector(".profile__edit-button");
const addPlaceBtn = document.querySelector(".profile__add-button");

const profileNameNode = document.querySelector(".profile__title");
const profileAboutNode = document.querySelector(".profile__description");
const profileAvatarNode = document.querySelector(".profile__image");

const formValidationCfg = {
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

const statsPopup = document.querySelector(".popup_type_info");
const statsRowsHost = statsPopup.querySelector(".popup__list_type_definitions");
const statsUsersHost = statsPopup.querySelector(".popup__list_type_users");
const statsRowTpl = document.querySelector("#popup-info-definition-template").content;
const statsUserTpl = document.querySelector("#popup-info-user-preview-template").content;

const popupNodes = document.querySelectorAll(".popup");

let activeUserId = "";

const ignoreFailedRequest = () => {};

const formatCardDate = (value) =>
  value.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const rememberButtonLabel = (btn) => {
  if (!btn.dataset.initialLabel) {
    btn.dataset.initialLabel = btn.textContent;
  }
};

const setButtonPending = (btn, pending, pendingLabel) => {
  rememberButtonLabel(btn);
  btn.textContent = pending ? pendingLabel : btn.dataset.initialLabel;
};

const paintProfile = (payload) => {
  profileNameNode.textContent = payload.name;
  profileAboutNode.textContent = payload.about;
  profileAvatarNode.style.backgroundImage = `url(${payload.avatar})`;
  activeUserId = payload._id;
};

const openImagePreview = ({ name, link }) => {
  zoomImage.src = link;
  zoomImage.alt = name;
  zoomCaption.textContent = name;
  showPopup(zoomPopup);
};

const makeStatsRow = (label, value) => {
  const row = statsRowTpl.querySelector(".popup__list-item").cloneNode(true);
  row.querySelector(".popup__info-term").textContent = label;
  row.querySelector(".popup__info-item").textContent = value;
  return row;
};

const makeUserChip = (label) => {
  const chip = statsUserTpl.querySelector(".popup__list-item_type_badge").cloneNode(true);
  chip.textContent = label;
  return chip;
};

const openCardStats = (cardId) => {
  fetchAllCards()
    .then((list) => {
      const item = list.find((entry) => entry._id === cardId);
      if (!item) {
        return;
      }

      statsRowsHost.replaceChildren(
        makeStatsRow("Описание:", item.name),
        makeStatsRow("Дата создания:", formatCardDate(new Date(item.createdAt))),
        makeStatsRow("Владелец:", item.owner.name),
        makeStatsRow("Количество лайков:", String(item.likes.length))
      );

      if (item.likes.length === 0) {
        statsUsersHost.replaceChildren(makeUserChip("Пока никто не лайкнул"));
      } else {
        statsUsersHost.replaceChildren(
          ...item.likes.map((person) => makeUserChip(person.name))
        );
      }

      showPopup(statsPopup);
    })
    .catch(ignoreFailedRequest);
};

const onLikePress = ({ cardId, alreadyLiked, likeBtn, counterNode }) => {
  setCardLike(cardId, alreadyLiked)
    .then((fresh) => {
      applyLikeVisual(fresh, likeBtn, counterNode);
    })
    .catch(ignoreFailedRequest);
};

const onTrashPress = ({ cardId, root }) => {
  removeCardRemote(cardId)
    .then(() => {
      detachCardNode(root);
    })
    .catch(ignoreFailedRequest);
};

const mountCard = (payload, prepend = false) => {
  const node = buildCard(payload, activeUserId, {
    handleImageClick: openImagePreview,
    handleLike: onLikePress,
    handleRemove: onTrashPress,
    handleInfo: openCardStats,
  });
  if (prepend) {
    cardsContainer.prepend(node);
    return;
  }
  cardsContainer.append(node);
};

const submitEditProfile = (event) => {
  event.preventDefault();
  const btn = event.submitter;
  setButtonPending(btn, true, "Сохранение...");
  patchProfile({ name: nameField.value, about: aboutField.value })
    .then((payload) => {
      paintProfile(payload);
      hidePopup(editPopup);
    })
    .catch(ignoreFailedRequest)
    .finally(() => {
      setButtonPending(btn, false);
    });
};

const submitNewAvatar = (event) => {
  event.preventDefault();
  const btn = event.submitter;
  setButtonPending(btn, true, "Сохранение...");
  patchAvatar({ avatar: avatarUrlField.value })
    .then((payload) => {
      paintProfile(payload);
      hidePopup(avatarPopup);
    })
    .catch(ignoreFailedRequest)
    .finally(() => {
      setButtonPending(btn, false);
    });
};

const submitNewPlace = (event) => {
  event.preventDefault();
  const btn = event.submitter;
  setButtonPending(btn, true, "Создание...");
  postCard({ name: placeTitleField.value, link: placeUrlField.value })
    .then((payload) => {
      mountCard(payload, true);
      hidePopup(addPlacePopup);
      addPlaceForm.reset();
    })
    .catch(ignoreFailedRequest)
    .finally(() => {
      setButtonPending(btn, false);
    });
};

editForm.addEventListener("submit", submitEditProfile);
addPlaceForm.addEventListener("submit", submitNewPlace);
avatarForm.addEventListener("submit", submitNewAvatar);

editProfileBtn.addEventListener("click", () => {
  nameField.value = profileNameNode.textContent;
  aboutField.value = profileAboutNode.textContent;
  clearValidation(editForm, formValidationCfg);
  showPopup(editPopup);
});

profileAvatarNode.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, formValidationCfg);
  showPopup(avatarPopup);
});

addPlaceBtn.addEventListener("click", () => {
  addPlaceForm.reset();
  clearValidation(addPlaceForm, formValidationCfg);
  showPopup(addPlacePopup);
});

popupNodes.forEach((node) => {
  attachPopupCloseHandlers(node);
});

enableValidation(formValidationCfg);

const loadInitialData = async () => {
  try {
    const [cards, profile] = await Promise.all([fetchAllCards(), fetchProfile()]);
    paintProfile(profile);
    cards.forEach((item) => {
      mountCard(item);
    });
  } catch {
    ignoreFailedRequest();
  }
};

loadInitialData();
