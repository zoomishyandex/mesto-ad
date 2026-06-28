const GROUP_ID = "";
const TOKEN = "";

const serverSettings = {
  root: `https://mesto.nomoreparties.co/v1/${GROUP_ID}`,
  headers: {
    authorization: TOKEN,
    "Content-Type": "application/json",
  },
};

const parseJson = (res) =>
  res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);

const sendRequest = (resource, init = {}) =>
  fetch(`${serverSettings.root}${resource}`, {
    headers: serverSettings.headers,
    ...init,
  }).then(parseJson);

export const loadAccount = () => sendRequest("/users/me");

export const loadSpots = () => sendRequest("/cards");

export const saveAccount = ({ name, about }) =>
  sendRequest("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const saveAccountPhoto = ({ avatar }) =>
  sendRequest("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const createSpot = ({ name, link }) =>
  sendRequest("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const deleteSpot = (spotId) =>
  sendRequest(`/cards/${spotId}`, { method: "DELETE" });

export const toggleSpotLike = (spotId, likedAlready) =>
  sendRequest(`/cards/likes/${spotId}`, {
    method: likedAlready ? "DELETE" : "PUT",
  });
