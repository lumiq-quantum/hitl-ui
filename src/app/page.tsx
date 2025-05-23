import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/settings/channels');
  return null; // Or a loading spinner, but redirect is cleaner
}
