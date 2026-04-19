import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Método não permitido.' });
  }

  const { nome, username, email, senha, data_nascimento, escola } = req.body;

  if (!nome || !username || !email || !senha) {
    return res.status(400).json({ ok: false, message: 'Campos obrigatórios faltando.' });
  }

  try {
    const senha_hash = await bcrypt.hash(senha, 12);

    const { error } = await supabase.from('usuarios').insert({
      nome, 
      username, 
      email, 
      senha_hash,
      data_nascimento: data_nascimento || null,
      escola: escola || null,
      provider: 'email'
    });

    if (error) {
      console.log("Erro crítico:", JSON.stringify(error));
      
      let msg = 'Erro ao criar conta.';
      const errorString = JSON.stringify(error).toUpperCase();

      if (errorString.includes('USUARIO_BANIDO')) {
        msg = 'Este e-mail está permanentemente banido da plataforma por violação das regras.';
        return res.status(403).json({ ok: false, message: msg });
      }

      if (errorString.includes('UNIQUE')) {
        msg = 'E-mail ou nome de usuário já cadastrado.';
      }

      return res.status(400).json({ ok: false, message: msg });
    }

    return res.status(200).json({ ok: true, redirect: '/entrar.html' });

  } catch (err) {
    console.error("Erro interno no servidor:", err);
    return res.status(500).json({ ok: false, message: 'Erro interno no servidor.' });
  }
}
