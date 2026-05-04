const paintFieldError = (form, field, message, cfg) => {
  const hint = form.querySelector(`#${field.id}-error`);
  hint.textContent = message;
  hint.classList.add(cfg.errorClass);
  field.classList.add(cfg.inputErrorClass);
};

const clearFieldError = (form, field, cfg) => {
  const hint = form.querySelector(`#${field.id}-error`);
  hint.textContent = "";
  hint.classList.remove(cfg.errorClass);
  field.classList.remove(cfg.inputErrorClass);
};

const validateField = (form, field, cfg) => {
  if (field.validity.patternMismatch && field.dataset.errorMessage) {
    field.setCustomValidity(field.dataset.errorMessage);
  } else {
    field.setCustomValidity("");
  }

  if (!field.validity.valid) {
    paintFieldError(form, field, field.validationMessage, cfg);
    return;
  }

  clearFieldError(form, field, cfg);
};

const formHasInvalidField = (form, cfg) => {
  const fields = form.querySelectorAll(cfg.inputSelector);
  return [...fields].some((field) => !field.validity.valid);
};

const lockSubmit = (form, cfg) => {
  const btn = form.querySelector(cfg.submitButtonSelector);
  btn.disabled = true;
  btn.classList.add(cfg.inactiveButtonClass);
};

const unlockSubmit = (form, cfg) => {
  const btn = form.querySelector(cfg.submitButtonSelector);
  btn.disabled = false;
  btn.classList.remove(cfg.inactiveButtonClass);
};

const refreshSubmitLock = (form, cfg) => {
  if (formHasInvalidField(form, cfg)) {
    lockSubmit(form, cfg);
  } else {
    unlockSubmit(form, cfg);
  }
};

const wireFieldInputs = (form, cfg) => {
  const fields = form.querySelectorAll(cfg.inputSelector);
  fields.forEach((field) => {
    field.addEventListener("input", () => {
      validateField(form, field, cfg);
      refreshSubmitLock(form, cfg);
    });
  });
};

const clearValidation = (form, cfg) => {
  const fields = form.querySelectorAll(cfg.inputSelector);
  fields.forEach((field) => {
    field.setCustomValidity("");
    clearFieldError(form, field, cfg);
  });
  lockSubmit(form, cfg);
};

const enableValidation = (cfg) => {
  const forms = document.querySelectorAll(cfg.formSelector);
  forms.forEach((form) => {
    wireFieldInputs(form, cfg);
    refreshSubmitLock(form, cfg);
  });
};

export { enableValidation, clearValidation };
