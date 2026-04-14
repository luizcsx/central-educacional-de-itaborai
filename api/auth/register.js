import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ ok: false, message: 'Método não permitido' });

  const { nome, username, email, senha, data_nascimento, escola } = req.body;

  if (!nome || !username || !email || !senha)
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios faltando.' });

  const senha_hash = await bcrypt.hash(senha, 12);

  const { error } = await supabase.from('usuarios').insert({
    nome, username, email, senha_hash,
    data_nascimento: data_nascimento || null,
    escola: escola || null,
    provider: 'email'
  });

  if (error) {
    const msg = error.message.includes('unique')
      ? 'E-mail ou nome de usuário já cadastrado.'
      : 'Erro ao criar conta.';
    return res.status(400).json({ ok: false, message: msg });
  }

  return res.status(200).json({ ok: true, redirect: '/index.html' });
}
