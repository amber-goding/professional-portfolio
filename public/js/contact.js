// Progressive enhancement for the contact form. Without this script the form
// submits normally and the server renders every state as a full page.
(() => {
  const success = document.querySelector('[data-contact-success]');
  const successHeading = success?.querySelector('[data-success-heading]');

  // After a no-JavaScript success page loads, move focus to the confirmation.
  if (success && !success.hidden) successHeading?.focus();

  const form = document.querySelector('[data-contact-form]');
  if (!form || !window.fetch || !window.URLSearchParams) return;

  const submit = form.querySelector('[data-submit]');
  const submitLabel = form.querySelector('[data-submit-label]');
  const status = form.querySelector('[data-form-status]');
  const alertBox = form.querySelector('[data-form-alert]');
  const summary = form.querySelector('[data-error-summary]');
  const summaryList = form.querySelector('[data-error-list]');
  const tokenInput = form.querySelector('[data-form-token]');
  const fields = ['name', 'email', 'message'];
  const REQUEST_TIMEOUT_MS = 20000;
  let pending = false;

  function setPending(isPending) {
    pending = isPending;
    // aria-disabled (not disabled) keeps keyboard focus on the button; the
    // `pending` flag blocks duplicate submits while a request is in flight.
    submit.setAttribute('aria-disabled', String(isPending));
    form.setAttribute('aria-busy', String(isPending));
    submitLabel.textContent = isPending ? 'Sending…' : 'Send message';
    for (const name of fields) form.elements[name].readOnly = isPending;
  }

  function showAlert(message) {
    alertBox.textContent = message;
    alertBox.hidden = false;
  }

  function clearFeedback() {
    alertBox.hidden = true;
    alertBox.textContent = '';
    summary.hidden = true;
    summaryList.replaceChildren();
    status.textContent = '';
    for (const name of fields) {
      const input = form.elements[name];
      const error = document.getElementById(`field-${name}-error`);
      error.hidden = true;
      error.querySelector('[data-error-text]').textContent = '';
      input.removeAttribute('aria-invalid');
      const describedBy = (input.getAttribute('aria-describedby') || '').split(' ').filter((id) => id && id !== error.id);
      if (describedBy.length) input.setAttribute('aria-describedby', describedBy.join(' '));
      else input.removeAttribute('aria-describedby');
      input.closest('.field').classList.remove('field--error');
    }
  }

  function showFieldErrors(errors) {
    for (const name of fields) {
      if (!errors[name]) continue;
      const input = form.elements[name];
      const error = document.getElementById(`field-${name}-error`);
      error.querySelector('[data-error-text]').textContent = errors[name];
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      const describedBy = (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      input.setAttribute('aria-describedby', [...describedBy, error.id].join(' '));
      input.closest('.field').classList.add('field--error');

      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#field-${name}`;
      link.textContent = errors[name];
      item.append(link);
      summaryList.append(item);
    }
    summary.hidden = false;
    summary.focus();
  }

  function showSuccess() {
    form.hidden = true;
    success.hidden = false;
    successHeading.focus();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (pending) return;

    clearFeedback();
    setPending(true);
    status.textContent = 'Sending your message…';

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)),
        credentials: 'same-origin',
        signal: controller.signal,
      });
      const data = await response.json().catch(() => null);
      if (!data || typeof data.message !== 'string') throw new Error('Unexpected response');
      if (typeof data.formToken === 'string') tokenInput.value = data.formToken;

      status.textContent = '';
      if (data.status === 'sent') showSuccess();
      else if (data.errors) showFieldErrors(data.errors);
      else showAlert(data.message);
    } catch {
      status.textContent = '';
      showAlert(
        controller.signal.aborted
          ? 'We couldn’t confirm that your message was sent. Please try again. Resubmitting the same message will not send it twice.'
          : 'Your message could not be sent because the server could not be reached. Please check your connection and try again.',
      );
    } finally {
      clearTimeout(timer);
      setPending(false);
    }
  });
})();
