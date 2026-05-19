document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profile-form');
  const passwordForm = document.getElementById('password-form');
  const alertContainer = document.getElementById('alert-container');
  const avatarPreview = document.getElementById('profile-avatar-preview');
  const imageUploadInput = document.getElementById('profile-image-upload');
  const imageUrlInput = document.getElementById('profile-image-url');

  // Initial Load
  fetchProfile();

  // Helper to show alerts
  function showAlert(message, type = 'danger') {
    alertContainer.innerHTML = `
      <div class="alert alert-${type}">
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    lucide.createIcons();
    
    // Auto-hide success alerts
    if(type === 'success') {
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
  }

  // Handle file upload and convert to Base64
  imageUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        showAlert('Image must be less than 2MB');
        imageUploadInput.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target.result;
        imageUrlInput.value = base64String;
        avatarPreview.src = base64String;
      };
      reader.readAsDataURL(file);
    }
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

  async function fetchProfile() {
    try {
      const profile = await api.get('customer/profile');
      
      document.getElementById('full-name').value = profile.fullName;
      document.getElementById('email').value = profile.email;
      document.getElementById('phone').value = profile.phone;
      document.getElementById('address').value = profile.address;
      
      if (profile.profileImageUrl) {
        imageUrlInput.value = profile.profileImageUrl;
        avatarPreview.src = profile.profileImageUrl;
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      showAlert("Failed to retrieve profile details.");
    }
  }

  // Save profile updates
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const dto = {
      fullName: document.getElementById('full-name').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      profileImageUrl: imageUrlInput.value.trim()
    };

    try {
      await api.put('customer/profile', dto);
      showAlert('Profile details updated successfully!', 'success');
      
      // Update local storage representation
      localStorage.setItem('auth_user_name', dto.fullName);
      
      // Update header info dynamically
      const headerName = document.getElementById('header-user-name');
      const headerAvatar = document.getElementById('header-avatar');
      if (headerName) headerName.textContent = dto.fullName;
      if (headerAvatar && dto.profileImageUrl) headerAvatar.src = dto.profileImageUrl;
      
      fetchProfile();
    } catch (error) {
      showAlert(error.message || 'Failed to update profile.');
    }
  });

  // Change password
  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      showAlert('New passwords do not match. Please verify.');
      return;
    }

    try {
      await api.put('customer/change-password', {
        currentPassword,
        newPassword
      });
      showAlert('Password updated successfully!', 'success');
      passwordForm.reset();
    } catch (error) {
      showAlert(error.message || 'Failed to update password. Verify current password.');
    }
  });
});
