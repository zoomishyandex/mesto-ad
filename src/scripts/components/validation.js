const attachError = (form, input, text, rules) => {
  const slot = form.querySelector(`#${input.id}-error`);
  slot.textContent = text;
  slot.classList.add(rules.errorClass);
  input.classList.add(rules.inputErrorClass);
};

const detachError = (form, input, rules) => {
  const slot = form.querySelector(`#${input.id}-error`);
  slot.textContent = "";
  slot.classList.remove(rules.errorClass);
  input.classList.remove(rules.inputErrorClass);
};

const runFieldRules = (form, input, rules) => {
  if (input.validity.patternMismatch && input.dataset.errorMessage) {
    input.setCustomValidity(input.dataset.errorMessage);
  } else {
    input.setCustomValidity("");
  }

  if (!input.validity.valid) {
    attachError(form, input, input.validationMessage, rules);
    return;
  }

  detachError(form, input, rules);
};

const anyFieldBad = (form, rules) => {
  for (const input of form.querySelectorAll(rules.inputSelector)) {
    if (!input.validity.valid) {
      return true;
    }
  }
  return false;
};

const blockSend = (form, rules) => {
  const send = form.querySelector(rules.submitButtonSelector);
  send.disabled = true;
  send.classList.add(rules.inactiveButtonClass);
};

const allowSend = (form, rules) => {
  const send = form.querySelector(rules.submitButtonSelector);
  send.disabled = false;
  send.classList.remove(rules.inactiveButtonClass);
};

const syncSendState = (form, rules) => {
  if (anyFieldBad(form, rules)) {
    blockSend(form, rules);
  } else {
    allowSend(form, rules);
  }
};

const hookInputs = (form, rules) => {
  for (const input of form.querySelectorAll(rules.inputSelector)) {
    input.addEventListener("input", () => {
      runFieldRules(form, input, rules);
      syncSendState(form, rules);
    });
  }
};

const clearValidation = (form, rules) => {
  for (const input of form.querySelectorAll(rules.inputSelector)) {
    input.setCustomValidity("");
    detachError(form, input, rules);
  }
  blockSend(form, rules);
};

const enableValidation = (rules) => {
  for (const form of document.querySelectorAll(rules.formSelector)) {
    hookInputs(form, rules);
    syncSendState(form, rules);
  }
};

export { enableValidation, clearValidation };
