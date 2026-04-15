import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { code } = req.query;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID, client_secret: process.env.GITHUB_CLIENT_SECRET, code })
  });
  const { access_token } = await tokenRes.json();

  const profileRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const profile = await profileRes.json();

  const emailRes = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const emails = await emailRes.json();
  const primaryEmail = emails.find(e => e.primary)?.email;

  const { data: user } = await supabase
    .from('usuarios')
    .upsert({ email: primaryEmail, nome: profile.name || profile.login,
              username: profile.login, provider: 'github', provider_id: String(profile.id) },
             { onConflict: 'email' })
    .select().single();

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', `cei_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);
  res.redirect('/index.html');
}
