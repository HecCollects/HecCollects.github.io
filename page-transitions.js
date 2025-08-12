document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  body.classList.add('fade-in');

  document.querySelectorAll('a[href]').forEach(link => {
    const target = link.getAttribute('target');
    const href = link.getAttribute('href');
    const sameHost = link.host === window.location.host;
    if (sameHost && target !== '_blank' && href && !href.startsWith('#')) {
      link.addEventListener('click', e => {
        e.preventDefault();
        body.classList.remove('fade-in');
        body.classList.add('fade-out');
        setTimeout(() => {
          window.location.href = href;
        }, 400);
      });
    }
  });
});
