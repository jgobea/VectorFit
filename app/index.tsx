import { Redirect } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';

export default function Index() {
  const session = useAuthStore((s) => s.session);
  return <Redirect href={session ? '/(app)/dashboard' : '/(auth)/login'} />;
}
