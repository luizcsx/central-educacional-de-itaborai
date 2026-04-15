import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  console.log("Tentativa de login para:", req.body.email);

  if (req.method !== 'POST') return res.status(405).end();

  const { email, senha } = req.body;

  const { data: user, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single();

  if (error) console.log("Erro ao buscar user:", error.message);

  if (!user || !user.senha_hash) {
    console.log("Login negado: Usuário não existe ou é conta Google (sem senha)");
    return res.status(401).json({ ok: false, message: 'Credenciais inválidas ou conta Google.' });
  }

  const ok = await bcrypt.compare(senha, user.senha_hash);
  if (!ok)
    return res.status(401).json({ ok: false, message: 'Credenciais inválidas.' });

const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

res.setHeader('Set-Cookie', `cei_token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`);
  
return res.status(200).json({ 
    ok: true, 
    redirect: '/dashboard.html',
    usuario: { 
        nome: user.nome, 
        username: user.username, 
        escola: user.escola 
    } 
});
