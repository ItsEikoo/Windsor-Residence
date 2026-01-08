import { supabase } from '../serverClient.js';
import { requireAuth } from '../protect.js';

const urlParams = new URLSearchParams(window.location.search);
const otherUserId = urlParams.get('user');
const otherUserName = urlParams.get('name');
let currentUser = null;
let chatSecret = null; 

(async () => {
  currentUser = await requireAuth();

  
  chatSecret = CryptoJS.SHA256(
    [currentUser.id, otherUserId].sort().join("-")
  ).toString();

  document.getElementById('chat-with').textContent = `Chat with ${otherUserName}`;
  await loadChat();
  subscribeChat();

  document.getElementById('chat-message').focus();
})();

async function loadChat() {
  const { data, error } = await supabase
    .from('private_messages')
    .select(`
      id,
      content,
      created_at,
      sender_id,
      receiver_id,
      sender_profile:sender_id ( username )
    `)
    .or(
      `and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),` +
      `and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`
    )
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Chat load error:', error.message);
    return;
  }

  const box = document.getElementById('chat-box');
  box.innerHTML = '';

  data.forEach(msg => appendMessage(msg));
  box.scrollTop = box.scrollHeight;
}

function appendMessage(msg) {
  const box = document.getElementById('chat-box');
  const isMine = msg.sender_id === currentUser.id;
  const name = isMine ? 'Me' : msg.sender_profile?.username || 'User';

  let text;
  if (msg._plaintext) {
    // Optimistic local message (we already know plaintext)
    text = msg._plaintext;
  } else {
    try {
      const bytes = CryptoJS.AES.decrypt(msg.content, chatSecret);
      text = bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      text = "[Failed to decrypt]";
    }
  }

  const div = document.createElement('div');
  div.className = isMine ? 'message sent' : 'message received';
  div.innerHTML = `<b>${name}:</b> ${text}`;
  box.appendChild(div);
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

async function sendMessage() {
  const input = document.getElementById('chat-message');
  const content = input.value.trim();
  if (!content) return;

  input.disabled = true;

  // Encrypt before storing
  const ciphertext = CryptoJS.AES.encrypt(content, chatSecret).toString();

  // Optimistically show plaintext message instantly
  appendMessage({
    sender_id: currentUser.id,
    sender_profile: { username: currentUser.username || "Me" },
    content: ciphertext,
    _plaintext: content
  });

  const { error } = await supabase
    .from('private_messages')
    .insert([{
      content: ciphertext,
      sender_id: currentUser.id,
      receiver_id: otherUserId
    }]);

  if (error) {
    console.error('Failed to send:', error.message);
    alert('Failed to send message. Please try again.');
  } else {
    input.value = '';
    const box = document.getElementById('chat-box');
    box.scrollTop = box.scrollHeight;
  }

  input.disabled = false;
  input.focus();
}

async function subscribeChat() {
  const channel = supabase
    .channel('private_messages_channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'private_messages',
      },
      async (payload) => {
        console.log("Realtime payload:", payload);

        const msg = payload.new;

        // Only process if it's from the other user
        if (msg.sender_id !== currentUser.id) {
          const { data } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', msg.sender_id)
            .single();

          if (data) {
            msg.sender_profile = { username: data.username };
          }

          appendMessage(msg);

          const box = document.getElementById('chat-box');
          box.scrollTop = box.scrollHeight;
        }
      }
    )
    .subscribe();

  window.addEventListener('beforeunload', () => {
    supabase.removeChannel(channel);
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


window.handleKeyPress = handleKeyPress;
window.sendMessage = sendMessage;
