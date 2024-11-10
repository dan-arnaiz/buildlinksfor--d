import { supabaseClient } from '../lib/Supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const { user, session, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ message: 'Signed in successfully', user, session });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
