const GROUP_ID = "";
const TOKEN = "";

const buildUrl = (resource) => `https://mesto.nomoreparties.co/v1/${GROUP_ID}${resource}`;

const sharedHeaders = () => ({
  authorization: TOKEN,
  "Content-Type": "application/json",
});

const resolveBody = (response) =>
  response.ok ? response.json() : Promise.reject(`Ошибка: ${response.status}`);

const mestoFetch = (resource, init = {}) =>
  fetch(buildUrl(resource), {
    headers: sharedHeaders(),
    ...init,
  }).then(resolveBody);

export const readProfile = () => mestoFetch("/users/me");

export const readGallery = () => mestoFetch("/cards");

export const writeProfile = ({ name, about }) =>
  mestoFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const writeAvatarImage = ({ avatar }) =>
  mestoFetch("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const createGalleryItem = ({ name, link }) =>
  mestoFetch("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const removeGalleryItem = (itemId) =>
  mestoFetch(`/cards/${itemId}`, { method: "DELETE" });

export const switchLikeState = (itemId, userHasLike) =>
  mestoFetch(`/cards/likes/${itemId}`, {
    method: userHasLike ? "DELETE" : "PUT",
  });
