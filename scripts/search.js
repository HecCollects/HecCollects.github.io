const input = document.getElementById('product-search');
const suggestions = document.getElementById('search-suggestions');

if (input && suggestions) {
  const index = [];
  let highlighted = -1;

  const clearSuggestions = () => {
    suggestions.innerHTML = '';
    highlighted = -1;
    input.removeAttribute('aria-activedescendant');
  };

  const updateHighlight = () => {
    const items = suggestions.querySelectorAll('li');
    items.forEach((li, i) => {
      if (i === highlighted) {
        li.classList.add('active');
        input.setAttribute('aria-activedescendant', li.id);
      } else {
        li.classList.remove('active');
      }
    });
    if (highlighted === -1) {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const loadItems = () => {
    if (typeof fetch !== 'function') {
      console.warn('Search index not loaded: fetch is unavailable');
      window.searchIndexLoaded = true;
      return Promise.resolve();
    }

    return fetch('items.json')
      .then(response => response.json())
      .then(data => {
        Object.values(data).forEach(arr => {
          arr.forEach(item => {
            const text = item.title || item.alt;
            if (text && item.link) {
              index.push({
                label: text,
                text: text.toLowerCase(),
                link: item.link
              });
            }
          });
        });
      })
      .catch(err => {
        console.warn('Failed to load search index', err);
      })
      .finally(() => {
        window.searchIndexLoaded = true;
      });
  };

  loadItems();

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    clearSuggestions();
    if (!query) return;

    let count = 0;
    for (const item of index) {
      if (item.text.includes(query)) {
        const li = document.createElement('li');
        li.setAttribute('role', 'option');
        li.id = `search-option-${count}`;
        const a = document.createElement('a');
        a.href = item.link;
        a.textContent = item.label;
        a.addEventListener('mousedown', e => e.preventDefault());
        a.addEventListener('click', e => {
          e.preventDefault();
          input.value = item.label;
          clearSuggestions();
          window.location.assign(item.link);
          document.dispatchEvent(new CustomEvent('search-navigate', { detail: item.link }));
        });
        li.appendChild(a);
        suggestions.appendChild(li);
        if (++count >= 5) break;
      }
    }
    if (count === 0) {
      const li = document.createElement('li');
      li.setAttribute('aria-disabled', 'true');
      li.textContent = 'No results found';
      suggestions.appendChild(li);
    }
    updateHighlight();
  });

  input.addEventListener('blur', () => setTimeout(clearSuggestions, 100));

  input.addEventListener('keydown', e => {
    const items = suggestions.querySelectorAll('li');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlighted = (highlighted + 1) % items.length;
      updateHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlighted = (highlighted - 1 + items.length) % items.length;
      updateHighlight();
    } else if (e.key === 'Enter' && highlighted >= 0) {
      e.preventDefault();
      const link = items[highlighted].querySelector('a');
      if (link) {
        input.value = link.textContent;
        clearSuggestions();
        window.location.assign(link.href);
        document.dispatchEvent(new CustomEvent('search-navigate', { detail: link.href }));
      }
    }
  });
}
