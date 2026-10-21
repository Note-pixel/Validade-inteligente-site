'use strict';
/* Transição suave entre páginas e botão de voltar */
const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sair = ir => {
  if (reduz) { ir(); return; }
  document.documentElement.classList.add('saindo');
  setTimeout(ir, 180);
};
document.addEventListener('click', e => {
  const voltar = e.target.closest('[data-voltar]');
  if (voltar) {
    e.preventDefault();
    const mesmoSite = document.referrer && new URL(document.referrer).origin === window.location.origin;
    sair(() => (mesmoSite && window.history.length > 1 ? window.history.back() : window.location.assign(voltar.dataset.fallback || 'index.html')));
    return;
  }
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target || a.hasAttribute('download')) return;
  const url = new URL(a.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (url.pathname === window.location.pathname && url.hash) return;
  e.preventDefault();
  sair(() => window.location.assign(url.href));
});
window.addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('saindo'); });