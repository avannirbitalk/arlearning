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
import { supabase } from '../../../src/lib/supabaseClient';
import { Button } from '../../../src/components/ui/Button';
import { colors, spacing } from '../../../src/theme/colors';

export default function RegisterPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAccount = async () => {
    if (!email) {
      setError('Email tidak ditemukan. Silakan mulai ulang pendaftaran.');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }
    if (password !== confirm) {
      setError('Konfirmasi password tidak sama.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: String(email),
        password,
      });
      if (signUpError) {
        setError(signUpError.message ?? 'Gagal membuat akun.');
      } else {
        router.replace('/(app)/home');
      }
    } catch (e) {
      setError('Terjadi kesalahan saat membuat akun.');
    } finally {
      setLoading(false);
    }
  };

  const disabled = !password || !confirm || loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.title}>Buat Password</Text>
          <Text style={styles.subtitle}>Buat password untuk akun {email}.</Text>

          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Minimal 6 karakter"
            secureTextEntry
            style={styles.input}
          />

          <Text style={styles.label}>Konfirmasi Password</Text>
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Ulangi password"
            secureTextEntry
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Buat Akun"
            onPress={handleCreateAccount}
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
