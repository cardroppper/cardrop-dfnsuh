
import { Redirect } from 'expo-router';

export default function AuthIndex() {
  console.log('AuthIndex: Redirecting to login');
  return <Redirect href="/(auth)/login" />;
}
