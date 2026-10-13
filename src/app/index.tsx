import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStudents } from '@/features/students/student-store';
import { useTranslations } from '@/features/students/translations';
import type { Student } from '@/features/students/types';

const colors = {
  background: '#F4F7FB',
  card: '#FFFFFF',
  ink: '#14213D',
  muted: '#75819A',
  primary: '#3457D5',
  border: '#E5EAF2',
};

export default function StudentListScreen() {
  const { students, loading, error, reload } = useStudents();
  const { t } = useTranslations();

  const renderStudent = ({ item }: { item: Student }) => (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/student/[id]', params: { id: item.id } })}
      style={({ pressed }) => [styles.studentCard, pressed && styles.pressed]}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <TextLabel style={styles.avatarInitial}>
            {item.fullName.trim().charAt(0).toLocaleUpperCase()}
          </TextLabel>
        </View>
      )}
      <View style={styles.studentInfo}>
        <View style={styles.studentTopLine}>
          <View style={styles.studentNameBlock}>
            <TextLabel style={styles.studentName}>{item.fullName}</TextLabel>
            <TextLabel style={styles.studentId}>{t('studentNumber')}: {item.studentId}</TextLabel>
          </View>
          <TextLabel style={styles.chevron}>›</TextLabel>
        </View>
        <TextLabel style={styles.email} numberOfLines={1}>{item.email}</TextLabel>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <View style={styles.header}>
          <View>
            <TextLabel style={styles.eyebrow}>{t('directory')}</TextLabel>
            <TextLabel style={styles.title}>{t('appName')}</TextLabel>
          </View>
        </View>

        <View style={styles.summary}>
          <View>
            <TextLabel style={styles.summaryLabel}>{t('totalStudents')}</TextLabel>
            <TextLabel style={styles.summaryCount}>{students.length}</TextLabel>
          </View>
          <View style={styles.summaryIcon}>
            <TextLabel style={styles.summaryIconText}>✦</TextLabel>
          </View>
        </View>

        <View style={styles.listHeading}>
          <TextLabel style={styles.listTitle}>{t('studentList')}</TextLabel>
          <TextLabel style={styles.listCount}>{students.length}</TextLabel>
        </View>

        <View style={styles.listArea}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <TextLabel style={styles.emptyTitle}>{t('loadError')}</TextLabel>
            <Pressable onPress={reload} style={styles.retryButton}>
              <TextLabel style={styles.retryText}>{t('retry')}</TextLabel>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={students.length ? styles.listContent : styles.emptyList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <TextLabel style={styles.emptyIconText}>♙</TextLabel>
                </View>
                <TextLabel style={styles.emptyTitle}>{t('noStudents')}</TextLabel>
                <TextLabel style={styles.emptyDescription}>
                  {t('addFirstStudent')}
                </TextLabel>
              </View>
            }
          />
        )}
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/student-form')}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}>
          <TextLabel style={styles.addButtonText}>＋</TextLabel>
          <TextLabel style={styles.addButtonText}>{t('addStudent')}</TextLabel>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const TextLabel = Text;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  page: { flex: 1, paddingHorizontal: 22, paddingBottom: 10 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 20,
  },
  eyebrow: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { color: colors.ink, fontSize: 27, fontWeight: '800', marginTop: 3 },
  addButton: { minHeight: 54, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 8 },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  summary: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 19,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  summaryLabel: { color: '#DCE4FF', fontSize: 13, fontWeight: '600' },
  summaryCount: { color: '#FFFFFF', fontSize: 31, fontWeight: '800', marginTop: 2 },
  summaryIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFFFFF24', alignItems: 'center', justifyContent: 'center' },
  summaryIconText: { color: '#FFFFFF', fontSize: 23 },
  listHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 24, marginBottom: 12 },
  listTitle: { color: colors.ink, fontSize: 17, fontWeight: '800' },
  listCount: { color: colors.primary, backgroundColor: '#E8EDFF', overflow: 'hidden', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 2, fontSize: 12, fontWeight: '700' },
  listContent: { paddingBottom: 28, gap: 10 },
  emptyList: { flexGrow: 1, justifyContent: 'center', paddingBottom: 60 },
  listArea: { flex: 1 },
  studentCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 13 },
  avatar: { width: 55, height: 55, borderRadius: 17 },
  avatarPlaceholder: { backgroundColor: '#E8EDFF', alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: colors.primary, fontSize: 21, fontWeight: '800', textAlign: 'center' },
  studentInfo: { flex: 1 },
  studentTopLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  studentNameBlock: { flex: 1 },
  studentName: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  studentId: { color: colors.primary, fontSize: 12, fontWeight: '600', marginTop: 3 },
  chevron: { color: '#A8B1C3', fontSize: 26, marginLeft: 8 },
  email: { color: colors.muted, fontSize: 12, marginTop: 7 },
  centered: { flex: 1, justifyContent: 'center' },
  emptyState: { alignItems: 'center', paddingHorizontal: 25, paddingVertical: 26 },
  emptyIcon: { width: 62, height: 62, backgroundColor: '#E8EDFF', borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  emptyIconText: { color: colors.primary, fontSize: 31 },
  emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyDescription: { color: colors.muted, fontSize: 13, textAlign: 'center', marginTop: 7, lineHeight: 19 },
  retryButton: { marginTop: 16, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
