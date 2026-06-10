const showInputError = (form, input, message, settings) => {
  const errorElement = form.querySelector(`#${input.id}-error`);
  errorElement.textContent = message;
  errorElement.classList.add(settings.errorClass);
  input.classList.add(settings.inputErrorClass);
};

const hideInputError = (form, input, settings) => {
  const errorElement = form.querySelector(`#${input.id}-error`);
  errorElement.textContent = "";
  errorElement.classList.remove(settings.errorClass);
  input.classList.remove(settings.inputErrorClass);
};

const checkInputValidity = (form, input, settings) => {
  if (input.validity.patternMismatch && input.dataset.errorMessage) {
    input.setCustomValidity(input.dataset.errorMessage);
  } else {
    input.setCustomValidity("");
  }

  if (!input.validity.valid) {
    showInputError(form, input, input.validationMessage, settings);
    return;
  }

  hideInputError(form, input, settings);
};

const hasInvalidInput = (form, settings) => {
  const inputs = form.querySelectorAll(settings.inputSelector);
  return Array.from(inputs).some((input) => !input.validity.valid);
};

const disableSubmitButton = (form, settings) => {
  const button = form.querySelector(settings.submitButtonSelector);
  button.disabled = true;
  button.classList.add(settings.inactiveButtonClass);
};

const enableSubmitButton = (form, settings) => {
  const button = form.querySelector(settings.submitButtonSelector);
  button.disabled = false;
  button.classList.remove(settings.inactiveButtonClass);
};

const toggleButtonState = (form, settings) => {
  if (hasInvalidInput(form, settings)) {
    disableSubmitButton(form, settings);
  } else {
    enableSubmitButton(form, settings);
  }
};

const setEventListeners = (form, settings) => {
  const inputs = form.querySelectorAll(settings.inputSelector);
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      checkInputValidity(form, input, settings);
      toggleButtonState(form, settings);
    });
  });
};

const clearValidation = (form, settings) => {
  const inputs = form.querySelectorAll(settings.inputSelector);
  inputs.forEach((input) => {
    input.setCustomValidity("");
    hideInputError(form, input, settings);
  });
  disableSubmitButton(form, settings);
};

const enableValidation = (settings) => {
  const forms = document.querySelectorAll(settings.formSelector);
  forms.forEach((form) => {
    setEventListeners(form, settings);
    toggleButtonState(form, settings);
  });
};

export { enableValidation, clearValidation };
