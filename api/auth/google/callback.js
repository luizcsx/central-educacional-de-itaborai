import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export default async function handler(req, res) {
  const { code } = req.query;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.BASE_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code'
    })
  });
  const { access_token } = await tokenRes.json();

  const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${access_token}` }
  });
  const profile = await profileRes.json();

  const { data: user } = await supabase
    .from('usuarios')
    .upsert({ email: profile.email, nome: profile.name, provider: 'google', provider_id: profile.id },
             { onConflict: 'email' })
    .select().single();

  const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.setHeader('Set-Cookie', `cei_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);
  res.redirect('/dashboard.html');
}
