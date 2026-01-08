// about-us.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initModals();
    initForms();
});

// ===== NAVIGATION =====
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        const isOpening = !this.classList.contains('active');
        
        // Toggle active state
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = isOpening ? 'hidden' : '';
        this.setAttribute('aria-expanded', isOpening);
    });
    
    // Close menu when clicking outside or on links
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar-container') && 
            !e.target.closest('.mobile-menu') &&
            mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Close menu function
    function closeMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
    }
    
    // Close menu after clicking any link or button
    document.querySelectorAll('.mobile-menu a, .mobile-signin').forEach(item => {
        item.addEventListener('click', closeMenu);
    });
}

// ===== MODALS =====
function initModals() {
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    
    // Open/close modal functions
    window.openLoginModal = function() {
        loginModal.classList.remove('hidden');
        loginModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    window.closeLoginModal = function() {
        loginModal.classList.add('hidden');
        loginModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    window.openSignupModal = function() {
        signupModal.classList.add('active');
        signupModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeLoginModal();
    };

    window.closeSignupModal = function() {
        signupModal.classList.remove('active');
        signupModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    window.switchToLogin = function() {
        closeSignupModal();
        openLoginModal();
    };

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            if (loginModal && !loginModal.classList.contains('hidden')) {
                closeLoginModal();
            }
            if (signupModal && signupModal.classList.contains('active')) {
                closeSignupModal();
            }
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (loginModal && !loginModal.classList.contains('hidden')) {
                closeLoginModal();
            }
            if (signupModal && signupModal.classList.contains('active')) {
                closeSignupModal();
            }
        }
    });
    
    // Password toggle functionality
    window.togglePassword = function(fieldId, iconContainer) {
        const input = document.getElementById(fieldId);
        const icon = iconContainer.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
            icon.setAttribute('aria-label', 'Hide password');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
            icon.setAttribute('aria-label', 'Show password');
        }
    };
}

// ===== FORM VALIDATION =====
function initForms() {
    window.validateLoginForm = function() {
        const username = document.querySelector('.login-left input[type="text"]')?.value.trim();
        const password = document.getElementById('passwordInput')?.value.trim();
        
        // Simple validation - replace with more robust validation in production
        if (!username) {
            alert('Please enter your username');
            return false;
        }
        
        if (!password) {
            alert('Please enter your password');
            return false;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return false;
        }
        
        // Form is valid
        alert('Login successful! (This is a demo)');
        closeLoginModal();
        return true;
    };

    window.validateSignupForm = function() {
        const username = document.querySelector('.register-right input[type="text"]')?.value.trim();
        const email = document.querySelector('.register-right input[type="email"]')?.value.trim();
        const phone = document.querySelector('.register-right input[type="tel"]')?.value.trim();
        const password = document.getElementById('regPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        // Validation checks
        if (!username) {
            alert('Please enter a username');
            return false;
        }
        
        if (!email) {
            alert('Please enter your email address');
            return false;
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert('Please enter a valid email address');
            return false;
        }
        
        if (!phone) {
            alert('Please enter your phone number');
            return false;
        }
        
        if (!password) {
            alert('Please enter a password');
            return false;
        } else if (password.length < 8) {
            alert('Password must be at least 8 characters');
            return false;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return false;
        }
        
        if (!document.getElementById('terms')?.checked) {
            alert('You must agree to the terms and conditions');
            return false;
        }
        
        // Form is valid
        alert('Registration successful! (This is a demo)');
        closeSignupModal();
        return true;
    };
}