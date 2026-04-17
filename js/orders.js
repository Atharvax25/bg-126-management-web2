const orderContainer = document.getElementById('order-history-container');
const money = (value) => `$${Number(value).toFixed(2)}`;
const isAdmin = () => getUser()?.role === 'admin';

const renderOrders = (orders) => {
  if (!orderContainer) {
    return;
  }

  if (orders.length === 0) {
    orderContainer.innerHTML = '<div class="glass empty-state">No orders yet.</div>';
    return;
  }

  const rows = orders.map((order) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const productNames = order.products.map((product) => product.name).join(', ');

    const statusCell = isAdmin()
      ? `
        <select class="form-control order-status-select" data-order-id="${order._id}">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>pending</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>delivered</option>
        </select>
      `
      : `<span class="status-badge"><i class="fas fa-check-circle"></i> ${order.status}</span>`;

    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.95rem; color: var(--text-main);">
          <strong>${order._id.slice(-10).toUpperCase()}</strong>
        </td>
        <td style="color: var(--text-muted);">${date}</td>
        <td>
          <span style="background: rgba(255,255,255,0.05); padding: 5px 10px; border-radius: 20px; font-size: 0.85rem;">
            ${order.products.length} item(s)
          </span>
          <div style="margin-top: 8px; color: var(--text-muted); font-size: 0.85rem;">${productNames}</div>
        </td>
        <td style="color: var(--primary); font-weight:700;">${money(order.totalAmount)}</td>
        <td>${statusCell}</td>
      </tr>
    `;
  }).join('');

  orderContainer.innerHTML = `
    <div class="table-responsive">
      <table class="glass" style="margin-top: 0;">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Timestamp</th>
            <th>Assets</th>
            <th>Total Resource</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

const loadOrders = async () => {
  if (!orderContainer) {
    return;
  }

  if (!getToken()) {
    showMessage('Please sign in to view orders.', 'error');
    window.location.href = 'login.html';
    return;
  }

  orderContainer.innerHTML = '<div class="glass empty-state">Loading orders...</div>';

  try {
    const orders = await requestJson('/orders', {
      headers: authHeaders()
    });

    renderOrders(orders);
  } catch (error) {
    orderContainer.innerHTML = `<div class="glass empty-state">${error.message}</div>`;
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    await requestJson(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });

    showMessage('Order status updated.', 'success');
    await loadOrders();
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

if (orderContainer) {
  orderContainer.addEventListener('change', (event) => {
    const select = event.target.closest('[data-order-id]');

    if (select) {
      updateOrderStatus(select.dataset.orderId, select.value);
    }
  });
}

document.addEventListener('DOMContentLoaded', loadOrders);
