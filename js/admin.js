const adminContainer = document.getElementById('admin-dashboard-container');

const renderDashboard = (data) => {
  const topProducts = data.topSellingProducts.length
    ? data.topSellingProducts.map((product) => `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${product.totalSold}</td>
          <td>$${Number(product.price).toFixed(2)}</td>
        </tr>
      `).join('')
    : '<tr><td colspan="4">No sales yet.</td></tr>';

  adminContainer.innerHTML = `
    <div class="glass metric-card">
      <span>Total Users</span>
      <strong>${data.totalUsers}</strong>
    </div>
    <div class="glass metric-card">
      <span>Total Orders</span>
      <strong>${data.totalOrders}</strong>
    </div>
    <div class="glass metric-card">
      <span>Total Revenue</span>
      <strong>$${Number(data.totalRevenue).toFixed(2)}</strong>
    </div>
    <div class="table-responsive dashboard-table">
      <table class="glass" style="margin-top: 0;">
        <thead>
          <tr>
            <th>Top Product</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>${topProducts}</tbody>
      </table>
    </div>
  `;
};

const loadDashboard = async () => {
  if (!adminContainer) {
    return;
  }

  if (!getToken()) {
    showMessage('Please sign in as admin.', 'error');
    window.location.href = 'login.html';
    return;
  }

  if (getUser()?.role !== 'admin') {
    adminContainer.innerHTML = '<div class="glass empty-state">Admin access required.</div>';
    return;
  }

  try {
    const data = await requestJson('/admin/dashboard', {
      headers: authHeaders()
    });

    renderDashboard(data);
  } catch (error) {
    adminContainer.innerHTML = `<div class="glass empty-state">${error.message}</div>`;
  }
};

document.addEventListener('DOMContentLoaded', loadDashboard);
