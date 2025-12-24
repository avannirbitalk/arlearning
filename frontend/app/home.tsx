import React from 'react';
import { Redirect } from 'expo-router';

// Alias route untuk /home agar mengarah ke grup (app)
export default function HomeAlias() {
  return <Redirect href="/(app)/home" />;
}
