import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // Root akan diarahkan oleh RootLayout berdasarkan status login,
  // tapi untuk keamanan kita arahkan ke login terlebih dahulu.
  return <Redirect href="/(auth)/login" />;
}
