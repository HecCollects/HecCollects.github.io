(() => {
  const GA_ID = window.GA_ID;
  if (!GA_ID) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.integrity = 'sha256-Otare2YpYU85tTuCOT36b10VBDtZIGOpaDskQaLvDCA=';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
})();
