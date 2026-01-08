
document.addEventListener('DOMContentLoaded', function() {
            const scrollContainer = document.getElementById('scrollContainer');
            const scrollLeftBtn = document.getElementById('scrollLeftBtn');
            const scrollRightBtn = document.getElementById('scrollRightBtn');
            const scrollIndicator = document.getElementById('scrollIndicator');
            
            if (!scrollContainer) return;
            
            // Calculate how many cards are visible at once
            const card = document.querySelector('.card');
            if (!card) return;
            
            const cardWidth = card.offsetWidth + parseInt(getComputedStyle(card).marginRight);
            const visibleCards = Math.floor(scrollContainer.offsetWidth / cardWidth);
            
            // Create indicator dots based on number of cards
            const totalCards = document.querySelectorAll('.card').length;
            const pages = Math.ceil(totalCards / visibleCards);
            
            // Clear existing indicators and create new ones
            scrollIndicator.innerHTML = '';
            for (let i = 0; i < pages; i++) {
                const dot = document.createElement('div');
                dot.classList.add('indicator-dot');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => {
                    scrollToPage(i);
                    updateIndicators(i);
                });
                scrollIndicator.appendChild(dot);
            }
            
            // Scroll functions
            scrollRightBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: cardWidth * visibleCards, behavior: 'smooth' });
                updateIndicatorsAfterScroll();
            });
            
            scrollLeftBtn.addEventListener('click', () => {
                scrollContainer.scrollBy({ left: -cardWidth * visibleCards, behavior: 'smooth' });
                updateIndicatorsAfterScroll();
            });
            
            // Touch/swipe support for mobile
            let startX;
            let scrollLeft;
            
            scrollContainer.addEventListener('touchstart', (e) => {
                startX = e.touches[0].pageX - scrollContainer.offsetLeft;
                scrollLeft = scrollContainer.scrollLeft;
            });
            
            scrollContainer.addEventListener('touchmove', (e) => {
                if (!startX) return;
                const x = e.touches[0].pageX - scrollContainer.offsetLeft;
                const walk = (x - startX) * 2;
                scrollContainer.scrollLeft = scrollLeft - walk;
            });
            
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    scrollContainer.scrollBy({ left: -cardWidth * visibleCards, behavior: 'smooth' });
                    updateIndicatorsAfterScroll();
                } else if (e.key === 'ArrowRight') {
                    scrollContainer.scrollBy({ left: cardWidth * visibleCards, behavior: 'smooth' });
                    updateIndicatorsAfterScroll();
                }
            });
            
            // Helper functions
            function scrollToPage(pageIndex) {
                scrollContainer.scrollTo({
                    left: pageIndex * cardWidth * visibleCards,
                    behavior: 'smooth'
                });
            }
            
            function updateIndicators(pageIndex) {
                document.querySelectorAll('.indicator-dot').forEach((dot, index) => {
                    if (index === pageIndex) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
            
            function updateIndicatorsAfterScroll() {
                // Wait for scroll to complete then update indicators
                setTimeout(() => {
                    const scrollPos = scrollContainer.scrollLeft;
                    const currentPage = Math.round(scrollPos / (cardWidth * visibleCards));
                    updateIndicators(currentPage);
                }, 500);
            }
            
            // Auto-play (optional)
            let autoScrollInterval = setInterval(() => {
                if (isElementInViewport(scrollContainer)) {
                    scrollContainer.scrollBy({ left: cardWidth * visibleCards, behavior: 'smooth' });
                    updateIndicatorsAfterScroll();
                }
            }, 5000);
            
            // Pause auto-scroll on hover
            scrollContainer.addEventListener('mouseenter', () => {
                clearInterval(autoScrollInterval);
            });
            
            scrollContainer.addEventListener('mouseleave', () => {
                autoScrollInterval = setInterval(() => {
                    if (isElementInViewport(scrollContainer)) {
                        scrollContainer.scrollBy({ left: cardWidth * visibleCards, behavior: 'smooth' });
                        updateIndicatorsAfterScroll();
                    }
                }, 5000);
            });
            
            // Check if element is in viewport
            function isElementInViewport(el) {
                const rect = el.getBoundingClientRect();
                return (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                );
            }
        });

const cards = document.querySelectorAll('.residence-card');

cards.forEach(card => {

  // Make a card active on click
  card.addEventListener('click', () => {
    cards.forEach(c => {
      c.classList.remove('active');
      
    });
    card.classList.add('active');
    
  });

  card.addEventListener('mousemove', (e) => {
  const rect = card.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const deltaX = (mouseX - centerX) / centerX;
  const deltaY = (mouseY - centerY) / centerY; 

  const rotateX = -(deltaY * 10); 
  const rotateY = deltaX * 10;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });


});




document.addEventListener('DOMContentLoaded', function () {
    /*** Smooth scroll to home section ***/
    document.querySelectorAll('a[href="#home"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Close mobile menu if open
            const hamburger = document.querySelector('.hamburger');
            const mobileMenu = document.querySelector('.mobile-menu');
            if (hamburger.classList.contains('active')) {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
                hamburger.setAttribute('aria-expanded', 'false');
            }

            // Smooth scroll to home
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    /*** Hamburger menu functionality ***/
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            const isOpening = !this.classList.contains('active');
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = isOpening ? 'hidden' : '';
            this.setAttribute('aria-expanded', isOpening);
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest('.navbar-container') &&
                !e.target.closest('.mobile-menu') &&
                mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        function closeMenu() {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            hamburger.setAttribute('aria-expanded', 'false');
        }

        document.querySelectorAll('.mobile-menu a, .mobile-signin, .mobile-signup').forEach(item => {
            item.addEventListener('click', closeMenu);
        });
    }

    /*** Best deal card scrolling ***/
    const scrollContainer = document.querySelector('.scroll-container');
    const leftBtn = document.getElementById('scrollLeftBtn');
    const rightBtn = document.getElementById('scrollRightBtn');

    function scrollToCard(direction) {
        if (!scrollContainer) return;
        const card = scrollContainer.querySelector('.card');
        if (!card) return;
        const cardWidth = card.offsetWidth + 20;
        scrollContainer.scrollBy({
            left: direction * cardWidth,
            behavior: 'smooth'
        });
    }

    if (leftBtn) leftBtn.addEventListener('click', () => scrollToCard(-1));
    if (rightBtn) rightBtn.addEventListener('click', () => scrollToCard(1));

    /*** Accordion functionality ***/
    const items = document.querySelectorAll('.accordion-item');
    items.forEach(item => {
        item.querySelector('.accordion-header').addEventListener('click', () => {
            const openItem = document.querySelector('.accordion-item.active');
            if (openItem && openItem !== item) {
                openItem.classList.remove('active');
                openItem.querySelector('.icon').textContent = '+';
            }
            item.classList.toggle('active');
            const icon = item.querySelector('.icon');
            icon.textContent = item.classList.contains('active') ? '−' : '+';
        });
    });



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


function logout() {
 
    localStorage.clear();
    sessionStorage.clear();

    // Optional
    fetch('/logout', { method: 'POST', credentials: 'include' });

    window.location.href = '../index.html';
}

