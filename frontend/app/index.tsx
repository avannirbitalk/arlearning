import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Secara default, arahkan ke tab utama aplikasi (Beranda)
  return <Redirect href="/(app)/home" />;
}
