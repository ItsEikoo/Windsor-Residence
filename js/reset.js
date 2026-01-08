import { supabase } from '../serverClient.js';

// ---------- Fix for GitHub Pages hash links ----------
if (window.location.hash.includes("access_token")) {
  const newUrl = window.location.href
    .replace("#access_token", "?access_token")
    .replace("&token_type", "&token_type")
    .replace("&expires_in", "&expires_in")
    .replace("&refresh_token", "&refresh_token")
    .replace("&type=recovery", "&type=recovery");
  window.history.replaceState({}, document.title, newUrl);
}

// ---------- Detect environment for redirect after reset ----------
const redirectAfterReset =
  window.location.origin.includes('127.0.0.1') || window.location.origin.includes('localhost')
    ? 'http://127.0.0.1:5502/index.html' // Localhost
    : 'https://rayys-dev.github.io/lh-resort/index.html'; // GitHub Pages

// ---------- DOM elements ----------
const statusMessage = document.getElementById('statusMessage');
const resetForm = document.getElementById('resetForm');
const noSession = document.getElementById('noSession');
const resetBtn = document.getElementById('resetBtn');
const feedback = document.getElementById('formFeedback');
const backHomeLink = document.getElementById('backHomeLink');

backHomeLink?.addEventListener('click', () => {
  window.location.href = redirectAfterReset;
});

// ---------- Step 1: Check recovery session ----------
async function checkSession() {
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

    if (error) throw error;

    statusMessage.style.display = 'none';
    resetForm.style.display = 'block';
  } catch (err) {
    console.error('Recovery session error:', err);
    statusMessage.style.display = 'none';
    noSession.style.display = 'block';
  }
}

// ---------- Step 2: Handle password reset ----------
resetBtn.addEventListener('click', async () => {
  const newPass = document.getElementById('newPassword').value.trim();
  const confirmPass = document.getElementById('confirmPassword').value.trim();

  if (newPass.length < 8) {
    feedback.textContent = 'Password must be at least 8 characters long.';
    feedback.style.color = 'red';
    return;
  }

  if (newPass !== confirmPass) {
    feedback.textContent = 'Passwords do not match.';
    feedback.style.color = 'red';
    return;
  }

  resetBtn.disabled = true;
  resetBtn.textContent = 'Updating...';

  const { error } = await supabase.auth.updateUser({ password: newPass });

  if (error) {
    feedback.textContent = error.message;
    feedback.style.color = 'red';
    resetBtn.disabled = false;
    resetBtn.textContent = 'Set new password';
  } else {
    feedback.textContent = 'Password updated successfully! Redirecting...';
    feedback.style.color = 'green';

    setTimeout(() => {
      window.location.href = redirectAfterReset;
    }, 1200);
  }
});

// ---------- Run check immediately ----------
checkSession();
