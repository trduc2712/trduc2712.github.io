// Theme toggle
(function () {
  const toggle = document.getElementById('theme-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  const saved = localStorage.getItem('theme');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  applyTheme(saved || (prefersDark.matches ? 'dark' : 'light'));

  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
})();

function toggleProjectMore(id, btn) {
  const el = document.getElementById(id);
  const open = !el.hidden;
  el.hidden = open;
  btn.textContent = open ? 'More info' : 'Less info';
  btn.classList.toggle('active', !open);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => document.querySelector('.nav-links').classList.remove('open'));
});

const form = document.getElementById('contact-form');
const statusMsg = document.getElementById('status-msg');
const submitBtn = form.querySelector('.contact-submit');

function validateField(field) {
  const parent = field.closest('.field');
  if (!parent) return true;
  let valid = true;
  if (field.required && !field.value.trim()) valid = false;
  if (field.type === 'email' && field.value) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
  parent.classList.toggle('invalid', !valid);
  return valid;
}

form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('blur', () => validateField(el));
  el.addEventListener('input', () => { if (el.closest('.field')?.classList.contains('invalid')) validateField(el); });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  let allValid = true;
  form.querySelectorAll('[required]').forEach(el => { if (!validateField(el)) allValid = false; });
  if (!allValid) { form.querySelector('.field.invalid input, .field.invalid textarea')?.focus(); return; }

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  statusMsg.className = 'status-msg';

  try {
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
    const data = await res.json();
    if (data.success) {
      statusMsg.textContent = '✓ Message sent! I\'ll get back to you as soon as possible.';
      statusMsg.className = 'status-msg success';
      form.reset();
      form.querySelectorAll('.field.invalid').forEach(f => f.classList.remove('invalid'));
    } else { throw new Error(); }
  } catch {
    statusMsg.textContent = '✗ Failed to send — please try again or email directly.';
    statusMsg.className = 'status-msg error';
  } finally {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
  }
});
