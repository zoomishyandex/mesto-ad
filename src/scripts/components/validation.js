function revealError(formElement, inputElement, message, validationConfig) {
  const errorNode = formElement.querySelector(`#${inputElement.id}-error`);
  errorNode.textContent = message;
  errorNode.classList.add(validationConfig.errorClass);
  inputElement.classList.add(validationConfig.inputErrorClass);
}

function resetError(formElement, inputElement, validationConfig) {
  const errorNode = formElement.querySelector(`#${inputElement.id}-error`);
  errorNode.textContent = "";
  errorNode.classList.remove(validationConfig.errorClass);
  inputElement.classList.remove(validationConfig.inputErrorClass);
}

function inspectInput(formElement, inputElement, validationConfig) {
  if (inputElement.validity.patternMismatch && inputElement.dataset.errorMessage) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  } else {
    inputElement.setCustomValidity("");
  }

  if (!inputElement.validity.valid) {
    revealError(formElement, inputElement, inputElement.validationMessage, validationConfig);
    return;
  }

  resetError(formElement, inputElement, validationConfig);
}

function formInvalid(formElement, validationConfig) {
  const inputs = formElement.querySelectorAll(validationConfig.inputSelector);
  return Array.from(inputs).some((input) => !input.validity.valid);
}

function setButtonInactive(formElement, validationConfig) {
  const submitButton = formElement.querySelector(validationConfig.submitButtonSelector);
  submitButton.disabled = true;
  submitButton.classList.add(validationConfig.inactiveButtonClass);
}

function setButtonActive(formElement, validationConfig) {
  const submitButton = formElement.querySelector(validationConfig.submitButtonSelector);
  submitButton.disabled = false;
  submitButton.classList.remove(validationConfig.inactiveButtonClass);
}

function updateFormButton(formElement, validationConfig) {
  if (formInvalid(formElement, validationConfig)) {
    setButtonInactive(formElement, validationConfig);
  } else {
    setButtonActive(formElement, validationConfig);
  }
}

function listenInputs(formElement, validationConfig) {
  const inputs = formElement.querySelectorAll(validationConfig.inputSelector);
  inputs.forEach((inputElement) => {
    inputElement.addEventListener("input", () => {
      inspectInput(formElement, inputElement, validationConfig);
      updateFormButton(formElement, validationConfig);
    });
  });
}

function clearValidation(formElement, validationConfig) {
  const inputs = formElement.querySelectorAll(validationConfig.inputSelector);
  inputs.forEach((inputElement) => {
    inputElement.setCustomValidity("");
    resetError(formElement, inputElement, validationConfig);
  });
  setButtonInactive(formElement, validationConfig);
}

function enableValidation(validationConfig) {
  const forms = document.querySelectorAll(validationConfig.formSelector);
  forms.forEach((formElement) => {
    listenInputs(formElement, validationConfig);
    updateFormButton(formElement, validationConfig);
  });
}

export { enableValidation, clearValidation };
