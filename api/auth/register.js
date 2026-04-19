import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });

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
    console.error("Erro crítico:", error);

    let msg = 'Erro ao criar conta.';
    
    if (error.message && error.message.includes('USUARIO_BANIDO')) {
      msg = 'Acesso Negado: Este e-mail foi banido por violação dos termos da plataforma.';
      return res.status(403).json({ ok: false, message: msg });
    } 
    
    if (error.message && error.message.includes('unique')) {
      msg = 'E-mail ou nome de usuário já cadastrado.';
    }

    return res.status(400).json({ ok: false, message: msg });
  }

  return res.status(200).json({ ok: true, redirect: '/entrar.html' });
  
