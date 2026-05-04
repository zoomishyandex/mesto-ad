import { assemblePlaceCard, erasePlaceNode, syncHeartUi } from "./components/card.js";
import { openLayer, closeLayer, bindLayerDismiss } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  loadMe,
  loadCards,
  saveProfile,
  saveAvatar,
  createPlace,
  erasePlace,
  flipLike,
} from "./components/api.js";

const listRoot = document.querySelector(".places__list");

const userPopup = document.querySelector(".popup_type_edit");
const userForm = userPopup.querySelector(".popup__form");
const userName = userForm.querySelector(".popup__input_type_name");
const userJob = userForm.querySelector(".popup__input_type_description");

const placePopup = document.querySelector(".popup_type_new-card");
const placeForm = placePopup.querySelector(".popup__form");
const placeName = placeForm.querySelector(".popup__input_type_card-name");
const placeUrl = placeForm.querySelector(".popup__input_type_url");

const picPopup = document.querySelector(".popup_type_image");
const picNode = picPopup.querySelector(".popup__image");
const picText = picPopup.querySelector(".popup__caption");

const btnEdit = document.querySelector(".profile__edit-button");
const btnAdd = document.querySelector(".profile__add-button");

const textName = document.querySelector(".profile__title");
const textJob = document.querySelector(".profile__description");
const blockAvatar = document.querySelector(".profile__image");

const rules = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

const facePopup = document.querySelector(".popup_type_edit-avatar");
const faceForm = facePopup.querySelector(".popup__form");
const faceUrl = faceForm.querySelector(".popup__input_type_avatar");

const factPopup = document.querySelector(".popup_type_info");
const factDl = factPopup.querySelector(".popup__list_type_definitions");
const factUl = factPopup.querySelector(".popup__list_type_users");
const factDlTpl = document.querySelector("#popup-info-definition-template").content;
const factLiTpl = document.querySelector("#popup-info-user-preview-template").content;

const layers = document.querySelectorAll(".popup");

let selfId = "";

const swallow = () => {};

const ruLongDate = (d) =>
  d.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const stashDefaultCaption = (b) => {
  if (!b.dataset.caption) {
    b.dataset.caption = b.textContent;
  }
};

const pulseButton = (b, busy, busyText) => {
  stashDefaultCaption(b);
  b.textContent = busy ? busyText : b.dataset.caption;
};

const fillHeader = (me) => {
  textName.textContent = me.name;
  textJob.textContent = me.about;
  blockAvatar.style.backgroundImage = `url(${me.avatar})`;
  selfId = me._id;
};

const showZoom = ({ name, link }) => {
  picNode.src = link;
  picNode.alt = name;
  picText.textContent = name;
  openLayer(picPopup);
};

const row = (k, v) => {
  const n = factDlTpl.querySelector(".popup__list-item").cloneNode(true);
  n.querySelector(".popup__info-term").textContent = k;
  n.querySelector(".popup__info-item").textContent = v;
  return n;
};

const chip = (s) => {
  const n = factLiTpl.querySelector(".popup__list-item_type_badge").cloneNode(true);
  n.textContent = s;
  return n;
};

const showFacts = (id) => {
  loadCards()
    .then((arr) => {
      const one = arr.find((x) => x._id === id);
      if (!one) {
        return;
      }

      factDl.replaceChildren(
        row("Описание:", one.name),
        row("Дата создания:", ruLongDate(new Date(one.createdAt))),
        row("Владелец:", one.owner.name),
        row("Количество лайков:", String(one.likes.length))
      );

      if (one.likes.length === 0) {
        factUl.replaceChildren(chip("Пока никто не лайкнул"));
      } else {
        factUl.replaceChildren(...one.likes.map((u) => chip(u.name)));
      }

      openLayer(factPopup);
    })
    .catch(swallow);
};

const onHeart = ({ cardId, removeLike, heart, counter }) => {
  flipLike(cardId, removeLike)
    .then((next) => {
      syncHeartUi(next, heart, counter);
    })
    .catch(swallow);
};

const onBin = ({ cardId, el }) => {
  erasePlace(cardId)
    .then(() => {
      erasePlaceNode(el);
    })
    .catch(swallow);
};

const placeOne = (model, head = false) => {
  const el = assemblePlaceCard(model, selfId, {
    zoomPhoto: showZoom,
    toggleHeart: onHeart,
    erasePlace: onBin,
    openFacts: showFacts,
  });
  if (head) {
    listRoot.prepend(el);
    return;
  }
  listRoot.append(el);
};

userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const b = e.submitter;
  pulseButton(b, true, "Сохранение...");
  saveProfile({ name: userName.value, about: userJob.value })
    .then((me) => {
      fillHeader(me);
      closeLayer(userPopup);
    })
    .catch(swallow)
    .finally(() => {
      pulseButton(b, false);
    });
});

faceForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const b = e.submitter;
  pulseButton(b, true, "Сохранение...");
  saveAvatar({ avatar: faceUrl.value })
    .then((me) => {
      fillHeader(me);
      closeLayer(facePopup);
    })
    .catch(swallow)
    .finally(() => {
      pulseButton(b, false);
    });
});

placeForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const b = e.submitter;
  pulseButton(b, true, "Создание...");
  createPlace({ name: placeName.value, link: placeUrl.value })
    .then((model) => {
      placeOne(model, true);
      closeLayer(placePopup);
      placeForm.reset();
    })
    .catch(swallow)
    .finally(() => {
      pulseButton(b, false);
    });
});

btnEdit.addEventListener("click", () => {
  userName.value = textName.textContent;
  userJob.value = textJob.textContent;
  clearValidation(userForm, rules);
  openLayer(userPopup);
});

blockAvatar.addEventListener("click", () => {
  faceForm.reset();
  clearValidation(faceForm, rules);
  openLayer(facePopup);
});

btnAdd.addEventListener("click", () => {
  placeForm.reset();
  clearValidation(placeForm, rules);
  openLayer(placePopup);
});

layers.forEach((layer) => {
  bindLayerDismiss(layer);
});

enableValidation(rules);

Promise.all([loadCards(), loadMe()])
  .then(([arr, me]) => {
    fillHeader(me);
    arr.forEach((model) => {
      placeOne(model);
    });
  })
  .catch(swallow);
