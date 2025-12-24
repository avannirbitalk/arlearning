import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/layout/Screen';
import { colors, spacing } from '../../../src/theme/colors';

export default function ProfilScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>
          Informasi akun siswa, progres belajar, dan pengaturan akan ditampilkan di sini.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status</Text>
        <Text style={styles.cardText}>Belum terhubung dengan Supabase Auth.</Text>
        <Text style={styles.cardText}>
          Pada tahap berikutnya, halaman ini akan menampilkan data pengguna dari Supabase serta
          progres belajar dari backend.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
});
