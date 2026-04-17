const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const searchSuggestions = document.getElementById('search-suggestions');
const recommendationSection = document.getElementById('recommendation-section');
const recommendationGrid = document.getElementById('recommendation-grid');

const money = (value) => `$${Number(value).toFixed(2)}`;

const productCard = (product) => `
  <div class="glass product-card">
    <a href="product.html?id=${product._id}" style="text-decoration: none;">
      <div class="product-img-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-img">
      </div>
    </a>
    <div class="product-category">
      <i class="fas fa-tag" style="font-size:0.7rem; margin-right:4px;"></i> ${product.category}
    </div>
    <a href="product.html?id=${product._id}" style="text-decoration: none;">
      <h3 class="product-title">${product.name}</h3>
    </a>
    <p class="product-description">${product.description}</p>
    <div class="product-stock">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</div>
    <div class="product-footer">
      <div class="product-price">${money(product.price)}</div>
      <button class="btn-add-circle" data-product-id="${product._id}" title="Deploy to Cart" ${product.stock <= 0 ? 'disabled' : ''}>
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <div class="product-actions">
      <button class="mini-action-btn" data-bookmark-id="${product._id}">
        <i class="fas fa-bookmark"></i> Bookmark
      </button>
      <button class="mini-action-btn" data-recommend-id="${product._id}">
        <i class="fas fa-wand-magic-sparkles"></i> Recommend
      </button>
    </div>
  </div>
`;

const loadProducts = async () => {
  if (!productGrid) {
    return;
  }

  const params = new URLSearchParams();
  const search = searchInput ? searchInput.value.trim() : '';
  const category = categoryFilter ? categoryFilter.value : 'all';
  const minPrice = minPriceInput ? minPriceInput.value.trim() : '';
  const maxPrice = maxPriceInput ? maxPriceInput.value.trim() : '';

  if (search) {
    params.set('search', search);
  }

  if (category && category !== 'all') {
    params.set('category', category);
  }

  if (minPrice) {
    params.set('minPrice', minPrice);
  }

  if (maxPrice) {
    params.set('maxPrice', maxPrice);
  }

  productGrid.innerHTML = '<div class="glass empty-state">Loading products...</div>';

  try {
    const products = await requestJson(`/products?${params.toString()}`);

    if (products.length === 0) {
      productGrid.innerHTML = '<div class="glass empty-state">No products matched your filters.</div>';
      return;
    }

    productGrid.innerHTML = products.map(productCard).join('');
  } catch (error) {
    productGrid.innerHTML = `<div class="glass empty-state">${error.message}</div>`;
  }
};

const renderSearchSuggestions = (products) => {
  if (!searchSuggestions) {
    return;
  }

  if (products.length === 0) {
    searchSuggestions.innerHTML = '<button type="button" class="suggestion-item">No matches found</button>';
    searchSuggestions.classList.add('active');
    return;
  }

  searchSuggestions.innerHTML = products.map((product) => `
    <button type="button" class="suggestion-item" data-suggestion="${product.name}">
      <img src="${product.image}" alt="${product.name}">
      <span>${product.name}</span>
      <strong>${money(product.price)}</strong>
    </button>
  `).join('');
  searchSuggestions.classList.add('active');
};

const loadSearchSuggestions = async () => {
  if (!searchSuggestions || !searchInput) {
    return;
  }

  const keyword = searchInput.value.trim();

  if (keyword.length < 2) {
    searchSuggestions.classList.remove('active');
    searchSuggestions.innerHTML = '';
    return;
  }

  try {
    const products = await requestJson(`/products/search?q=${encodeURIComponent(keyword)}`);
    renderSearchSuggestions(products);
  } catch (error) {
    searchSuggestions.innerHTML = '';
    searchSuggestions.classList.remove('active');
  }
};

const toggleBookmark = async (productId) => {
  if (!getToken()) {
    showMessage('Please sign in before bookmarking products.', 'error');
    window.location.href = 'login.html';
    return;
  }

  try {
    const data = await requestJson(`/bookmark/${productId}`, {
      method: 'POST',
      headers: authHeaders()
    });

    showMessage(data.message, 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

const loadRecommendations = async (productId) => {
  if (!recommendationSection || !recommendationGrid) {
    return;
  }

  recommendationSection.style.display = 'block';
  recommendationGrid.innerHTML = '<div class="glass empty-state">Loading recommendations...</div>';

  try {
    const products = await requestJson(`/products/recommend/${productId}`);

    recommendationGrid.innerHTML = products.length
      ? products.map(productCard).join('')
      : '<div class="glass empty-state">No recommendations found.</div>';

    recommendationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    recommendationGrid.innerHTML = `<div class="glass empty-state">${error.message}</div>`;
  }
};

const addToCart = async (productId) => {
  if (!getToken()) {
    showMessage('Please sign in before adding products.', 'error');
    window.location.href = 'login.html';
    return;
  }

  try {
    await requestJson('/cart', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ productId, quantity: 1 })
    });

    showMessage('Added to your saved cart.', 'success');
    await loadProducts();
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

let searchTimer;

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      loadProducts();
      loadSearchSuggestions();
    }, 300);
  });
}

if (searchSuggestions) {
  searchSuggestions.addEventListener('click', (event) => {
    const item = event.target.closest('[data-suggestion]');

    if (item && searchInput) {
      searchInput.value = item.dataset.suggestion;
      searchSuggestions.classList.remove('active');
      loadProducts();
    }
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', loadProducts);
}

if (minPriceInput) {
  minPriceInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 300);
  });
}

if (maxPriceInput) {
  maxPriceInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 300);
  });
}

if (productGrid) {
  productGrid.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-product-id]');
    const bookmarkButton = event.target.closest('[data-bookmark-id]');
    const recommendButton = event.target.closest('[data-recommend-id]');

    if (addButton) {
      addToCart(addButton.dataset.productId);
    }

    if (bookmarkButton) {
      toggleBookmark(bookmarkButton.dataset.bookmarkId);
    }

    if (recommendButton) {
      loadRecommendations(recommendButton.dataset.recommendId);
    }
  });

  document.addEventListener('DOMContentLoaded', loadProducts);
}

if (recommendationGrid) {
  recommendationGrid.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-product-id]');
    const bookmarkButton = event.target.closest('[data-bookmark-id]');
    const recommendButton = event.target.closest('[data-recommend-id]');

    if (addButton) {
      addToCart(addButton.dataset.productId);
    }

    if (bookmarkButton) {
      toggleBookmark(bookmarkButton.dataset.bookmarkId);
    }

    if (recommendButton) {
      loadRecommendations(recommendButton.dataset.recommendId);
    }
  });
}
