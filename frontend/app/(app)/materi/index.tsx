import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/layout/Screen';
import { colors, spacing } from '../../../src/theme/colors';

export default function MateriListScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Materi</Text>
        <Text style={styles.subtitle}>
          Daftar bab pelajaran akan tampil di sini dan dibuka seperti buku untuk siswa.
        </Text>
      </View>
      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Belum ada materi</Text>
        <Text style={styles.placeholderText}>
          Pada tahap berikutnya, materi akan diambil dari backend dan ditampilkan penuh seperti
          halaman buku beserta kuis.
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
  placeholderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
