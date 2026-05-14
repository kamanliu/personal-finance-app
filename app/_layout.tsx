import { Stack, useRouter } from "expo-router";
import { useEffect } from 'react';
import { AccountProvider } from "../context/AccountContext";
import { AuthProvider, useAuth } from '../context/AuthContext';


function RootNavigation() {
  const router = useRouter();
  const { user, loading } = useAuth();
  useEffect(() => {

    if (loading) {
      return;
    }
    if (!user) {
      router.replace('/Login');
    }
    else {
      router.replace('/(tabs)');
    }
  }, [user, loading])
  if (loading) return null;
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 2. Each screen must have its own tag */}
      <Stack.Screen name="Login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
export default function RootLayout() {

  return (
    <AuthProvider>
      <AccountProvider>
        <RootNavigation />
      </AccountProvider>
    </AuthProvider>

  );
}



