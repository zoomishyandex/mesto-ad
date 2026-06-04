function showInputError(formEl, inputEl, message, config) {
  const errorEl = formEl.querySelector(`#${inputEl.id}-error`);
  errorEl.textContent = message;
  errorEl.classList.add(config.errorClass);
  inputEl.classList.add(config.inputErrorClass);
}

function hideInputError(formEl, inputEl, config) {
  const errorEl = formEl.querySelector(`#${inputEl.id}-error`);
  errorEl.textContent = "";
  errorEl.classList.remove(config.errorClass);
  inputEl.classList.remove(config.inputErrorClass);
}

function validateInput(formEl, inputEl, config) {
  if (inputEl.validity.patternMismatch && inputEl.dataset.errorMessage) {
    inputEl.setCustomValidity(inputEl.dataset.errorMessage);
  } else {
    inputEl.setCustomValidity("");
  }

  if (!inputEl.validity.valid) {
    showInputError(formEl, inputEl, inputEl.validationMessage, config);
    return;
  }

  hideInputError(formEl, inputEl, config);
}

function isFormInvalid(formEl, config) {
  const inputs = Array.from(formEl.querySelectorAll(config.inputSelector));
  return inputs.some((inputEl) => !inputEl.validity.valid);
}

function disableSubmit(formEl, config) {
  const submitEl = formEl.querySelector(config.submitButtonSelector);
  submitEl.disabled = true;
  submitEl.classList.add(config.inactiveButtonClass);
}

function enableSubmit(formEl, config) {
  const submitEl = formEl.querySelector(config.submitButtonSelector);
  submitEl.disabled = false;
  submitEl.classList.remove(config.inactiveButtonClass);
}

function toggleSubmitAvailability(formEl, config) {
  if (isFormInvalid(formEl, config)) {
    disableSubmit(formEl, config);
  } else {
    enableSubmit(formEl, config);
  }
}

function bindInputListeners(formEl, config) {
  const inputs = formEl.querySelectorAll(config.inputSelector);
  inputs.forEach((inputEl) => {
    inputEl.addEventListener("input", () => {
      validateInput(formEl, inputEl, config);
      toggleSubmitAvailability(formEl, config);
    });
  });
}

export function clearValidation(formEl, config) {
  const inputs = formEl.querySelectorAll(config.inputSelector);
  inputs.forEach((inputEl) => {
    inputEl.setCustomValidity("");
    hideInputError(formEl, inputEl, config);
  });
  disableSubmit(formEl, config);
}

export function enableValidation(config) {
  const forms = document.querySelectorAll(config.formSelector);
  forms.forEach((formEl) => {
    bindInputListeners(formEl, config);
    toggleSubmitAvailability(formEl, config);
  });
}
