const showInputError = (formElement, inputElement, errorMessage, validationConfig) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(validationConfig.errorClass);
  inputElement.classList.add(validationConfig.inputErrorClass);
};

const hideInputError = (formElement, inputElement, validationConfig) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = "";
  errorElement.classList.remove(validationConfig.errorClass);
  inputElement.classList.remove(validationConfig.inputErrorClass);
};

const checkInputValidity = (formElement, inputElement, validationConfig) => {
  if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  } else {
    inputElement.setCustomValidity("");
  }

  if (!inputElement.validity.valid) {
    showInputError(
      formElement,
      inputElement,
      inputElement.validationMessage,
      validationConfig
    );
    return;
  }

  hideInputError(formElement, inputElement, validationConfig);
};

const hasInvalidInput = (formElement, validationConfig) => {
  const inputList = formElement.querySelectorAll(validationConfig.inputSelector);
  return Array.from(inputList).some((inputElement) => !inputElement.validity.valid);
};

const disableSubmitButton = (formElement, validationConfig) => {
  const buttonElement = formElement.querySelector(validationConfig.submitButtonSelector);
  buttonElement.disabled = true;
  buttonElement.classList.add(validationConfig.inactiveButtonClass);
};

const enableSubmitButton = (formElement, validationConfig) => {
  const buttonElement = formElement.querySelector(validationConfig.submitButtonSelector);
  buttonElement.disabled = false;
  buttonElement.classList.remove(validationConfig.inactiveButtonClass);
};

const toggleButtonState = (formElement, validationConfig) => {
  if (hasInvalidInput(formElement, validationConfig)) {
    disableSubmitButton(formElement, validationConfig);
  } else {
    enableSubmitButton(formElement, validationConfig);
  }
};

const setEventListeners = (formElement, validationConfig) => {
  const inputList = formElement.querySelectorAll(validationConfig.inputSelector);
  inputList.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      checkInputValidity(formElement, inputElement, validationConfig);
      toggleButtonState(formElement, validationConfig);
    });
  });
};

const clearValidation = (formElement, validationConfig) => {
  const inputList = formElement.querySelectorAll(validationConfig.inputSelector);
  inputList.forEach((inputElement) => {
    inputElement.setCustomValidity("");
    hideInputError(formElement, inputElement, validationConfig);
  });
  disableSubmitButton(formElement, validationConfig);
};

const enableValidation = (validationConfig) => {
  const formList = document.querySelectorAll(validationConfig.formSelector);
  formList.forEach((formElement) => {
    setEventListeners(formElement, validationConfig);
    toggleButtonState(formElement, validationConfig);
  });
};

export { enableValidation, clearValidation };
