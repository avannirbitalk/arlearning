import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Screen } from '../../../src/components/layout/Screen';
import { colors, spacing } from '../../../src/theme/colors';
import { Button } from '../../../src/components/ui/Button';

const backendBase = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Section {
  type: 'text' | 'image' | '3d' | 'quiz';
  content?: string | null;
  glb_id?: string | null;
  quiz_id?: string | null;
}

interface ChapterResponse {
  id: string;
  course_id: string;
  title: string;
  order: number;
  sections: Section[];
}

interface QuizOption {
  key: string;
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

interface QuizResponse {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export default function ChapterScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const [chapter, setChapter] = useState<ChapterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChapter = async () => {
      if (!backendBase || !chapterId) {
        setError('Konfigurasi backend atau ID bab tidak tersedia.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${backendBase}/api/chapters/${chapterId}`);
        setChapter(res.data);
      } catch (e: any) {
        const msg = e?.response?.data?.detail || 'Gagal memuat bab.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Memuat bab...</Text>
        </View>
      </Screen>
    );
  }

  if (error || !chapter) {
    return (
      <Screen scroll={false}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Bab tidak ditemukan.'}</Text>
        </View>
      </Screen>
    );
  }

  const renderSection = (section: Section, index: number) => {
    if (section.type === 'text') {
      return (
        <View key={index} style={styles.textSection}>
          <Text style={styles.textContent}>{section.content}</Text>
        </View>
      );
    }

    if (section.type === 'image' && section.content) {
      return (
        <View key={index} style={styles.imageSection}>
          <Image source={{ uri: section.content }} style={styles.image} />
        </View>
      );
    }

    if (section.type === '3d') {
      return (
        <View key={index} style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Model 3D</Text>
          <Text style={styles.sectionSubtitle}>
            Objek 3D akan tampil di sini. Tahap berikutnya akan diisi viewer GLB dan mode AR.
          </Text>
        </View>
      );
    }

    if (section.type === 'quiz' && section.quiz_id) {
      return (
        <View key={index} style={styles.cardSection}>
          <QuizBlock quizId={section.quiz_id} />
        </View>
      );
    }

    return null;
  };

  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{chapter.title}</Text>
        {chapter.sections.map(renderSection)}
      </ScrollView>
    </Screen>
  );
}

interface QuizBlockProps {
  quizId: string;
}

const QuizBlock: React.FC<QuizBlockProps> = ({ quizId }) => {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; correct_count: number; total: number } | null>(
    null,
  );

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!backendBase) {
        setError('Konfigurasi backend tidak tersedia.');
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${backendBase}/api/quizzes/${quizId}`);
        setQuiz(res.data);
      } catch (e: any) {
        const msg = e?.response?.data?.detail || 'Gagal memuat kuis.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const toggleChoice = (questionId: string, choiceKey: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceKey }));
  };

  const handleSubmit = async () => {
    if (!backendBase || !quiz) return;

    try {
      const payload = {
        answers: quiz.questions.map((q) => ({
          question_id: q.id,
          choice_key: answers[q.id] ?? '',
        })),
      };
      const res = await axios.post(`${backendBase}/api/quizzes/${quiz.id}/attempts`, payload);
      setResult(res.data);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || 'Gagal mengirim jawaban.';
      setError(msg);
    }
  };

  if (loading) {
    return (
      <View style={styles.quizContainer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Memuat kuis...</Text>
      </View>
    );
  }

  if (error || !quiz) {
    return (
      <View style={styles.quizContainer}>
        <Text style={styles.errorText}>{error || 'Kuis tidak ditemukan.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.quizContainer}>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      {quiz.questions.map((q) => (
        <View key={q.id} style={styles.questionBlock}>
          <Text style={styles.questionText}>{q.question}</Text>
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt.key;
            return (
              <Button
                key={opt.key}
                title={`${opt.key}. ${opt.text}`}
                onPress={() => toggleChoice(q.id, opt.key)}
                variant={selected ? 'solid' : 'outline'}
                style={styles.choiceButton}
              />
            );
          })}
        </View>
      ))}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Button title="Kirim Jawaban" onPress={handleSubmit} style={styles.submitButton} />

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Hasil</Text>
          <Text style={styles.resultText}>Skor: {result.score}</Text>
          <Text style={styles.resultText}>
            Benar {result.correct_count} dari {result.total} soal
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textMuted,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  textSection: {
    marginBottom: spacing.md,
  },
  textContent: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  imageSection: {
    marginBottom: spacing.lg,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.backgroundSoft,
  },
  cardSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
  quizContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    backgroundColor: colors.card,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
    color: colors.text,
  },
  questionBlock: {
    marginBottom: spacing.md,
  },
  questionText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: spacing.sm,
    color: colors.text,
  },
  choiceButton: {
    marginBottom: spacing.xs,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  resultBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.backgroundSoft,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  resultText: {
    fontSize: 14,
    color: colors.text,
  },
});
