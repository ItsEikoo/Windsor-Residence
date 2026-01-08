import { supabase } from '../serverClient.js';
import { requireAuth } from '../protect.js';

const threadId = new URLSearchParams(window.location.search).get('thread');
let currentUser = null;
let threadOwnerId = null;

// Load thread details and store thread owner
async function loadThread() {
  const { data, error } = await supabase
    .from('threads')
    .select('title, created_by')
    .eq('id', threadId)
    .single();

  if (error) {
    console.error('Thread load error:', error.message);
    return;
  }

  document.getElementById('thread-title').textContent = data.title;
  threadOwnerId = data.created_by;
}

// Load comments with sender's username using the alias (assuming only one FK exists)
async function loadComments() {
  setupRealtimeListener(); // 👈 Setup realtime after loading comments

  const { data, error } = await supabase
    .from('messages')
    .select(`
      id,
      content,
      created_at,
      sender_profile:sender_id (username)
    `)
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading comments:', error.message);
    return;
  }

  const list = document.getElementById('comments-list');
  list.innerHTML = '';

  data.forEach(msg => {
    const username = msg.sender_profile?.username || 'User';
    const time = new Date(msg.created_at).toLocaleString();
    const div = document.createElement('div');
    div.className = 'message';
    div.innerHTML = `
      <p><strong>${username}:</strong> ${msg.content}</p>
      <small>${time}</small>
    `;
    list.appendChild(div);
  });
}

// Add a comment to the thread
async function postComment() {
  const content = document.getElementById('comment-content').value.trim();
  if (!content) return;

  if (!threadOwnerId) {
    console.error('Thread owner ID not loaded.');
    return;
  }

  const { error } = await supabase.from('messages').insert([{
    content,
    thread_id: threadId,
    sender_id: currentUser.id,
    receiver_id: threadOwnerId
  }]);

  if (error) {
    console.error('Post comment error:', error.message);
    return;
  }

  document.getElementById('comment-content').value = '';
  await loadComments();
}

// Display logged-in user info
async function showUserInfo() {
  document.getElementById('user-info').textContent = `Logged in as: ${currentUser.email}`;
}

function setupRealtimeListener() {
  supabase
    .channel('realtime-thread-comments')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `thread_id=eq.${threadId}`
      },
      async (payload) => {
        console.log('New comment:', payload.new);
        await loadComments(); // Refresh comments on new insert
      }
    )
    .subscribe();
}


// Init
(async () => {
  currentUser = await requireAuth();
  await loadThread();
  await loadComments();
//  await showUserInfo();
  setupRealtimeListener(); // 👈 Setup realtime after loading comments

})();

window.postComment = postComment;

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


