const takeCardShell = () =>
  document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);

export const syncHeartUi = (model, heart, counter) => {
  const selfId = heart.dataset.selfId;
  const active = model.likes.some((u) => u._id === selfId);
  heart.classList.toggle("card__like-button_is-active", active);
  counter.textContent = String(model.likes.length);
};

export const erasePlaceNode = (el) => {
  el.remove();
};

export const assemblePlaceCard = (
  model,
  selfId,
  { zoomPhoto, toggleHeart, erasePlace, openFacts }
) => {
  const el = takeCardShell();
  const heart = el.querySelector(".card__like-button");
  const counter = el.querySelector(".card__like-count");
  const bin = el.querySelector(".card__control-button_type_delete");
  const facts = el.querySelector(".card__control-button_type_info");
  const pic = el.querySelector(".card__image");

  pic.src = model.link;
  pic.alt = model.name;
  el.querySelector(".card__title").textContent = model.name;
  heart.dataset.selfId = selfId;
  syncHeartUi(model, heart, counter);

  const owner = model.owner._id === selfId;
  if (!owner) {
    bin.remove();
  }

  heart.addEventListener("click", () =>
    toggleHeart({
      cardId: model._id,
      removeLike: heart.classList.contains("card__like-button_is-active"),
      heart,
      counter,
    })
  );

  if (owner) {
    bin.addEventListener("click", () =>
      erasePlace({ cardId: model._id, el })
    );
  }

  facts.addEventListener("click", () => openFacts(model._id));
  pic.addEventListener("click", () => zoomPhoto(model));

  return el;
};
