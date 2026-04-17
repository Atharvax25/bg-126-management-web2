document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      try {
        const data = await requestJson('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        saveSession(data.token, data.user);
        showMessage('Login successful. Redirecting...', 'success');
        window.location.href = 'index.html';
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm_password').value;

      if (password !== confirmPassword) {
        showMessage('Passwords do not match.', 'error');
        return;
      }

      try {
        await requestJson('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });

        showMessage('Account created. Please sign in.', 'success');
        window.location.href = 'login.html';
      } catch (error) {
        showMessage(error.message, 'error');
      }
    });
  }
});
