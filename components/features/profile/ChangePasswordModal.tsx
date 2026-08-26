import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ChangePasswordModalProps {
  visible: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<boolean>;
}

// supabase/config.toml: minimum_password_length = 6 — matched here so the
// client rejects a too-short password before the request round-trip.
const MIN_LENGTH = 6;

export function ChangePasswordModal({ visible, isSubmitting, onClose, onSubmit }: ChangePasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPassword('');
    setConfirm('');
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (password.length < MIN_LENGTH) {
      setError(`Password must be at least ${MIN_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    const success = await onSubmit(password);
    if (success) handleClose();
    else setError('Failed to update password — try again');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={handleClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/60 px-6" onPress={handleClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-sm gap-4 rounded-2xl border border-border-light bg-surface-light p-card dark:border-border dark:bg-surface"
        >
          <Text className="font-display text-h3 text-primary-light dark:text-primary">Change Password</Text>
          <Input label="New password" value={password} onChangeText={setPassword} isPassword error={error ?? undefined} />
          <Input label="Confirm password" value={confirm} onChangeText={setConfirm} isPassword />
          <View className="flex-row gap-3 pt-2">
            <View className="flex-1">
              <Button label="Cancel" variant="secondary" onPress={handleClose} />
            </View>
            <View className="flex-1">
              <Button label="Save" loading={isSubmitting} onPress={handleSubmit} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
