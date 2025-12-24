import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../src/theme/colors';

// Untuk sementara, kita tampilkan halaman sederhana di root ('/') tanpa redirect
// supaya tidak terjadi Unmatched Route di web/Expo Go.
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>E-Learning AR</Text>
      <Text style={styles.subtitle}>
        Versi mobile sedang dalam pengembangan. Gunakan menu tab di bawah (jika tampil) atau
        akses fitur melalui rute lain.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
