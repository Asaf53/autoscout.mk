const form = document.querySelector('#inquiry');
const statusBox = document.querySelector('#status');
const submit = form.querySelector('button');
document.querySelectorAll('[data-interest]').forEach(link => {
  link.addEventListener('click', () => { form.elements.interest.value = link.dataset.interest; });
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submit.disabled) return;
  submit.disabled = true;
  submit.textContent = 'Sending…';
  statusBox.textContent = '';
  try {
    const response = await fetch('/api/inquiry', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Unable to send your inquiry. Please try again later.');
    form.reset();
    statusBox.dataset.error = 'false';
    statusBox.textContent = 'Your inquiry has been sent. Thank you for your interest.';
  } catch (error) {
    statusBox.dataset.error = 'true';
    statusBox.textContent = error.message || 'Unable to send your inquiry. Please try again.';
  } finally {
    submit.disabled = false;
    submit.textContent = 'Send inquiry ↗';
  }
});
