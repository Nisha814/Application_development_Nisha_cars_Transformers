document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect to dashboard
  if (api.isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return;
  }

  // DOM Elements
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const toggleToRegister = document.getElementById('toggle-to-register');
  const toggleToLogin = document.getElementById('toggle-to-login');
  const authSubtitle = document.getElementById('auth-subtitle');
  const alertContainer = document.getElementById('alert-container');

  // Toggle Forms
  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    authSubtitle.textContent = 'Create your account to access portal features.';
    toggleToRegister.style.display = 'none';
    toggleToLogin.style.display = 'block';
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    authSubtitle.textContent = 'Welcome back! Please enter your details.';
    toggleToLogin.style.display = 'none';
    toggleToRegister.style.display = 'block';
  });

  // Password Visibility Toggle
  document.querySelectorAll('.password-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
      input.setAttribute('type', type);
      
      const icon = btn.querySelector('i');
      if (type === 'text') {
        icon.setAttribute('data-lucide', 'eye-off');
      } else {
        icon.setAttribute('data-lucide', 'eye');
      }
      lucide.createIcons();
    });
  });

  // Show alert message helper
  function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
      <div class="alert alert-${type}">
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    lucide.createIcons();
  }

  // Handle Login Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = ''; // Clear alerts

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const data = await api.post('auth/login', { email, password });
      api.setAuth(data);
      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      showAlert(error.message || 'Login failed. Please check your credentials.');
    }
  });

  // Handle Register Submission
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = ''; // Clear alerts

    const fullName = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const address = document.getElementById('register-address').value;
    const password = document.getElementById('register-password').value;

    try {
      const data = await api.post('auth/register', {
        fullName,
        email,
        phone,
        address,
        password
      });
      api.setAuth(data);
      showAlert('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } catch (error) {
      showAlert(error.message || 'Registration failed. Please try again.');
    }
  });
});
