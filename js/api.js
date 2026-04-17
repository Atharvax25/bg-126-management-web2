const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('forgecartToken');
const getUser = () => JSON.parse(localStorage.getItem('forgecartUser') || 'null');

const saveSession = (token, user) => {
  localStorage.setItem('forgecartToken', token);
  localStorage.setItem('forgecartUser', JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem('forgecartToken');
  localStorage.removeItem('forgecartUser');
};

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

const showMessage = (message, type = 'info') => {
  let messageBox = document.getElementById('app-message');

  if (!messageBox) {
    messageBox = document.createElement('div');
    messageBox.id = 'app-message';
    document.body.appendChild(messageBox);
  }

  messageBox.textContent = message;
  messageBox.className = `app-message ${type}`;
  setTimeout(() => {
    messageBox.className = 'app-message hidden';
  }, 3500);
};

const updateAuthLinks = () => {
  const navLinks = document.querySelector('.nav-links');
  const user = getUser();

  if (!navLinks || !user) {
    return;
  }

  const signInLink = navLinks.querySelector('a[href="login.html"]');
  const signUpLink = navLinks.querySelector('a[href="register.html"]');

  if (signInLink) {
    signInLink.textContent = user.name;
    signInLink.href = 'orders.html';
  }

  if (signUpLink) {
    signUpLink.textContent = 'Logout';
    signUpLink.href = '#';
    signUpLink.addEventListener('click', (event) => {
      event.preventDefault();
      clearSession();
      window.location.href = 'login.html';
    });
  }
};

document.addEventListener('DOMContentLoaded', updateAuthLinks);
