const serverConfig = {
  root: "https://mesto.nomoreparties.co/v1/GROUP_ID",
  headers: {
    authorization: "TOKEN",
    "Content-Type": "application/json",
  },
};

const ensureOk = (response) =>
  response.ok ? response.json() : Promise.reject(`Ошибка: ${response.status}`);

const apiRequest = (path, init = {}) =>
  fetch(`${serverConfig.root}${path}`, {
    headers: serverConfig.headers,
    ...init,
  }).then(ensureOk);

export const fetchProfile = () => apiRequest("/users/me");

export const fetchAllCards = () => apiRequest("/cards");

export const patchProfile = ({ name, about }) =>
  apiRequest("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const patchAvatar = ({ avatar }) =>
  apiRequest("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const postCard = ({ name, link }) =>
  apiRequest("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const removeCardRemote = (cardId) =>
  apiRequest(`/cards/${cardId}`, { method: "DELETE" });

export const setCardLike = (cardId, alreadyLiked) =>
  apiRequest(`/cards/likes/${cardId}`, {
    method: alreadyLiked ? "DELETE" : "PUT",
  });
