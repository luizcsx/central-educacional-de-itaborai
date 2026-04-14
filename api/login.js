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

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ ok: false, message: 'E-mail e senha são obrigatórios.' });
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('nome, username, email, senha_hash, escola')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !usuario) {
    return res.status(401).json({ ok: false, message: 'E-mail ou senha incorretos.' });
  }

  const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

  if (!senhaCorreta) {
    return res.status(401).json({ ok: false, message: 'E-mail ou senha incorretos.' });
  }

  return res.status(200).json({
    ok: true,
    usuario: {
      nome:     usuario.nome,
      username: usuario.username,
      escola:   usuario.escola ?? 'Não informada',
    }
  });
}
