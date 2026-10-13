import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useStudents } from '@/features/students/student-store';
import { useTranslations } from '@/features/students/translations';
import type { Student } from '@/features/students/types';
import type { ComponentProps } from 'react';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

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

export default function StudentFormScreen() {
  const { id: routeId } = useLocalSearchParams<{ id?: string | string[] }>();
  const { students, loading } = useStudents();
  const { t } = useTranslations();
  const studentId = Array.isArray(routeId) ? routeId[0] : routeId;
  const existingStudent = students.find((student) => student.id === studentId);
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  if (studentId && !existingStudent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <Text style={styles.notFound}>{t('notFound')}</Text>
          <Pressable onPress={() => router.replace('/')} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{t('back')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  return <StudentEditor key={studentId ?? 'new'} existingStudent={existingStudent} />;
}

function StudentEditor({ existingStudent }: { existingStudent?: Student }) {
  const { students, saveStudent } = useStudents();
  const { t } = useTranslations();
  const studentId = existingStudent?.id;
  const isEditing = Boolean(existingStudent);
  const [fullName, setFullName] = useState(existingStudent?.fullName ?? '');
  const [studentNumber, setStudentNumber] = useState(existingStudent?.studentId ?? '');
  const [email, setEmail] = useState(existingStudent?.email ?? '');
  const [avatar, setAvatar] = useState(existingStudent?.avatar ?? '');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const normalizedStudentNumber = studentNumber.trim().toLocaleLowerCase();
  const hasDuplicateStudentNumber = useMemo(
    () =>
      students.some(
        (student) =>
          student.id !== studentId &&
          student.studentId.trim().toLocaleLowerCase() === normalizedStudentNumber,
      ),
    [normalizedStudentNumber, studentId, students],
  );

  const choosePhoto = async () => {
    setPhotoBusy(true);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setDialog({ title: t('avatar'), message: t('photoPermission'), confirmLabel: t('okay') });
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.72,
        base64: Platform.OS === 'web',
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (Platform.OS === 'web' && asset.base64) {
          setAvatar(`data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}`);
        } else {
          setAvatar(asset.uri);
        }
      }
    } catch (error) {
      console.error('Failed to choose a student photo:', error);
      setDialog({ title: t('avatar'), message: t('photoError'), confirmLabel: t('okay') });
    } finally {
      setPhotoBusy(false);
    }
  };

  const persistAvatar = async (uri: string) => {
    if (
      Platform.OS === 'web' ||
      !uri.startsWith('file://') ||
      uri.startsWith(Paths.document.uri)
    ) {
      return uri;
    }

    const source = new File(uri);
    const extension = source.name.match(/\.[a-zA-Z0-9]+$/)?.[0] ?? '.jpg';
    const destination = new File(
      Paths.document,
      `student-avatar-${Date.now()}-${Math.random().toString(36).slice(2, 7)}${extension}`,
    );
    await source.copy(destination);
    return destination.uri;
  };

  const storeStudent = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const savedAvatar = await persistAvatar(avatar.trim());
      const student: Student = {
        id: existingStudent?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        fullName: fullName.trim(),
        studentId: studentNumber.trim(),
        email: email.trim(),
        avatar: savedAvatar,
      };
      await saveStudent(student);
      router.replace({ pathname: '/student/[id]', params: { id: student.id } });
    } catch (error) {
      console.error('Failed to save student:', error);
      setDialog({ title: t('appName'), message: t('saveError'), confirmLabel: t('okay') });
    } finally {
      setSaving(false);
    }
  };

  const submit = () => {
    if (!fullName.trim() || !studentNumber.trim() || !email.trim()) {
      setDialog({ title: t('appName'), message: t('requiredFields'), confirmLabel: t('okay') });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setDialog({ title: t('appName'), message: t('invalidEmail'), confirmLabel: t('okay') });
      return;
    }
    if (hasDuplicateStudentNumber) {
      setDialog({ title: t('appName'), message: t('duplicateStudentId'), confirmLabel: t('okay') });
      return;
    }
    if (isEditing) {
      setDialog({
        title: t('confirmEditTitle'),
        message: t('confirmEdit'),
        cancelLabel: t('no'),
        confirmLabel: t('yes'),
        onConfirm: () => void storeStudent(),
      });
    } else {
      void storeStudent();
    }
  };

  const headerTitle = isEditing ? t('editTitle') : t('createTitle');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <Text style={styles.headerTitle}>{headerTitle}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.title}>{headerTitle}</Text>
          <Text style={styles.subtitle}>{t('formHint')}</Text>

          <View style={styles.photoArea}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('choosePhoto')}
              onPress={() => void choosePhoto()}
              disabled={photoBusy}
              style={styles.photoPicker}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  {photoBusy ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text style={styles.photoPlus}>＋</Text>
                  )}
                </View>
              )}
              <View style={styles.cameraBadge}>
                <Text style={styles.cameraBadgeText}>↥</Text>
              </View>
            </Pressable>
            <Text style={styles.photoLabel}>{t('avatar')}</Text>
            <Text style={styles.photoHint}>{t('avatarHint')}</Text>
            {avatar ? (
              <Pressable onPress={() => setAvatar('')} style={styles.removePhotoButton}>
                <Text style={styles.removePhotoText}>{t('removePhoto')}</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.fields}>
            <FormField
              label={t('fullName')}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('fullNamePlaceholder')}
              autoCapitalize="words"
              returnKeyType="next"
            />
            <FormField
              label={t('studentIdLabel')}
              value={studentNumber}
              onChangeText={setStudentNumber}
              placeholder={t('studentIdPlaceholder')}
              autoCapitalize="characters"
              returnKeyType="next"
            />
            <FormField
              label={t('email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>{t('photoLink')}</Text>
              <TextInput
                value={avatar.startsWith('data:') || avatar.startsWith('file:') ? '' : avatar}
                onChangeText={setAvatar}
                placeholder={t('photoLinkPlaceholder')}
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={saving || photoBusy}
            onPress={submit}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, (saving || photoBusy) && styles.disabled]}>
            {saving ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{t('save')}</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
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

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  ...inputProps
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
} & Omit<ComponentProps<typeof TextInput>, 'style' | 'value' | 'onChangeText' | 'placeholder'>) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  page: { paddingHorizontal: 22, paddingBottom: 32 },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  backButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backArrow: { color: colors.ink, fontSize: 31, lineHeight: 34, marginTop: -4 },
  headerTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  headerSpacer: { width: 42 },
  title: { color: colors.ink, fontSize: 25, fontWeight: '800' },
  subtitle: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  photoArea: { alignItems: 'center', marginTop: 22, marginBottom: 19 },
  photoPicker: { position: 'relative' },
  photo: { width: 104, height: 104, borderRadius: 33, backgroundColor: '#E8EDFF' },
  photoPlaceholder: { width: 104, height: 104, borderRadius: 33, backgroundColor: '#E8EDFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#D9E1FF', borderStyle: 'dashed' },
  photoPlus: { color: colors.primary, fontSize: 37, fontWeight: '300', lineHeight: 43 },
  cameraBadge: { position: 'absolute', right: -5, bottom: -4, width: 32, height: 32, borderRadius: 12, backgroundColor: colors.primary, borderWidth: 3, borderColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  cameraBadgeText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', lineHeight: 20 },
  photoLabel: { color: colors.ink, fontSize: 14, fontWeight: '700', marginTop: 12 },
  photoHint: { color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 4 },
  removePhotoButton: { paddingVertical: 7, paddingHorizontal: 12 },
  removePhotoText: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  fields: { gap: 15 },
  field: { gap: 7 },
  fieldLabel: { color: colors.ink, fontSize: 12, fontWeight: '700' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.card, color: colors.ink, paddingHorizontal: 14, fontSize: 14 },
  saveButton: { minHeight: 53, backgroundColor: colors.primary, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFound: { color: colors.ink, fontSize: 14 },
});
