const input = document.getElementById('product-search');
const suggestions = document.getElementById('search-suggestions');

if (input && suggestions) {
  input.addEventListener('input', () => {
    suggestions.innerHTML = '';
  });
}
