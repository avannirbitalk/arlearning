import React from 'react';
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import { AuthProvider, useAuth } from '../src/store/auth';

function RootStack() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Bisa diganti dengan splash/loading screen khusus
  }

  const initialRouteName = user ? '(app)' : '(auth)/login';

  return (
    <Stack
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootStack />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
