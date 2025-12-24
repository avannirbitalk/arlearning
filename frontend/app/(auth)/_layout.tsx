import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { fontSize: 18, fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Masuk' }} />
      <Stack.Screen name="register/email" options={{ title: 'Daftar - Email' }} />
      <Stack.Screen name="register/verify" options={{ title: 'Daftar - Verifikasi' }} />
      <Stack.Screen name="register/password" options={{ title: 'Daftar - Password' }} />
    </Stack>
  );
}
