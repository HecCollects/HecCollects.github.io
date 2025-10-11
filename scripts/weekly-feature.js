(() => {
  // Featured item of the week
  const initWeeklyFeature = () => {
    const container = document.getElementById('weekly-feature');
    if (!container) return;
    const display = document.getElementById('weekly-item');
    const btn = document.getElementById('weekly-refresh');
    if (!display || !btn) return;

    let items = [];
    const buildCard = (item) => {
      const card = document.createElement('a');
      card.className = 'featured-card featured-card--weekly';
      const ratio = 4 / 5;
      const label = item.alt || item.title || item.caption || 'Featured item';
      card.setAttribute('aria-label', label);
      if (item.link) {
        card.href = item.link;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.addEventListener('click', () => {
          if (window.gtag) {
            window.gtag('event', 'featured_week_open', { event_label: item.link || label });
          }
        });
      } else {
        card.href = '#';
        card.addEventListener('click', evt => evt.preventDefault());
      }

      if (item.tagColor) {
        card.style.setProperty('--featured-border-color', item.tagColor);
      }

      const media = document.createElement('div');
      media.className = 'featured-media';

      const img = document.createElement('img');
      const small = item.imageSmall || item.imageLarge || item.image || '';
      const large = item.imageLarge || item.imageSmall || item.image || '';
      if (small) {
        img.src = small;
      }
      img.alt = item.alt || item.title || '';
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
          img.height = Math.round(largeW * ratio);
          img.srcset = `${small} ${smallW}w, ${large} ${largeW}w`;
          img.sizes = `(max-width: ${largeW}px) 100vw, ${largeW}px`;
        }
      } catch {}

      media.appendChild(img);

      if (item.badge || item.stock) {
        const meta = document.createElement('span');
        meta.className = 'item-meta';
        meta.textContent = item.badge ? item.badge : `Only ${item.stock} left`;
        if (item.tagColor) {
          meta.style.backgroundColor = item.tagColor;
        }
        media.appendChild(meta);
      }

      card.appendChild(media);

      const details = document.createElement('div');
      details.className = 'featured-details';

      const title = document.createElement('span');
      title.className = 'featured-title';
      title.textContent = item.title || item.caption || item.alt || 'Featured find';
      details.appendChild(title);

      const priceText = item.price || item.priceText || item.priceLabel || '';
      const price = document.createElement('span');
      price.className = 'featured-price';
      if (priceText) {
        price.textContent = priceText;
      } else {
        price.textContent = 'View listing ↗';
        price.classList.add('featured-price--placeholder');
      }
      details.appendChild(price);

      if (Array.isArray(item.valueProps) && item.valueProps.length) {
        const list = document.createElement('ul');
        list.className = 'featured-value-props';
        item.valueProps.filter(Boolean).forEach(value => {
          const li = document.createElement('li');
          li.textContent = value;
          list.appendChild(li);
        });
        if (list.childElementCount) {
          details.appendChild(list);
        }
      }

      if (item.bonus) {
        const bonus = document.createElement('span');
        bonus.className = 'featured-bonus';
        bonus.textContent = item.bonus;
        details.appendChild(bonus);
      }

      card.appendChild(details);

      return card;
    };
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
      const card = buildCard(item);
      display.appendChild(card);
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
