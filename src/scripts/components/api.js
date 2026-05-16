const GROUP_ID = "";
const TOKEN = "";

const apiConfig = {
  baseUrl: `https://mesto.nomoreparties.co/v1/${GROUP_ID}`,
  headers: {
    authorization: TOKEN,
    "Content-Type": "application/json",
  },
};

const parseResponse = (response) => {
  if (response.ok) {
    return response.json();
  }
  return Promise.reject(`Ошибка: ${response.status}`);
};

const callApi = (endpoint, requestInit = {}) =>
  fetch(`${apiConfig.baseUrl}${endpoint}`, {
    headers: apiConfig.headers,
    ...requestInit,
  }).then(parseResponse);

export const requestUserInfo = () => callApi("/users/me");

export const requestCardsData = () => callApi("/cards");

export const updateUserInfo = ({ name, about }) =>
  callApi("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const updateUserAvatar = ({ avatar }) =>
  callApi("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const submitNewCard = ({ name, link }) =>
  callApi("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const requestDeleteCard = (cardId) =>
  callApi(`/cards/${cardId}`, { method: "DELETE" });

export const requestLikeToggle = (cardId, likedByMe) =>
  callApi(`/cards/likes/${cardId}`, {
    method: likedByMe ? "DELETE" : "PUT",
  });
