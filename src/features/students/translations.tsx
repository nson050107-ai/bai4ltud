import { getLocales } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { AppState } from 'react-native';

const vi = {
  appName: 'Quản lý sinh viên',
  directory: 'HỌC TẬP',
  totalStudents: 'Tổng số sinh viên',
  studentList: 'Danh sách sinh viên',
  studentNumber: 'Mã số SV',
  noStudents: 'Chưa có sinh viên nào',
  addFirstStudent: 'Thêm sinh viên đầu tiên để bắt đầu quản lý danh sách.',
  addStudent: 'Thêm sinh viên',
  studentDetails: 'Thông tin sinh viên',
  editStudent: 'Sửa thông tin',
  deleteStudent: 'Xóa sinh viên',
  edit: 'Sửa',
  delete: 'Xóa',
  back: 'Quay lại',
  cancel: 'Hủy',
  save: 'Lưu thông tin',
  createTitle: 'Sinh viên mới',
  editTitle: 'Cập nhật hồ sơ',
  formHint: 'Điền đầy đủ thông tin để tạo hồ sơ sinh viên.',
  fullName: 'Họ và tên',
  fullNamePlaceholder: 'Ví dụ: Nguyễn Minh Anh',
  studentIdLabel: 'Mã số sinh viên',
  studentIdPlaceholder: 'Ví dụ: SV2026001',
  email: 'Email',
  emailPlaceholder: 'sinhvien@example.com',
  avatar: 'Ảnh đại diện',
  avatarHint: 'Chọn ảnh từ thiết bị hoặc nhập đường dẫn ảnh.',
  choosePhoto: 'Chọn ảnh',
  photoLink: 'Đường dẫn ảnh (không bắt buộc)',
  photoLinkPlaceholder: 'https://example.com/avatar.jpg',
  removePhoto: 'Bỏ ảnh',
  requiredFields: 'Vui lòng nhập đầy đủ họ tên, mã số sinh viên và email.',
  invalidEmail: 'Vui lòng nhập địa chỉ email hợp lệ.',
  duplicateStudentId: 'Mã số sinh viên này đã được sử dụng.',
  confirmEditTitle: 'Xác nhận sửa',
  confirmEdit: 'Bạn có muốn sửa thông tin SV không?',
  confirmDeleteTitle: 'Xác nhận xóa',
  confirmDelete: 'Bạn có muốn xóa thông tin SV không?',
  yes: 'Có',
  no: 'Không',
  okay: 'Đã hiểu',
  notFound: 'Không tìm thấy sinh viên này.',
  saveError: 'Không thể lưu dữ liệu. Vui lòng thử lại.',
  deleteError: 'Không thể xóa dữ liệu. Vui lòng thử lại.',
  loadError: 'Không thể tải danh sách sinh viên.',
  retry: 'Thử lại',
  photoError: 'Không thể mở ảnh. Vui lòng thử lại.',
  photoPermission: 'Cần cấp quyền truy cập ảnh để chọn ảnh đại diện.',
  nameField: 'HỌ VÀ TÊN',
  idField: 'MÃ SỐ SINH VIÊN',
  emailField: 'EMAIL',
};

const en: Record<keyof typeof vi, string> = {
  appName: 'Student Manager',
  directory: 'CAMPUS',
  totalStudents: 'Total students',
  studentList: 'Student list',
  studentNumber: 'Student ID',
  noStudents: 'No students yet',
  addFirstStudent: 'Add your first student to start managing the directory.',
  addStudent: 'Add student',
  studentDetails: 'Student details',
  editStudent: 'Edit student',
  deleteStudent: 'Delete student',
  edit: 'Edit',
  delete: 'Delete',
  back: 'Back',
  cancel: 'Cancel',
  save: 'Save student',
  createTitle: 'New student',
  editTitle: 'Update profile',
  formHint: 'Enter the student details to create a profile.',
  fullName: 'Full name',
  fullNamePlaceholder: 'For example: Alex Nguyen',
  studentIdLabel: 'Student ID',
  studentIdPlaceholder: 'For example: STU2026001',
  email: 'Email',
  emailPlaceholder: 'student@example.com',
  avatar: 'Profile photo',
  avatarHint: 'Choose a photo from your device or enter an image URL.',
  choosePhoto: 'Choose photo',
  photoLink: 'Photo URL (optional)',
  photoLinkPlaceholder: 'https://example.com/avatar.jpg',
  removePhoto: 'Remove photo',
  requiredFields: 'Enter a name, student ID and email.',
  invalidEmail: 'Enter a valid email address.',
  duplicateStudentId: 'This student ID is already in use.',
  confirmEditTitle: 'Confirm edit',
  confirmEdit: 'Do you want to edit this student’s information?',
  confirmDeleteTitle: 'Confirm deletion',
  confirmDelete: 'Do you want to delete this student’s information?',
  yes: 'Yes',
  no: 'No',
  okay: 'OK',
  notFound: 'This student could not be found.',
  saveError: 'Could not save the data. Please try again.',
  deleteError: 'Could not delete the data. Please try again.',
  loadError: 'Could not load the student list.',
  retry: 'Try again',
  photoError: 'Could not open photos. Please try again.',
  photoPermission: 'Photo library access is required to choose a profile photo.',
  nameField: 'FULL NAME',
  idField: 'STUDENT ID',
  emailField: 'EMAIL',
};

type Language = 'vi' | 'en';
type TranslationKey = keyof typeof vi;
type TranslationContextValue = { language: Language; t: (key: TranslationKey) => string };

const TranslationContext = createContext<TranslationContextValue | null>(null);

function getDeviceLanguage(): Language {
  const languageCode = getLocales()[0]?.languageCode?.toLowerCase();
  return languageCode === 'vi' ? 'vi' : 'en';
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getDeviceLanguage);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setLanguage(getDeviceLanguage());
    });
    return () => subscription.remove();
  }, []);

  const value = useMemo<TranslationContextValue>(
    () => ({ language, t: (key) => (language === 'vi' ? vi[key] : en[key]) }),
    [language],
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslations() {
  const context = useContext(TranslationContext);
  if (!context) throw new Error('useTranslations must be used within TranslationProvider');
  return context;
}
