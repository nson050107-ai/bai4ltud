import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type ConfirmationDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

const colors = {
  ink: '#14213D',
  muted: '#75819A',
  primary: '#3457D5',
  border: '#E5EAF2',
  danger: '#C64040',
};

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onDismiss,
}: ConfirmationDialogProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View
          accessibilityRole="alert"
          accessibilityViewIsModal
          style={styles.dialog}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            {cancelLabel ? (
              <Pressable
                accessibilityRole="button"
                onPress={onDismiss}
                style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}>
                <Text style={styles.cancelText}>{cancelLabel}</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onDismiss();
                onConfirm();
              }}
              style={({ pressed }) => [
                styles.confirmButton,
                destructive && styles.destructiveButton,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#10182B80',
  },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 12,
  },
  title: { color: colors.ink, fontSize: 18, fontWeight: '800' },
  message: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 9 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 23 },
  cancelButton: { minHeight: 44, minWidth: 82, paddingHorizontal: 15, borderRadius: 13, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: colors.ink, fontSize: 14, fontWeight: '700' },
  confirmButton: { minHeight: 44, minWidth: 82, paddingHorizontal: 16, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  destructiveButton: { backgroundColor: colors.danger },
  confirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.75 },
});
