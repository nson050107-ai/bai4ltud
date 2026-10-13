import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { StudentProvider } from '@/features/students/student-store';
import { TranslationProvider } from '@/features/students/translations';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TranslationProvider>
        <StudentProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="student/[id]" />
            <Stack.Screen name="student-form" />
          </Stack>
        </StudentProvider>
      </TranslationProvider>
    </ThemeProvider>
  );
}
