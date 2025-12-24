import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/layout/Screen';
import { colors, spacing } from '../../../src/theme/colors';
import { Button } from '../../../src/components/ui/Button';
import { useAuth } from '../../../src/store/auth';

export default function ProfilScreen() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>
          Informasi akun siswa, progres belajar, dan pengaturan akun.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Akun</Text>
        <Text style={styles.cardTextLabel}>Email</Text>
        <Text style={styles.cardTextValue}>{user?.email ?? '-'} </Text>
      </View>
      <View style={[styles.card, styles.logoutCard]}>
        <Text style={styles.cardTitle}>Keluar</Text>
        <Text style={styles.cardText}>
          Tekan tombol di bawah ini untuk keluar dari akun dan kembali ke halaman masuk.
        </Text>
        <Button title="Keluar" onPress={handleLogout} />
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
    marginBottom: spacing.md,
  },
  logoutCard: {
    borderColor: colors.errorSoft,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  cardTextLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardTextValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
});
