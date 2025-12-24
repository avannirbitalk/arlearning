import React from 'react';
import { Redirect } from 'expo-router';

// Alias route untuk /auth/login agar mengarah ke grup (auth)
export default function AuthLoginAlias() {
  return <Redirect href="/(auth)/login" />;
}
