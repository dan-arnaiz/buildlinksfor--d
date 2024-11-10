
import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect immediately to the /dashboard route
  redirect('/dashboard');
}