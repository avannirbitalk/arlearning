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
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Button } from '../../../src/components/ui/Button';
import { colors, spacing } from '../../../src/theme/colors';

const backendBase = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function RegisterVerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (!backendBase) {
      setError('Konfigurasi backend belum tersedia.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${backendBase}/api/auth/register/verify`, {
        email,
        code,
      });
      if (res.data?.valid) {
        router.push({ pathname: '/(auth)/register/password', params: { email } });
      } else {
        setError('Kode verifikasi tidak valid.');
      }
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Gagal memverifikasi kode.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const disabled = !code || loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Verifikasi Email</Text>
          <Text style={styles.subtitle}>
            Masukkan kode 6 digit yang kami kirim ke email {email}.
          </Text>

          <Text style={styles.label}>Kode Verifikasi</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Lanjutkan"
            onPress={handleVerify}
            disabled={disabled}
            loading={loading}
          />
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
