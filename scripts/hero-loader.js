(() => {
  const hero = document.getElementById('home');
  const packageContainer = document.getElementById('package-anim');
  const webglSupported = !!window.WebGLRenderingContext;
  if (!hero || !webglSupported) {
    packageContainer?.classList.add('show-logo');
    return;
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });

  const init = async () => {
    try {
      // Load Three.js first to ensure Vanta has its dependency available
      await loadScript('vendor/three.min.js');
      await loadScript('vendor/vanta.net.min.js');
    } finally {
      window.initVanta?.();
      window.initPackageAnimation?.();
    }
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        observer.disconnect();
        init();
      }
    });
  });

  observer.observe(hero);
})();

