import { supabase } from '../serverClient.js';
import { requireAuth } from '../protect.js';

let currentUser = null;
let deleteTargetId = null; // store which post is pending deletion

async function loadMyPosts() {
  const { data, error } = await supabase
    .from('threads')
    .select('*')
    .eq('created_by', currentUser.id)
    .order('created_at', { ascending: false });

  const list = document.getElementById('my-threads-list');
  list.innerHTML = '';

  if (error) {
    list.innerHTML = '<li class="no-posts">Error loading posts. Please try again.</li>';
    return;
  }

  if (!data || data.length === 0) {
    list.innerHTML = '<li class="no-posts">You haven\'t created any posts yet.</li>';
    return;
  }

  data.forEach(thread => {
    const li = document.createElement('li');
    li.className = 'thread-box';
    li.innerHTML = `
      <h3>${thread.title}</h3>
      <p>Created: ${new Date(thread.created_at).toLocaleDateString()}</p>
      <button onclick="goToComments('${thread.id}')">
        <i class="fas fa-comment"></i> View Comments
      </button>
      <button onclick="confirmDelete('${thread.id}')">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;
    list.appendChild(li);
  });
}

function goToComments(id) {
  window.location.href = `thread.html?thread=${id}`;
}

// Show custom popup
function confirmDelete(id) {
  deleteTargetId = id;
  document.getElementById('confirm-modal').style.display = 'flex';
}

// Handle "Yes" button
async function deleteThreadConfirmed() {
  if (!deleteTargetId) return;

  const { error } = await supabase
    .from('threads')
    .delete()
    .eq('id', deleteTargetId);

  if (!error) {
    await loadMyPosts();
  } else {
    alert('Error deleting post. Please try again.');
  }

  closeConfirmPopup();
}

// Handle "No" / close button
function closeConfirmPopup() {
  document.getElementById('confirm-modal').style.display = 'none';
  deleteTargetId = null;
}

// Initialize authentication and load posts
(async () => {
  try {
    currentUser = await requireAuth();
    document.getElementById('user-info').innerHTML = `
      <p>Logged in as: <strong>${currentUser.email}</strong></p>
    `;
    await loadMyPosts();
  } catch (error) {
    document.getElementById('my-threads-list').innerHTML = `
      <li class="no-posts">Please sign in to view your posts.</li>
    `;
  }
})();

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


// Expose functions globally
window.goToComments = goToComments;
window.confirmDelete = confirmDelete;
window.deleteThreadConfirmed = deleteThreadConfirmed;
window.closeConfirmPopup = closeConfirmPopup;
