function attachError(formNode, field, text, settings) {
  const hint = formNode.querySelector(`#${field.id}-error`);
  hint.textContent = text;
  hint.classList.add(settings.errorClass);
  field.classList.add(settings.inputErrorClass);
}

function detachError(formNode, field, settings) {
  const hint = formNode.querySelector(`#${field.id}-error`);
  hint.textContent = "";
  hint.classList.remove(settings.errorClass);
  field.classList.remove(settings.inputErrorClass);
}

function checkField(formNode, field, settings) {
  if (field.validity.patternMismatch && field.dataset.errorMessage) {
    field.setCustomValidity(field.dataset.errorMessage);
  } else {
    field.setCustomValidity("");
  }

  if (!field.validity.valid) {
    attachError(formNode, field, field.validationMessage, settings);
    return;
  }

  detachError(formNode, field, settings);
}

function hasInvalidFields(formNode, settings) {
  const fields = formNode.querySelectorAll(settings.inputSelector);
  for (const field of fields) {
    if (!field.validity.valid) {
      return true;
    }
  }
  return false;
}

function lockSubmit(formNode, settings) {
  const btn = formNode.querySelector(settings.submitButtonSelector);
  btn.disabled = true;
  btn.classList.add(settings.inactiveButtonClass);
}

function unlockSubmit(formNode, settings) {
  const btn = formNode.querySelector(settings.submitButtonSelector);
  btn.disabled = false;
  btn.classList.remove(settings.inactiveButtonClass);
}

function refreshSubmitState(formNode, settings) {
  if (hasInvalidFields(formNode, settings)) {
    lockSubmit(formNode, settings);
  } else {
    unlockSubmit(formNode, settings);
  }
}

function hookFormFields(formNode, settings) {
  const fields = formNode.querySelectorAll(settings.inputSelector);
  for (const field of fields) {
    field.addEventListener("input", () => {
      checkField(formNode, field, settings);
      refreshSubmitState(formNode, settings);
    });
  }
}

export function clearValidation(formNode, settings) {
  const fields = formNode.querySelectorAll(settings.inputSelector);
  for (const field of fields) {
    field.setCustomValidity("");
    detachError(formNode, field, settings);
  }
  lockSubmit(formNode, settings);
}

export function enableValidation(settings) {
  const forms = document.querySelectorAll(settings.formSelector);
  for (const formNode of forms) {
    hookFormFields(formNode, settings);
    refreshSubmitState(formNode, settings);
  }
}
