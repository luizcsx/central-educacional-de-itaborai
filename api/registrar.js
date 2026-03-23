import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido.' });
  }

  const { perfil, nome, genero, email, nascimento, senha } = request.body;

  if (!perfil || !nome || !email || !senha) {
    return response.status(400).json({ error: 'Campos obrigatórios ausentes.' });
  }

  try {
    await sql`
      INSERT INTO usuarios (perfil, nome, genero, email, nascimento, senha)
      VALUES (${perfil}, ${nome}, ${genero}, ${email}, ${nascimento}, ${senha});
    `;

    return response.status(200).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    if (error.code === '23505') {
      return response.status(400).json({ error: 'Este e-mail já está cadastrado.' });
    }
    return response.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
