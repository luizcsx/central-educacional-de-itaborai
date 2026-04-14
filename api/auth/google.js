export default function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const siteUrl = process.env.SITE_URL || 'https://centro-educacional-de-itaborai.vercel.app';
  
  const loginUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${siteUrl}/dashboard2f.html`;
  
  return res.redirect(302, loginUrl);
}
