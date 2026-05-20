const textFieldsPattern = /^[A-Za-zА-Яа-яЁё\s-]+$/;

const matchesTextFieldRule = (input, formRules) => {
  const restrictedClasses = formRules.lettersOnlyClassList || [];
  return restrictedClasses.some((className) => input.classList.contains(className));
};

const displayError = (form, input, message, formRules) => {
  const errorElement = form.querySelector(`#${input.id}-error`);
  errorElement.textContent = message;
  errorElement.classList.add(formRules.errorClass);
  input.classList.add(formRules.inputErrorClass);
};

const removeError = (form, input, formRules) => {
  const errorElement = form.querySelector(`#${input.id}-error`);
  errorElement.textContent = "";
  errorElement.classList.remove(formRules.errorClass);
  input.classList.remove(formRules.inputErrorClass);
};

const validateSingleInput = (form, input, formRules) => {
  if (matchesTextFieldRule(input, formRules)) {
    const message = input.dataset.errorMessage || formRules.lettersOnlyMessage;
    if (!textFieldsPattern.test(input.value)) {
      input.setCustomValidity(message);
    } else {
      input.setCustomValidity("");
    }
  } else if (input.validity.patternMismatch && input.dataset.errorMessage) {
    input.setCustomValidity(input.dataset.errorMessage);
  } else {
    input.setCustomValidity("");
  }

  if (!input.validity.valid) {
    displayError(form, input, input.validationMessage, formRules);
    return;
  }

  removeError(form, input, formRules);
};

const formContainsInvalidInput = (form, formRules) => {
  const inputs = form.querySelectorAll(formRules.inputSelector);
  return Array.from(inputs).some((input) => !input.validity.valid);
};

const lockFormButton = (form, formRules) => {
  const button = form.querySelector(formRules.submitButtonSelector);
  button.disabled = true;
  button.classList.add(formRules.inactiveButtonClass);
};

const unlockFormButton = (form, formRules) => {
  const button = form.querySelector(formRules.submitButtonSelector);
  button.disabled = false;
  button.classList.remove(formRules.inactiveButtonClass);
};

const refreshFormButton = (form, formRules) => {
  if (formContainsInvalidInput(form, formRules)) {
    lockFormButton(form, formRules);
  } else {
    unlockFormButton(form, formRules);
  }
};

const bindInputValidation = (form, formRules) => {
  const inputs = form.querySelectorAll(formRules.inputSelector);
  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      validateSingleInput(form, input, formRules);
      refreshFormButton(form, formRules);
    });
  });
};

const clearValidation = (form, formRules) => {
  const inputs = form.querySelectorAll(formRules.inputSelector);
  inputs.forEach((input) => {
    input.setCustomValidity("");
    removeError(form, input, formRules);
  });
  lockFormButton(form, formRules);
};

const enableValidation = (formRules) => {
  const forms = document.querySelectorAll(formRules.formSelector);
  forms.forEach((form) => {
    bindInputValidation(form, formRules);
    refreshFormButton(form, formRules);
  });
};

export { enableValidation, clearValidation };
