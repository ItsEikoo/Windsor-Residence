import { supabase } from '../serverClient.js';
import { requireAuth } from '../protect.js';

    window.addEventListener('DOMContentLoaded', async () => {
      const user = await requireAuth();
      const container = document.getElementById('reservationInfo');

      const { data: reservations, error } = await supabase
        .from('room_reservations')
        .select('*, rooms(room_no, location)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        container.innerHTML = `<p class="error">Failed to load reservation info.</p>`;
        return;
      }

      if (!reservations.length) {
        container.innerHTML = `<p>No current reservations.</p>`;
        return;
      }

      const reservation = reservations[0];
      const card = document.createElement('div');
      card.className = 'reservation-card';
      card.innerHTML = `
        <h3>Your Room Reservation</h3>
        <p><strong>Room No:</strong> ${reservation.rooms.room_no}</p>
        <p><strong>Building:</strong> ${reservation.rooms.location}</p>
        <p><strong>Visit Time Frame:</strong> ${reservation.start_date} to ${reservation.end_date}</p>
        <button id="cancelBtn">Cancel Reservation</button>
      `;
      container.appendChild(card);

      document.getElementById('cancelBtn').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to cancel your reservation?')) return;
        const { error: deleteError } = await supabase
          .from('room_reservations')
          .delete()
          .eq('id', reservation.id);

        if (deleteError) {
          alert('Failed to cancel reservation.');
        } else {
          alert('Reservation canceled.');
          location.reload();
        }
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
   fetch('/logout', { method: 'POST', credentials: 'include' });

    window.location.href = '../index.html';
}
