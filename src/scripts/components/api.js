const GROUP_ID = "";
const TOKEN = "";

const cohortSettings = {
  root: `https://mesto.nomoreparties.co/v1/${GROUP_ID}`,
  headers: {
    authorization: TOKEN,
    "Content-Type": "application/json",
  },
};

const unwrapJson = (res) =>
  res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);

const mestoRequest = (resource, init = {}) =>
  fetch(`${cohortSettings.root}${resource}`, {
    headers: cohortSettings.headers,
    ...init,
  }).then(unwrapJson);

export const getMeProfile = () => mestoRequest("/users/me");

export const fetchGallery = () => mestoRequest("/cards");

export const saveMeDetails = ({ name, about }) =>
  mestoRequest("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const saveMePicture = ({ avatar }) =>
  mestoRequest("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const publishCard = ({ name, link }) =>
  mestoRequest("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const eraseCardById = (cardId) =>
  mestoRequest(`/cards/${cardId}`, { method: "DELETE" });

export const toggleCardLike = (cardId, isLiked) =>
  mestoRequest(`/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
  });
