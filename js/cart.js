const cartItemsList = document.getElementById('cart-items-list');
const summaryTotalAmount = document.getElementById('summary-total-amt');
const checkoutButton = document.getElementById('checkout-btn');

let currentCart = null;

const cartMoney = (value) => `$${Number(value).toFixed(2)}`;

const cartItemTemplate = (item) => {
  const product = item.productId;
  const itemTotal = product.price * item.quantity;

  return `
    <div class="glass cart-item">
      <img src="${product.image}" alt="${product.name}" class="cart-item-img">
      <div class="cart-item-info">
        <div class="cart-item-title">${product.name}</div>
        <div class="cart-item-price">${cartMoney(product.price)}</div>
      </div>
      <div class="cart-qty-ctrl">
        <span class="qty-val">${item.quantity}</span>
      </div>
      <div class="cart-item-total">${cartMoney(itemTotal)}</div>
      <button class="icon-btn" data-remove-cart-id="${product._id}" title="Remove item">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
};

const getCartTotal = (cart) => {
  return cart.products.reduce((sum, item) => {
    return sum + item.productId.price * item.quantity;
  }, 0);
};

const renderCart = (cart) => {
  currentCart = cart;

  if (!cartItemsList || !summaryTotalAmount) {
    return;
  }

  if (!cart.products.length) {
    cartItemsList.innerHTML = '<div class="glass empty-state">Your saved cart is empty.</div>';
    summaryTotalAmount.textContent = '$0.00';
    return;
  }

  cartItemsList.innerHTML = cart.products.map(cartItemTemplate).join('');
  summaryTotalAmount.textContent = cartMoney(getCartTotal(cart));
};

const loadCart = async () => {
  if (!getToken()) {
    showMessage('Please sign in to view your cart.', 'error');
    window.location.href = 'login.html';
    return;
  }

  try {
    const cart = await requestJson('/cart', {
      headers: authHeaders()
    });

    renderCart(cart);
  } catch (error) {
    cartItemsList.innerHTML = `<div class="glass empty-state">${error.message}</div>`;
  }
};

const removeCartItem = async (productId) => {
  try {
    const data = await requestJson(`/cart/${productId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });

    showMessage(data.message, 'success');
    renderCart(data.cart);
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

const checkoutCart = async () => {
  if (!currentCart || !currentCart.products.length) {
    showMessage('Your cart is empty.', 'error');
    return;
  }

  const products = currentCart.products.flatMap((item) => {
    return Array.from({ length: item.quantity }, () => item.productId._id);
  });

  try {
    await requestJson('/orders', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ products })
    });

    await Promise.all(
      currentCart.products.map((item) =>
        requestJson(`/cart/${item.productId._id}`, {
          method: 'DELETE',
          headers: authHeaders()
        })
      )
    );

    showMessage('Order created from saved cart.', 'success');
    await loadCart();
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

if (cartItemsList) {
  cartItemsList.addEventListener('click', (event) => {
    const removeButton = event.target.closest('[data-remove-cart-id]');

    if (removeButton) {
      removeCartItem(removeButton.dataset.removeCartId);
    }
  });
}

if (checkoutButton) {
  checkoutButton.addEventListener('click', checkoutCart);
}

document.addEventListener('DOMContentLoaded', loadCart);
