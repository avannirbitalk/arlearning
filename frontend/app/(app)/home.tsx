import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { Screen } from '../../src/components/layout/Screen';
import { colors, spacing } from '../../src/theme/colors';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>E-Learning AR</Text>
        <Text style={styles.subtitle}>
          Belajar interaktif dengan materi seperti buku, 3D model, dan Augmented Reality.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mulai dari menu Materi</Text>
        <Text style={styles.cardText}>
          Pilih bab pelajaran, baca materi yang tersusun rapi, lalu kerjakan kuis di akhir.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mode AR Berbasis Barcode</Text>
        <Text style={styles.cardText}>
          Scan barcode pada buku atau lembar kerja untuk menampilkan objek 3D di atas kamera.
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
    fontSize: 24,
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
    marginBottom: spacing.md,
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
  },
});
