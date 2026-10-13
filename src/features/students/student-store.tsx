import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { Student } from '@/features/students/types';

const STORAGE_KEY = '@student-manager/students-v1';

type StudentStore = {
  students: Student[];
  loading: boolean;
  error: boolean;
  reload: () => Promise<void>;
  saveStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
};

const StudentContext = createContext<StudentStore | null>(null);

function isStudent(value: unknown): value is Student {
  if (typeof value !== 'object' || value === null) return false;
  const student = value as Record<string, unknown>;
  return (
    typeof student.id === 'string' &&
    typeof student.fullName === 'string' &&
    typeof student.studentId === 'string' &&
    typeof student.email === 'string' &&
    typeof student.avatar === 'string'
  );
}

async function readStoredStudents(): Promise<Student[]> {
  const storedValue = await AsyncStorage.getItem(STORAGE_KEY);
  if (storedValue === null) return [];
  const parsed: unknown = JSON.parse(storedValue);
  if (!Array.isArray(parsed) || !parsed.every(isStudent)) {
    throw new Error('Saved student data has an invalid format.');
  }
  return parsed;
}

export function StudentProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setStudents(await readStoredStudents());
    } catch (loadError) {
      console.error('Failed to load student records:', loadError);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadInitialStudents = async () => {
      try {
        const savedStudents = await readStoredStudents();
        if (active) setStudents(savedStudents);
      } catch (loadError) {
        console.error('Failed to load student records:', loadError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadInitialStudents();
    return () => {
      active = false;
    };
  }, []);

  const saveStudent = useCallback(async (student: Student) => {
    const nextStudents = students.some((current) => current.id === student.id)
      ? students.map((current) => (current.id === student.id ? student : current))
      : [...students, student];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStudents));
    setStudents(nextStudents);
  }, [students]);

  const deleteStudent = useCallback(async (id: string) => {
    const nextStudents = students.filter((student) => student.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextStudents));
    setStudents(nextStudents);
  }, [students]);

  const value = useMemo(
    () => ({ students, loading, error, reload, saveStudent, deleteStudent }),
    [students, loading, error, reload, saveStudent, deleteStudent],
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudents must be used within StudentProvider');
  return context;
}
