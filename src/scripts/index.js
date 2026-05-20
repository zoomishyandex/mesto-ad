import {
  renderGalleryItem,
  dropGalleryItem,
  updateLikesUi,
} from "./components/card.js";
import { showWindow, hideWindow, initWindowClosing } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";
import {
  readProfile,
  readGallery,
  writeProfile,
  writeAvatarImage,
  createGalleryItem,
  removeGalleryItem,
  switchLikeState,
} from "./components/api.js";

const galleryContainer = document.querySelector(".places__list");

const userWindow = document.querySelector(".popup_type_edit");
const userForm = userWindow.querySelector(".popup__form");
const userNameField = userForm.querySelector(".popup__input_type_name");
const userAboutField = userForm.querySelector(".popup__input_type_description");

const galleryItemWindow = document.querySelector(".popup_type_new-card");
const galleryItemForm = galleryItemWindow.querySelector(".popup__form");
const galleryItemNameField = galleryItemForm.querySelector(".popup__input_type_card-name");
const galleryItemLinkField = galleryItemForm.querySelector(".popup__input_type_url");

const fullscreenWindow = document.querySelector(".popup_type_image");
const fullscreenImage = fullscreenWindow.querySelector(".popup__image");
const fullscreenCaption = fullscreenWindow.querySelector(".popup__caption");

const userEditTrigger = document.querySelector(".profile__edit-button");
const galleryAddTrigger = document.querySelector(".profile__add-button");

const headerName = document.querySelector(".profile__title");
const headerAbout = document.querySelector(".profile__description");
const headerAvatar = document.querySelector(".profile__image");

const formRules = {
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

const avatarWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarWindow.querySelector(".popup__form");
const avatarLinkField = avatarForm.querySelector(".popup__input_type_avatar");

const statisticsWindow = document.querySelector(".popup_type_info");
const statisticsDefinitions = statisticsWindow.querySelector(".popup__list_type_definitions");
const statisticsUsers = statisticsWindow.querySelector(".popup__list_type_users");
const statisticsDefinitionTemplate = document.querySelector(
  "#popup-info-definition-template"
).content;
const statisticsUserTemplate = document.querySelector("#popup-info-user-preview-template")
  .content;

const windowCollection = document.querySelectorAll(".popup");

let loggedInUserId = "";

const handleRequestFailure = () => {};

const formatLocaleDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const saveButtonCaption = (button) => {
  if (!button.dataset.storedCaption) {
    button.dataset.storedCaption = button.textContent;
  }
};

const setButtonLoading = (button, loading, loadingCaption) => {
  saveButtonCaption(button);
  button.textContent = loading ? loadingCaption : button.dataset.storedCaption;
};

const displayProfile = (profile) => {
  headerName.textContent = profile.name;
  headerAbout.textContent = profile.about;
  headerAvatar.style.backgroundImage = `url(${profile.avatar})`;
  loggedInUserId = profile._id;
};

const openFullscreen = (item) => {
  fullscreenImage.src = item.link;
  fullscreenImage.alt = item.name;
  fullscreenCaption.textContent = item.name;
  showWindow(fullscreenWindow);
};

const createDefinitionLine = (title, value) => {
  const line = statisticsDefinitionTemplate.querySelector(".popup__list-item").cloneNode(true);
  line.querySelector(".popup__info-term").textContent = title;
  line.querySelector(".popup__info-item").textContent = value;
  return line;
};

const createUserMark = (name) => {
  const mark = statisticsUserTemplate
    .querySelector(".popup__list-item_type_badge")
    .cloneNode(true);
  mark.textContent = name;
  return mark;
};

const openStatistics = (itemId) => {
  readGallery()
    .then((items) => {
      const target = items.find((item) => item._id === itemId);
      if (!target) {
        return;
      }

      statisticsDefinitions.replaceChildren(
        createDefinitionLine("Описание:", target.name),
        createDefinitionLine("Дата создания:", formatLocaleDate(new Date(target.createdAt))),
        createDefinitionLine("Владелец:", target.owner.name),
        createDefinitionLine("Количество лайков:", String(target.likes.length))
      );

      if (target.likes.length === 0) {
        statisticsUsers.replaceChildren(createUserMark("Пока никто не лайкнул"));
      } else {
        statisticsUsers.replaceChildren(
          ...target.likes.map((member) => createUserMark(member.name))
        );
      }

      showWindow(statisticsWindow);
    })
    .catch(handleRequestFailure);
};

const onGalleryLike = ({ itemId, userHasLike, likeButton, likesNumber }) => {
  switchLikeState(itemId, userHasLike)
    .then((updatedItem) => {
      updateLikesUi(updatedItem, likeButton, likesNumber, loggedInUserId);
    })
    .catch(handleRequestFailure);
};

const onGalleryRemove = ({ itemId, itemElement }) => {
  removeGalleryItem(itemId)
    .then(() => {
      dropGalleryItem(itemElement);
    })
    .catch(handleRequestFailure);
};

const pushGalleryItem = (item, toStart = false) => {
  const itemElement = renderGalleryItem(item, loggedInUserId, {
    showFullscreen: openFullscreen,
    toggleLike: onGalleryLike,
    removeItem: onGalleryRemove,
    openStatistics,
  });

  if (toStart) {
    galleryContainer.prepend(itemElement);
    return;
  }

  galleryContainer.append(itemElement);
};

const submitWithLoading = (button, loadingCaption, task) => {
  setButtonLoading(button, true, loadingCaption);
  return task()
    .catch(handleRequestFailure)
    .finally(() => {
      setButtonLoading(button, false);
    });
};

userForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  submitWithLoading(button, "Сохранение...", () =>
    writeProfile({
      name: userNameField.value,
      about: userAboutField.value,
    }).then((profile) => {
      displayProfile(profile);
      hideWindow(userWindow);
    })
  );
});

avatarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  submitWithLoading(button, "Сохранение...", () =>
    writeAvatarImage({ avatar: avatarLinkField.value }).then((profile) => {
      displayProfile(profile);
      hideWindow(avatarWindow);
    })
  );
});

galleryItemForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = event.submitter;
  submitWithLoading(button, "Создание...", () =>
    createGalleryItem({
      name: galleryItemNameField.value,
      link: galleryItemLinkField.value,
    }).then((item) => {
      pushGalleryItem(item, true);
      hideWindow(galleryItemWindow);
    })
  );
});

userEditTrigger.addEventListener("click", () => {
  userNameField.value = headerName.textContent;
  userAboutField.value = headerAbout.textContent;
  clearValidation(userForm, formRules);
  showWindow(userWindow);
});

headerAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, formRules);
  showWindow(avatarWindow);
});

galleryAddTrigger.addEventListener("click", () => {
  galleryItemForm.reset();
  clearValidation(galleryItemForm, formRules);
  showWindow(galleryItemWindow);
});

windowCollection.forEach((windowElement) => {
  initWindowClosing(windowElement);
});

enableValidation(formRules);

Promise.all([readGallery(), readProfile()])
  .then(([items, profile]) => {
    displayProfile(profile);
    items.forEach((item) => {
      pushGalleryItem(item);
    });
  })
  .catch(handleRequestFailure);
