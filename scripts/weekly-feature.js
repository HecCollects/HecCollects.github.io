(() => {
  // Featured item of the week
  const initWeeklyFeature = () => {
    const container = document.getElementById('weekly-feature');
    if (!container) return;
    const display = document.getElementById('weekly-item');
    const btn = document.getElementById('weekly-refresh');
    if (!display || !btn) return;

    let items = [];
    const loadItems = async () => {
      if (location.protocol === 'file:') {
        display.textContent = 'Unable to load item.';
        items = [];
        return;
      }
      try {
        const res = await fetch('items.json');
        const data = await res.json();
        items = [...(data.ebay || []), ...(data.offerup || [])];
      } catch {
        items = [];
        display.textContent = 'Unable to load item.';
      }
    };

    const showRandom = () => {
      if (!items.length) {
        display.textContent = 'Unable to load item.';
        return;
      }
      const item = items[Math.floor(Math.random() * items.length)];
      display.innerHTML = '';
      const link = document.createElement('a');
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', item.alt || 'Featured item');
      const img = document.createElement('img');
      const small = item.imageSmall || item.imageLarge || '';
      const large = item.imageLarge || item.imageSmall || '';
      img.src = small;
      img.alt = item.alt || '';
      img.loading = 'lazy';
      try {
        const getWidth = (u) => {
          try {
            return parseInt(new URL(u).searchParams.get('width') || '0', 10);
          } catch {
            return 0;
          }
        };
        const smallW = getWidth(small);
        const largeW = getWidth(large);
        if (smallW && largeW) {
          img.width = largeW;
          img.height = Math.round(largeW * 9 / 16);
          img.srcset = `${small} ${smallW}w, ${large} ${largeW}w`;
          img.sizes = `(max-width: ${largeW}px) 100vw, ${largeW}px`;
        }
      } catch {}
      link.appendChild(img);
      display.appendChild(link);
      if (window.gtag) {
        window.gtag('event', 'featured_week_view', { event_label: item.link || item.alt || '' });
      }
    };

    btn.addEventListener('click', () => {
      showRandom();
      if (window.gtag) {
        window.gtag('event', 'featured_week_click');
      }
    });

    btn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        btn.click();
      }
    });

    loadItems().then(showRandom);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeeklyFeature, { once: true });
  } else {
    initWeeklyFeature();
  }

})();
