import { supabaseClient } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password, name } = req.body;

    const { user, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // You can also insert additional user data into your custom users table
    const { data, error: insertError } = await supabaseClient
      .from('Users')
      .insert([{ id: user.id, email, name }]);

    if (insertError) {
      return res.status(400).json({ error: insertError.message });
    }

    return res.status(200).json({ message: 'User created successfully', user });
  }

  res.status(405).json({ error: 'Method Not Allowed' });
}
