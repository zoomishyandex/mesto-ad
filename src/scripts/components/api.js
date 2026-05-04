const GROUP_ID = "";
const TOKEN = "";

const cohortBase = () => `https://mesto.nomoreparties.co/v1/${GROUP_ID}`;

const readJsonOrThrow = (res) =>
  res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);

const send = (path, options = {}) => {
  const { headers: extraHeaders, ...rest } = options;
  return fetch(`${cohortBase()}${path}`, {
    headers: {
      authorization: TOKEN,
      "Content-Type": "application/json",
      ...(extraHeaders || {}),
    },
    ...rest,
  }).then(readJsonOrThrow);
};

export const loadMe = () => send("/users/me");

export const loadCards = () => send("/cards");

export const saveProfile = ({ name, about }) =>
  send("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const saveAvatar = ({ avatar }) =>
  send("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const createPlace = ({ name, link }) =>
  send("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const erasePlace = (id) => send(`/cards/${id}`, { method: "DELETE" });

export const flipLike = (id, removeLike) =>
  send(`/cards/likes/${id}`, {
    method: removeLike ? "DELETE" : "PUT",
  });
