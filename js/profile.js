import { supabase } from '../serverClient.js';


    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '../index.html';
      } else {
        document.body.style.display = 'block';
        loadProfile();
      }
    })();

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Failed to load profile:', error.message);
        return;
      }

      if (data) {
        document.getElementById('username').value = data.username || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = data.phone_number || '';
        if (data.avatar_url) {
          document.getElementById('avatarPreview').src = data.avatar_url;
          document.getElementById('avatarPreview').style.display = 'block';
        }
      }
    }

    document.getElementById('profileForm').addEventListener('submit', async function(e) {
      e.preventDefault();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const username = document.getElementById('username').value;
      const phone = document.getElementById('phone').value;

      let avatarUrl = null;
      const avatarFile = document.getElementById('avatar').files[0];

      if (avatarFile) {
        const filePath = `${user.id}/avatar.png`; 
        const { data, error } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (error) {
          console.error('Avatar upload error:', error.message);
          alert('Failed to upload avatar: ' + error.message);
          return;
        }

        avatarUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;
      }

      const updates = {
        username,
        phone_number: phone,
        ...(avatarUrl && { avatar_url: avatarUrl })
      };

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (updateError) {
        console.error('Profile update failed:', updateError.message);
        alert('Failed to update profile.');
        return;
      }

      alert('Profile updated!');
      if (avatarUrl) {
        document.getElementById('avatarPreview').src = avatarUrl;
        document.getElementById('avatarPreview').style.display = 'block';
      }
    });

    document.getElementById('avatar').addEventListener('change', function() {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          document.getElementById('avatarPreview').src = e.target.result;
          document.getElementById('avatarPreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    document.getElementById('deleteAvatarBtn').addEventListener('click', async () => {
  const avatarImg = document.getElementById('avatarPreview');

  // Check if an avatar is currently shown
  if (!avatarImg.src || avatarImg.style.display === 'none') {
    alert('There is no avatar to delete.');
    return;
  }

  const confirmDelete = confirm('Are you sure you want to delete your profile picture?');
  if (!confirmDelete) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const filePath = `${user.id}/avatar.png`;

  // Delete the file from storage
  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath]);

  if (error) {
    console.error('Failed to delete avatar:', error.message);
    alert('Failed to delete avatar.');
    return;
  }

  // Clear avatar_url from profiles table
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id);

  if (updateError) {
    console.error('Failed to clear avatar_url:', updateError.message);
    alert('Failed to update profile.');
    return;
  }

  // Hide preview
  avatarImg.src = '';
  avatarImg.style.display = 'none';
  alert('Avatar deleted successfully.');
});

//password
// Password visibility toggle
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const passwordField = document.getElementById(targetId);
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
});

// Change password functionality
document.getElementById('changePasswordBtn').addEventListener('click', async function() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const messageEl = document.getElementById('passwordMessage');
    
    // Reset message
    messageEl.className = 'message';
    messageEl.textContent = '';
    messageEl.style.display = 'none';
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showMessage('Password must be at least 8 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }
    
    // Disable button during operation
    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';
    
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        // First verify current password by signing in again
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
        });
        
        if (signInError) throw new Error('Current password is incorrect');
        
        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });
        
        if (updateError) throw updateError;
        
        showMessage('Password changed successfully!', 'success');
        
        // Clear fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (error) {
        showMessage(error.message || 'Failed to change password', 'error');
        console.error('Password change error:', error);
    } finally {
        this.disabled = false;
        this.textContent = 'Change Password';
    }
    
    function showMessage(text, type) {
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutModal = document.getElementById('logoutModal');
    const closeLogoutModal = document.getElementById('closeLogoutModal');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');

    // Show modal when clicking logout link
    logoutBtn?.addEventListener('click', function (e) {
        e.preventDefault();
        logoutModal.style.display = 'flex';
    });

    // Close modal when clicking X or Cancel
    closeLogoutModal?.addEventListener('click', () => logoutModal.style.display = 'none');
    cancelLogout?.addEventListener('click', () => logoutModal.style.display = 'none');

    // Confirm Logout (only logs out here)
    confirmLogout?.addEventListener('click', function () {
        logout(); // Call the logout function only when "Yes" is clicked
    });

    // Close modal if user clicks outside
    window.addEventListener('click', function (e) {
        if (e.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
});



document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - setting up hamburger menu');
    
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (hamburger && mobileMenu) {
        console.log('Hamburger and mobile menu found');
        
        // Hamburger click event
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpening = !this.classList.contains('active');
            
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            body.style.overflow = isOpening ? 'hidden' : '';
            this.setAttribute('aria-expanded', isOpening.toString());
            
            console.log('Hamburger clicked, active:', isOpening);
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.navbar-container') &&
                !e.target.closest('.mobile-menu') &&
                mobileMenu.classList.contains('active')) {
                closeMenu();
                console.log('Clicked outside - closing menu');
            }
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.mobile-menu a').forEach(item => {
            item.addEventListener('click', function() {
                closeMenu();
                console.log('Menu link clicked - closing menu');
            });
        });

        function closeMenu() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
            console.log('Menu closed');
        }

        // Handle logo click
        const logo = document.querySelector('.navbar-left img');
        if (logo) {
            logo.addEventListener('click', function() {
                window.location.href = '../pages/home.html';
            });
        }
        
        // Handle mobile logout button
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                document.getElementById('logoutModal').style.display = 'flex';
            });
        }
        
        console.log('Hamburger menu setup complete');
    } else {
        console.log('Hamburger or mobile menu not found');
        if (!hamburger) console.log('Hamburger button not found');
        if (!mobileMenu) console.log('Mobile menu not found');
    }
});
  

function logout() {
 
    localStorage.clear();
    sessionStorage.clear();

    // Optional
    // fetch('/logout', { method: 'POST', credentials: 'include' });

    window.location.href = '../index.html';
}

