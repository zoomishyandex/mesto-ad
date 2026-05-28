const GROUP_ID = "";
const TOKEN = "";

const API_BASE = `https://mesto.nomoreparties.co/v1/${GROUP_ID}`;

const defaultHeaders = {
  authorization: TOKEN,
  "Content-Type": "application/json",
};

const jsonFromResponse = (response) => {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка: ${response.status}`);
};

const doFetch = (path, options = {}) =>
  fetch(`${API_BASE}${path}`, {
    headers: defaultHeaders,
    ...options,
  }).then(jsonFromResponse);

export const readProfile = () => doFetch("/users/me");

export const readAllPlaces = () => doFetch("/cards");

export const patchProfileData = ({ name, about }) =>
  doFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const patchProfilePhoto = ({ avatar }) =>
  doFetch("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const addPlace = ({ name, link }) =>
  doFetch("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const removePlace = (placeId) =>
  doFetch(`/cards/${placeId}`, { method: "DELETE" });

export const flipPlaceLike = (placeId, alreadyLiked) =>
  doFetch(`/cards/likes/${placeId}`, {
    method: alreadyLiked ? "DELETE" : "PUT",
  });
