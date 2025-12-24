import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { Screen } from '../../../src/components/layout/Screen';
import { colors, spacing } from '../../../src/theme/colors';

const backendBase = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Course {
  id: string;
  title: string;
  description?: string | null;
}

export default function MateriListScreen() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      if (!backendBase) {
        setError('Konfigurasi backend tidak tersedia.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${backendBase}/api/courses`);
        setCourses(res.data ?? []);
      } catch (e: any) {
        const msg = e?.response?.data?.detail || 'Gagal memuat daftar materi.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleOpenSample = () => {
    // Untuk tahap awal, kita bisa arahkan ke satu chapter contoh jika sudah ada ID-nya.
    // Nanti ini akan diganti dengan daftar bab per course.
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Materi</Text>
        <Text style={styles.subtitle}>
          Pilih materi pelajaran. Setelah dipilih, bab akan terbuka penuh seperti buku beserta kuis
          di bagian akhir.
        </Text>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Memuat materi...</Text>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {!loading && !error && courses.length === 0 && (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Belum ada materi</Text>
          <Text style={styles.placeholderText}>
            Tambahkan course dan bab melalui backend. Setiap bab dapat berisi teks, gambar
            (base64), model 3D, dan kuis.
          </Text>
        </View>
      )}

      {courses.map((course) => (
        <Pressable
          key={course.id}
          style={({ pressed }) => [styles.courseCard, pressed && { opacity: 0.8 }]}
          onPress={handleOpenSample}
        >
          <Text style={styles.courseTitle}>{course.title}</Text>
          {course.description ? (
            <Text style={styles.courseDesc}>{course.description}</Text>
          ) : null}
        </Pressable>
      ))}
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
  centered: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.error,
    marginBottom: spacing.sm,
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
  courseCard: {
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  courseDesc: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
