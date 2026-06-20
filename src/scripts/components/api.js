const GROUP_ID = "";
const TOKEN = "";

const mestoConfig = {
  baseUrl: `https://mesto.nomoreparties.co/v1/${GROUP_ID}`,
  headers: {
    authorization: TOKEN,
    "Content-Type": "application/json",
  },
};

const handleResponse = (response) =>
  response.ok ? response.json() : Promise.reject(`Ошибка: ${response.status}`);

const apiCall = (endpoint, init = {}) =>
  fetch(`${mestoConfig.baseUrl}${endpoint}`, {
    headers: mestoConfig.headers,
    ...init,
  }).then(handleResponse);

export const pullUserProfile = () => apiCall("/users/me");

export const pullCardCollection = () => apiCall("/cards");

export const pushProfileUpdate = ({ name, about }) =>
  apiCall("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const pushAvatarUpdate = ({ avatar }) =>
  apiCall("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const pushNewCard = ({ name, link }) =>
  apiCall("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const pullCardRemoval = (cardId) =>
  apiCall(`/cards/${cardId}`, { method: "DELETE" });

export const pushLikeToggle = (cardId, isAlreadyLiked) =>
  apiCall(`/cards/likes/${cardId}`, {
    method: isAlreadyLiked ? "DELETE" : "PUT",
  });
