import React from 'react';
import { Redirect } from 'expo-router';

// Alias route untuk /login agar mengarah ke grup (auth)
export default function LoginAlias() {
  return <Redirect href="/(auth)/login" />;
}
