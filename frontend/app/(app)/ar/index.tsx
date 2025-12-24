import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../../src/components/layout/Screen';
import { Button } from '../../../src/components/ui/Button';
import { colors, spacing } from '../../../src/theme/colors';

export default function ARScreen() {
  // Tahap berikutnya: integrasi expo-barcode-scanner dan viewer 3D di atas kamera
  const handleScanPress = () => {
    // Akan diisi dengan navigasi ke layar pemindai barcode
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Mode AR</Text>
        <Text style={styles.subtitle}>
          Scan barcode pada buku untuk menampilkan objek 3D di atas tampilan kamera.
        </Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Siap untuk scan?</Text>
        <Text style={styles.cardText}>
          Tekan tombol di bawah ini untuk membuka kamera dan mulai memindai barcode.
        </Text>
        <Button title="Scan Barcode" onPress={handleScanPress} style={styles.button} />
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
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.sm,
  },
});
