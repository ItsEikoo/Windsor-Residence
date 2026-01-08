import { supabase } from './serverClient.js';
export async function requireAuth() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    window.location.href = 'index.html';
    throw new Error('Not authenticated');
  }
  return data.user;
}
