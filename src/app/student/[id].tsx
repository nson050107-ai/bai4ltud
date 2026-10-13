import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useStudents } from '@/features/students/student-store';
import { useTranslations } from '@/features/students/translations';

const colors = {
  background: '#F4F7FB',
  card: '#FFFFFF',
  ink: '#14213D',
  muted: '#75819A',
  primary: '#3457D5',
  border: '#E5EAF2',
  danger: '#C64040',
};

type DialogState = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
};

export default function StudentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { students, deleteStudent } = useStudents();
  const { t } = useTranslations();
  const [deleting, setDeleting] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const student = students.find((item) => item.id === id);

  const confirmDelete = () => {
    if (!student || deleting) return;
    setDialog({
      title: t('confirmDeleteTitle'),
      message: t('confirmDelete'),
      cancelLabel: t('no'),
      confirmLabel: t('yes'),
      destructive: true,
      onConfirm: () => {
          setDeleting(true);
          void deleteStudent(student.id)
            .then(() => router.replace('/'))
            .catch((error: unknown) => {
              console.error('Failed to delete student:', error);
              setDialog({
                title: t('confirmDeleteTitle'),
                message: t('deleteError'),
                confirmLabel: t('okay'),
              });
            })
            .finally(() => setDeleting(false));
      },
    });
  };

  if (!student) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('notFound')}</Text>
          <Pressable onPress={() => router.replace('/')} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{t('back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.headerTitle}>{t('studentDetails')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.profileCard}>
          {student.avatar ? (
            <Image source={{ uri: student.avatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{student.fullName.charAt(0).toLocaleUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{student.fullName}</Text>
          <Text style={styles.studentId}>{t('studentNumber')}: {student.studentId}</Text>
        </View>

        <Text style={styles.sectionTitle}>{t('studentDetails')}</Text>
        <View style={styles.detailsCard}>
          <DetailRow label={t('nameField')} value={student.fullName} />
          <View style={styles.divider} />
          <DetailRow label={t('idField')} value={student.studentId} />
          <View style={styles.divider} />
          <DetailRow label={t('emailField')} value={student.email} />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/student-form', params: { id: student.id } })}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
            <Text style={styles.primaryButtonText}>{t('editStudent')}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={deleting}
            onPress={confirmDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
            <Text style={styles.deleteButtonText}>{t('deleteStudent')}</Text>
          </Pressable>
        </View>
      </ScrollView>
      <ConfirmationDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message ?? ''}
        cancelLabel={dialog?.cancelLabel}
        confirmLabel={dialog?.confirmLabel ?? t('okay')}
        destructive={dialog?.destructive}
        onConfirm={dialog?.onConfirm ?? (() => {})}
        onDismiss={() => setDialog(null)}
      />
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  page: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 30 },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: colors.ink, fontSize: 31, lineHeight: 34, marginTop: -4 },
  headerTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 42 },
  profileCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 23, alignItems: 'center', paddingVertical: 26, paddingHorizontal: 20 },
  avatar: { width: 108, height: 108, borderRadius: 34 },
  avatarPlaceholder: { backgroundColor: '#E8EDFF', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.primary, fontSize: 43, fontWeight: '800' },
  name: { color: colors.ink, fontSize: 21, fontWeight: '800', textAlign: 'center', marginTop: 17 },
  studentId: { color: colors.primary, fontSize: 13, fontWeight: '600', marginTop: 7 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 25, marginBottom: 12 },
  detailsCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingHorizontal: 17 },
  detailRow: { paddingVertical: 16, gap: 6 },
  detailLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  detailValue: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: colors.border },
  actions: { gap: 10, marginTop: 22 },
  primaryButton: { minHeight: 52, backgroundColor: colors.primary, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  deleteButton: { minHeight: 50, backgroundColor: '#FFF1F1', borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  deleteButtonText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 18, padding: 24 },
  notFoundText: { color: colors.ink, fontSize: 16, textAlign: 'center' },
});
