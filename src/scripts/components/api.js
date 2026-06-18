const GROUP_ID = "";
const TOKEN = "";

const cohortUrl = (path) => `https://mesto.nomoreparties.co/v1/${GROUP_ID}${path}`;

const authHeaders = {
  authorization: TOKEN,
  "Content-Type": "application/json",
};

const checkStatus = (res) =>
  res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);

const request = (path, options = {}) =>
  fetch(cohortUrl(path), {
    headers: authHeaders,
    ...options,
  }).then(checkStatus);

export const fetchMe = () => request("/users/me");

export const fetchCards = () => request("/cards");

export const updateMe = ({ name, about }) =>
  request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const updateAvatar = ({ avatar }) =>
  request("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const sendCard = ({ name, link }) =>
  request("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const removeCard = (cardId) =>
  request(`/cards/${cardId}`, { method: "DELETE" });

export const changeLikeStatus = (cardId, isLiked) =>
  request(`/cards/likes/${cardId}`, {
    method: isLiked ? "DELETE" : "PUT",
  });
