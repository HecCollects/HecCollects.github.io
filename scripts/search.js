const input = document.getElementById('product-search');
const suggestions = document.getElementById('search-suggestions');

if (input && suggestions) {
  const index = [];

  const clearSuggestions = () => {
    suggestions.innerHTML = '';
  };

  const loadItems = () => {
    const isNativeFetch = window.fetch.toString().includes('[native code]');
    if (location.protocol === 'file:' && isNativeFetch) {
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
      .catch(() => {})
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
  });

  input.addEventListener('blur', () => setTimeout(clearSuggestions, 100));
}
