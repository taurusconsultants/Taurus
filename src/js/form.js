/**
 * Lead form.
 *
 * Three fields only — email, phone, and what they're after. Every extra field
 * costs conversions, so resist adding more.
 *
 * Posts FormData to the configured endpoint (Web3Forms by default). Because
 * it sends plain FormData, swapping to Formspree, a PHP script or a Google
 * Apps Script endpoint is a config change, not a code change.
 */

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setError(form, name, msg) {
  const slot = form.querySelector(`[data-err="${name}"]`);
  const field = form.querySelector(`[name="${name}"]`)?.closest('.field');
  if (slot) slot.textContent = msg || '';
  if (field) field.classList.toggle('invalid', Boolean(msg));
}

// Exported so the either/or rule can be unit-tested without a browser.
export function validate(form) {
  const data = {
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    message: form.message.value.trim(),
  };
  let ok = true;

  // Email and phone are EITHER/OR — we need one way to reach them, not two.
  // Demanding both costs conversions for no benefit: a prospect who will only
  // share a phone number, or only an email, is still a real lead.
  // Each field is validated for FORMAT only when it is actually filled in.
  const hasEmail = data.email.length > 0;
  const hasPhone = data.phone.length > 0;

  if (hasEmail && !RE_EMAIL.test(data.email)) {
    setError(form, 'email', 'That email doesn’t look right.');
    ok = false;
  } else setError(form, 'email', '');

  // Deliberately permissive: international formats vary wildly and a strict
  // regex rejects real numbers, which costs leads.
  const digits = data.phone.replace(/\D/g, '');
  if (hasPhone && digits.length < 7) {
    setError(form, 'phone', 'Please include the full number with country code.');
    ok = false;
  } else setError(form, 'phone', '');

  // The only contact rule: at least one of the two.
  if (!hasEmail && !hasPhone) {
    setError(form, 'contact', 'Please leave either an email or a contact number.');
    ok = false;
  } else setError(form, 'contact', '');

  if (data.message.length < 10) {
    setError(form, 'message', 'A sentence or two about what you need is enough.');
    ok = false;
  } else setError(form, 'message', '');

  return ok ? data : null;
}

export function initForm(cfg, brand) {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const btn = document.getElementById('formSubmit');
  const label = btn.querySelector('.btn-label');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot — bots fill hidden fields, humans can't see them.
    if (form.botcheck.value) return;

    const data = validate(form);
    if (!data) {
      status.className = 'form-status bad';
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }

    if (cfg.accessKey.startsWith('REPLACE-WITH')) {
      status.className = 'form-status bad';
      status.textContent =
        'Form not configured yet — add your Web3Forms access key in src/config.js.';
      console.warn('[form] Missing access key. See src/config.js → form.accessKey');
      return;
    }

    btn.disabled = true;
    label.textContent = 'Sending…';
    status.className = 'form-status';
    status.textContent = '';

    const payload = new FormData();
    payload.append('access_key', cfg.accessKey);
    payload.append('subject', cfg.subject);
    payload.append('from_name', brand.name);

    // Only send fields the visitor actually filled in. Web3Forms treats
    // `email` as the reply-to address and rejects an empty/invalid one, so a
    // phone-only enquiry must omit the key entirely rather than send ''.
    if (data.email) payload.append('email', data.email);
    if (data.phone) payload.append('phone', data.phone);

    // Spelled out in the notification so you can see at a glance how to reply
    // — some leads will arrive with a number and no email, or vice versa.
    payload.append(
      'Reply via',
      [data.email && `email: ${data.email}`, data.phone && `phone: ${data.phone}`]
        .filter(Boolean)
        .join('  ·  ')
    );
    payload.append('message', data.message);

    try {
      const res = await fetch(cfg.endpoint, { method: 'POST', body: payload });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success !== false) {
        form.reset();
        status.className = 'form-status ok';
        status.textContent =
          'Thanks — that’s with us. We’ll reply to every enquiry, usually within a day.';
        label.textContent = 'Sent';
        if (window.gtag) window.gtag('event', 'generate_lead');
        if (window.fbq) window.fbq('track', 'Lead');
        setTimeout(() => {
          btn.disabled = false;
          label.textContent = 'Send enquiry';
        }, 4000);
      } else {
        throw new Error(json.message || 'Request failed');
      }
    } catch (err) {
      console.warn('[form] submit failed:', err);
      status.className = 'form-status bad';
      status.innerHTML = `Something went wrong sending that. Please message us on WhatsApp, or email <a href="mailto:${brand.email}">${brand.email}</a>.`;
      btn.disabled = false;
      label.textContent = 'Send enquiry';
    }
  });

  // Clear an error the moment the visitor starts fixing it. Typing in either
  // contact field also clears the shared "at least one" error.
  ['email', 'phone', 'message'].forEach((n) => {
    form[n].addEventListener('input', () => {
      setError(form, n, '');
      if (n === 'email' || n === 'phone') setError(form, 'contact', '');
    });
  });
}
