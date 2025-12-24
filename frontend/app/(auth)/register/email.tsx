import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { Button } from '../../../src/components/ui/Button';
import { colors, spacing } from '../../../src/theme/colors';

const backendBase = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function RegisterEmailScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!backendBase) {
      setError('Konfigurasi backend belum tersedia.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${backendBase}/api/auth/register/request`, { email });
      router.push({ pathname: '/(auth)/register/verify', params: { email } });
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Gagal mengirim kode verifikasi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const disabled = !email || loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Daftar</Text>
          <Text style={styles.subtitle}>
            Masukkan email aktif. Kami akan mengirim kode verifikasi ke email Anda.
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@contoh.com"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Kirim Kode" onPress={handleSubmit} disabled={disabled} loading={loading} />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
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
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    backgroundColor: '#fff',
  },
  error: {
    color: colors.error,
    marginBottom: spacing.sm,
  },
});
