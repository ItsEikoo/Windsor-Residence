import { supabase } from '../serverClient.js';
import { requireAuth } from '../protect.js';

let currentUser = null;

async function loadInbox() {
  const { data, error } = await supabase
    .from('private_messages')
    .select(`
      id,
      sender_id,
      receiver_id,
      content,
      created_at,
      sender_profile:sender_id ( username ),
      receiver_profile:receiver_id ( username )
    `)
    .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Inbox load error:', error.message);
    return;
  }

  const inbox = document.getElementById('inbox-list');
  inbox.innerHTML = '';

  const uniqueUsers = {};

  data.forEach(msg => {
    const isSender = msg.sender_id === currentUser.id;
    const otherId = isSender ? msg.receiver_id : msg.sender_id;
    if (uniqueUsers[otherId]) return;

    const otherUsername = isSender
      ? msg.receiver_profile?.username
      : msg.sender_profile?.username;

    uniqueUsers[otherId] = true;

    // Derive per-chat secret (same method as chat.js)
    const chatSecret = CryptoJS.SHA256(
      [currentUser.id, otherId].sort().join("-")
    ).toString();

    // Try decrypting message
    let preview;
    try {
      const bytes = CryptoJS.AES.decrypt(msg.content, chatSecret);
      preview = bytes.toString(CryptoJS.enc.Utf8);
      if (!preview) throw new Error("Empty after decrypt");
    } catch {
      preview = "[Encrypted]";
    }

    const div = document.createElement('div');
      div.className = 'inbox-item';
      div.innerHTML = `
        <div class="inbox-avatar">${(otherUsername || "U").charAt(0).toUpperCase()}</div>
        <div class="inbox-content">
          <strong>${otherUsername || 'Unknown'}</strong>
          <p>${preview}</p>
        </div>
        <button onclick="chatWith('${otherId}', '${otherUsername}')">Chat</button>
      `;
      inbox.appendChild(div);
  });
}

function chatWith(id, name) {
  window.location.href = `chat.html?user=${id}&name=${encodeURIComponent(name)}`;
}

window.chatWith = chatWith;

(async () => {
  currentUser = await requireAuth();
  await loadInbox();
})();

// === HAMBURGER MENU FUNCTIONALITY ===
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mobileMenu.classList.toggle("active");

    // accessibility: toggle aria-expanded
    const expanded = hamburger.getAttribute("aria-expanded") === "true" || false;
    hamburger.setAttribute("aria-expanded", !expanded);
  });
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
   fetch('/logout', { method: 'POST', credentials: 'include' });

    window.location.href = '../index.html';
}
