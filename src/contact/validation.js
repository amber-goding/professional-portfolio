export const LIMITS = {
  name: { max: 100 },
  email: { max: 254 },
  message: { min: 10, max: 5000 },
};

export const FIELDS = ['name', 'email', 'message'];

const EMAIL = /^[^\s@<>()",;:\\]+@[^\s@<>()",;:\\]+\.[^\s@<>()",;:\\]{2,}$/;
// Control characters other than tab and newline (allowed only in the message).
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const LINE_BREAK = /[\r\n]/;

/**
 * Check that every expected field, if present, is a single string.
 * Repeated keys (arrays) or objects mean the request was not sent by our form.
 */
export function hasOnlyStringFields(body, names) {
  return names.every((name) => body[name] === undefined || typeof body[name] === 'string');
}

/** Validate and normalize a submission. Returns { values, errors }. */
export function validateSubmission(body) {
  const values = {
    name: (body.name ?? '').trim(),
    email: (body.email ?? '').trim(),
    message: (body.message ?? '').replace(/\r\n?/g, '\n').trim(),
  };
  const errors = {};

  if (!values.name) errors.name = 'Enter your name.';
  else if ([...values.name].length > LIMITS.name.max) errors.name = `Name must be ${LIMITS.name.max} characters or fewer.`;
  else if (CONTROL.test(values.name) || LINE_BREAK.test(values.name)) errors.name = 'Name contains characters that aren’t allowed.';

  if (!values.email) errors.email = 'Enter your email address.';
  else if (values.email.length > LIMITS.email.max) errors.email = `Email address must be ${LIMITS.email.max} characters or fewer.`;
  else if (!EMAIL.test(values.email) || CONTROL.test(values.email)) errors.email = 'Enter a valid email address, like name@example.com.';

  const messageLength = [...values.message].length;
  if (!values.message) errors.message = 'Enter a message.';
  else if (messageLength < LIMITS.message.min) errors.message = `Message must be at least ${LIMITS.message.min} characters.`;
  else if (messageLength > LIMITS.message.max) errors.message = `Message must be ${LIMITS.message.max.toLocaleString('en-US')} characters or fewer.`;
  else if (CONTROL.test(values.message)) errors.message = 'Message contains characters that aren’t allowed.';

  return { values, errors };
}
