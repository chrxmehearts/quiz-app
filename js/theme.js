'use strict';

/*
 * Theme toggle. With no stored choice the app follows the system preference
 * (pure CSS media query); an explicit choice sets [data-theme] on <html> and
 * persists, overriding the system from then on.
 */
(function () {
  const THEME_KEY = 'quiz_theme';
  const root = document.documentElement;

  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') root.dataset.theme = stored;

  const btn = document.getElementById('btn-theme');
  if (!btn) return;

  function effectiveTheme() {
    return root.dataset.theme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  btn.addEventListener('click', () => {
    const next = effectiveTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* private mode */ }
  });
})();
