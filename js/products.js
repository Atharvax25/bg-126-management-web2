const productGrid = document.getElementById('product-grid');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

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
  </div>
`;

const loadProducts = async () => {
  if (!productGrid) {
    return;
  }

  const params = new URLSearchParams();
  const search = searchInput ? searchInput.value.trim() : '';
  const category = categoryFilter ? categoryFilter.value : 'all';

  if (search) {
    params.set('search', search);
  }

  if (category && category !== 'all') {
    params.set('category', category);
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

const addToCart = async (productId) => {
  if (!getToken()) {
    showMessage('Please sign in before adding products.', 'error');
    window.location.href = 'login.html';
    return;
  }

  try {
    await requestJson('/orders', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ products: [productId] })
    });

    showMessage('Added to cart and order created.', 'success');
    await loadProducts();
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

let searchTimer;

if (searchInput) {
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(loadProducts, 300);
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener('change', loadProducts);
}

if (productGrid) {
  productGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-id]');

    if (button) {
      addToCart(button.dataset.productId);
    }
  });

  document.addEventListener('DOMContentLoaded', loadProducts);
}
