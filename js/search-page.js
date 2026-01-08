// smooth scroll to top and navigation handling

document.addEventListener("DOMContentLoaded", () => {
  // Send ping
  window.electronAPI.ping()

  // Listen for pong
  window.electronAPI.onPong((_event, message) => {
    console.log(message) // prints: Hello from main process!
  })
})
function initNavigation() {
    // Handle Search link clicks
    document.querySelectorAll('a[href="search-page.html"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            // Only prevent default if we're handling the scroll
            if (!this.hasAttribute('target')) {
                e.preventDefault();
                
                // Close mobile menu if open
                const hamburger = document.querySelector('.hamburger');
                const mobileMenu = document.querySelector('.mobile-menu');
                if (hamburger?.classList.contains('active')) {
                    hamburger.classList.remove('active');
                    mobileMenu?.classList.remove('active');
                    document.body.style.overflow = '';
                    hamburger.setAttribute('aria-expanded', 'false');
                }
                
                // Scroll to top
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Then navigate to the page after scroll completes
                setTimeout(() => {
                    window.location.href = this.getAttribute('href');
                }, 500); // Match this duration with your scroll duration
            }
        });
    });

    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking outside or on links
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar-container') && 
            !e.target.closest('.mobile-menu') &&
            mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Close menu after clicking any link or button
    document.querySelectorAll('.mobile-menu a, .mobile-signin, .mobile-signup').forEach(item => {
        item.addEventListener('click', closeMenu);
    });

    function handleHomeLinkClick(anchor) {
        // Close mobile menu if open
        const hamburger = document.querySelector('.hamburger');
        if (hamburger.classList.contains('active')) {
            closeMenu();
        }
        
        // Smooth scroll to home
        document.querySelector(anchor.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    }

    function toggleMobileMenu() {
        const isOpening = !this.classList.contains('active');
        
        // Toggle active state
        this.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = isOpening ? 'hidden' : '';
        this.setAttribute('aria-expanded', isOpening);
    }

    function closeMenu() {
        const hamburger = document.querySelector('.hamburger');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        hamburger.setAttribute('aria-expanded', 'false');
    }
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
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeLoginModal();
            closeSignupModal();
        }
    });
    
    // Password toggle functionality
    window.togglePassword = function(fieldId, iconContainer) {
        const input = document.getElementById(fieldId);
        const icon = iconContainer.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    };
}

// ===== FORM VALIDATION =====
function initForms() {
    window.validateLoginForm = function() {
        const username = document.querySelector('.login-left input[type="text"]')?.value.trim();
        const password = document.getElementById('passwordInput')?.value.trim();
        
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
        
        return true;
    };

    window.validateSignupForm = function() {
        const password = document.getElementById('regPassword')?.value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return false;
        }
        
        if (!document.getElementById('terms')?.checked) {
            alert('You must agree to the terms and conditions');
            return false;
        }
        
        return true;
    };
}

// ===== PROPERTY SEARCH =====
function initPropertySearch() {
    const propertyCards = document.querySelectorAll(".property-card");
    
    // Add data attributes to each card for better filtering
    propertyCards.forEach((card, index) => {
        const priceText = card.querySelector("h3").textContent.replace(/[^\d]/g, "");
        const title = card.querySelector("h2").textContent;
        
        card.dataset.price = priceText;
        card.dataset.residence = title.split("–")[0].trim();
        card.dataset.unitType = title.split("–")[1].trim();
        
        // Example values - replace with real data from your backend
        const floorAreas = [30, 45, 60, 50, 80, 40, 35, 65, 25, 100];
        card.dataset.floorArea = floorAreas[index];
        
        const amenitiesList = [
            "Pool", 
            "Parking", 
            "Gym,Pool", 
            "Parking", 
            "Gym,Pool,Parking", 
            "Pool", 
            "Parking", 
            "Gym,Pool,Parking", 
            "", 
            "Gym,Pool,Parking"
        ];
        card.dataset.amenities = amenitiesList[index];
    });

    function applyFilters() {
    const residence = document.getElementById("residenceFilter").value;
    const unitType = document.getElementById("unitTypeFilter").value;
    const monthlyRange = document.getElementById("monthlyRangeFilter").value;
    const floorArea = document.getElementById("floorAreaFilter").value;
    const amenities = document.getElementById("amenitiesFilter").value;

    propertyCards.forEach(card => {
        const cardResidence = card.dataset.residence;
        const cardUnitType = card.dataset.unitType;
        const cardPrice = parseInt(card.dataset.price);
        const cardFloorArea = parseInt(card.dataset.floorArea);
        const cardAmenities = card.dataset.amenities || "";

        let show = true;

        // Residence filter - exact match
        if (residence && cardResidence !== residence) {
            show = false;
        }

        // Unit type filter - partial match
        if (unitType && !cardUnitType.toLowerCase().includes(unitType.toLowerCase())) {
            show = false;
        }

        // Price range filter
        if (monthlyRange) {
            const [min, max] = monthlyRange.split("-").map(Number);
            if (cardPrice < min || cardPrice > max) {
                show = false;
            }
        }

        // Floor area filter
        if (floorArea) {
            const [min, max] = floorArea.split("-").map(Number);
            if (cardFloorArea < min || cardFloorArea > max) {
                show = false;
            }
        }

        // Amenities filter
        if (amenities && !cardAmenities.toLowerCase().includes(amenities.toLowerCase())) {
            show = false;
        }

        card.style.display = show ? "flex" : "none";
    });
}

    function resetFilters() {
        document.querySelectorAll(".filters select").forEach(select => {
            select.value = "";
        });
        propertyCards.forEach(card => {
            card.style.display = "flex";
        });
    }

    document.querySelectorAll(".filters select").forEach(select => {
        select.addEventListener("change", applyFilters);
    });

    window.resetFilters = resetFilters;
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initModals();
    initForms();
    initPropertySearch();
});