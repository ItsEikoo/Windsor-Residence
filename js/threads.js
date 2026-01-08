import { supabase } from '../serverClient.js';
import { requireAuth } from '../protect.js';

let currentUser = null;

async function loadThreads() {
  const list = document.getElementById('threads-list');
  list.innerHTML = 'Loading...';

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  const { data, error } = await supabase
    .from('threads')
    .select(`
      id,
      title,
      created_at,
      created_by,
      profiles (
        username
      )
    `)
    .eq('is_deleted', false)
    .neq('created_by', userId)  // ← Exclude current user's posts
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('Error loading threads:', error?.message);
    list.innerHTML = '<p>Failed to load threads.</p>';
    return;
  }

  list.innerHTML = '';
  data.forEach(thread => {
    const username = thread.profiles?.username || 'Unknown';
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="thread-box">
        <h3>${thread.title}</h3>
        <p>Posted by: ${username}</p>
        <button onclick="goToThread('${thread.id}')" class="comment">Comment Section</button>
        <button onclick="messageUser('${thread.created_by}', '${username}')" class="message">Message</button>
      </div>
    `;
    list.appendChild(li);
  });
}


function goToThread(id) {
  window.location.href = `thread.html?thread=${id}`;
}

function messageUser(recipientId, recipientName) {
  window.location.href = `chat.html?user=${recipientId}&name=${encodeURIComponent(recipientName)}`;
}

async function createThread() {
  const title = document.getElementById('new-thread-title').value.trim();
  if (!title) return alert('Thread title is required.');

  const { data, error } = await supabase.from('threads').insert([
    {
      title,
      created_by: currentUser.id
    }
  ]);

  if (error) {
    alert('Error creating thread: ' + error.message);
    return;
  }

  // Reload threads after creation
  await loadThreads();
  document.getElementById('new-thread-title').value = '';
}

async function showUserInfo() {
  document.getElementById('user-info').textContent = `Logged in as: ${currentUser.email}`;
}

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
    // fetch('/logout', { method: 'POST', credentials: 'include' });

    window.location.href = '../index.html';
}


// Initialize
(async () => {
  currentUser = await requireAuth();
  await loadThreads();
  await showUserInfo();
})();

window.createThread = createThread;
window.goToThread = goToThread;
window.messageUser = messageUser;

