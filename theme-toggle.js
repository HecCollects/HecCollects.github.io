const storageKey = 'theme';
const body = document.body;
const toggle = document.getElementById('theme-toggle');

function setTheme(theme) {
  body.setAttribute('data-theme', theme);
  localStorage.setItem(storageKey, theme);
}

const saved = localStorage.getItem(storageKey);
if (saved) {
  setTheme(saved);
}

toggle?.addEventListener('click', () => {
  const current = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(current);
});
