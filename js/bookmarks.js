const bookmarkGrid = document.getElementById('bookmark-grid');
const bookmarkMoney = (value) => `$${Number(value).toFixed(2)}`;

const bookmarkCard = (product) => `
  <div class="glass product-card">
    <div class="product-img-wrapper">
      <img src="${product.image}" alt="${product.name}" class="product-img">
    </div>
    <div class="product-category">
      <i class="fas fa-tag" style="font-size:0.7rem; margin-right:4px;"></i> ${product.category}
    </div>
    <h3 class="product-title">${product.name}</h3>
    <p class="product-description">${product.description}</p>
    <div class="product-stock">${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</div>
    <div class="product-footer">
      <div class="product-price">${bookmarkMoney(product.price)}</div>
      <button class="btn-add-circle" data-product-id="${product._id}" title="Deploy to Cart" ${product.stock <= 0 ? 'disabled' : ''}>
        <i class="fas fa-plus"></i>
      </button>
    </div>
    <div class="product-actions">
      <button class="mini-action-btn" data-remove-bookmark-id="${product._id}">
        <i class="fas fa-trash"></i> Remove
      </button>
    </div>
  </div>
`;

const loadBookmarks = async () => {
  if (!bookmarkGrid) {
    return;
  }

  if (!getToken()) {
    showMessage('Please sign in to view bookmarks.', 'error');
    window.location.href = 'login.html';
    return;
  }

  try {
    const products = await requestJson('/bookmark', {
      headers: authHeaders()
    });

    bookmarkGrid.innerHTML = products.length
      ? products.map(bookmarkCard).join('')
      : '<div class="glass empty-state">No bookmarked products yet.</div>';
  } catch (error) {
    bookmarkGrid.innerHTML = `<div class="glass empty-state">${error.message}</div>`;
  }
};

const addBookmarkedProductToOrder = async (productId) => {
  try {
    await requestJson('/orders', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ products: [productId] })
    });

    showMessage('Order created from bookmark.', 'success');
    await loadBookmarks();
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

const removeBookmark = async (productId) => {
  try {
    await requestJson(`/bookmark/${productId}`, {
      method: 'POST',
      headers: authHeaders()
    });

    showMessage('Bookmark removed.', 'success');
    await loadBookmarks();
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

if (bookmarkGrid) {
  bookmarkGrid.addEventListener('click', (event) => {
    const addButton = event.target.closest('[data-product-id]');
    const removeButton = event.target.closest('[data-remove-bookmark-id]');

    if (addButton) {
      addBookmarkedProductToOrder(addButton.dataset.productId);
    }

    if (removeButton) {
      removeBookmark(removeButton.dataset.removeBookmarkId);
    }
  });
}

document.addEventListener('DOMContentLoaded', loadBookmarks);
