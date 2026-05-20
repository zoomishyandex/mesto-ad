const GROUP_ID = "";
const TOKEN = "";

const getApiUrl = (path) => `https://mesto.nomoreparties.co/v1/${GROUP_ID}${path}`;

const getRequestHeaders = () => ({
  authorization: TOKEN,
  "Content-Type": "application/json",
});

const handleFetchResult = (response) =>
  response.ok ? response.json() : Promise.reject(`Ошибка: ${response.status}`);

const request = (path, options = {}) =>
  fetch(getApiUrl(path), {
    headers: getRequestHeaders(),
    ...options,
  }).then(handleFetchResult);

export const getOwnerProfile = () => request("/users/me");

export const getPlacesList = () => request("/cards");

export const patchOwnerProfile = ({ name, about }) =>
  request("/users/me", {
    method: "PATCH",
    body: JSON.stringify({ name, about }),
  });

export const patchOwnerPhoto = ({ avatar }) =>
  request("/users/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });

export const postNewPlace = ({ name, link }) =>
  request("/cards", {
    method: "POST",
    body: JSON.stringify({ name, link }),
  });

export const deletePlace = (placeId) =>
  request(`/cards/${placeId}`, { method: "DELETE" });

export const togglePlaceLike = (placeId, userAlreadyLiked) =>
  request(`/cards/likes/${placeId}`, {
    method: userAlreadyLiked ? "DELETE" : "PUT",
  });
